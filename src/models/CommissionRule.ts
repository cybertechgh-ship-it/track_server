import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class CommissionRule extends Model {
  public id!: number;
  public name!: string;
  public type!: "percentage" | "fixed" | "tiered";
  public calculationBasis!: "gross_revenue" | "net_revenue" | "trip_count" | "distance";
  public rate!: number;
  public minThreshold!: number | null;
  public maxThreshold!: number | null;
  public tiers!: object | null;
  public applicableToRoles!: string[];
  public isActive!: boolean;
  public effectiveFrom!: Date;
  public effectiveTo!: Date | null;
  public description!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CommissionRule.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("percentage", "fixed", "tiered"),
      allowNull: false,
      defaultValue: "percentage",
    },
    calculationBasis: {
      type: DataTypes.ENUM("gross_revenue", "net_revenue", "trip_count", "distance"),
      allowNull: false,
      defaultValue: "gross_revenue",
    },
    rate: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
    minThreshold: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    maxThreshold: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    tiers: { type: DataTypes.JSONB, allowNull: true },
    applicableToRoles: { type: DataTypes.JSONB, allowNull: false, defaultValue: ["driver"] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    effectiveFrom: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    effectiveTo: { type: DataTypes.DATE, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "CommissionRule",
    tableName: "commission_rules",
    timestamps: true,
  }
);
