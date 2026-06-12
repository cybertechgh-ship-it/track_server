import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class FuelLog extends Model {
  public id!: number;
  public vehicleId!: number;
  public driverId!: number | null;
  public litres!: number;
  public costPerLitre!: number;
  public totalCost!: number;
  public odometer!: number;
  public fuelType!: "petrol" | "diesel" | "lpg" | "electric";
  public station!: string | null;
  public notes!: string | null;
  public filledAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

FuelLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
    driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
    litres: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    costPerLitre: { type: DataTypes.DECIMAL(8, 3), allowNull: false },
    totalCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    odometer: { type: DataTypes.INTEGER, allowNull: false },
    fuelType: {
      type: DataTypes.ENUM("petrol", "diesel", "lpg", "electric"),
      allowNull: false,
      defaultValue: "petrol",
    },
    station: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    filledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "FuelLog",
    tableName: "fuel_logs",
    timestamps: true,
    indexes: [{ fields: ["vehicleId"] }, { fields: ["filledAt"] }],
  }
);
