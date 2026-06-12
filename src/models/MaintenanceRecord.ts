import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class MaintenanceRecord extends Model {
  public id!: number;
  public vehicleId!: number;
  public type!: "oil_change" | "tire" | "brake" | "service" | "inspection" | "fuel" | "other";
  public description!: string;
  public cost!: number;
  public odometer!: number;
  public performedAt!: Date;
  public nextDueDate!: Date | null;
  public nextDueOdometer!: number | null;
  public performedBy!: string | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MaintenanceRecord.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
    type: {
      type: DataTypes.ENUM("oil_change", "tire", "brake", "service", "inspection", "fuel", "other"),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    odometer: { type: DataTypes.INTEGER, defaultValue: 0 },
    performedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    nextDueDate: { type: DataTypes.DATE, allowNull: true },
    nextDueOdometer: { type: DataTypes.INTEGER, allowNull: true },
    performedBy: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "MaintenanceRecord",
    tableName: "maintenance_records",
    timestamps: true,
    indexes: [{ fields: ["vehicleId"] }, { fields: ["performedAt"] }, { fields: ["nextDueDate"] }],
  }
);
