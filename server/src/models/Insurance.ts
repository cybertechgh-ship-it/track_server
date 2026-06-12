import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Insurance extends Model {
  public id!: number;
  public vehicleId!: number;
  public policyNumber!: string;
  public provider!: string;
  public type!: "comprehensive" | "third_party" | "liability" | "collision";
  public startDate!: Date;
  public endDate!: Date;
  public premium!: number;
  public coverageDetails!: string | null;
  public documents!: object | null;
  public isActive!: boolean;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Insurance.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "vehicles", key: "id" } },
  policyNumber: { type: DataTypes.STRING, allowNull: false },
  provider: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("comprehensive", "third_party", "liability", "collision"), allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  premium: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  coverageDetails: { type: DataTypes.TEXT, allowNull: true },
  documents: { type: DataTypes.JSONB, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Insurance", tableName: "insurance", timestamps: true, indexes: [{ fields: ["vehicleId"] }, { fields: ["endDate"] }] });
