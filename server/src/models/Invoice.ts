import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Invoice extends Model {
  public id!: number;
  public clientName!: string;
  public clientEmail!: string | null;
  public clientAddress!: string | null;
  public invoiceNumber!: string;
  public items!: object;
  public subtotal!: number;
  public tax!: number;
  public total!: number;
  public status!: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  public dueDate!: Date;
  public paidAt!: Date | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Invoice.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clientName: { type: DataTypes.STRING, allowNull: false },
  clientEmail: { type: DataTypes.STRING, allowNull: true },
  clientAddress: { type: DataTypes.TEXT, allowNull: true },
  invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM("draft", "sent", "paid", "overdue", "cancelled"), allowNull: false, defaultValue: "draft" },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  paidAt: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Invoice", tableName: "invoices", timestamps: true, indexes: [{ fields: ["status"] }, { fields: ["dueDate"] }] });
