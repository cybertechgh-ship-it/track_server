import { Request, Response } from "express";
import { RevenueRecord } from "../models/RevenueRecord";
import { Deployment } from "../models/Deployment";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { Op, fn, col } from "sequelize";
import { AuthRequest } from "../middlewares/auth.middleware";

export class RevenueController {
  static async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate, deploymentId, driverId } = req.query;
      const where: any = {};
      if (deploymentId) where.deploymentId = deploymentId;
      if (driverId) where.driverId = driverId;
      if (startDate && endDate) {
        where.collectionDate = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        };
      }

      const records = await RevenueRecord.findAll({
        where,
        include: [
          { association: "deployment", attributes: ["id", "status"] },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "vehicle", attributes: ["id", "plateNumber"] },
          { association: "supervisor", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["collectionDate", "DESC"]],
      });
      return res.json({ success: true, data: records });
    } catch (error) {
      console.error("Get revenue records error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch revenue records" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const record = await RevenueRecord.findByPk(req.params.id, {
        include: [
          { association: "deployment" },
          { association: "driver", attributes: ["id", "firstName", "lastName"] },
          { association: "vehicle", attributes: ["id", "plateNumber"] },
        ],
      });
      if (!record)
        return res.status(404).json({ success: false, message: "Revenue record not found" });
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error("Get revenue record error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch revenue record" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const record = await RevenueRecord.create(req.body);
      return res
        .status(201)
        .json({ success: true, data: record, message: "Revenue record created" });
    } catch (error: any) {
      console.error("Create revenue record error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create revenue record" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const record = await RevenueRecord.findByPk(req.params.id);
      if (!record)
        return res.status(404).json({ success: false, message: "Revenue record not found" });
      if (record.remittanceDate) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot update a remitted record" });
      }
      await record.update(req.body);
      return res.json({ success: true, data: record, message: "Revenue record updated" });
    } catch (error) {
      console.error("Update revenue record error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update revenue record" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const record = await RevenueRecord.findByPk(req.params.id);
      if (!record)
        return res.status(404).json({ success: false, message: "Revenue record not found" });
      if (record.remittanceDate) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot delete a remitted record" });
      }
      await record.destroy();
      return res.json({ success: true, message: "Revenue record deleted" });
    } catch (error) {
      console.error("Delete revenue record error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete revenue record" });
    }
  }

  static async markRemitted(req: AuthRequest, res: Response) {
    try {
      const record = await RevenueRecord.findByPk(req.params.id);
      if (!record)
        return res.status(404).json({ success: false, message: "Revenue record not found" });
      if (record.remittanceDate)
        return res.status(400).json({ success: false, message: "Already remitted" });

      // FIX: req.user has userId (not id) — was causing null remittedById
      const remittedById = req.user?.userId ?? record.remittedById;

      await record.update({
        remittanceDate: new Date(),
        remittedById,
        status: "remitted",
      });
      return res.json({ success: true, data: record, message: "Revenue marked as remitted" });
    } catch (error) {
      console.error("Mark remitted error:", error);
      return res.status(500).json({ success: false, message: "Failed to mark as remitted" });
    }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};
      if (startDate && endDate) {
        where.collectionDate = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        };
      }

      const summary = await RevenueRecord.findOne({
        where,
        attributes: [
          [fn("COALESCE", fn("SUM", col("amount")), 0), "totalAmount"],
          [fn("COALESCE", fn("SUM", col("expectedAmount")), 0), "totalExpectedAmount"],
          [fn("COUNT", col("id")), "totalRecords"],
        ],
        raw: true,
      });

      return res.json({ success: true, data: summary || {} });
    } catch (error) {
      console.error("Get revenue summary error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch revenue summary" });
    }
  }
}
