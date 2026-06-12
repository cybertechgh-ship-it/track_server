import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Alert extends Model {
  public id!: number;
  public type!: "speed" | "unauthorized" | "geofence_enter" | "geofence_exit" | "maintenance" | "idle";
  public severity!: "low" | "medium" | "high" | "critical";
  public vehicleId!: number;
  public driverId!: number | null;
  public sessionId!: number | null;
  public message!: string;
  public data!: object;
  public isRead!: boolean;
  public isAcknowledged!: boolean;
  public acknowledgedBy!: number | null;
  public acknowledgedAt!: Date | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Alert.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: {
      type: DataTypes.ENUM("speed", "unauthorized", "geofence_enter", "geofence_exit", "maintenance", "idle"),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "medium",
    },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
    driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
    sessionId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "driving_sessions", key: "id" } },
    message: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.JSONB, defaultValue: {} },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAcknowledged: { type: DataTypes.BOOLEAN, defaultValue: false },
    acknowledgedBy: { type: DataTypes.INTEGER, allowNull: true },
    acknowledgedAt: { type: DataTypes.DATE, allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  },
  {
    sequelize,
    modelName: "Alert",
    tableName: "alerts",
    timestamps: true,
    indexes: [
      { fields: ["vehicleId"] },
      { fields: ["type"] },
      { fields: ["isRead"] },
      { fields: ["isAcknowledged"] },
      { fields: ["createdAt"] },
    ],
  }
);
