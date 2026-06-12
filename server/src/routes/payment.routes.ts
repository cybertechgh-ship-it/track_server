import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, PaymentController.getAll);
router.post("/", authenticateToken, PaymentController.create);
router.delete("/:id", authenticateToken, PaymentController.delete);
export default router;
