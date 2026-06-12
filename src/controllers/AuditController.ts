import { Request, Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { Op } from "sequelize";

export class AuditController {
  static async getAll(req: Request, res: Response) {
    try {
      const { action, entityType, userId, startDate, endDate, status } = req.query;
      const where: any = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (userId) where.userId = userId;
      if (status) where.status = status;
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
      }

      const logs = await AuditLog.findAll({
        where,
        include: [
          { association: "user", attributes: ["id", "firstName", "lastName", "email"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: 500,
      });
      return res.json({ success: true, data: logs });
    } catch (error) {
      console.error("Get audit logs error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const log = await AuditLog.findByPk(req.params.id, {
        include: [
          { association: "user", attributes: ["id", "firstName", "lastName"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
      });
      if (!log) return res.status(404).json({ success: false, message: "Audit log not found" });
      return res.json({ success: true, data: log });
    } catch (error) {
      console.error("Get audit log error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch audit log" });
    }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const since = new Date();
      since.setDate(since.getDate() - Number(days));

      const totalLogs = await AuditLog.count({ where: { createdAt: { [Op.gte]: since } } });
      const pendingApprovals = await AuditLog.count({
        where: { status: "pending_approval", createdAt: { [Op.gte]: since } },
      });
      const criticalActions = await AuditLog.count({
        where: { action: "delete", createdAt: { [Op.gte]: since } },
      });

      return res.json({
        success: true,
        data: { totalLogs, pendingApprovals, criticalActions, days: Number(days) },
      });
    } catch (error) {
      console.error("Get audit summary error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch audit summary" });
    }
  }
}
