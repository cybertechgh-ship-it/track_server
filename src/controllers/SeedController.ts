import { Request, Response } from "express";
import { logger } from "../config/logger";
import { Driver } from "../models/Driver";
import { Vehicle } from "../models/Vehicle";
import { Device } from "../models/Device";
import { DrivingSession } from "../models/DrivingSession";
import { LocationLog } from "../models/LocationLog";
import { Alert } from "../models/Alert";
import { OrganizationUnit } from "../models/OrganizationUnit";
import { Deployment } from "../models/Deployment";
import { RevenueRecord } from "../models/RevenueRecord";
import { IncidentReport } from "../models/IncidentReport";
import { KPI } from "../models/KPI";
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

const VEHICLE_IMAGES = [
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Toyota+Hilux',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Nissan+Navara',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Hyundai+Tucson',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Kia+Sorento',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Mercedes+Sprinter',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Toyota+Corolla',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Mitsubishi+L200',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Honda+CR-V',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Suzuki+Swift',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Ford+Ranger',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Mazda+CX-5',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Volkswagen+Amarok',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Toyota+Camry',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Nissan+Sunny',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Hyundai+Elantra',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Isuzu+D-Max',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Peugeot+3008',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Toyota+Rav4',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Honda+Accord',
  'https://placehold.co/400x250/1a1a2e/00c9a7?text=Kia+Sportage',
];

const DRIVER_IMAGES = [
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1779109679/Mr._Oppong_Ampnsah_nsjftn.avif',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1779109679/Suleiman_Habuba_abxq5e.avif',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1779109679/Clara_Pinkrah-Sam_pvjf5v.avif',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1779109679/Katherine_s8yhms.avif',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778751233/Joe-Tackie-270x315_hztdld.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778716831/emmanuel-270x315_ho2yl2.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778716830/Kwasi-Okyere-Boateng--270x315_r79yrk.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778716830/prudence-270x315_zoepyu.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1778716830/Afful-270x315_a4brbm.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1776230143/1_4_sbjq8z.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1776230139/1_3_cwsqrr.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1776230139/1_2_jjlnjh.jpg',
  'https://res.cloudinary.com/dwsl2ktt2/image/upload/v1776230139/1_1_mkjpox.jpg',
];

const DEVICES = [
  { imei: "863456032114551", name: "GT06N-001", protocol: "GT06N", firmware: "v3.2.1", signal: 5, battery: 98, simStatus: "Active", isOnline: true },
  { imei: "863456032114552", name: "TLT-FMB140", protocol: "Teltonika", firmware: "v3.1.8", signal: 3, battery: 41, simStatus: "Active", isOnline: true },
  { imei: "863456032114553", name: "GT06N-003", protocol: "GT06N", firmware: "v3.2.0", signal: 0, battery: 12, simStatus: "Inactive", isOnline: false },
  { imei: "863456032114554", name: "TLT-FMB920", protocol: "Teltonika", firmware: "v3.2.1", signal: 4, battery: 76, simStatus: "Active", isOnline: true },
  { imei: "863456032114555", name: "GT06N-005", protocol: "GT06N", firmware: "v3.1.9", signal: 5, battery: 91, simStatus: "Active", isOnline: true },
  { imei: "863456032114556", name: "Concox-AT4", protocol: "Concox", firmware: "v2.4.0", signal: 4, battery: 84, simStatus: "Active", isOnline: true },
  { imei: "863456032114557", name: "GT06N-007", protocol: "GT06N", firmware: "v3.2.0", signal: 2, battery: 33, simStatus: "Active", isOnline: true },
  { imei: "863456032114558", name: "TLT-FMB140", protocol: "Teltonika", firmware: "v3.1.8", signal: 5, battery: 97, simStatus: "Active", isOnline: true },
];

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
            photo: DRIVER_IMAGES[i % DRIVER_IMAGES.length],
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
            photo: VEHICLE_IMAGES[i],
            color: ["#e74c3c", "#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"][i % 8],
            speedLimit: Math.random() > 0.7 ? 80 : 120,
            totalOdometer: Math.floor(randomBetween(5000, 120000)),
          },
          { transaction }
        );
        vehicles.push(vehicle);
      }

      // Seed devices
      for (let i = 0; i < DEVICES.length; i++) {
        const d = DEVICES[i];
        const lastPing = d.isOnline
          ? new Date(Date.now() - Math.floor(Math.random() * 300000))
          : new Date(Date.now() - Math.floor(Math.random() * 7200000 + 3600000));
        await Device.create(
          {
            imei: d.imei,
            name: d.name,
            protocol: d.protocol,
            firmware: d.firmware,
            signal: d.signal,
            battery: d.battery,
            simStatus: d.simStatus,
            isOnline: d.isOnline,
            lastPing,
            vehicleId: i < 20 ? vehicles[i % 20].id : null,
          },
          { transaction }
        );
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
                ? `${vehicle.plateNumber} - Speed limit exceeded: ${Math.round(randomBetween(90, 140))} km/h`
                : alertType === "idle"
                ? `${vehicle.plateNumber} - ${Math.round(randomBetween(5, 30))} min idle`
                : `${vehicle.plateNumber} - Maintenance due (${Math.round(randomBetween(100, 5000))} km remaining)`,
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

      // Seed organization units
      const orgUnits: OrganizationUnit[] = [];
      const orgData = [
        { name: "cyTrack HQ", type: "headquarters" as const, code: "HQ-001", location: "Accra" },
        { name: "Greater Accra Region", type: "region" as const, code: "REG-ACC", location: "Accra", parentIdx: -1 },
        { name: "Ashanti Region", type: "region" as const, code: "REG-ASH", location: "Kumasi", parentIdx: -1 },
        { name: "Western Region", type: "region" as const, code: "REG-WST", location: "Takoradi", parentIdx: -1 },
        { name: "Accra Central Depot", type: "depot" as const, code: "DPT-ACC01", location: "Accra Central", parentIdx: -1 },
        { name: "Tema Depot", type: "depot" as const, code: "DPT-TMA01", location: "Tema", parentIdx: -1 },
        { name: "Kumasi Depot", type: "depot" as const, code: "DPT-KMS01", location: "Kumasi", parentIdx: -1 },
        { name: "Takoradi Depot", type: "depot" as const, code: "DPT-TKD01", location: "Takoradi", parentIdx: -1 },
        { name: "Accra North Branch", type: "branch" as const, code: "BRN-ACN01", location: "Accra North", parentIdx: -1 },
        { name: "Tema Branch", type: "branch" as const, code: "BRN-TMA01", location: "Tema", parentIdx: -1 },
      ];
      // Assign parent IDs based on sequence: regions and depots under HQ, branches under depots
      const hq = await OrganizationUnit.create({ name: "cyTrack HQ", type: "headquarters", code: "HQ-001", location: "Accra", status: "active" }, { transaction });
      orgUnits.push(hq);
      const regionNames = ["Greater Accra Region", "Ashanti Region", "Western Region"];
      for (const name of regionNames) {
        const r = await OrganizationUnit.create({ name, type: "region", code: `REG-${name.slice(0, 3).toUpperCase()}`, location: name === "Greater Accra Region" ? "Accra" : name === "Ashanti Region" ? "Kumasi" : "Takoradi", parentId: hq.id, status: "active" }, { transaction });
        orgUnits.push(r);
      }
      const depotNames = ["Accra Central Depot", "Tema Depot", "Kumasi Depot", "Takoradi Depot"];
      for (let di = 0; di < depotNames.length; di++) {
        const parentRegion = orgUnits[di < 2 ? 1 : di < 3 ? 2 : 3];
        const d = await OrganizationUnit.create({ name: depotNames[di], type: "depot", code: `DPT-${depotNames[di].slice(0, 3).toUpperCase()}`, location: depotNames[di].replace(" Depot", ""), parentId: parentRegion.id, status: "active" }, { transaction });
        orgUnits.push(d);
      }
      const branchNames = ["Accra North Branch", "Tema Branch"];
      for (let bi = 0; bi < branchNames.length; bi++) {
        const parentDepot = orgUnits[4 + bi]; // first two depots
        const b = await OrganizationUnit.create({ name: branchNames[bi], type: "branch", code: `BRN-${branchNames[bi].slice(0, 3).toUpperCase()}`, location: branchNames[bi].replace(" Branch", ""), parentId: parentDepot.id, status: "active" }, { transaction });
        orgUnits.push(b);
      }

      // Seed deployments
      const deployments: Deployment[] = [];
      for (let i = 0; i < 20; i++) {
        const driver = drivers[i];
        const vehicle = vehicles[i];
        const unitIdx = i % orgUnits.length;
        const isActive = i < 12;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(randomBetween(1, 60)));
        const dep = await Deployment.create({
          driverId: driver.id,
          vehicleId: vehicle.id,
          supervisorId: userId,
          organizationUnitId: orgUnits[unitIdx].id,
          type: i < 15 ? "permanent" : "temporary" as "permanent" | "temporary",
          startDate,
          endDate: isActive ? null : new Date(Date.now() - Math.floor(randomBetween(1, 10)) * 86400000),
          shiftPattern: i % 3 === 0 ? "daily" as const : i % 3 === 1 ? "rotating" as const : "split" as const,
          status: isActive ? "active" as const : "completed" as const,
          approvedById: userId,
          approvedAt: new Date(),
          notes: `Deployment #${i + 1} for ${driver.firstName} ${driver.lastName}`,
        }, { transaction });
        deployments.push(dep);
      }

      // Seed revenue records
      for (let i = 0; i < 40; i++) {
        const dep = deployments[i % deployments.length];
        const driver = drivers[i % 20];
        const vehicle = vehicles[i % 20];
        const amount = randomBetween(200, 1500);
        const daysAgo = Math.floor(randomBetween(0, 30));
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        await RevenueRecord.create({
          deploymentId: dep.id,
          driverId: driver.id,
          vehicleId: vehicle.id,
          supervisorId: userId,
          amount: Math.round(amount * 100) / 100,
          expectedAmount: Math.round(amount * randomBetween(0.8, 1.2) * 100) / 100,
          collectionDate: d,
          shiftType: i % 3 === 0 ? "day" as const : i % 3 === 1 ? "night" as const : "split" as const,
          passengerCount: Math.floor(randomBetween(2, 8)),
          tripCount: Math.floor(randomBetween(3, 15)),
          status: i < 25 ? "remitted" as const : i < 35 ? "collected" as const : "pending" as const,
          remittanceDate: i < 25 ? new Date(d.getTime() + 86400000) : null,
          remittedById: i < 25 ? userId : null,
          notes: `Revenue collection for ${driver.firstName} ${driver.lastName}`,
        }, { transaction });
      }

      // Seed incident reports
      for (let i = 0; i < 8; i++) {
        const driver = drivers[i];
        const vehicle = vehicles[i];
        const daysAgo = Math.floor(randomBetween(1, 30));
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const severities = ["minor", "moderate", "major", "critical"] as const;
        const types = ["accident", "traffic_violation", "passenger_complaint", "damage", "mechanical"] as const;
        await IncidentReport.create({
          type: types[i % types.length],
          severity: severities[i % severities.length],
          status: i < 4 ? "resolved" as const : "investigating" as const,
          driverId: driver.id,
          vehicleId: vehicle.id,
          reportedById: userId,
          dateOfIncident: d,
          location: GHANA_CITIES[i % GHANA_CITIES.length].name,
          description: `${types[i % types.length].replace(/_/g, " ")} incident involving ${driver.firstName} ${driver.lastName} on vehicle ${vehicle.plateNumber}`,
          findings: i < 4 ? "Investigation complete. Driver found at fault." : null,
          resolution: i < 4 ? "Verbal warning issued. Driver cautioned." : null,
          isEscalated: i >= 6,
          escalatedAt: i >= 6 ? new Date(d.getTime() + 86400000) : null,
        }, { transaction });
      }

      // Seed KPIs
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const kpiMetrics = [
        { name: "Daily Revenue Target", category: "revenue" as const, metricKey: "daily_revenue", unit: "amount", target: 5000, current: 4850 },
        { name: "Fleet Utilization", category: "operations" as const, metricKey: "fleet_utilization", unit: "percentage", target: 85, current: 78 },
        { name: "Safety Score", category: "safety" as const, metricKey: "safety_score", unit: "percentage", target: 95, current: 92 },
        { name: "On-Time Rate", category: "operations" as const, metricKey: "on_time_rate", unit: "percentage", target: 90, current: 87 },
        { name: "Fuel Efficiency", category: "fuel" as const, metricKey: "fuel_efficiency", unit: "km/l", target: 12, current: 11.2 },
        { name: "Maintenance Compliance", category: "maintenance" as const, metricKey: "maint_compliance", unit: "percentage", target: 100, current: 95 },
        { name: "Customer Rating", category: "customer" as const, metricKey: "customer_rating", unit: "percentage", target: 4.5, current: 4.2 },
        { name: "Driver Retention", category: "driver" as const, metricKey: "driver_retention", unit: "percentage", target: 90, current: 88 },
      ];
      for (const km of kpiMetrics) {
        await KPI.create({
          name: km.name,
          category: km.category,
          metricKey: km.metricKey,
          unit: km.unit,
          target: km.target,
          current: km.current,
          previousValue: km.current - randomBetween(0.5, 5),
          frequency: "monthly",
          periodStart,
          periodEnd,
          organizationUnitId: hq.id,
          isActive: true,
        }, { transaction });
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
          organizationUnits: orgUnits.length,
          deployments: 20,
          revenueRecords: 40,
          incidents: 8,
          kpis: 8,
        },
      });
    } catch (error: any) {
      await transaction.rollback();
      logger.error("Seed error:", error);
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
      const deletedDevices = await Device.destroy({ where: {} });
      const deletedKpis = await KPI.destroy({ where: {} });
      const deletedIncidents = await IncidentReport.destroy({ where: {} });
      const deletedRevenue = await RevenueRecord.destroy({ where: {} });
      const deletedDeployments = await Deployment.destroy({ where: {} });
      const deletedOrgUnits = await OrganizationUnit.destroy({ where: {} });

      return res.json({
        success: true,
        message: "Demo data cleared",
        data: {
          deletedAlerts,
          deletedLogs,
          deletedSessions,
          deletedDrivers,
          deletedVehicles,
          deletedDevices,
          deletedKpis,
          deletedIncidents,
          deletedRevenue,
          deletedDeployments,
          deletedOrgUnits,
        },
      });
    } catch (error: any) {
      logger.error("Clear seed error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Clear failed",
      });
    }
  }
}
