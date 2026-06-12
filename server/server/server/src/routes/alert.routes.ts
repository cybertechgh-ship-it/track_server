import { Router } from "express";
import { AlertController } from "../controllers/AlertController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { body, param, query } from "express-validator";
import { validate } from "../middlewares/validation.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", AlertController.getAlerts);

router.get("/stats", AlertController.getAlertStats);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 })],
  validate,
  AlertController.getAlertById
);

router.patch(
  "/read",
  [body("ids").isArray({ min: 1 }), body("ids.*").isInt()],
  validate,
  AlertController.markAsRead
);

router.patch(
  "/:id/acknowledge",
  [param("id").isInt({ min: 1 })],
  validate,
  AlertController.acknowledgeAlert
);

export default router;
