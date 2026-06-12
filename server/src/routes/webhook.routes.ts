import { Router } from "express";
import { WebhookController } from "../controllers/WebhookController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticateToken, WebhookController.getAll);
router.post("/", authenticateToken, WebhookController.create);
router.put("/:id", authenticateToken, WebhookController.update);
router.delete("/:id", authenticateToken, WebhookController.delete);
router.post("/:id/test", authenticateToken, WebhookController.test);
export default router;
