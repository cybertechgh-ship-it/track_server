import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class DriverShift extends Model {
  public id!: number;
  public driverId!: number;
  public date!: Date;
  public startTime!: Date;
  public endTime!: Date | null;
  public type!: "morning" | "afternoon" | "night" | "full_day" | "custom";
  public status!: "scheduled" | "checked_in" | "checked_out" | "absent" | "swapped";
  public swappedWithDriverId!: number | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

DriverShift.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "drivers", key: "id" } },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: true },
  type: { type: DataTypes.ENUM("morning", "afternoon", "night", "full_day", "custom"), allowNull: false },
  status: { type: DataTypes.ENUM("scheduled", "checked_in", "checked_out", "absent", "swapped"), allowNull: false, defaultValue: "scheduled" },
  swappedWithDriverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "DriverShift", tableName: "driver_shifts", timestamps: true, indexes: [{ fields: ["driverId"] }, { fields: ["date"] }, { fields: ["status"] }] });
