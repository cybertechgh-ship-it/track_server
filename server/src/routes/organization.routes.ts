import { Router } from "express";
import { OrganizationUnitController } from "../controllers/OrganizationUnitController";
import { param } from "express-validator";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken);

router.get("/", OrganizationUnitController.getAll);
router.get("/tree", OrganizationUnitController.getTree);
router.get("/:id", [param("id").isInt()], validate, OrganizationUnitController.getById);
router.post("/", requireRole(["admin", "operator"]), OrganizationUnitController.create);
router.put("/:id", requireRole(["admin", "operator"]), [param("id").isInt()], validate, OrganizationUnitController.update);
router.delete("/:id", requireRole(["admin"]), [param("id").isInt()], validate, OrganizationUnitController.delete);

export default router;
