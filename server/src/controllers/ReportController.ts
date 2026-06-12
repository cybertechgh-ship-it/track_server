import { Request, Response } from "express";
import path from "path";
import fs from "fs";
const pdfmake = require("pdfmake");

import { Report } from "../models/Report";
import { User } from "../models/User";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { DrivingSession } from "../models/DrivingSession";
import { MaintenanceRecord } from "../models/MaintenanceRecord";
import { Op } from "sequelize";

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../../node_modules/pdfmake/src/fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../../node_modules/pdfmake/src/fonts/Roboto-Medium.ttf"),
    italics: path.join(__dirname, "../../node_modules/pdfmake/src/fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "../../node_modules/pdfmake/src/fonts/Roboto-MediumItalic.ttf"),
  },
};

pdfmake.setFonts(fonts);

const REPORTS_DIR = path.resolve(__dirname, "../../reports");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const REPORT_TYPES = [
  { value: "executive_summary", label: "Executive Summary" },
  { value: "fleet_performance", label: "Fleet Performance" },
  { value: "vehicle_tracking", label: "Vehicle Tracking" },
  { value: "driver_performance", label: "Driver Performance" },
  { value: "fuel_consumption", label: "Fuel Consumption" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
  { value: "custom", label: "Custom Report" },
];

const pageFooter = (currentPage: number, pageCount: number) => ({
  margin: [40, 0, 40, 20] as [number, number, number, number],
  columns: [
    { text: `Generated ${new Date().toLocaleDateString()}`, style: "footerText", alignment: "left" as const },
    { text: `Page ${currentPage} of ${pageCount}`, style: "footerText", alignment: "right" as const },
  ],
});

export class ReportController {
  static async getAll(req: Request, res: Response) {
    try {
      const { type, search, archived, startDate, endDate, sort } = req.query;
      const where: any = {};
      if (type && type !== "all") where.type = type;
      if (archived === "true") where.isArchived = true;
      else if (archived !== "all") where.isArchived = false;
      if (search) where.name = { [Op.iLike]: `%${search}%` };
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
      }

      const order: any = sort === "oldest" ? ["createdAt", "ASC"] : ["createdAt", "DESC"];

      const reports = await Report.findAll({
        where,
        include: [{ model: User, as: "generatedBy", attributes: ["id", "firstName", "lastName", "email"] }],
        order: [order],
      });

      return res.json({ success: true, data: reports });
    } catch (error) {
      console.error("Get reports error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const report = await Report.findByPk(req.params.id, {
        include: [{ model: User, as: "generatedBy", attributes: ["id", "firstName", "lastName", "email"] }],
      });
      if (!report) return res.status(404).json({ success: false, message: "Report not found" });
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error("Get report error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch report" });
    }
  }

  static async generate(req: Request, res: Response) {
    try {
      const { type, name, filters } = req.body;
      const userId = (req as any).user?.userId;

      if (!type || !name) {
        return res.status(400).json({ success: false, message: "type and name are required" });
      }

      const report = await Report.create({
        name,
        type,
        generatedById: userId || 1,
        filters: filters || {},
        status: "generating",
        fileSize: 0,
      });

      try {
        const filePath = await ReportController.generatePdf(report.id, type, filters);
        const stats = fs.statSync(filePath);
        await report.update({ filePath, fileSize: stats.size, status: "ready" });
      } catch (genError: any) {
        console.error("PDF generation failed:", genError);
        await report.update({ status: "failed" });
        return res.status(500).json({ success: false, message: `PDF generation failed: ${genError.message}`, data: report });
      }

      const full = await Report.findByPk(report.id, {
        include: [{ model: User, as: "generatedBy", attributes: ["id", "firstName", "lastName", "email"] }],
      });
      return res.json({ success: true, data: full, message: "Report generated successfully" });
    } catch (error: any) {
      console.error("Generate report error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to generate report" });
    }
  }

  private static async generatePdf(reportId: number, type: string, filters: any): Promise<string> {
    const reportType = REPORT_TYPES.find(t => t.value === type);
    const title = `${reportType?.label || type} Report`;
    const now = new Date();

    const content: any[] = [];
    content.push(
      { text: "cyTrack Fleet Intelligence", style: "companyName" },
      { text: title, style: "reportTitle" },
      { text: `Generated: ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, style: "dateLine" },
      { text: `Report Period: ${filters.startDate || "N/A"} — ${filters.endDate || "N/A"}`, style: "dateLine" },
      { text: "\n" },
    );

    if (type === "executive_summary" || type === "custom") {
      const totalDrivers = await Driver.count();
      const totalVehicles = await Vehicle.count();
      const activeSessions = await DrivingSession.count({ where: { isActive: true } });
      const totalSessions = await DrivingSession.count();
      const totalDistance = (await DrivingSession.sum("totalDistance")) || 0;
      const upcomingMaintenance = await MaintenanceRecord.count({
        where: { nextDueDate: { [Op.lte]: new Date(Date.now() + 30 * 86400000) } },
      });

      content.push(
        { text: "Executive Summary", style: "sectionTitle" },
        { text: "\n" },
        {
          table: {
            widths: ["*", "*", "*", "*"],
            body: [
              [
                { text: "Total Drivers", style: "statLabel" },
                { text: "Total Vehicles", style: "statLabel" },
                { text: "Active Sessions", style: "statLabel" },
                { text: "Upcoming Maint.", style: "statLabel" },
              ],
              [
                { text: String(totalDrivers), style: "statValue" },
                { text: String(totalVehicles), style: "statValue" },
                { text: String(activeSessions), style: "statValue" },
                { text: String(upcomingMaintenance), style: "statValue" },
              ],
            ],
          },
          layout: "noBorders",
        },
        { text: "\n" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              [{ text: "Total Sessions", style: "statLabel" }, { text: String(totalSessions), style: "statValue" }],
              [{ text: "Total Distance (km)", style: "statLabel" }, { text: `${Math.round(totalDistance).toLocaleString()} km`, style: "statValue" }],
              [{ text: "Avg. Distance/Session", style: "statLabel" }, { text: totalSessions > 0 ? `${Math.round(totalDistance / totalSessions)} km` : "N/A", style: "statValue" }],
            ],
          },
          layout: "noBorders",
        },
      );
    }

    if (type === "fleet_performance" || type === "vehicle_tracking" || type === "custom") {
      const vehicles = await Vehicle.findAll({ limit: 50, order: [["plateNumber", "ASC"]] });
      content.push(
        { text: "\n" },
        { text: "Fleet Overview", style: "sectionTitle" },
        { text: "\n" },
        {
          table: {
            widths: ["auto", "*", "auto", "auto", "auto"],
            headerRows: 1,
            body: [
              [
                { text: "Plate", style: "tableHeader" },
                { text: "Model", style: "tableHeader" },
                { text: "Odometer", style: "tableHeader" },
                { text: "Last Service", style: "tableHeader" },
                { text: "Status", style: "tableHeader" },
              ],
              ...vehicles.map(v => [
                v.plateNumber,
                `${v.brand} ${v.model}`,
                `${(v.totalOdometer || 0).toLocaleString()} km`,
                v.lastServiceOdometer ? `${v.lastServiceOdometer.toLocaleString()} km` : "-",
                v.isActive ? "Active" : "Inactive",
              ]),
            ],
          },
        },
      );
    }

    if (type === "driver_performance" || type === "custom") {
      const drivers = await Driver.findAll({ limit: 50, order: [["firstName", "ASC"]] });
      content.push(
        { text: "\n" },
        { text: "Driver Performance", style: "sectionTitle" },
        { text: "\n" },
        {
          table: {
            widths: ["*", "*", "auto", "auto", "auto"],
            headerRows: 1,
            body: [
              [
                { text: "Name", style: "tableHeader" },
                { text: "License", style: "tableHeader" },
                { text: "Score", style: "tableHeader" },
                { text: "License Expiry", style: "tableHeader" },
                { text: "Status", style: "tableHeader" },
              ],
              ...drivers.map(d => [
                `${d.firstName} ${d.lastName}`,
                d.licenseNumber || "-",
                String(d.behaviorScore || 0),
                d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : "-",
                d.isActive ? "Active" : "Inactive",
              ]),
            ],
          },
        },
      );
    }

    if (type === "revenue" || type === "custom") {
      const totalRevenue = await DrivingSession.sum("totalDistance") || 0;
      content.push(
        { text: "\n" },
        { text: "Revenue Summary", style: "sectionTitle" },
        { text: "\n" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              [{ text: "Estimated Revenue", style: "statLabel" }, { text: `$${Math.round(totalRevenue * 0.5).toLocaleString()}`, style: "statValue" }],
              [{ text: "Active Deployments", style: "statLabel" }, { text: "—", style: "statValue" }],
            ],
          },
          layout: "noBorders",
        },
      );
    }

    content.push({ text: "\n\n" });
    content.push({
      text: "This report was automatically generated by cyTrack Fleet Intelligence System.",
      style: "disclaimer",
    });

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      header: () => ({
        margin: [40, 20, 40, 0],
        columns: [
          { text: "cyTrack Fleet Intelligence", alignment: "left", fontSize: 9, color: "#6b7280" },
          { text: title, alignment: "right", fontSize: 9, color: "#6b7280" },
        ],
      }),
      footer: pageFooter,
      content,
      styles: {
        companyName: { fontSize: 18, bold: true, color: "#00c9a7", margin: [0, 0, 0, 4] },
        reportTitle: { fontSize: 22, bold: true, color: "#1a1a2e", margin: [0, 0, 0, 4] },
        dateLine: { fontSize: 9, color: "#9ca3af", margin: [0, 0, 0, 2] },
        sectionTitle: { fontSize: 14, bold: true, color: "#1a1a2e", margin: [0, 10, 0, 4] },
        statLabel: { fontSize: 9, color: "#6b7280", bold: true, margin: [4, 4] },
        statValue: { fontSize: 16, bold: true, color: "#1a1a2e", margin: [4, 2] },
        tableHeader: { fontSize: 9, bold: true, color: "#ffffff", fillColor: "#1a1a2e", margin: [4, 4] },
        footerText: { fontSize: 8, color: "#9ca3af" },
        disclaimer: { fontSize: 8, color: "#9ca3af", italics: true, alignment: "center" },
      },
      defaultStyle: { font: "Roboto" },
    };

    const fileName = `${type}_${reportId}_${now.getTime()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    const doc = pdfmake.createPdf(docDefinition);
    const stream = await doc.getStream();
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    return new Promise<string>((resolve, reject) => {
      writeStream.on("finish", () => resolve(filePath));
      writeStream.on("error", reject);
    });
  }

  static async download(req: Request, res: Response) {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report || !report.filePath) {
        return res.status(404).json({ success: false, message: "Report file not found" });
      }
      if (!fs.existsSync(report.filePath)) {
        return res.status(404).json({ success: false, message: "Report file no longer exists on disk" });
      }
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      res.download(report.filePath, fileName);
    } catch (error) {
      console.error("Download report error:", error);
      return res.status(500).json({ success: false, message: "Failed to download report" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: "Report not found" });

      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
      await report.destroy();
      return res.json({ success: true, message: "Report deleted" });
    } catch (error) {
      console.error("Delete report error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete report" });
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: "Report not found" });
      await report.update({ isArchived: !report.isArchived });
      return res.json({ success: true, data: report, message: report.isArchived ? "Report archived" : "Report restored" });
    } catch (error) {
      console.error("Archive report error:", error);
      return res.status(500).json({ success: false, message: "Failed to archive report" });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const totalReports = await Report.count();
      const thisMonth = await Report.count({
        where: { createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      });
      const totalStorage = (await Report.sum("fileSize")) || 0;
      const recent = await Report.findAll({
        include: [{ model: User, as: "generatedBy", attributes: ["id", "firstName", "lastName"] }],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
      const archivedCount = await Report.count({ where: { isArchived: true } });

      return res.json({
        success: true,
        data: { totalReports, thisMonth, totalStorage, recent, archivedCount },
      });
    } catch (error) {
      console.error("Report dashboard stats error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
  }

  static async getReportTypes(_req: Request, res: Response) {
    return res.json({ success: true, data: REPORT_TYPES });
  }
}
