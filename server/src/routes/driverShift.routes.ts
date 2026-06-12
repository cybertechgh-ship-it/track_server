import { Router } from "express";
import { DriverShiftController } from "../controllers/DriverShiftController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, DriverShiftController.getAll);
router.get("/schedule", authenticateToken, DriverShiftController.getSchedule);
router.post("/", authenticateToken, DriverShiftController.create);
router.post("/:id/swap", authenticateToken, DriverShiftController.swapRequest);
router.put("/:id", authenticateToken, DriverShiftController.update);
router.delete("/:id", authenticateToken, DriverShiftController.delete);
export default router;
