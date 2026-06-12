import { Request, Response } from "express";
import { Expense } from "../models/Expense";
import { Op } from "sequelize";

export class ExpenseController {
  static async getAll(req: Request, res: Response) {
    try {
      const { vehicleId, category, startDate, endDate } = req.query;
      const where: any = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (category) where.category = category;
      if (startDate || endDate) where.expenseDate = { ...(startDate ? { [Op.gte]: new Date(startDate as string) } : {}), ...(endDate ? { [Op.lte]: new Date(endDate as string) } : {}) };
      const expenses = await Expense.findAll({ where, order: [["expenseDate", "DESC"]] });
      return res.json({ success: true, data: expenses });
    } catch (error) { console.error("Get expenses error:", error); return res.status(500).json({ success: false, message: "Failed to fetch expenses" }); }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const where: any = {};
      if (startDate || endDate) where.expenseDate = { ...(startDate ? { [Op.gte]: new Date(startDate as string) } : {}), ...(endDate ? { [Op.lte]: new Date(endDate as string) } : {}) };
      const expenses = await Expense.findAll({ where });
      const total = expenses.reduce((s, e) => s + parseFloat(String(e.amount)), 0);
      const byCategory: Record<string, number> = {};
      expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(String(e.amount)); });
      return res.json({ success: true, data: { total, count: expenses.length, byCategory } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const expense = await Expense.create(req.body); return res.status(201).json({ success: true, data: expense }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to create expense" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Expense.update(req.body, { where: { id: req.params.id } }); const expense = await Expense.findByPk(req.params.id); return res.json({ success: true, data: expense }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Expense.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
