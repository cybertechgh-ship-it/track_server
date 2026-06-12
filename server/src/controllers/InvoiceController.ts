import { Request, Response } from "express";
import { Invoice } from "../models/Invoice";
import { Op } from "sequelize";

export class InvoiceController {
  static async getAll(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status) where.status = status;
      const invoices = await Invoice.findAll({ where, order: [["createdAt", "DESC"]] });
      return res.json({ success: true, data: invoices });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const invoices = await Invoice.findAll();
      const total = invoices.reduce((s, i) => s + parseFloat(String(i.total)), 0);
      const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(String(i.total)), 0);
      const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + parseFloat(String(i.total)), 0);
      const pending = invoices.filter(i => i.status === "sent" || i.status === "draft").reduce((s, i) => s + parseFloat(String(i.total)), 0);
      return res.json({ success: true, data: { total, paid, overdue, pending, count: invoices.length } });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try { const inv = await Invoice.create(req.body); return res.status(201).json({ success: true, data: inv }); }
    catch (error: any) { return res.status(500).json({ success: false, message: error.message || "Failed" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Invoice.update(req.body, { where: { id: req.params.id } }); const i = await Invoice.findByPk(req.params.id); return res.json({ success: true, data: i }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Invoice.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }
}
