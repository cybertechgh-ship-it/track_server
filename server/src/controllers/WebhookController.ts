import { Request, Response } from "express";
import { Webhook } from "../models/Webhook";
import crypto from "crypto";

export class WebhookController {
  static async getAll(req: Request, res: Response) {
    try { const hooks = await Webhook.findAll({ order: [["name", "ASC"]] }); return res.json({ success: true, data: hooks }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed" }); }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = { ...req.body, secret: req.body.secret || crypto.randomBytes(16).toString("hex") };
      const hook = await Webhook.create(data);
      return res.status(201).json({ success: true, data: hook });
    } catch (error) { return res.status(500).json({ success: false, message: "Failed to create" }); }
  }

  static async update(req: Request, res: Response) {
    try { await Webhook.update(req.body, { where: { id: req.params.id } }); const w = await Webhook.findByPk(req.params.id); return res.json({ success: true, data: w }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to update" }); }
  }

  static async delete(req: Request, res: Response) {
    try { await Webhook.destroy({ where: { id: req.params.id } }); return res.json({ success: true }); }
    catch (error) { return res.status(500).json({ success: false, message: "Failed to delete" }); }
  }

  static async test(req: Request, res: Response) {
    try {
      const hook = await Webhook.findByPk(req.params.id);
      if (!hook) return res.status(404).json({ success: false, message: "Not found" });
      const payload = { event: "test", timestamp: new Date().toISOString(), data: { message: "Webhook test from cyTrack" } };
      const signature = hook.secret ? crypto.createHmac("sha256", hook.secret).update(JSON.stringify(payload)).digest("hex") : "";
      const response = await fetch(hook.url, { method: "POST", headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature }, body: JSON.stringify(payload) });
      return res.json({ success: response.ok, data: { status: response.status } });
    } catch (error: any) { return res.json({ success: false, message: error.message }); }
  }
}
