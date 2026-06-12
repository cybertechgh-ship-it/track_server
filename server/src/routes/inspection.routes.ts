import { Router } from "express";
import { InspectionController } from "../controllers/InspectionController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, InspectionController.getAll);
router.post("/", authenticateToken, InspectionController.create);
router.delete("/:id", authenticateToken, InspectionController.delete);
export default router;
