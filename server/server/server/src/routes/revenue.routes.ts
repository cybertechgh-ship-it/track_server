import { Router } from "express";
import { RevenueController } from "../controllers/RevenueController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", RevenueController.getAll);
router.get("/summary", RevenueController.getSummary);
router.get("/:id", [param("id").isInt()], validate, RevenueController.getById);
router.post("/", requireRole(["admin", "operator"]), RevenueController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, RevenueController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, RevenueController.delete);
router.post("/:id/remit", requireRole(["admin", "operator"]), [param("id").isInt()], validate, RevenueController.markRemitted);

export default router;
