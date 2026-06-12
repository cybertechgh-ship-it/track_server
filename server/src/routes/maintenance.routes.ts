import { Router } from "express";
import { MaintenanceController } from "../controllers/MaintenanceController";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", MaintenanceController.getAll);

router.get("/upcoming", MaintenanceController.getUpcomingMaintenance);

router.get("/vehicle/:vehicleId", MaintenanceController.getVehicleHistory);

router.get("/:id", MaintenanceController.getById);

router.post(
  "/",
  requireRole(["admin", "operator"]),
  [
    body("vehicleId").isInt().withMessage("Valid vehicle ID is required"),
    body("type").isIn(["oil_change", "tire", "brake", "service", "inspection", "fuel", "other"]).withMessage("Valid type is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  validate,
  MaintenanceController.create
);

router.put(
  "/:id",
  requireRole(["admin", "operator"]),
  [param("id").isInt().withMessage("Valid record ID is required")],
  validate,
  MaintenanceController.update
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  [param("id").isInt().withMessage("Valid record ID is required")],
  validate,
  MaintenanceController.delete
);

export default router;
