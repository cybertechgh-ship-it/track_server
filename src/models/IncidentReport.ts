import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class IncidentReport extends Model {
  public id!: number;
  public type!: "accident" | "theft" | "damage" | "traffic_violation" | "passenger_complaint" | "disciplinary" | "mechanical" | "other";
  public severity!: "minor" | "moderate" | "major" | "critical";
  public status!: "reported" | "investigating" | "escalated" | "resolved" | "closed";
  public driverId!: number | null;
  public vehicleId!: number | null;
  public reportedById!: number;
  public assignedToId!: number | null;
  public dateOfIncident!: Date;
  public location!: string | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public description!: string;
  public findings!: string | null;
  public resolution!: string | null;
  public disciplinaryActionId!: number | null;
  public isEscalated!: boolean;
  public escalatedToId!: number | null;
  public escalatedAt!: Date | null;
  public resolvedAt!: Date | null;
  public attachments!: object | null;
  public photo!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

IncidentReport.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: {
      type: DataTypes.ENUM("accident", "theft", "damage", "traffic_violation", "passenger_complaint", "disciplinary", "mechanical", "other"),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("minor", "moderate", "major", "critical"),
      allowNull: false,
      defaultValue: "moderate",
    },
    status: {
      type: DataTypes.ENUM("reported", "investigating", "escalated", "resolved", "closed"),
      allowNull: false,
      defaultValue: "reported",
    },
    driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "vehicles", key: "id" } },
    reportedById: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    assignedToId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    dateOfIncident: { type: DataTypes.DATE, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    findings: { type: DataTypes.TEXT, allowNull: true },
    resolution: { type: DataTypes.TEXT, allowNull: true },
    disciplinaryActionId: { type: DataTypes.INTEGER, allowNull: true },
    isEscalated: { type: DataTypes.BOOLEAN, defaultValue: false },
    escalatedToId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    escalatedAt: { type: DataTypes.DATE, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
    attachments: { type: DataTypes.JSONB, allowNull: true },
    photo: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "IncidentReport",
    tableName: "incident_reports",
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["driverId"] }, { fields: ["dateOfIncident"] }],
  }
);
