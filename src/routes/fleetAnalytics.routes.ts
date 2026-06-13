import { Router } from "express";
import { FleetAnalyticsController } from "../controllers/FleetAnalyticsController";
import { apiLimiter } from "../middlewares/security.middleware";

const router = Router();

router.get("/utilization", apiLimiter, FleetAnalyticsController.utilization);
router.get("/driver-scoreboard", apiLimiter, FleetAnalyticsController.driverScoreboard);
router.get("/cost-per-km", apiLimiter, FleetAnalyticsController.costPerKm);
router.get("/idle-monitoring", apiLimiter, FleetAnalyticsController.idleMonitoring);
router.get("/kpi-comparison", apiLimiter, FleetAnalyticsController.kpiComparison);

export default router;
