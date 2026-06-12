import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Payment extends Model {
  public id!: number;
  public driverId!: number | null;
  public invoiceId!: number | null;
  public amount!: number;
  public method!: "cash" | "mobile_money" | "bank_transfer" | "card" | "other";
  public reference!: string | null;
  public paidAt!: Date;
  public receivedById!: number | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Payment.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
  invoiceId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "invoices", key: "id" } },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  method: { type: DataTypes.ENUM("cash", "mobile_money", "bank_transfer", "card", "other"), allowNull: false },
  reference: { type: DataTypes.STRING, allowNull: true },
  paidAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  receivedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Payment", tableName: "payments", timestamps: true, indexes: [{ fields: ["driverId"] }, { fields: ["paidAt"] }] });
