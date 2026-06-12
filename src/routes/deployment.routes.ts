import { Router } from "express";
import { DeploymentController } from "../controllers/DeploymentController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", DeploymentController.getAll);
router.get("/active", DeploymentController.getActive);
router.get("/:id", [param("id").isInt()], validate, DeploymentController.getById);
router.post("/", requireRole(["admin", "operator"]), DeploymentController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, DeploymentController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, DeploymentController.delete);

export default router;
