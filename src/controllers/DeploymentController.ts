import { Request, Response } from "express";
import { logger } from "../config/logger";
import { Deployment } from "../models/Deployment";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { OrganizationUnit } from "../models/OrganizationUnit";
import { Op } from "sequelize";

export class DeploymentController {
  static async getAll(req: Request, res: Response) {
    try {
      const { status, driverId, vehicleId } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (driverId) where.driverId = driverId;
      if (vehicleId) where.vehicleId = vehicleId;

      const deployments = await Deployment.findAll({
        where,
        include: [
          { association: "driver", attributes: ["id", "firstName", "lastName", "phone"] },
          { association: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] },
          { association: "supervisor", attributes: ["id", "firstName", "lastName"] },
          { association: "organizationUnit", attributes: ["id", "name"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.json({ success: true, data: deployments });
    } catch (error) {
      logger.error("Get deployments error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch deployments" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const deployment = await Deployment.findByPk(req.params.id, {
        include: [
          { association: "driver", attributes: ["id", "firstName", "lastName", "phone"] },
          { association: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] },
          { association: "supervisor", attributes: ["id", "firstName", "lastName"] },
          { association: "organizationUnit", attributes: ["id", "name"] },
          { association: "approvedBy", attributes: ["id", "firstName", "lastName"] },
        ],
      });
      if (!deployment)
        return res.status(404).json({ success: false, message: "Deployment not found" });
      return res.json({ success: true, data: deployment });
    } catch (error) {
      logger.error("Get deployment error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch deployment" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const deployment = await Deployment.create(req.body);
      return res
        .status(201)
        .json({ success: true, data: deployment, message: "Deployment created" });
    } catch (error: any) {
      logger.error("Create deployment error:", error);
      return res.status(500).json({ success: false, message: "Failed to create deployment" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const deployment = await Deployment.findByPk(req.params.id);
      if (!deployment)
        return res.status(404).json({ success: false, message: "Deployment not found" });
      await deployment.update(req.body);
      return res.json({ success: true, data: deployment, message: "Deployment updated" });
    } catch (error) {
      logger.error("Update deployment error:", error);
      return res.status(500).json({ success: false, message: "Failed to update deployment" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const deployment = await Deployment.findByPk(req.params.id);
      if (!deployment)
        return res.status(404).json({ success: false, message: "Deployment not found" });
      await deployment.destroy();
      return res.json({ success: true, message: "Deployment deleted" });
    } catch (error) {
      logger.error("Delete deployment error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete deployment" });
    }
  }

  static async getActive(req: Request, res: Response) {
    try {
      // FIX: previous Op.or with null was invalid Sequelize syntax — caused runtime crash.
      // Correct approach: use Op.or as a top-level array condition.
      const deployments = await Deployment.findAll({
        where: {
          status: "active",
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: new Date() } },
          ],
        },
        include: [
          { association: "driver", attributes: ["id", "firstName", "lastName", "phone"] },
          { association: "vehicle", attributes: ["id", "plateNumber", "brand", "model"] },
          { association: "supervisor", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["startDate", "ASC"]],
      });
      return res.json({ success: true, data: deployments });
    } catch (error) {
      logger.error("Get active deployments error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch active deployments" });
    }
  }
}
