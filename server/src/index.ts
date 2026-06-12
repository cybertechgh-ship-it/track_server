// â”€â”€â”€ Load env FIRST â€” before any other import reads process.env â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config({ path: resolve(__dirname, "../.env"), override: true });
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// Models â€” import to ensure associations are set up
import "./models";

// Middleware
import { globalErrorHandler } from "./middlewares/error.middleware";
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
import maintenanceRoutes from "./routes/maintenance.routes";
import reportRoutes from "./routes/report.routes";
import expenseRoutes from "./routes/expense.routes";
import insuranceRoutes from "./routes/insurance.routes";
import trainingRoutes from "./routes/training.routes";
import invoiceRoutes from "./routes/invoice.routes";
import partRoutes from "./routes/part.routes";
import vendorRoutes from "./routes/vendor.routes";
import vehicleBookingRoutes from "./routes/vehicleBooking.routes";
import driverShiftRoutes from "./routes/driverShift.routes";
import inspectionRoutes from "./routes/inspection.routes";
import paymentRoutes from "./routes/payment.routes";
import webhookRoutes from "./routes/webhook.routes";
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

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(speedLimiter);

// â”€â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
app.use("/api/maintenance", apiLimiter, maintenanceRoutes);
app.use("/api/reports", apiLimiter, reportRoutes);
app.use("/api/expenses", apiLimiter, expenseRoutes);
app.use("/api/insurance", apiLimiter, insuranceRoutes);
app.use("/api/training", apiLimiter, trainingRoutes);
app.use("/api/invoices", apiLimiter, invoiceRoutes);
app.use("/api/parts", apiLimiter, partRoutes);
app.use("/api/vendors", apiLimiter, vendorRoutes);
app.use("/api/bookings", apiLimiter, vehicleBookingRoutes);
app.use("/api/shifts", apiLimiter, driverShiftRoutes);
app.use("/api/inspections", apiLimiter, inspectionRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);
app.use("/api/webhooks", apiLimiter, webhookRoutes);
app.use("/api/fleet-analytics", apiLimiter, fleetAnalyticsRoutes);

// 404
app.use("*", (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found", code: "ROUTE_NOT_FOUND" });
});

// Global error handler
app.use(globalErrorHandler);

// â”€â”€â”€ Start â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PORT = process.env.PORT || 9040;

sequelize.authenticate()
  .then(() => {
    logger.info("Database connection established successfully.");
    // Use alter:true in dev to keep schema in sync without losing data
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      
      // Initialize background services
      CleanupService.init();
      if (process.env.NODE_ENV === "development") {
        SimulationService.init();
      }
    });
  })
  .catch((err) => {
    logger.error("Unable to start the server due to database connection error:", err);
    process.exit(1);
  });
