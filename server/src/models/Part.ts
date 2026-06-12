import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Part extends Model {
  public id!: number;
  public name!: string;
  public partNumber!: string | null;
  public category!: "engine" | "brake" | "suspension" | "electrical" | "body" | "tire" | "filter" | "other";
  public quantity!: number;
  public minStock!: number;
  public unitPrice!: number;
  public supplier!: string | null;
  public location!: string | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Part.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  partNumber: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.ENUM("engine", "brake", "suspension", "electrical", "body", "tire", "filter", "other"), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  minStock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  supplier: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Part", tableName: "parts", timestamps: true, indexes: [{ fields: ["category"] }, { fields: ["partNumber"] }] });
