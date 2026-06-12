import { Router } from "express";
import { VehicleBookingController } from "../controllers/VehicleBookingController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, VehicleBookingController.getAll);
router.get("/check-availability", authenticateToken, VehicleBookingController.checkAvailability);
router.post("/", authenticateToken, VehicleBookingController.create);
router.patch("/:id/status", authenticateToken, VehicleBookingController.updateStatus);
router.delete("/:id", authenticateToken, VehicleBookingController.delete);
export default router;
