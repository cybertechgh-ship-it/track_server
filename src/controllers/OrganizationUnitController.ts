import { Request, Response } from "express";
import { logger } from "../config/logger";
import { OrganizationUnit } from "../models/OrganizationUnit";

export class OrganizationUnitController {
  static async getAll(req: Request, res: Response) {
    try {
      const units = await OrganizationUnit.findAll({
        include: [
          { association: "parent", attributes: ["id", "name"] },
          { association: "manager", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["name", "ASC"]],
      });
      return res.json({ success: true, data: units });
    } catch (error) {
      logger.error("Get organization units error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch organization units" });
    }
  }

  static async getTree(req: Request, res: Response) {
    try {
      const rootUnits = await OrganizationUnit.findAll({
        where: { parentId: null },
        include: [
          { association: "manager", attributes: ["id", "firstName", "lastName"] },
          {
            association: "children",
            include: [
              { association: "manager", attributes: ["id", "firstName", "lastName"] },
              {
                association: "children",
                include: [{ association: "manager", attributes: ["id", "firstName", "lastName"] }],
              },
            ],
          },
        ],
        order: [["name", "ASC"]],
      });
      return res.json({ success: true, data: rootUnits });
    } catch (error) {
      logger.error("Get org tree error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch organization tree" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const unit = await OrganizationUnit.findByPk(req.params.id, {
        include: [
          { association: "parent", attributes: ["id", "name"] },
          { association: "manager", attributes: ["id", "firstName", "lastName"] },
          { association: "children", attributes: ["id", "name"] },
        ],
      });
      if (!unit) return res.status(404).json({ success: false, message: "Organization unit not found" });
      return res.json({ success: true, data: unit });
    } catch (error) {
      logger.error("Get org unit error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch organization unit" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const unit = await OrganizationUnit.create(req.body);
      return res.status(201).json({ success: true, data: unit, message: "Organization unit created" });
    } catch (error: any) {
      logger.error("Create org unit error:", error);
      return res.status(500).json({ success: false, message: "Failed to create organization unit" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const unit = await OrganizationUnit.findByPk(req.params.id);
      if (!unit) return res.status(404).json({ success: false, message: "Organization unit not found" });
      await unit.update(req.body);
      return res.json({ success: true, data: unit, message: "Organization unit updated" });
    } catch (error) {
      logger.error("Update org unit error:", error);
      return res.status(500).json({ success: false, message: "Failed to update organization unit" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const unit = await OrganizationUnit.findByPk(req.params.id);
      if (!unit) return res.status(404).json({ success: false, message: "Organization unit not found" });
      await unit.destroy();
      return res.json({ success: true, message: "Organization unit deleted" });
    } catch (error) {
      logger.error("Delete org unit error:", error);
      return res.status(500).json({ success: false, message: "Failed to delete organization unit" });
    }
  }
}
