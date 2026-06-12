import { Router } from "express";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { UploadController } from "../controllers/UploadController";
import { authenticateToken } from "../middlewares/auth.middleware";

const makeStorage = (subDir: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(__dirname, `../../uploads/${subDir}`);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${subDir}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

const makeUpload = (subDir: string) =>
  multer({
    storage: makeStorage(subDir),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Only images (jpg, jpeg, png, webp, gif) are allowed"));
    },
  });

const makeMediaUpload = (subDir: string) =>
  multer({
    storage: makeStorage(subDir),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".avi", ".webm", ".pdf", ".doc", ".docx"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Only images, videos, PDFs, and documents are allowed"));
    },
  });

const router = Router();
router.use(authenticateToken);

router.post("/vehicle", makeUpload("vehicles").single("image"), UploadController.uploadVehicle);
router.post("/driver", makeUpload("drivers").single("image"), UploadController.uploadDriver);
router.post("/incident", makeUpload("incidents").single("image"), UploadController.uploadIncident);
router.post("/incident/media", makeMediaUpload("incidents").array("media", 10), UploadController.uploadIncidentMedia);
router.post("/deployment", makeUpload("deployments").single("image"), UploadController.uploadDeployment);
router.post("/revenue", makeUpload("revenue").single("image"), UploadController.uploadRevenue);
router.post("/organization", makeUpload("organization").single("image"), UploadController.uploadOrganization);
router.post("/disciplinary", makeUpload("disciplinary").single("image"), UploadController.uploadDisciplinary);

export default router;
