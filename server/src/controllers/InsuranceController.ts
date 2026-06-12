import { Request, Response } from "express";
import { Insurance } from "../models/Insurance";
import { Op } from "sequelize";

export class InsuranceController {
  static async getAll(req: Request, res: Response) {
    try {
      const { vehicleId, isActive } = req.query;
      const where: any = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (isActive !== undefined) where.isActive = isActive === "true";
      const policies = await Insurance.findAll({ where, order: [["endDate", "ASC"]] });
      return res.json({ success: true, data: policies });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async getExpiring(req: Request, res: Response) {
    try {
      const soon = new Date(Date.now() + 30 * 86400000);
      const policies = await Insurance.findAll({ where: { isActive: true, endDate: { [Op.lte]: soon } }, order: [["endDate", "ASC"]] });
      return res.json({ success: true, data: policies });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const policy = await Insurance.create(req.body); return res.status(201).json({ success: true, data: policy }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Insurance.update(req.body, { where: { id: req.params.id } }); const p = await Insurance.findByPk(req.params.id); return res.json({ success: true, data: p }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Insurance.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
