import { Request, Response } from "express";

export class UploadController {
  static uploadVehicle(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/vehicles/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadDriver(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/drivers/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadIncident(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/incidents/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadDeployment(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/deployments/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadRevenue(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/revenue/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadOrganization(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/organization/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadDisciplinary(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.json({ success: true, data: { url: `/uploads/disciplinary/${req.file.filename}`, filename: req.file.filename } });
  }

  static uploadIncidentMedia(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ success: false, message: "No files uploaded" });
    const items = files.map(f => ({ url: `/uploads/incidents/${f.filename}`, filename: f.filename, mimetype: f.mimetype }));
    return res.json({ success: true, data: items });
  }
}
