import { Router } from "express";
import { AuditController } from "../controllers/AuditController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", requireRole(["admin", "operator"]), AuditController.getAll);
router.get("/summary", requireRole(["admin"]), AuditController.getSummary);
router.get("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, AuditController.getById);

export default router;
