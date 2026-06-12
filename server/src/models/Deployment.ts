import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Deployment extends Model {
  public id!: number;
  public driverId!: number;
  public vehicleId!: number;
  public supervisorId!: number;
  public organizationUnitId!: number | null;
  public status!: "active" | "completed" | "suspended" | "cancelled";
  public startDate!: Date;
  public endDate!: Date | null;
  public shiftType!: "day" | "night" | "split" | "custom";
  public dailyTarget!: number | null;
  public revenueTarget!: number | null;
  public notes!: string | null;
  public approvedById!: number | null;
  public approvedAt!: Date | null;
  public photo!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Deployment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    driverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "drivers", key: "id" } },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
    supervisorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    organizationUnitId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "organization_units", key: "id" } },
    status: {
      type: DataTypes.ENUM("active", "completed", "suspended", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: true },
    shiftType: {
      type: DataTypes.ENUM("day", "night", "split", "custom"),
      allowNull: false,
      defaultValue: "day",
    },
    dailyTarget: { type: DataTypes.FLOAT, allowNull: true },
    revenueTarget: { type: DataTypes.FLOAT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    approvedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    photo: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Deployment",
    tableName: "deployments",
    timestamps: true,
    indexes: [{ fields: ["driverId"] }, { fields: ["vehicleId"] }, { fields: ["status"] }],
  }
);
