import { body, param, query } from "express-validator";

export const authSchemas = {
  login: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],

  register: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage("Password must contain uppercase, lowercase, number, and special character"),
    body("role").optional().isIn(["admin", "operator", "viewer"]).withMessage("Invalid role"),
  ],
};

export const driverSchemas = {
  create: [
    body("rfidCardId")
      .isLength({ min: 4, max: 50 })
      .matches(/^[A-Z0-9]+$/)
      .withMessage("RFID card ID must be alphanumeric uppercase"),
    body("firstName")
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("First name must contain only letters"),
    body("lastName")
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Last name must contain only letters"),
    body("phone")
      .matches(/^\+?[0-9\-]{7,15}$/)
      .withMessage("Valid phone number required"),
    body("email").optional().isEmail().normalizeEmail(),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("Valid driver ID required"),
    body("firstName").optional().isLength({ min: 2, max: 50 }),
    body("lastName").optional().isLength({ min: 2, max: 50 }),
    body("phone")
      .optional()
      .matches(/^\+?[0-9\-]{7,15}$/),
    body("email").optional().isEmail().normalizeEmail(),
  ],

  delete: [param("id").isInt({ min: 1 }).withMessage("Valid driver ID required")],

  stats: [
    param("id").isInt({ min: 1 }).withMessage("Valid driver ID required"),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
};

export const vehicleSchemas = {
  create: [
    body("plateNumber")
      .matches(/^[A-Z]{2,3}-\d{4}-\d{2}$/)
      .withMessage("Valid plate number required (e.g., GH-1001-20)"),
    body("brand")
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Brand must contain only letters"),
    body("model").isLength({ min: 1, max: 50 }).withMessage("Model is required"),
    body("year")
      .isInt({ min: 1950, max: new Date().getFullYear() + 2 })
      .withMessage("Valid year required"),
    body("esp32DeviceId")
      .isLength({ min: 8, max: 50 })
      .matches(/^ESP32_[A-Z0-9_]+$/)
      .withMessage("Device ID must start with ESP32_"),
  ],

  update: [param("id").isInt({ min: 1 }).withMessage("Valid vehicle ID required")],

  delete: [param("id").isInt({ min: 1 }).withMessage("Valid vehicle ID required")],
};

export const deviceSchemas = {
  validateRfid: [
    body("rfidCardId")
      .isLength({ min: 4, max: 50 })
      .matches(/^[A-Z0-9]+$/)
      .withMessage("Valid RFID card ID required"),
    body("deviceId")
      .matches(/^ESP32_[A-Z0-9_]+$/)
      .withMessage("Valid device ID required"),
  ],

  startSession: [
    body("driverId").isInt({ min: 1 }).withMessage("Valid driver ID required"),
    body("vehicleId").isInt({ min: 1 }).withMessage("Valid vehicle ID required"),
    body("location").isObject().withMessage("Location object required"),
    body("location.latitude").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required"),
    body("location.longitude").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required"),
  ],

  logLocation: [
    body("sessionId").isInt({ min: 1 }).withMessage("Valid session ID required"),
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required"),
    body("speed").optional().isFloat({ min: 0, max: 300 }).withMessage("Speed must be between 0-300 km/h"),
    body("heading").optional().isFloat({ min: 0, max: 360 }).withMessage("Heading must be between 0-360 degrees"),
    body("accuracy").optional().isFloat({ min: 0 }).withMessage("Accuracy must be positive"),
  ],

  endSession: [
    body("sessionId").isInt({ min: 1 }).withMessage("Valid session ID required"),
    body("location").isObject().withMessage("Location object required"),
    body("location.latitude").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required"),
    body("location.longitude").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required"),
  ],
};

export const analyticsSchemas = {
  dashboard: [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601()],

  daily: [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601()],

  sessions: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("driverId").optional().isInt({ min: 1 }),
    query("vehicleId").optional().isInt({ min: 1 }),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],

  route: [param("sessionId").isInt({ min: 1 }).withMessage("Valid session ID required")],
};
