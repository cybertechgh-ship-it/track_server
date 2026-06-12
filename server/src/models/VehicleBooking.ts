import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class VehicleBooking extends Model {
  public id!: number;
  public vehicleId!: number;
  public driverId!: number | null;
  public bookedById!: number;
  public purpose!: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

VehicleBooking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
  driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
  bookedById: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
  purpose: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "approved", "in_progress", "completed", "cancelled"), allowNull: false, defaultValue: "pending" },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "VehicleBooking", tableName: "vehicle_bookings", timestamps: true, indexes: [{ fields: ["vehicleId"] }, { fields: ["startTime", "endTime"] }, { fields: ["status"] }] });
