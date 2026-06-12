import { Router } from "express";
import { CommissionController } from "../controllers/CommissionController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", CommissionController.getAll);
router.get("/:id", [param("id").isInt()], validate, CommissionController.getById);
router.post("/", requireRole(["admin"]), CommissionController.create);
router.put("/:id", requireRole(["admin"]), [param("id").isInt()], validate, CommissionController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, CommissionController.delete);

export default router;
