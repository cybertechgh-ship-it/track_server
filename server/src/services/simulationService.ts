import { LocationLog } from "../models/LocationLog";
import { DrivingSession } from "../models/DrivingSession";
import { Vehicle } from "../models/Vehicle";
import { Driver } from "../models/Driver";
import { getSocketIO } from "../config/socket";

interface SimState {
  points: { latitude: number; longitude: number; speed: number; heading: number }[];
  currentIndex: number;
}

const activeSims: Map<number, SimState> = new Map();
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

// Ghana bounding box noise
function jitter(value: number, amount: number) {
  return value + (Math.random() - 0.5) * amount;
}

// Calculate heading between two GPS points
function calcHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Build route points from stored LocationLogs, interpolating between sparse points
function interpolatePoints(
  logs: { latitude: number; longitude: number; speed: number; heading: number }[],
  stepsPerSegment: number = 8
): { latitude: number; longitude: number; speed: number; heading: number }[] {
  if (logs.length <= 1) return logs;

  const result: { latitude: number; longitude: number; speed: number; heading: number }[] = [];

  for (let i = 0; i < logs.length - 1; i++) {
    const a = logs[i];
    const b = logs[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const lat = a.latitude + (b.latitude - a.latitude) * t;
      const lng = a.longitude + (b.longitude - a.longitude) * t;
      const speed = a.speed + (b.speed - a.speed) * t;
      const heading = calcHeading(a.latitude, a.longitude, b.latitude, b.longitude);
      result.push({ latitude: lat, longitude: lng, speed, heading });
    }
  }
  const last = logs[logs.length - 1];
  result.push({
    latitude: last.latitude,
    longitude: last.longitude,
    speed: last.speed,
    heading: last.heading,
  });

  return result;
}

async function tick() {
  try {
    const sessions = await DrivingSession.findAll({
      where: { isActive: true },
      include: [
        { model: Vehicle, as: "vehicle" },
        { model: Driver, as: "driver" },
      ],
      limit: 50,
    });

    for (const session of sessions) {
      let sim = activeSims.get(session.id);

      if (!sim) {
        // Load route points from DB
        const logs = await LocationLog.findAll({
          where: { sessionId: session.id },
          order: [["timestamp", "ASC"]],
          attributes: ["latitude", "longitude", "speed", "heading"],
          limit: 200,
        });

        if (logs.length < 2) continue;

        const points = interpolatePoints(
          logs.map((l) => ({
            latitude: Number(l.latitude),
            longitude: Number(l.longitude),
            speed: Number(l.speed) || 30 + Math.random() * 40,
            heading: Number(l.heading) || 0,
          })),
          6
        );

        sim = { points, currentIndex: 0 };
        activeSims.set(session.id, sim);
      }

      // Advance to next point
      sim.currentIndex = (sim.currentIndex + 1) % sim.points.length;
      const pt = sim.points[sim.currentIndex];

      // Add small jitter for realism
      const io = getSocketIO();
      io.emit("locationUpdate", {
        sessionId: session.id,
        vehicleId: session.vehicleId,
        driverId: session.driverId,
        sessionType: session.sessionType,
        latitude: jitter(pt.latitude, 0.002),
        longitude: jitter(pt.longitude, 0.002),
        speed: Math.max(0, pt.speed + (Math.random() - 0.5) * 10),
        heading: pt.heading + (Math.random() - 0.5) * 10,
        accuracy: 5 + Math.random() * 15,
        isRealGPS: true,
        timestamp: new Date(),
        driver: session.driver
          ? { firstName: (session.driver as any).firstName, lastName: (session.driver as any).lastName }
          : null,
      });
    }
  } catch (err) {
    console.error("Simulation tick error:", err);
  }
}

export class SimulationService {
  static isRunning() {
    return isRunning;
  }

  static activeCount() {
    return activeSims.size;
  }

  static start() {
    if (isRunning) return;
    isRunning = true;
    intervalHandle = setInterval(tick, 2500);
    console.log("Simulation started: vehicles will move every 2.5s");
  }

  static stop() {
    isRunning = false;
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    activeSims.clear();
    console.log("Simulation stopped");
  }

  static async refreshRoutes() {
    activeSims.clear();
    console.log("Simulation routes refreshed");
  }
}
