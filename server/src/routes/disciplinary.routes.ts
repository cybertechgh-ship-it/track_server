import { Router } from "express";
import { DisciplinaryController } from "../controllers/DisciplinaryController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", DisciplinaryController.getAll);
router.get("/:id", [param("id").isInt()], validate, DisciplinaryController.getById);
router.post("/", requireRole(["admin", "operator"]), DisciplinaryController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, DisciplinaryController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, DisciplinaryController.delete);

export default router;
