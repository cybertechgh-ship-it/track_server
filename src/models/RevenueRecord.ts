import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class RevenueRecord extends Model {
  public id!: number;
  public deploymentId!: number;
  public driverId!: number;
  public vehicleId!: number;
  public supervisorId!: number | null;
  public amount!: number;
  public expectedAmount!: number | null;
  public currency!: string;
  public collectionDate!: Date;
  public shiftType!: "day" | "night" | "split";
  public passengerCount!: number | null;
  public tripCount!: number | null;
  public status!: "collected" | "remitted" | "short" | "over" | "pending";
  public remittanceDate!: Date | null;
  public remittedById!: number | null;
  public notes!: string | null;
  public photo!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

RevenueRecord.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    deploymentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "deployments", key: "id" } },
    driverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "drivers", key: "id" } },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
    supervisorId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    expectedAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "GHS" },
    collectionDate: { type: DataTypes.DATE, allowNull: false },
    shiftType: { type: DataTypes.ENUM("day", "night", "split"), allowNull: false, defaultValue: "day" },
    passengerCount: { type: DataTypes.INTEGER, allowNull: true },
    tripCount: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM("collected", "remitted", "short", "over", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    remittanceDate: { type: DataTypes.DATE, allowNull: true },
    remittedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    notes: { type: DataTypes.TEXT, allowNull: true },
    photo: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "RevenueRecord",
    tableName: "revenue_records",
    timestamps: true,
    indexes: [{ fields: ["deploymentId"] }, { fields: ["driverId"] }, { fields: ["collectionDate"] }],
  }
);
