import { Request, Response } from "express";
import { logger } from "../config/logger";
import { IncidentReport } from "../models/IncidentReport";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { Op } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";

export class IncidentController {
  static async getAll(req: Request, res: Response) {
    try {
      const { status, severity, driverId } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (driverId) where.driverId = driverId;

      const incidents = await IncidentReport.findAll({
        where,
        include: [
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] },
          { association: "reportedBy", attributes: ["id", "firstName", "lastName"] },
          { association: "assignedTo", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.json({ success: true, data: incidents });
    } catch (error) {
      logger.error("Get incidents error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch incidents" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const incident = await IncidentReport.findByPk(req.params.id, {
        include: [
          { association: "driver", attributes: ["id", "firstName", "lastName", "phone"] },
          { association: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] },
          { association: "reportedBy", attributes: ["id", "firstName", "lastName"] },
          { association: "assignedTo", attributes: ["id", "firstName", "lastName"] },
          { association: "escalatedTo", attributes: ["id", "firstName", "lastName"] },
          { association: "disciplinaryAction" },
        ],
      });
      if (!incident)
        return res.status(404).json({ success: false, message: "Incident not found" });
      return res.json({ success: true, data: incident });
    } catch (error) {
      logger.error("Get incident error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch incident" });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      // FIX: req.user has userId (not id)
      const reportedById = req.user?.userId ?? req.body.reportedById;
      const data = { ...req.body, reportedById };
      const incident = await IncidentReport.create(data);
      return res
        .status(201)
        .json({ success: true, data: incident, message: "Incident report created" });
    } catch (error: any) {
      logger.error("Create incident error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create incident report" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const incident = await IncidentReport.findByPk(req.params.id);
      if (!incident)
        return res.status(404).json({ success: false, message: "Incident not found" });
      await incident.update(req.body);
      return res.json({ success: true, data: incident, message: "Incident updated" });
    } catch (error) {
      logger.error("Update incident error:", error);
      return res.status(500).json({ success: false, message: "Failed to update incident" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const incident = await IncidentReport.findByPk(req.params.id);
      if (!incident)
        return res.status(404).json({ success: false, message: "Incident not found" });
      await incident.destroy();
      return res.json({ success: true, message: "Incident report deleted" });
    } catch (error) {
      logger.error("Delete incident error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete incident" });
    }
  }

  static async escalate(req: AuthRequest, res: Response) {
    try {
      const incident = await IncidentReport.findByPk(req.params.id);
      if (!incident)
        return res.status(404).json({ success: false, message: "Incident not found" });
      const { escalatedToId, note } = req.body;
      if (!escalatedToId) {
        return res.status(400).json({ success: false, message: "escalatedToId is required" });
      }
      const updatedFindings = incident.findings
        ? `${incident.findings}\n---\n[Escalated]: ${note || ""}`
        : `[Escalated]: ${note || ""}`;
      await incident.update({
        escalatedToId,
        escalatedAt: new Date(),
        status: "escalated",
        isEscalated: true,
        findings: updatedFindings,
      });
      return res.json({ success: true, data: incident, message: "Incident escalated" });
    } catch (error) {
      logger.error("Escalate incident error:", error);
      return res.status(500).json({ success: false, message: "Failed to escalate incident" });
    }
  }
}
