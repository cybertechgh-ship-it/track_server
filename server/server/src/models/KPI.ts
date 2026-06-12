import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class KPI extends Model {
  public id!: number;
  public name!: string;
  public category!: "revenue" | "operations" | "safety" | "maintenance" | "driver" | "fuel" | "customer";
  public metricKey!: string;
  public unit!: string;
  public target!: number | null;
  public current!: number | null;
  public previousValue!: number | null;
  public frequency!: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  public periodStart!: Date;
  public periodEnd!: Date | null;
  public organizationUnitId!: number | null;
  public driverId!: number | null;
  public vehicleId!: number | null;
  public isActive!: boolean;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

KPI.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    category: {
      type: DataTypes.ENUM("revenue", "operations", "safety", "maintenance", "driver", "fuel", "customer"),
      allowNull: false,
    },
    metricKey: { type: DataTypes.STRING, allowNull: false, unique: "kpi_metric_period" },
    unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "count" },
    target: { type: DataTypes.FLOAT, allowNull: true },
    current: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    previousValue: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    frequency: {
      type: DataTypes.ENUM("daily", "weekly", "monthly", "quarterly", "yearly"),
      allowNull: false,
      defaultValue: "monthly",
    },
    periodStart: { type: DataTypes.DATE, allowNull: false },
    periodEnd: { type: DataTypes.DATE, allowNull: true },
    organizationUnitId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "organization_units", key: "id" } },
    driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "vehicles", key: "id" } },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "KPI",
    tableName: "kpis",
    timestamps: true,
    indexes: [{ fields: ["category"] }, { fields: ["frequency"] }, { fields: ["metricKey"], unique: true }],
  }
);
