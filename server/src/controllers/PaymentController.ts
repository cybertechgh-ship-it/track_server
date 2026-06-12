import { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Op } from "sequelize";

export class PaymentController {
  static async getAll(req: Request, res: Response) {
    try {
      const { driverId, startDate, endDate } = req.query;
      const where: any = {};
      if (driverId) where.driverId = driverId;
      if (startDate || endDate) where.paidAt = { ...(startDate ? { [Op.gte]: new Date(startDate as string) } : {}), ...(endDate ? { [Op.lte]: new Date(endDate as string) } : {}) };
      const payments = await Payment.findAll({ where, order: [["paidAt", "DESC"]] });
      return res.json({ success: true, data: payments });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const payment = await Payment.create({ ...req.body, receivedById: (req as any).user?.id || req.body.receivedById }); return res.status(201).json({ success: true, data: payment }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Payment.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
