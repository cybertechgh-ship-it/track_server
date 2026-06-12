import { Router } from "express";
import { InvoiceController } from "../controllers/InvoiceController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, InvoiceController.getAll);
router.get("/stats", authenticateToken, InvoiceController.getStats);
router.post("/", authenticateToken, InvoiceController.create);
router.put("/:id", authenticateToken, InvoiceController.update);
router.delete("/:id", authenticateToken, InvoiceController.delete);
export default router;
