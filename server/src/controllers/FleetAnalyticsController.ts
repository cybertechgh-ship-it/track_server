import { Request, Response } from "express";
import { Vehicle } from "../models/Vehicle";
import { Driver } from "../models/Driver";
import { DrivingSession } from "../models/DrivingSession";
import { FuelLog } from "../models/FuelLog";
import { MaintenanceRecord } from "../models/MaintenanceRecord";
import { Alert } from "../models/Alert";
import { Expense } from "../models/Expense";
import { Op, fn, col, literal } from "sequelize";

export class FleetAnalyticsController {
  static async utilization(req: Request, res: Response) {
    try {
      const total = await Vehicle.count({ where: { isActive: true } });
      const totalHours = await DrivingSession.sum("totalDuration", { where: { endTime: { [Op.not]: null } } }) || 0;
      const sessionCount = await DrivingSession.count();
      const avgHoursPerVehicle = total > 0 ? (totalHours / total).toFixed(1) : 0;
      return res.json({ success: true, data: { totalVehicles: total, totalDrivingHours: totalHours, totalTrips: sessionCount, avgHoursPerVehicle } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async driverScoreboard(req: Request, res: Response) {
    try {
      const drivers = await Driver.findAll({ where: { isActive: true }, order: [["behaviorScore", "DESC"]], limit: 20 });
      const data = drivers.map(d => ({ id: d.id, name: `${d.firstName} ${d.lastName}`, score: d.behaviorScore, trips: d.totalTrips, photo: d.photo }));
      return res.json({ success: true, data });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async costPerKm(req: Request, res: Response) {
    try {
      const totalDistance = await DrivingSession.sum("totalDistance", { where: { endTime: { [Op.not]: null } } }) || 0;
      const fuelCost = await FuelLog.sum("totalCost") || 0;
      const maintCost = await MaintenanceRecord.sum("cost") || 0;
      const expenses = await Expense.sum("amount") || 0;
      const totalCost = Number(fuelCost) + Number(maintCost) + Number(expenses);
      const costPerKm = totalDistance > 0 ? (totalCost / Number(totalDistance)).toFixed(2) : 0;
      return res.json({ success: true, data: { totalDistance: Number(totalDistance), totalCost, fuelCost: Number(fuelCost), maintenanceCost: Number(maintCost), otherCosts: Number(expenses), costPerKm } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async idleMonitoring(req: Request, res: Response) {
    try {
      const idleAlerts = await Alert.count({ where: { type: "idle", createdAt: { [Op.gte]: new Date(Date.now() - 30 * 86400000) } } });
      return res.json({ success: true, data: { idleAlertsPast30d: idleAlerts } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async kpiComparison(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 86400000);
      const end = endDate ? new Date(endDate as string) : new Date();
      const where = { createdAt: { [Op.between]: [start, end] } };
      const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
      const prevWhere = { createdAt: { [Op.between]: [prevStart, start] } };
      const trips = await DrivingSession.count({ where: { ...where, endTime: { [Op.not]: null } } });
      const prevTrips = await DrivingSession.count({ where: { ...prevWhere, endTime: { [Op.not]: null } } });
      const distance = await DrivingSession.sum("totalDistance", { where: { ...where, endTime: { [Op.not]: null } } }) || 0;
      const prevDistance = await DrivingSession.sum("totalDistance", { where: { ...prevWhere, endTime: { [Op.not]: null } } }) || 0;
      const revenue = await Expense.sum("amount", { where: { ...where, category: "fuel" } }) || 0;
      return res.json({ success: true, data: { period: { start, end }, current: { trips, distance: Number(distance), revenue: Number(revenue) }, previous: { trips: prevTrips, distance: Number(prevDistance) } } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }
}
