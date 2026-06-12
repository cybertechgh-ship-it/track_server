import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Report extends Model {
  public id!: number;
  public name!: string;
  public type!: "executive_summary" | "fleet_performance" | "vehicle_tracking" | "driver_performance" | "fuel_consumption" | "revenue" | "expense" | "custom";
  public filePath!: string;
  public fileSize!: number;
  public format!: "pdf" | "csv";
  public generatedById!: number;
  public filters!: object;
  public status!: "generating" | "ready" | "failed";
  public isArchived!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Report.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("executive_summary", "fleet_performance", "vehicle_tracking", "driver_performance", "fuel_consumption", "revenue", "expense", "custom"),
      allowNull: false,
    },
    filePath: { type: DataTypes.TEXT, allowNull: true },
    fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
    format: { type: DataTypes.ENUM("pdf", "csv"), defaultValue: "pdf" },
    generatedById: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    filters: { type: DataTypes.JSONB, defaultValue: {} },
    status: { type: DataTypes.ENUM("generating", "ready", "failed"), defaultValue: "generating" },
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "Report",
    tableName: "reports",
    timestamps: true,
    indexes: [{ fields: ["type"] }, { fields: ["generatedById"] }, { fields: ["createdAt"] }],
  }
);
