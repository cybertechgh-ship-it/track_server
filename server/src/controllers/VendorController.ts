import { Request, Response } from "express";
import { Vendor } from "../models/Vendor";

export class VendorController {
  static async getAll(req: Request, res: Response) {
    try {
      const { type, isActive } = req.query;
      const where: any = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive === "true";
      const vendors = await Vendor.findAll({ where, order: [["name", "ASC"]] });
      return res.json({ success: true, data: vendors });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const vendor = await Vendor.create(req.body); return res.status(201).json({ success: true, data: vendor }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Vendor.update(req.body, { where: { id: req.params.id } }); const v = await Vendor.findByPk(req.params.id); return res.json({ success: true, data: v }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Vendor.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
