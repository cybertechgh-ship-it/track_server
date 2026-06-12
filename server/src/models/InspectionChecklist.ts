import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class InspectionChecklist extends Model {
  public id!: number;
  public vehicleId!: number;
  public driverId!: number | null;
  public type!: "checkout" | "checkin";
  public items!: object;
  public notes!: string | null;
  public odometer!: number | null;
  public fuelLevel!: number | null;
  public photos!: object | null;
  public issuesReported!: string | null;
  public isCleared!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

InspectionChecklist.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
  driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
  type: { type: DataTypes.ENUM("checkout", "checkin"), allowNull: false },
  items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  notes: { type: DataTypes.TEXT, allowNull: true },
  odometer: { type: DataTypes.INTEGER, allowNull: true },
  fuelLevel: { type: DataTypes.INTEGER, allowNull: true },
  photos: { type: DataTypes.JSONB, allowNull: true },
  issuesReported: { type: DataTypes.TEXT, allowNull: true },
  isCleared: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, modelName: "InspectionChecklist", tableName: "inspection_checklists", timestamps: true, indexes: [{ fields: ["vehicleId"] }, { fields: ["type"] }] });
