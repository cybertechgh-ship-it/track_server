import { Router } from "express";
import { VendorController } from "../controllers/VendorController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, VendorController.getAll);
router.post("/", authenticateToken, VendorController.create);
router.put("/:id", authenticateToken, VendorController.update);
router.delete("/:id", authenticateToken, VendorController.delete);
export default router;
