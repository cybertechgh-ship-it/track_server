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
import { Report } from "./Report";
import { Expense } from "./Expense";
import { Insurance } from "./Insurance";
import { Training } from "./Training";
import { Invoice } from "./Invoice";
import { Part } from "./Part";
import { Vendor } from "./Vendor";
import { VehicleBooking } from "./VehicleBooking";
import { DriverShift } from "./DriverShift";
import { InspectionChecklist } from "./InspectionChecklist";
import { Payment } from "./Payment";
import { Webhook } from "./Webhook";

DrivingSession.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
DrivingSession.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Driver.hasMany(DrivingSession, { foreignKey: "driverId", as: "sessions" });
Vehicle.hasMany(DrivingSession, { foreignKey: "vehicleId", as: "sessions" });

LocationLog.belongsTo(DrivingSession, { foreignKey: "sessionId", as: "session" });
DrivingSession.hasMany(LocationLog, { foreignKey: "sessionId", as: "locations" });

Alert.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Alert.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Alert.belongsTo(DrivingSession, { foreignKey: "sessionId", as: "session" });
Vehicle.hasMany(Alert, { foreignKey: "vehicleId", as: "alerts" });

MaintenanceRecord.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Vehicle.hasMany(MaintenanceRecord, { foreignKey: "vehicleId", as: "maintenanceRecords" });

FuelLog.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
FuelLog.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Vehicle.hasMany(FuelLog, { foreignKey: "vehicleId", as: "fuelLogs" });

Device.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Vehicle.hasOne(Device, { foreignKey: "vehicleId", as: "device" });

OrganizationUnit.belongsTo(User, { foreignKey: "managerId", as: "manager" });
OrganizationUnit.belongsTo(OrganizationUnit, { foreignKey: "parentId", as: "parent" });
OrganizationUnit.hasMany(OrganizationUnit, { foreignKey: "parentId", as: "children" });

Deployment.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Deployment.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Deployment.belongsTo(User, { foreignKey: "supervisorId", as: "supervisor" });
Deployment.belongsTo(OrganizationUnit, { foreignKey: "organizationUnitId", as: "organizationUnit" });
Deployment.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });
Driver.hasMany(Deployment, { foreignKey: "driverId", as: "deployments" });
Vehicle.hasMany(Deployment, { foreignKey: "vehicleId", as: "deployments" });

RevenueRecord.belongsTo(Deployment, { foreignKey: "deploymentId", as: "deployment" });
RevenueRecord.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
RevenueRecord.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
RevenueRecord.belongsTo(User, { foreignKey: "supervisorId", as: "supervisor" });
RevenueRecord.belongsTo(User, { foreignKey: "remittedById", as: "remittedBy" });
Deployment.hasMany(RevenueRecord, { foreignKey: "deploymentId", as: "revenueRecords" });

IncidentReport.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
IncidentReport.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
IncidentReport.belongsTo(User, { foreignKey: "reportedById", as: "reportedBy" });
IncidentReport.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
IncidentReport.belongsTo(User, { foreignKey: "escalatedToId", as: "escalatedTo" });
Driver.hasMany(IncidentReport, { foreignKey: "driverId", as: "incidents" });

DisciplinaryAction.belongsTo(IncidentReport, { foreignKey: "incidentReportId", as: "incident" });
DisciplinaryAction.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
DisciplinaryAction.belongsTo(User, { foreignKey: "issuedById", as: "issuedBy" });
DisciplinaryAction.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });
IncidentReport.hasOne(DisciplinaryAction, { foreignKey: "incidentReportId", as: "disciplinaryAction" });
Driver.hasMany(DisciplinaryAction, { foreignKey: "driverId", as: "disciplinaryActions" });

AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });

KPI.belongsTo(OrganizationUnit, { foreignKey: "organizationUnitId", as: "organizationUnit" });
KPI.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
KPI.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

Report.belongsTo(User, { foreignKey: "generatedById", as: "generatedBy" });
User.hasMany(Report, { foreignKey: "generatedById", as: "reports" });

Expense.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Expense.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Expense.belongsTo(User, { foreignKey: "approvedById", as: "approvedBy" });
Vehicle.hasMany(Expense, { foreignKey: "vehicleId", as: "expenses" });

Insurance.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Vehicle.hasMany(Insurance, { foreignKey: "vehicleId", as: "insurance" });

Training.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Driver.hasMany(Training, { foreignKey: "driverId", as: "training" });

Payment.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });
Payment.belongsTo(User, { foreignKey: "receivedById", as: "receivedBy" });
Invoice.hasMany(Payment, { foreignKey: "invoiceId", as: "payments" });

VehicleBooking.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
VehicleBooking.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
VehicleBooking.belongsTo(User, { foreignKey: "bookedById", as: "bookedBy" });
Vehicle.hasMany(VehicleBooking, { foreignKey: "vehicleId", as: "bookings" });

DriverShift.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
DriverShift.belongsTo(Driver, { foreignKey: "swappedWithDriverId", as: "swappedWith" });
Driver.hasMany(DriverShift, { foreignKey: "driverId", as: "shifts" });

InspectionChecklist.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
InspectionChecklist.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Vehicle.hasMany(InspectionChecklist, { foreignKey: "vehicleId", as: "inspections" });

export { User, Driver, Vehicle, DrivingSession, LocationLog, Alert, Geofence, MaintenanceRecord, FuelLog, Device, OrganizationUnit, Deployment, RevenueRecord, CommissionRule, IncidentReport, DisciplinaryAction, AuditLog, KPI, Report, Expense, Insurance, Training, Invoice, Part, Vendor, VehicleBooking, DriverShift, InspectionChecklist, Payment, Webhook };
