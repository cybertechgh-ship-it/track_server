import { Request, Response } from "express";
import { Device } from "../models/Device";
import { Vehicle } from "../models/Vehicle";

export class DeviceManageController {
  static async getAll(req: Request, res: Response) {
    try {
      const devices = await Device.findAll({
        include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] }],
        order: [["createdAt", "DESC"]],
      });
      return res.json({ success: true, data: devices });
    } catch (error: any) {
      console.error("Get devices error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch devices" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const device = await Device.findByPk(req.params.id, {
        include: [{ model: Vehicle, as: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] }],
      });
      if (!device) return res.status(404).json({ success: false, message: "Device not found" });
      return res.json({ success: true, data: device });
    } catch (error: any) {
      console.error("Get device error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch device" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { imei, name, protocol, firmware, signal, battery, simStatus, isOnline, vehicleId } = req.body;
      const device = await Device.create({ imei, name, protocol, firmware, signal, battery, simStatus, isOnline, vehicleId });
      return res.status(201).json({ success: true, data: device, message: "Device created" });
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ success: false, message: "IMEI already exists" });
      }
      console.error("Create device error:", error);
      return res.status(500).json({ success: false, message: "Failed to create device" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const device = await Device.findByPk(req.params.id);
      if (!device) return res.status(404).json({ success: false, message: "Device not found" });
      await device.update(req.body);
      return res.json({ success: true, data: device, message: "Device updated" });
    } catch (error: any) {
      console.error("Update device error:", error);
      return res.status(500).json({ success: false, message: "Failed to update device" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const device = await Device.findByPk(req.params.id);
      if (!device) return res.status(404).json({ success: false, message: "Device not found" });
      await device.destroy();
      return res.json({ success: true, message: "Device deleted" });
    } catch (error: any) {
      console.error("Delete device error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete device" });
    }
  }
}
