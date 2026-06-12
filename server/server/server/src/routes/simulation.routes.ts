import { Router } from "express";
import { SimulationController } from "../controllers/SimulationController";

const router = Router();

router.post("/start", SimulationController.start);
router.post("/stop", SimulationController.stop);
router.get("/status", SimulationController.status);
router.post("/refresh", SimulationController.refresh);

export default router;
