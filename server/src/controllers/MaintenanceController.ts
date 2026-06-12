import { Request, Response } from "express";
import { MaintenanceRecord } from "../models/MaintenanceRecord";
import { Vehicle } from "../models/Vehicle";
import { Op } from "sequelize";

export class MaintenanceController {
  static async getAll(req: Request, res: Response) {
    try {
      const { vehicleId, status, limit } = req.query;
      const where: any = {};
      if (vehicleId) where.vehicleId = parseInt(vehicleId as string);
      if (status === "overdue") {
        where.nextDueDate = { [Op.lt]: new Date() };
      } else if (status === "upcoming") {
        where.nextDueDate = {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 30 * 86400000),
        };
      }

      const records = await MaintenanceRecord.findAll({
        where,
        include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "plateNumber", "brand", "model", "photo"] }],
        order: [["performedAt", "DESC"]],
        limit: limit ? parseInt(limit as string) : undefined,
      });

      return res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get maintenance records error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch maintenance records" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const record = await MaintenanceRecord.findByPk(req.params.id, {
        include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "plateNumber", "brand", "model", "photo"] }],
      });
      if (!record) return res.status(404).json({ success: false, message: "Record not found" });
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error("Get maintenance record error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch record" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { vehicleId, type, description, cost, odometer, performedAt, nextDueDate, nextDueOdometer, performedBy, notes } = req.body;

      if (!vehicleId || !type || !description) {
        return res.status(400).json({ success: false, message: "vehicleId, type, and description are required" });
      }

      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

      const record = await MaintenanceRecord.create({
        vehicleId, type, description, cost, odometer,
        performedAt: performedAt || new Date(),
        nextDueDate, nextDueOdometer, performedBy, notes,
      });

      if (odometer) {
        await vehicle.update({ lastServiceOdometer: odometer });
      }

      return res.status(201).json({ success: true, data: record, message: "Maintenance record created" });
    } catch (error: any) {
      console.error("Create maintenance record error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to create record" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const record = await MaintenanceRecord.findByPk(req.params.id);
      if (!record) return res.status(404).json({ success: false, message: "Record not found" });

      await record.update(req.body);

      if (req.body.odometer) {
        await Vehicle.update({ lastServiceOdometer: req.body.odometer }, { where: { id: record.vehicleId } });
      }

      return res.json({ success: true, data: record, message: "Maintenance record updated" });
    } catch (error: any) {
      console.error("Update maintenance record error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to update record" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const record = await MaintenanceRecord.findByPk(req.params.id);
      if (!record) return res.status(404).json({ success: false, message: "Record not found" });

      await record.destroy();
      return res.json({ success: true, message: "Maintenance record deleted" });
    } catch (error) {
      console.error("Delete maintenance record error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete record" });
    }
  }

  static async getVehicleHistory(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await MaintenanceRecord.findAll({
        where: { vehicleId },
        order: [["performedAt", "DESC"]],
      });
      return res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get vehicle maintenance history error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch history" });
    }
  }

  static async getUpcomingMaintenance(req: Request, res: Response) {
    try {
      const upcoming = await MaintenanceRecord.findAll({
        where: {
          nextDueDate: {
            [Op.lte]: new Date(Date.now() + 30 * 86400000),
          },
        },
        include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "plateNumber", "brand", "model", "photo"] }],
        order: [["nextDueDate", "ASC"]],
      });
      return res.json({ success: true, data: upcoming });
    } catch (error) {
      console.error("Get upcoming maintenance error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch upcoming maintenance" });
    }
  }
}
