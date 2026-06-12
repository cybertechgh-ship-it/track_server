import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Vendor extends Model {
  public id!: number;
  public name!: string;
  public type!: "mechanic" | "parts_supplier" | "fuel_station" | "insurance" | "towing" | "other";
  public contactPerson!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public address!: string | null;
  public rating!: number | null;
  public notes!: string | null;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Vendor.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("mechanic", "parts_supplier", "fuel_station", "insurance", "towing", "other"), allowNull: false },
  contactPerson: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, modelName: "Vendor", tableName: "vendors", timestamps: true, indexes: [{ fields: ["type"] }] });
