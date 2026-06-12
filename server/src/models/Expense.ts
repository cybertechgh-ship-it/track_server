import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Expense extends Model {
  public id!: number;
  public vehicleId!: number | null;
  public driverId!: number | null;
  public category!: "fuel" | "maintenance" | "toll" | "parking" | "insurance" | "tax" | "permits" | "supplies" | "utilities" | "rent" | "salary" | "other";
  public amount!: number;
  public description!: string;
  public receiptUrl!: string | null;
  public expenseDate!: Date;
  public approvedById!: number | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Expense.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "vehicles", key: "id" } },
  driverId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "drivers", key: "id" } },
  category: { type: DataTypes.ENUM("fuel", "maintenance", "toll", "parking", "insurance", "tax", "permits", "supplies", "utilities", "rent", "salary", "other"), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  receiptUrl: { type: DataTypes.TEXT, allowNull: true },
  expenseDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approvedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: "Expense", tableName: "expenses", timestamps: true, indexes: [{ fields: ["category"] }, { fields: ["expenseDate"] }, { fields: ["vehicleId"] }] });
