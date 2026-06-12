import { Request, Response } from "express";
import { Training } from "../models/Training";
import { Op } from "sequelize";

export class TrainingController {
  static async getAll(req: Request, res: Response) {
    try {
      const { driverId } = req.query;
      const where: any = {};
      if (driverId) where.driverId = driverId;
      const records = await Training.findAll({ where, order: [["completionDate", "DESC"]] });
      return res.json({ success: true, data: records });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async getExpiring(req: Request, res: Response) {
    try {
      const soon = new Date(Date.now() + 60 * 86400000);
      const records = await Training.findAll({ where: { expiryDate: { [Op.not]: null, [Op.lte]: soon } }, order: [["expiryDate", "ASC"]] });
      return res.json({ success: true, data: records });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const rec = await Training.create(req.body); return res.status(201).json({ success: true, data: rec }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Training.update(req.body, { where: { id: req.params.id } }); const t = await Training.findByPk(req.params.id); return res.json({ success: true, data: t }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Training.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
