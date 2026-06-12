import { Router } from "express";
import { KPIController } from "../controllers/KPIController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", KPIController.getAll);
router.get("/dashboard", KPIController.getDashboard);
router.get("/:id", [param("id").isInt()], validate, KPIController.getById);
router.post("/", requireRole(["admin", "operator"]), KPIController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, KPIController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, KPIController.delete);

export default router;
