import { Router } from "express";
import { PartController } from "../controllers/PartController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, PartController.getAll);
router.post("/", authenticateToken, PartController.create);
router.put("/:id", authenticateToken, PartController.update);
router.delete("/:id", authenticateToken, PartController.delete);
export default router;
