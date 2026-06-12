import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", ReportController.getAll);

router.get("/types", ReportController.getReportTypes);

router.get("/dashboard", ReportController.getDashboardStats);

router.get("/:id", ReportController.getById);

router.get("/:id/download", ReportController.download);

router.post(
  "/generate",
  requireRole(["admin", "operator"]),
  [body("type").notEmpty(), body("name").notEmpty()],
  validate,
  ReportController.generate
);

router.put(
  "/:id/archive",
  requireRole(["admin", "operator"]),
  [param("id").isInt()],
  validate,
  ReportController.archive
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  [param("id").isInt()],
  validate,
  ReportController.delete
);

export default router;
