import { Router } from "express";
import { FleetAnalyticsController } from "../controllers/FleetAnalyticsController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/utilization", authenticateToken, FleetAnalyticsController.utilization);
router.get("/driver-scoreboard", authenticateToken, FleetAnalyticsController.driverScoreboard);
router.get("/cost-per-km", authenticateToken, FleetAnalyticsController.costPerKm);
router.get("/idle-monitoring", authenticateToken, FleetAnalyticsController.idleMonitoring);
router.get("/kpi-comparison", authenticateToken, FleetAnalyticsController.kpiComparison);
export default router;
