import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class AuditLog extends Model {
  public id!: number;
  public userId!: number | null;
  public action!: string;
  public entityType!: string;
  public entityId!: number | null;
  public description!: string;
  public previousValues!: object | null;
  public newValues!: object | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public approvalStatus!: "pending" | "approved" | "rejected" | null;
  public approvedById!: number | null;
  public approvedAt!: Date | null;
  public createdAt!: Date;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    action: { type: DataTypes.STRING, allowNull: false },
    entityType: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    previousValues: { type: DataTypes.JSONB, allowNull: true },
    newValues: { type: DataTypes.JSONB, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.TEXT, allowNull: true },
    approvalStatus: { type: DataTypes.ENUM("pending", "approved", "rejected"), allowNull: true },
    approvedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ["entityType", "entityId"] }, { fields: ["userId"] }, { fields: ["createdAt"] }],
  }
);
