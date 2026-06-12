import { User } from "./User";
import { Driver } from "./Driver";
import { Vehicle } from "./Vehicle";
import { DrivingSession } from "./DrivingSession";
import { LocationLog } from "./LocationLog";
import { Alert } from "./Alert";
import { Geofence } from "./Geofence";
import { MaintenanceRecord } from "./MaintenanceRecord";
import { FuelLog } from "./FuelLog";

// Core associations
DrivingSession.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
DrivingSession.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Driver.hasMany(DrivingSession, { foreignKey: "driverId", as: "sessions" });
Vehicle.hasMany(DrivingSession, { foreignKey: "vehicleId", as: "sessions" });

LocationLog.belongsTo(DrivingSession, { foreignKey: "sessionId", as: "session" });
DrivingSession.hasMany(LocationLog, { foreignKey: "sessionId", as: "locations" });

// Alert associations
Alert.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Alert.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Alert.belongsTo(DrivingSession, { foreignKey: "sessionId", as: "session" });
Vehicle.hasMany(Alert, { foreignKey: "vehicleId", as: "alerts" });

// Maintenance associations
MaintenanceRecord.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Vehicle.hasMany(MaintenanceRecord, { foreignKey: "vehicleId", as: "maintenanceRecords" });

// Fuel associations
FuelLog.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
FuelLog.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Vehicle.hasMany(FuelLog, { foreignKey: "vehicleId", as: "fuelLogs" });

export { User, Driver, Vehicle, DrivingSession, LocationLog, Alert, Geofence, MaintenanceRecord, FuelLog };
