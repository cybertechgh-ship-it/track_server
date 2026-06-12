import { Request, Response } from "express";
import { InspectionChecklist } from "../models/InspectionChecklist";

export class InspectionController {
  static async getAll(req: Request, res: Response) {
    try {
      const { vehicleId, type } = req.query;
      const where: any = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (type) where.type = type;
      const inspections = await InspectionChecklist.findAll({ where, order: [["createdAt", "DESC"]] });
      return res.json({ success: true, data: inspections });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const inspection = await InspectionChecklist.create(req.body); return res.status(201).json({ success: true, data: inspection }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await InspectionChecklist.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
