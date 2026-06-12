import { Request, Response } from "express";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { DrivingSession } from "../models/DrivingSession";
import { LocationLog } from "../models/LocationLog";
import { Alert } from "../models/Alert";
import { sequelize } from "../config/database";
import { Op, QueryTypes } from "sequelize";

const GHANA_CITIES = [
  { name: "Accra", lat: 5.6037, lng: -0.1870 },
  { name: "Kumasi", lat: 6.6885, lng: -1.6244 },
  { name: "Takoradi", lat: 4.8845, lng: -1.7554 },
  { name: "Tamale", lat: 9.4008, lng: -0.8393 },
  { name: "Cape Coast", lat: 5.1315, lng: -1.2795 },
  { name: "Tema", lat: 5.6692, lng: -0.0166 },
  { name: "Koforidua", lat: 6.0920, lng: -0.2593 },
  { name: "Ho", lat: 6.6103, lng: 0.4653 },
  { name: "Sunyani", lat: 7.3366, lng: -2.3279 },
  { name: "Bolgatanga", lat: 10.7850, lng: -0.8514 },
  { name: "Wa", lat: 10.0601, lng: -2.5000 },
  { name: "Tema", lat: 5.6692, lng: -0.0166 },
];

const GHANA_NAMES = [
  { first: "Kwame", last: "Asante" },
  { first: "Akua", last: "Mensah" },
  { first: "Kofi", last: "Owusu" },
  { first: "Yaa", last: "Boateng" },
  { first: "Yaw", last: "Addo" },
  { first: "Abena", last: "Osei" },
  { first: "Kwesi", last: "Agyeman" },
  { first: "Efia", last: "Darko" },
  { first: "Nana", last: "Sarpong" },
  { first: "Mawusi", last: "Dodoo" },
  { first: "Sena", last: "Tetteh" },
  { first: "Adwoa", last: "Cudjoe" },
  { first: "Kwaku", last: "Amoah" },
  { first: "Afia", last: "Quartey" },
  { first: "Kojo", last: "Arhin" },
  { first: "Esi", last: "Bediako" },
  { first: "Kobina", last: "Sackey" },
  { first: "Ama", last: "Opoku" },
  { first: "Fiifi", last: "Ackah" },
  { first: "Naa", last: "Lartey" },
];

const VEHICLES = [
  { brand: "Toyota", model: "Hilux", year: 2023 },
  { brand: "Nissan", model: "Navara", year: 2023 },
  { brand: "Hyundai", model: "Tucson", year: 2024 },
  { brand: "Kia", model: "Sorento", year: 2023 },
  { brand: "Mercedes", model: "Sprinter", year: 2024 },
  { brand: "Toyota", model: "Corolla", year: 2024 },
  { brand: "Mitsubishi", model: "L200", year: 2023 },
  { brand: "Honda", model: "CR-V", year: 2024 },
  { brand: "Suzuki", model: "Swift", year: 2023 },
  { brand: "Ford", model: "Ranger", year: 2024 },
  { brand: "Mazda", model: "CX-5", year: 2023 },
  { brand: "Volkswagen", model: "Amarok", year: 2024 },
  { brand: "Toyota", model: "Camry", year: 2023 },
  { brand: "Nissan", model: "Sunny", year: 2024 },
  { brand: "Hyundai", model: "Elantra", year: 2023 },
  { brand: "Isuzu", model: "D-Max", year: 2024 },
  { brand: "Peugeot", model: "3008", year: 2023 },
  { brand: "Toyota", model: "Rav4", year: 2024 },
  { brand: "Honda", model: "Accord", year: 2023 },
  { brand: "Kia", model: "Sportage", year: 2024 },
];

const PLATE_LETTERS = "GT";
const getPlate = (i: number) =>
  `${PLATE_LETTERS}-${String(1000 + i).slice(-4)}-${String(20 + Math.floor(i / 26))}`;

const getEsp32Id = (i: number) =>
  `ESP32_GH_${String(i + 1).padStart(4, "0")}`;

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const jitter = (base: number, amount: number) =>
  base + randomBetween(-amount, amount);

function generateRoutePoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  count: number
): { lat: number; lng: number; speed: number; heading: number }[] {
  const points: { lat: number; lng: number; speed: number; heading: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const lat = startLat + (endLat - startLat) * t + randomBetween(-0.008, 0.008);
    const lng = startLng + (endLng - startLng) * t + randomBetween(-0.008, 0.008);
    const speed = Math.random() > 0.3 ? randomBetween(20, 90) : randomBetween(0, 15);
    const heading = ((Math.atan2(endLat - startLat, endLng - startLng) * 180) / Math.PI + 360) % 360;
    points.push({ lat, lng, speed, heading });
  }
  return points;
}

export class SeedController {
  static async seed(req: Request, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      const adminEmail = req.body?.email || "admin@admin.com";

      const adminUser = await sequelize.query<{ id: number }>(
        `SELECT id FROM "users" WHERE email = :email LIMIT 1`,
        { replacements: { email: adminEmail }, type: QueryTypes.SELECT, transaction }
      );

      if (!adminUser || adminUser.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Admin user not found. Login first, then try again.",
        });
      }

      const userId = adminUser[0].id;

      const existingCount = await Driver.count({ transaction });
      if (existingCount >= 20) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Demo data already exists (${existingCount} drivers). Delete existing data first if you want to re-seed.`,
        });
      }

      const drivers: Driver[] = [];
      const vehicles: Vehicle[] = [];

      for (let i = 0; i < 20; i++) {
        const driver = await Driver.create(
          {
            rfidCardId: `RFID_GH_${String(i + 1).padStart(4, "0")}`,
            firstName: GHANA_NAMES[i].first,
            lastName: GHANA_NAMES[i].last,
            phone: `+233-${String(500000000 + i).slice(0, 9)}`,
            email: `${GHANA_NAMES[i].first.toLowerCase()}.${GHANA_NAMES[i].last.toLowerCase()}@example.com`,
            isActive: true,
            licenseNumber: `GH-${String(100000 + i).slice(-6)}`,
            behaviorScore: Math.round(randomBetween(65, 100)),
          },
          { transaction }
        );
        drivers.push(driver);
      }

      for (let i = 0; i < 20; i++) {
        const vehicle = await Vehicle.create(
          {
            plateNumber: getPlate(i),
            brand: VEHICLES[i].brand,
            model: VEHICLES[i].model,
            year: VEHICLES[i].year,
            esp32DeviceId: getEsp32Id(i),
            isActive: true,
            color: ["#e74c3c", "#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"][i % 8],
            speedLimit: Math.random() > 0.7 ? 80 : 120,
            totalOdometer: Math.floor(randomBetween(5000, 120000)),
          },
          { transaction }
        );
        vehicles.push(vehicle);
      }

      let totalSessions = 0;
      let totalLogs = 0;

      for (let i = 0; i < 20; i++) {
        const driver = drivers[i];
        const vehicle = vehicles[i];
        const city = GHANA_CITIES[i % GHANA_CITIES.length];
        const nextCity = GHANA_CITIES[(i + 5) % GHANA_CITIES.length];

        const isActive = i < 10;
        const startLat = jitter(city.lat, 0.015);
        const startLng = jitter(city.lng, 0.015);
        const hoursAgo = isActive ? randomBetween(0.1, 2) : randomBetween(24, 72);
        const startTime = new Date(Date.now() - hoursAgo * 3600000);

        const session = await DrivingSession.create(
          {
            driverId: driver.id,
            vehicleId: vehicle.id,
            startTime,
            endTime: null,
            startLocation: { latitude: startLat, longitude: startLng },
            isActive: true,
            sessionType: "authorized",
            lastHeartbeat: new Date(),
            totalDistance: 0,
          },
          { transaction }
        );

        const pointCount = Math.floor(randomBetween(5, 12));
        const endLat = jitter(isActive ? city.lat : nextCity.lat, isActive ? 0.008 : 0.02);
        const endLng = jitter(isActive ? city.lng : nextCity.lng, isActive ? 0.008 : 0.02);
        const routePoints = generateRoutePoints(startLat, startLng, endLat, endLng, pointCount);

        const logs: any[] = [];
        for (let p = 0; p < routePoints.length; p++) {
          logs.push({
            sessionId: session.id,
            latitude: routePoints[p].lat,
            longitude: routePoints[p].lng,
            speed: isActive && p === routePoints.length - 1 ? randomBetween(20, 80) : routePoints[p].speed,
            heading: routePoints[p].heading,
            accuracy: randomBetween(3, 12),
            timestamp: new Date(startTime.getTime() + p * 60000),
          });
          totalLogs++;
        }

        await LocationLog.bulkCreate(logs, { transaction });
        totalSessions++;

        const totalDist = routePoints.reduce((sum, p, idx) => {
          if (idx === 0) return 0;
          const prev = routePoints[idx - 1];
          const dlat = (p.lat - prev.lat) * 111.32;
          const dlng = (p.lng - prev.lng) * 111.32 * Math.cos((p.lat * Math.PI) / 180);
          return sum + Math.sqrt(dlat * dlat + dlng * dlng);
        }, 0);

        if (!isActive) {
          await session.update(
            {
              endLocation: { latitude: endLat, longitude: endLng },
              endTime: new Date(startTime.getTime() + pointCount * 60000),
              totalDistance: Math.round(totalDist * 1000) / 1000,
              isActive: false,
              lastHeartbeat: new Date(startTime.getTime() + pointCount * 60000),
            },
            { transaction }
          );
        } else {
          await session.update(
            {
              totalDistance: Math.round(totalDist * 1000) / 1000,
              isActive: true,
              lastHeartbeat: new Date(),
            },
            { transaction }
          );
        }

        if (Math.random() > 0.4) {
          const alertType = ["speed", "idle", "maintenance"][Math.floor(Math.random() * 3)] as string;
          await Alert.create(
            {
              type: alertType,
              severity: (["low", "medium", "high", "critical"] as const)[Math.floor(Math.random() * 4)],
              vehicleId: vehicle.id,
              driverId: driver.id,
              sessionId: session.id,
              message: alertType === "speed"
                ? `${vehicle.plateNumber} - Hız limiti aşıldı: ${Math.round(randomBetween(90, 140))} km/h`
                : alertType === "idle"
                ? `${vehicle.plateNumber} - ${Math.round(randomBetween(5, 30))} dakika rölanti`
                : `${vehicle.plateNumber} - Bakım zamanı yaklaşıyor (${Math.round(randomBetween(100, 5000))} km kaldı)`,
              data: {},
              isRead: Math.random() > 0.5,
              isAcknowledged: Math.random() > 0.75,
              latitude: endLat,
              longitude: endLng,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      return res.json({
        success: true,
        message: "Demo data seeded successfully for Ghana!",
        data: {
          drivers: 20,
          vehicles: 20,
          sessions: totalSessions,
          locationLogs: totalLogs,
        },
      });
    } catch (error: any) {
      await transaction.rollback();
      console.error("Seed error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Seed failed",
      });
    }
  }

  static async clearSeed(req: Request, res: Response) {
    try {
      const deletedAlerts = await Alert.destroy({ where: {} });
      const deletedLogs = await LocationLog.destroy({ where: {} });
      const deletedSessions = await DrivingSession.destroy({ where: {} });
      const deletedDrivers = await Driver.destroy({ where: { email: { [Op.like]: "%@example.com" } } });
      const deletedVehicles = await Vehicle.destroy({ where: { esp32DeviceId: { [Op.like]: "ESP32_GH_%" } } });

      return res.json({
        success: true,
        message: "Demo data cleared",
        data: {
          deletedAlerts,
          deletedLogs,
          deletedSessions,
          deletedDrivers,
          deletedVehicles,
        },
      });
    } catch (error: any) {
      console.error("Clear seed error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Clear failed",
      });
    }
  }
}
