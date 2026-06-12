import { Router } from "express";
import { IncidentController } from "../controllers/IncidentController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", IncidentController.getAll);
router.get("/:id", [param("id").isInt()], validate, IncidentController.getById);
router.post("/", IncidentController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, IncidentController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, IncidentController.delete);
router.post("/:id/escalate", requireRole(["admin"]), [param("id").isInt()], validate, IncidentController.escalate);

export default router;
