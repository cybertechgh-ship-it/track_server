import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Training extends Model {
  public id!: number;
  public driverId!: number;
  public type!: "defensive_driving" | "safety" | "certification" | "refresher" | "compliance" | "other";
  public title!: string;
  public provider!: string | null;
  public completionDate!: Date;
  public expiryDate!: Date | null;
  public certificateUrl!: string | null;
  public score!: number | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Training.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "drivers", key: "id" } },
  type: { type: DataTypes.ENUM("defensive_driving", "safety", "certification", "refresher", "compliance", "other"), allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  provider: { type: DataTypes.STRING, allowNull: true },
  completionDate: { type: DataTypes.DATE, allowNull: false },
  expiryDate: { type: DataTypes.DATE, allowNull: true },
  certificateUrl: { type: DataTypes.TEXT, allowNull: true },
  score: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Training", tableName: "training", timestamps: true, indexes: [{ fields: ["driverId"] }, { fields: ["expiryDate"] }] });
