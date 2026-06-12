import { Router } from "express";
import { ExpenseController } from "../controllers/ExpenseController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, ExpenseController.getAll);
router.get("/summary", authenticateToken, ExpenseController.getSummary);
router.post("/", authenticateToken, ExpenseController.create);
router.put("/:id", authenticateToken, ExpenseController.update);
router.delete("/:id", authenticateToken, ExpenseController.delete);
export default router;
