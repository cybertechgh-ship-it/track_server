import { Request, Response } from "express";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { DrivingSession } from "../models/DrivingSession";
import { LocationLog } from "../models/LocationLog";
import { getSocketIO } from "../config/socket";
import { logger } from "../config/logger";
import { Op } from "sequelize";

interface GPSData {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  rfidCardId?: string; // Optional - only present when card is scanned
  timestamp?: string;
}

export class DeviceController {
  /**
   * MAIN ENDPOINT - GPS data + RFID status
   * Primary endpoint receiving continuous device data
   */
  static async receiveGPSData(req: Request, res: Response) {
    try {
      const {
        deviceId,
        latitude,
        longitude,
        speed = 0,
        heading = 0,
        accuracy = 0,
        rfidCardId,
        timestamp,
      }: GPSData = req.body;

      logger.info(`GPS Data received from device: ${deviceId}`, {
        latitude,
        longitude,
        speed,
        accuracy,
        rfidCardId: rfidCardId ? `***${rfidCardId.slice(-4)}` : "none",
        timestamp: timestamp || "now",
      });

      const isHighAccuracy = accuracy < 20;
      const isValidCoordinates = latitude !== 0 && longitude !== 0;
      const isDefaultLocation = latitude === 39.9334 && longitude === 32.8597;

      if (isDefaultLocation) {
        logger.info("Received default coordinates - GPS fix not available");
      } else if (!isValidCoordinates) {
        logger.info("Invalid coordinates received");
        return res.status(400).json({
          success: false,
          message: "Invalid GPS coordinates",
          code: "INVALID_COORDINATES",
        });
      }

      // 1. Find vehicle for this device
      const vehicle = await Vehicle.findOne({
        where: { esp32DeviceId: deviceId, isActive: true },
      });

      if (!vehicle) {
        logger.error(`Vehicle not found for device: ${deviceId}`);
        return res.status(404).json({
          success: false,
          message: "Vehicle not found or inactive",
          code: "VEHICLE_NOT_FOUND",
        });
      }

      // 2. Validate driver if RFID card is present
      let driver = null;
      let validatedDriver = false;
      let invalidCardAttempt = false;

      if (rfidCardId) {
        driver = await Driver.findOne({
          where: { rfidCardId, isActive: true },
        });

        if (driver) {
          validatedDriver = true;
          logger.info(`Driver validated: ${driver.firstName} ${driver.lastName}`);
        } else {
          invalidCardAttempt = true;
          logger.info(`Invalid RFID card: ${rfidCardId}`);
        }
      }

      // 3. Check current active session
      let currentSession = await DrivingSession.findOne({
        where: {
          vehicleId: vehicle.id,
          isActive: true,
        },
        include: [
          {
            model: Driver,
            as: "driver",
            attributes: ["firstName", "lastName", "rfidCardId"],
          },
        ],
      });

      // 4. Session management
      const sessionResult = await DeviceController.manageSession(
        vehicle,
        driver,
        currentSession,
        { latitude, longitude, speed, heading, accuracy },
        validatedDriver,
        invalidCardAttempt,
        rfidCardId
      );

      // 5. Save location log - always record even for default coordinates
      if (sessionResult.session) {
        await LocationLog.create({
          sessionId: sessionResult.session.id,
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        });

        // 6. Distance update - only on real GPS coordinates
        if (!isDefaultLocation && isValidCoordinates && Math.random() < 0.1) {
          await DeviceController.updateSessionDistance(sessionResult.session.id);
        }

        // 7. Emit socket event
        DeviceController.emitLocationUpdate(sessionResult.session, {
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          isRealGPS: !isDefaultLocation && isValidCoordinates,
          driver: sessionResult.session.driver,
        });
      }

      // 8. Return response
      return res.json({
        success: true,
        message: sessionResult.message,
        data: {
          sessionId: sessionResult.session?.id,
          sessionType: sessionResult.session?.sessionType,
          driverAuthorized: validatedDriver,
          invalidCardAttempt,
          gpsQuality: isDefaultLocation ? "default" : isHighAccuracy ? "high" : "low",
          driver: driver
            ? {
                id: driver.id,
                firstName: driver.firstName,
                lastName: driver.lastName,
              }
            : null,
          vehicle: {
            id: vehicle.id,
            plateNumber: vehicle.plateNumber,
          },
        },
      });
    } catch (error) {
      logger.error("GPS data processing error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process GPS data",
        code: "PROCESSING_ERROR",
      });
    }
  }

  /**
   * Session management logic
   */
  private static async manageSession(
    vehicle: any,
    driver: any,
    currentSession: any,
    location: { latitude: number; longitude: number; speed: number; heading: number; accuracy: number },
    validatedDriver: boolean,
    invalidCardAttempt: boolean = false,
    rfidCardId?: string
  ) {
    const now = new Date();

    // SCENARIO 1: No session exists
    if (!currentSession) {
      logger.info("Creating new session");

      const newSession = await DrivingSession.create({
        driverId: validatedDriver && driver ? driver.id : null,
        vehicleId: vehicle.id,
        startTime: now,
        startLocation: { latitude: location.latitude, longitude: location.longitude },
        sessionType: validatedDriver ? "authorized" : "unauthorized",
        lastHeartbeat: now,
        isActive: true,
        totalDistance: 0,
      });

      // Include driver data
      if (validatedDriver && driver) {
        newSession.driver = driver;
      }

      const io = getSocketIO();
      io.emit("sessionStarted", {
        sessionId: newSession.id,
        vehicleId: vehicle.id,
        driverId: driver?.id || null,
        sessionType: newSession.sessionType,
        startTime: newSession.startTime,
        location,
      });

      return {
        session: newSession,
        message: `New ${newSession.sessionType} session started`,
      };
    }

    // SCENARIO 2: Session exists - update heartbeat
    await currentSession.update({ lastHeartbeat: now });

    // SCENARIO 3-1: RFID card present but invalid
    if (invalidCardAttempt && rfidCardId) {
      logger.info(`Invalid RFID card attempted: ${rfidCardId}`);

      // If current session is authorized, downgrade to unauthorized
      if (currentSession.sessionType === "authorized" && currentSession.driverId) {
        logger.info("Downgrading authorized session to unauthorized due to invalid card");

        // End old session
        await DeviceController.endSessionInternal(currentSession, location);

        // Start new unauthorized session
        const newSession = await DrivingSession.create({
          driverId: null,
          vehicleId: vehicle.id,
          startTime: now,
          startLocation: { latitude: location.latitude, longitude: location.longitude },
          sessionType: "unauthorized",
          lastHeartbeat: now,
          isActive: true,
          totalDistance: 0,
        });

        const io = getSocketIO();
        io.emit("sessionDowngraded", {
          oldSessionId: currentSession.id,
          newSessionId: newSession.id,
          vehicleId: vehicle.id,
          oldDriverId: currentSession.driverId,
          reason: "invalid_rfid_card",
          invalidCardId: rfidCardId,
          downgradeTime: now,
        });

        return {
          session: newSession,
          message: "Session downgraded to unauthorized - invalid RFID card attempted",
        };
      } else {
        // Already unauthorized session - just warn
        const io = getSocketIO();
        io.emit("invalidCardAttempt", {
          sessionId: currentSession.id,
          vehicleId: vehicle.id,
          attemptTime: now,
          invalidCardId: rfidCardId,
        });

        return {
          session: currentSession,
          message: "Invalid RFID card attempted - session remains unauthorized",
        };
      }
    }

    // SCENARIO 3: RFID change detected?
    if (validatedDriver && driver) {
      // SCENARIO 3A: Same driver rescanned card
      if (currentSession.driverId === driver.id) {
        logger.info("Same driver re-authenticated");
        return {
          session: currentSession,
          message: "Driver re-authenticated successfully",
        };
      }

      // SCENARIO 3B: Different driver scanned card
      if (currentSession.driverId && currentSession.driverId !== driver.id) {
        logger.info("Driver change detected");

        // End old session
        await DeviceController.endSessionInternal(currentSession, location);

        // Start new session
        const newSession = await DrivingSession.create({
          driverId: driver.id,
          vehicleId: vehicle.id,
          startTime: now,
          startLocation: { latitude: location.latitude, longitude: location.longitude },
          sessionType: "authorized",
          lastHeartbeat: now,
          isActive: true,
          totalDistance: 0,
        });

        newSession.driver = driver;

        const io = getSocketIO();
        io.emit("driverChanged", {
          oldSessionId: currentSession.id,
          newSessionId: newSession.id,
          vehicleId: vehicle.id,
          oldDriverId: currentSession.driverId,
          newDriverId: driver.id,
          changeTime: now,
        });

        return {
          session: newSession,
          message: "Driver changed - new session started",
        };
      }

      // SCENARIO 3C: Authorized card scanned on unauthorized session
      if (!currentSession.driverId || currentSession.sessionType !== "authorized") {
        logger.info("Unauthorized session upgraded to authorized");

        await currentSession.update({
          driverId: driver.id,
          sessionType: "authorized",
        });

        currentSession.driver = driver;

        const io = getSocketIO();
        io.emit("sessionUpgraded", {
          sessionId: currentSession.id,
          driverId: driver.id,
          vehicleId: vehicle.id,
          upgradeTime: now,
        });

        return {
          session: currentSession,
          message: "Session upgraded to authorized",
        };
      }
    }

    // SCENARIO 4: Session continuing, no changes
    return {
      session: currentSession,
      message: "Session continuing",
    };
  }

  /**
   * Update session distance
   */
  private static async updateSessionDistance(sessionId: number) {
    try {
      const locations = await LocationLog.findAll({
        where: { sessionId },
        order: [["timestamp", "ASC"]],
        attributes: ["latitude", "longitude"],
      });

      if (locations.length < 2) return;

      let totalDistance = 0;
      for (let i = 1; i < locations.length; i++) {
        totalDistance += DeviceController.calculateDistance(
          locations[i - 1].latitude,
          locations[i - 1].longitude,
          locations[i].latitude,
          locations[i].longitude
        );
      }

      await DrivingSession.update(
        { totalDistance: Math.round(totalDistance * 1000) / 1000 },
        { where: { id: sessionId } }
      );
    } catch (error) {
      logger.error("Distance update error:", error);
    }
  }

  /**
   * End session internally
   */
  private static async endSessionInternal(session: any, endLocation: any) {
    try {
      // Final distance calculation
      await DeviceController.updateSessionDistance(session.id);

      await session.update({
        endTime: new Date(),
        endLocation,
        isActive: false,
      });

      const io = getSocketIO();
      io.emit("sessionEnded", {
        sessionId: session.id,
        endTime: session.endTime,
        totalDistance: session.totalDistance,
        reason: "driver_change",
      });

      logger.info(`Session ${session.id} ended internally`);
    } catch (error) {
      logger.error("End session internal error:", error);
    }
  }

  /**
   * Emit location update via socket
   */
  private static emitLocationUpdate(session: any, data: any) {
    try {
      const io = getSocketIO();
      io.emit("locationUpdate", {
        sessionId: session.id,
        vehicleId: session.vehicleId,
        driverId: session.driverId,
        sessionType: session.sessionType,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        accuracy: data.accuracy,
        isRealGPS: data.isRealGPS, // GPS quality indicator
        timestamp: new Date(),
        driver: data.driver,
      });
    } catch (error) {
      logger.error("Socket emit error:", error);
    }
  }

  /**
   * End timed-out sessions (for cron job)
   */
  static async cleanupInactiveSessions() {
    try {
      const timeoutMinutes = 10; // 10 minute timeout
      const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      const inactiveSessions = await DrivingSession.findAll({
        where: {
          isActive: true,
          lastHeartbeat: {
            [Op.lt]: timeoutDate,
          },
        },
      });

      for (const session of inactiveSessions) {
        // Final distance calculation
        await DeviceController.updateSessionDistance(session.id);

        // Get last location for end location
        const lastLocation = await LocationLog.findOne({
          where: { sessionId: session.id },
          order: [["timestamp", "DESC"]],
        });

        await session.update({
          endTime: new Date(),
          endLocation: lastLocation
            ? {
                latitude: lastLocation.latitude,
                longitude: lastLocation.longitude,
              }
            : session.startLocation,
          isActive: false,
        });

        const io = getSocketIO();
        io.emit("sessionEnded", {
          sessionId: session.id,
          endTime: session.endTime,
          totalDistance: session.totalDistance,
          reason: "timeout",
        });

        logger.info(`Session ${session.id} ended due to timeout`);
      }

      logger.info(`Cleaned up ${inactiveSessions.length} inactive sessions`);
      return inactiveSessions.length;
    } catch (error) {
      logger.error("Cleanup inactive sessions error:", error);
      return 0;
    }
  }

  /**
   * Debugging/Admin endpoints
   */

  // Admin: List all active sessions
  static async getActiveSessions(req: Request, res: Response) {
    try {
      const activeSessions = await DrivingSession.findAll({
        where: { isActive: true },
        include: [
          {
            model: Driver,
            as: "driver",
            attributes: ["firstName", "lastName", "rfidCardId"],
          },
          {
            model: Vehicle,
            as: "vehicle",
            attributes: ["plateNumber", "brand", "model", "esp32DeviceId"],
          },
        ],
        order: [["startTime", "DESC"]],
      });

      return res.json({
        success: true,
        data: activeSessions,
        count: activeSessions.length,
      });
    } catch (error) {
      logger.error("Get active sessions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch active sessions",
      });
    }
  }

  // Admin: Force end session manually
  static async forceEndSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { reason = "manual" } = req.body;

      const session = await DrivingSession.findOne({
        where: { id: sessionId, isActive: true },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Active session not found",
        });
      }

      // Get last location
      const lastLocation = await LocationLog.findOne({
        where: { sessionId },
        order: [["timestamp", "DESC"]],
      });

      await DeviceController.updateSessionDistance(session.id);

      await session.update({
        endTime: new Date(),
        endLocation: lastLocation
          ? {
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
            }
          : session.startLocation,
        isActive: false,
      });

      const io = getSocketIO();
      io.emit("sessionEnded", {
        sessionId: session.id,
        endTime: session.endTime,
        totalDistance: session.totalDistance,
        reason,
      });

      return res.json({
        success: true,
        message: "Session ended successfully",
        data: {
          sessionId: session.id,
          totalDistance: session.totalDistance,
          reason,
        },
      });
    } catch (error) {
      logger.error("Force end session error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to end session",
      });
    }
  }

  /**
   * Haversine formula - GPS distance calculation
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Legacy method support (backward compatibility for old endpoints)
   */
  static async validateRfid(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /gps-data endpoint instead.",
      code: "DEPRECATED",
    });
  }

  static async startSession(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /gps-data endpoint instead.",
      code: "DEPRECATED",
    });
  }

  static async logLocation(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /gps-data endpoint instead.",
      code: "DEPRECATED",
    });
  }

  static async endSession(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      message: "This endpoint is deprecated. Use /gps-data endpoint instead.",
      code: "DEPRECATED",
    });
  }
}
