import { Request, Response } from "express";
import { VehicleBooking } from "../models/VehicleBooking";
import { Op } from "sequelize";

export class VehicleBookingController {
  static async getAll(req: Request, res: Response) {
    try {
      const { vehicleId, status, date } = req.query;
      const where: any = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (status) where.status = status;
      if (date) where.startTime = { [Op.lte]: new Date(date as string + "T23:59:59") }, where.endTime = { [Op.gte]: new Date(date as string + "T00:00:00") };
      const bookings = await VehicleBooking.findAll({ where, order: [["startTime", "DESC"]] });
      return res.json({ success: true, data: bookings });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async checkAvailability(req: Request, res: Response) {
    try {
      const { vehicleId, startTime, endTime } = req.query;
      const conflicts = await VehicleBooking.findAll({ where: { vehicleId, status: { [Op.notIn]: ["cancelled", "completed"] }, startTime: { [Op.lt]: new Date(endTime as string) }, endTime: { [Op.gt]: new Date(startTime as string) } } });
      return res.json({ success: true, data: { available: conflicts.length === 0, conflicts } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try {
      const booking = await VehicleBooking.create({ ...req.body, bookedById: (req as any).user?.id || req.body.bookedById });
      return res.status(201).json({ success: true, data: booking });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed to create booking" }); }
  }

  static async updateStatus(req: Request, res: Response) {
    try { await VehicleBooking.update({ status: req.body.status }, { where: { id: req.params.id } }); const b = await VehicleBooking.findByPk(req.params.id); return res.json({ success: true, data: b }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await VehicleBooking.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
