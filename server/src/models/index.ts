import { User } from "./User";
import { Driver } from "./Driver";
import { Vehicle } from "./Vehicle";
import { DrivingSession } from "./DrivingSession";
import { LocationLog } from "./LocationLog";
import { Alert } from "./Alert";
import { Geofence } from "./Geofence";
import { MaintenanceRecord } from "./MaintenanceRecord";
import { FuelLog } from "./FuelLog";
import { Device } from "./Device";
import { OrganizationUnit } from "./OrganizationUnit";
import { Deployment } from "./Deployment";
import { RevenueRecord } from "./RevenueRecord";
import { CommissionRule } from "./CommissionRule";
import { IncidentReport } from "./IncidentReport";
import { DisciplinaryAction } from "./DisciplinaryAction";
import { AuditLog } from "./AuditLog";
import { KPI } from "./KPI";

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

// Device associations
Device.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Vehicle.hasOne(Device, { foreignKey: "vehicleId", as: "device" });

// Organization structure
OrganizationUnit.belongsTo(User, { foreignKey: "managerId", as: "manager" });
OrganizationUnit.belongsTo(OrganizationUnit, { foreignKey: "parentId", as: "parent" });
OrganizationUnit.hasMany(OrganizationUnit, { foreignKey: "parentId", as: "children" });

// Deployments
Deployment.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Deployment.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Deployment.belongsTo(User, { foreignKey: "supervisorId", as: "supervisor" });
Deployment.belongsTo(OrganizationUnit, { foreignKey: "organizationUnitId", as: "organizationUnit" });
Deployment.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });
Driver.hasMany(Deployment, { foreignKey: "driverId", as: "deployments" });
Vehicle.hasMany(Deployment, { foreignKey: "vehicleId", as: "deployments" });

// Revenue records
RevenueRecord.belongsTo(Deployment, { foreignKey: "deploymentId", as: "deployment" });
RevenueRecord.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
RevenueRecord.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
RevenueRecord.belongsTo(User, { foreignKey: "supervisorId", as: "supervisor" });
RevenueRecord.belongsTo(User, { foreignKey: "remittedById", as: "remittedBy" });
Deployment.hasMany(RevenueRecord, { foreignKey: "deploymentId", as: "revenueRecords" });

// Commission rules (no FK associations needed - standalone config)

// Incidents
IncidentReport.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
IncidentReport.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
IncidentReport.belongsTo(User, { foreignKey: "reportedById", as: "reportedBy" });
IncidentReport.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
IncidentReport.belongsTo(User, { foreignKey: "escalatedToId", as: "escalatedTo" });
Driver.hasMany(IncidentReport, { foreignKey: "driverId", as: "incidents" });

// Disciplinary actions
DisciplinaryAction.belongsTo(IncidentReport, { foreignKey: "incidentReportId", as: "incident" });
DisciplinaryAction.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
DisciplinaryAction.belongsTo(User, { foreignKey: "issuedById", as: "issuedBy" });
DisciplinaryAction.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });
IncidentReport.hasOne(DisciplinaryAction, { foreignKey: "incidentReportId", as: "disciplinaryAction" });
Driver.hasMany(DisciplinaryAction, { foreignKey: "driverId", as: "disciplinaryActions" });

// Audit logs
AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });
AuditLog.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });

// KPI
KPI.belongsTo(OrganizationUnit, { foreignKey: "organizationUnitId", as: "organizationUnit" });
KPI.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
KPI.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

export { User, Driver, Vehicle, DrivingSession, LocationLog, Alert, Geofence, MaintenanceRecord, FuelLog, Device, OrganizationUnit, Deployment, RevenueRecord, CommissionRule, IncidentReport, DisciplinaryAction, AuditLog, KPI };
