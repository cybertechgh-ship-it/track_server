import { Router } from "express";
import { DeviceManageController } from "../controllers/DeviceManageController";
import { body, param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", DeviceManageController.getAll);
router.get("/:id", DeviceManageController.getById);

router.post(
  "/",
  requireRole(["admin", "operator"]),
  [
    body("imei").notEmpty().withMessage("IMEI is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("protocol").notEmpty().withMessage("Protocol is required"),
  ],
  validate,
  DeviceManageController.create
);

router.put("/:id", requireRole(["admin", "operator"]), validate, DeviceManageController.update);
router.delete("/:id", requireRole(["admin"]), DeviceManageController.delete);

export default router;
