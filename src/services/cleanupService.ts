import cron from "node-cron";
import { DeviceController } from "../controllers/DeviceController";
import { logger } from "../config/logger";

export class CleanupService {
  static start() {
    cron.schedule("*/5 * * * *", async () => {
      logger.info("Running session cleanup...");
      try {
        const cleanedCount = await DeviceController.cleanupInactiveSessions();
        if (cleanedCount > 0) {
          logger.info(`Session cleanup completed: ${cleanedCount} sessions ended`);
        }
      } catch (error) {
        logger.error("Session cleanup error:", error);
      }
    });

    logger.info("Cleanup service started");
  }
}
