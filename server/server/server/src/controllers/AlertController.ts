import { Request, Response, NextFunction } from "express";
import { Alert } from "../models/Alert";
import { Op } from "sequelize";
import { asyncHandler } from "../middlewares/error.middleware";
import { ResponseHelper } from "../utils/response";

export class AlertController {
  static getAlerts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = "1",
      limit = "20",
      type,
      severity,
      isRead,
      isAcknowledged,
      vehicleId,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead === "true";
    if (isAcknowledged !== undefined) where.isAcknowledged = isAcknowledged === "true";
    if (vehicleId) where.vehicleId = parseInt(vehicleId as string);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }

    const { count, rows } = await Alert.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    ResponseHelper.paginated(res, rows, count, pageNum, limitNum);
  });

  static getAlertById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const alert = await Alert.findByPk(parseInt(req.params.id));
    if (!alert) {
      res.status(404).json({ success: false, message: "Alert not found" });
      return;
    }
    ResponseHelper.success(res, alert);
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: "ids array is required" });
      return;
    }
    await Alert.update({ isRead: true }, { where: { id: { [Op.in]: ids } } });
    ResponseHelper.success(res, { updated: ids.length });
  });

  static acknowledgeAlert = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const alert = await Alert.findByPk(parseInt(req.params.id));
    if (!alert) {
      res.status(404).json({ success: false, message: "Alert not found" });
      return;
    }
    await alert.update({
      isRead: true,
      isAcknowledged: true,
      acknowledgedBy: (req as any).user?.userId || null,
      acknowledgedAt: new Date(),
    });
    ResponseHelper.success(res, alert);
  });

  static getAlertStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const total = await Alert.count();
    const unread = await Alert.count({ where: { isRead: false } });
    const bySeverity = await Alert.findAll({
      attributes: ["severity", [Alert.sequelize!.fn("COUNT", Alert.sequelize!.col("id")), "count"]],
      group: ["severity"],
      raw: true,
    });
    const byType = await Alert.findAll({
      attributes: ["type", [Alert.sequelize!.fn("COUNT", Alert.sequelize!.col("id")), "count"]],
      group: ["type"],
      raw: true,
    });

    ResponseHelper.success(res, { total, unread, bySeverity, byType });
  });
}
