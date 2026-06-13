// ─── Load env FIRST — before any other import reads process.env ───────────────
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config({ path: resolve(__dirname, "../.env"), override: true });
// ──────────────────────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import compression from "compression";
import { createServer } from "http";
import { existsSync, mkdirSync } from "fs";

// Config
import { sequelize } from "./config/database";
import { initializeSocket } from "./config/socket";
import { logger } from "./config/logger";
import { CleanupService } from "./services/cleanupService";
import { SimulationService } from "./services/simulationService";

// Models — import to ensure associations are set up
import "./models";

// Middleware
import { globalErrorHandler } from "./middlewares/error.middleware";
import { requestId } from "./middlewares/requestId.middleware";
import {
  securityHeaders,
  apiLimiter,
  authLimiter,
  deviceLimiter,
  speedLimiter,
  sanitizeInput,
  requestLogger,
} from "./middlewares/security.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import deviceRoutes from "./routes/device.routes";
import driverRoutes from "./routes/driver.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import analyticsRoutes from "./routes/analytics.routes";
import alertRoutes from "./routes/alert.routes";
import seedRoutes from "./routes/seed.routes";
import simulationRoutes from "./routes/simulation.routes";
import uploadRoutes from "./routes/upload.routes";
import deviceManageRoutes from "./routes/deviceManage.routes";
import organizationRoutes from "./routes/organization.routes";
import deploymentRoutes from "./routes/deployment.routes";
import revenueRoutes from "./routes/revenue.routes";
import commissionRoutes from "./routes/commission.routes";
import incidentRoutes from "./routes/incident.routes";
import disciplinaryRoutes from "./routes/disciplinary.routes";
import auditRoutes from "./routes/audit.routes";
import kpiRoutes from "./routes/kpi.routes";
import fleetAnalyticsRoutes from "./routes/fleetAnalytics.routes";

// Ensure upload directories exist
const uploadDirs = ["../uploads", "../uploads/vehicles", "../uploads/drivers"];
uploadDirs.forEach(dir => {
  const p = resolve(__dirname, dir);
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
});

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Trust proxy (Railway / Vercel sit behind one)
app.set("trust proxy", 1);

// Request ID tracking
app.use(requestId);

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(speedLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost dev + any *.vercel.app deploy + your custom CLIENT_URL
const allowedOrigins = [
  "http://localhost:9041",
  "http://127.0.0.1:9041",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any Vercel preview/production URL for this project
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/[\w-]+-[\w-]+\.vercel\.app$/.test(origin) ||
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ──────────────────────────────────────────────────────────────────────────────

// Static files
app.use("/uploads", express.static(resolve(__dirname, "../uploads")));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization & request logging
app.use(sanitizeInput);
app.use(requestLogger);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/device", deviceLimiter, deviceRoutes);
app.use("/api/drivers", apiLimiter, driverRoutes);
app.use("/api/vehicles", apiLimiter, vehicleRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);
app.use("/api/alerts", apiLimiter, alertRoutes);
app.use("/api/seed", apiLimiter, seedRoutes);
app.use("/api/simulation", apiLimiter, simulationRoutes);
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/devices/manage", apiLimiter, deviceManageRoutes);
app.use("/api/organization", apiLimiter, organizationRoutes);
app.use("/api/deployments", apiLimiter, deploymentRoutes);
app.use("/api/revenue", apiLimiter, revenueRoutes);
app.use("/api/commission", apiLimiter, commissionRoutes);
app.use("/api/incidents", apiLimiter, incidentRoutes);
app.use("/api/disciplinary", apiLimiter, disciplinaryRoutes);
app.use("/api/audit", apiLimiter, auditRoutes);
app.use("/api/kpi", apiLimiter, kpiRoutes);
app.use("/api/fleet-analytics", apiLimiter, fleetAnalyticsRoutes);

// 404
app.use("*", (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found", code: "ROUTE_NOT_FOUND" });
});

// Global error handler
app.use(globalErrorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "9040", 10);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development", force: false });
    logger.info("✅ Database synced");

    CleanupService.start();
    SimulationService.start();

    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} — shutting down`);
  httpServer.close(() => {
    sequelize.close().then(() => process.exit(0)).catch(() => process.exit(1));
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

startServer();
