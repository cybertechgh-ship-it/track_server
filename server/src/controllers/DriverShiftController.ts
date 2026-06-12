import { Request, Response } from "express";
import { DriverShift } from "../models/DriverShift";
import { Op } from "sequelize";

export class DriverShiftController {
  static async getAll(req: Request, res: Response) {
    try {
      const { driverId, date, status } = req.query;
      const where: any = {};
      if (driverId) where.driverId = driverId;
      if (date) where.date = date;
      if (status) where.status = status;
      const shifts = await DriverShift.findAll({ where, order: [["date", "DESC"], ["startTime", "ASC"]] });
      return res.json({ success: true, data: shifts });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async getSchedule(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const shifts = await DriverShift.findAll({ where: { date: { [Op.between]: [startDate, endDate] } }, order: [["date", "ASC"], ["startTime", "ASC"]] });
      return res.json({ success: true, data: shifts });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const shift = await DriverShift.create(req.body); return res.status(201).json({ success: true, data: shift }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async swapRequest(req: Request, res: Response) {
    try {
      const { targetDriverId } = req.body;
      await DriverShift.update({ status: "swapped", swappedWithDriverId: targetDriverId }, { where: { id: req.params.id } });
      const shift = await DriverShift.findByPk(req.params.id);
      return res.json({ success: true, data: shift });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async update(req: Request, res: Response) {
    try { await DriverShift.update(req.body, { where: { id: req.params.id } }); const s = await DriverShift.findByPk(req.params.id); return res.json({ success: true, data: s }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await DriverShift.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
