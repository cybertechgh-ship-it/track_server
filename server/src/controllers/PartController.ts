import { Request, Response } from "express";
import { Part } from "../models/Part";
import { Op } from "sequelize";

export class PartController {
  static async getAll(req: Request, res: Response) {
    try {
      const { lowStock } = req.query;
      const where: any = {};
      if (lowStock === "true") where[Op.and as any] = [{ quantity: { [Op.lte]: Part.sequelize!.col("minStock") } }];
      const parts = await Part.findAll({ where, order: [["name", "ASC"]] });
      return res.json({ success: true, data: parts });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const part = await Part.create(req.body); return res.status(201).json({ success: true, data: part }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Part.update(req.body, { where: { id: req.params.id } }); const p = await Part.findByPk(req.params.id); return res.json({ success: true, data: p }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Part.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
