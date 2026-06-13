import { Request, Response } from "express";
import { logger } from "../config/logger";
import { KPI } from "../models/KPI";
import { OrganizationUnit } from "../models/OrganizationUnit";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { Op, fn, col } from "sequelize";

export class KPIController {
  static async getAll(req: Request, res: Response) {
    try {
      const { organizationUnitId, driverId, vehicleId, period } = req.query;
      const where: any = {};
      if (organizationUnitId) where.organizationUnitId = organizationUnitId;
      if (driverId) where.driverId = driverId;
      if (vehicleId) where.vehicleId = vehicleId;
      if (period) where.period = period;

      const kpis = await KPI.findAll({
        where,
        include: [
          { association: "organizationUnit", attributes: ["id", "name"] },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "vehicle", attributes: ["id", "plateNumber"] },
        ],
        order: [["periodStart", "DESC"]],
      });
      return res.json({ success: true, data: kpis });
    } catch (error) {
      logger.error("Get KPIs error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch KPIs" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const kpi = await KPI.findByPk(req.params.id, {
        include: [
          { association: "organizationUnit", attributes: ["id", "name"] },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "vehicle", attributes: ["id", "plateNumber"] },
        ],
      });
      if (!kpi) return res.status(404).json({ success: false, message: "KPI not found" });
      return res.json({ success: true, data: kpi });
    } catch (error) {
      logger.error("Get KPI error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch KPI" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const kpi = await KPI.create(req.body);
      return res.status(201).json({ success: true, data: kpi, message: "KPI created" });
    } catch (error: any) {
      logger.error("Create KPI error:", error);
      return res.status(500).json({ success: false, message: "Failed to create KPI" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const kpi = await KPI.findByPk(req.params.id);
      if (!kpi) return res.status(404).json({ success: false, message: "KPI not found" });
      await kpi.update(req.body);
      return res.json({ success: true, data: kpi, message: "KPI updated" });
    } catch (error) {
      logger.error("Update KPI error:", error);
      return res.status(500).json({ success: false, message: "Failed to update KPI" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const kpi = await KPI.findByPk(req.params.id);
      if (!kpi) return res.status(404).json({ success: false, message: "KPI not found" });
      await kpi.destroy();
      return res.json({ success: true, message: "KPI deleted" });
    } catch (error) {
      logger.error("Delete KPI error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete KPI" });
    }
  }

  static async getDashboard(req: Request, res: Response) {
    try {
      const { period = "monthly" } = req.query;
      const kpis = await KPI.findAll({
        where: { period },
        include: [
          { association: "organizationUnit", attributes: ["id", "name"] },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["periodStart", "DESC"]],
        limit: 100,
      });

      const totals = {
        totalTarget: kpis.reduce((s, k) => s + (k.target || 0), 0),
        totalCurrent: kpis.reduce((s, k) => s + (k.current || 0), 0),
        avgTarget: kpis.reduce((s, k) => s + (k.target || 0), 0) / (kpis.length || 1),
        avgCurrent: kpis.reduce((s, k) => s + (k.current || 0), 0) / (kpis.length || 1),
        avgAchievement: kpis.reduce((s, k) => {
          return k.target ? s + ((k.current || 0) / k.target) * 100 : s;
        }, 0) / (kpis.filter(k => k.target).length || 1),
      };

      return res.json({ success: true, data: { kpis, totals } });
    } catch (error) {
      logger.error("Get KPI dashboard error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch KPI dashboard" });
    }
  }
}
