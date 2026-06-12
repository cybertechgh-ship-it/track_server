import { Router } from "express";
import { SeedController } from "../controllers/SeedController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.post("/", SeedController.seed);
router.delete("/", SeedController.clearSeed);

export default router;
