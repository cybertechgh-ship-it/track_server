import { Request, Response } from "express";
import { logger } from "../config/logger";
import { CommissionRule } from "../models/CommissionRule";

export class CommissionController {
  static async getAll(req: Request, res: Response) {
    try {
      const rules = await CommissionRule.findAll({ order: [["name", "ASC"]] });
      return res.json({ success: true, data: rules });
    } catch (error) {
      logger.error("Get commission rules error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch commission rules" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const rule = await CommissionRule.findByPk(req.params.id);
      if (!rule) return res.status(404).json({ success: false, message: "Commission rule not found" });
      return res.json({ success: true, data: rule });
    } catch (error) {
      logger.error("Get commission rule error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch commission rule" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const rule = await CommissionRule.create(req.body);
      return res.status(201).json({ success: true, data: rule, message: "Commission rule created" });
    } catch (error: any) {
      logger.error("Create commission rule error:", error);
      return res.status(500).json({ success: false, message: "Failed to create commission rule" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const rule = await CommissionRule.findByPk(req.params.id);
      if (!rule) return res.status(404).json({ success: false, message: "Commission rule not found" });
      await rule.update(req.body);
      return res.json({ success: true, data: rule, message: "Commission rule updated" });
    } catch (error) {
      logger.error("Update commission rule error:", error);
      return res.status(500).json({ success: false, message: "Failed to update commission rule" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const rule = await CommissionRule.findByPk(req.params.id);
      if (!rule) return res.status(404).json({ success: false, message: "Commission rule not found" });
      await rule.destroy();
      return res.json({ success: true, message: "Commission rule deleted" });
    } catch (error) {
      logger.error("Delete commission rule error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete commission rule" });
    }
  }
}
