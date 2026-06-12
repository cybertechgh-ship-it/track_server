import { Router } from "express";
import { InsuranceController } from "../controllers/InsuranceController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, InsuranceController.getAll);
router.get("/expiring", authenticateToken, InsuranceController.getExpiring);
router.post("/", authenticateToken, InsuranceController.create);
router.put("/:id", authenticateToken, InsuranceController.update);
router.delete("/:id", authenticateToken, InsuranceController.delete);
export default router;
