import { Router } from "express";
import { TrainingController } from "../controllers/TrainingController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, TrainingController.getAll);
router.get("/expiring", authenticateToken, TrainingController.getExpiring);
router.post("/", authenticateToken, TrainingController.create);
router.put("/:id", authenticateToken, TrainingController.update);
router.delete("/:id", authenticateToken, TrainingController.delete);
export default router;
