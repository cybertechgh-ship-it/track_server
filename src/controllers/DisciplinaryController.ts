import { Request, Response } from "express";
import { logger } from "../config/logger";
import { DisciplinaryAction } from "../models/DisciplinaryAction";
import { IncidentReport } from "../models/IncidentReport";
import { Driver } from "../models/Driver";

export class DisciplinaryController {
  static async getAll(req: Request, res: Response) {
    try {
      const { driverId, status, type } = req.query;
      const where: any = {};
      if (driverId) where.driverId = driverId;
      if (status) where.status = status;
      if (type) where.type = type;

      const actions = await DisciplinaryAction.findAll({
        where,
        include: [
          { association: "incident", attributes: ["id", "title", "severity"] },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "issuedBy", attributes: ["id", "firstName", "lastName"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.json({ success: true, data: actions });
    } catch (error) {
      logger.error("Get disciplinary actions error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch disciplinary actions" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const action = await DisciplinaryAction.findByPk(req.params.id, {
        include: [
          { association: "incident" },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "issuedBy", attributes: ["id", "firstName", "lastName"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
      });
      if (!action) return res.status(404).json({ success: false, message: "Disciplinary action not found" });
      return res.json({ success: true, data: action });
    } catch (error) {
      logger.error("Get disciplinary action error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch disciplinary action" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = { ...req.body, issuedById: (req as any).user?.id || req.body.issuedById };
      const action = await DisciplinaryAction.create(data);
      return res.status(201).json({ success: true, data: action, message: "Disciplinary action created" });
    } catch (error: any) {
      logger.error("Create disciplinary action error:", error);
      return res.status(500).json({ success: false, message: "Failed to create disciplinary action" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const action = await DisciplinaryAction.findByPk(req.params.id);
      if (!action) return res.status(404).json({ success: false, message: "Disciplinary action not found" });
      await action.update(req.body);
      return res.json({ success: true, data: action, message: "Disciplinary action updated" });
    } catch (error) {
      logger.error("Update disciplinary action error:", error);
      return res.status(500).json({ success: false, message: "Failed to update disciplinary action" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const action = await DisciplinaryAction.findByPk(req.params.id);
      if (!action) return res.status(404).json({ success: false, message: "Disciplinary action not found" });
      await action.destroy();
      return res.json({ success: true, message: "Disciplinary action deleted" });
    } catch (error) {
      logger.error("Delete disciplinary action error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete disciplinary action" });
    }
  }
}
