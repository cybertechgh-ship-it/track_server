import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class DisciplinaryAction extends Model {
  public id!: number;
  public incidentReportId!: number;
  public driverId!: number;
  public actionType!: "warning" | "suspension" | "fine" | "termination" | "retraining" | "demotion";
  public severity!: "verbal" | "written" | "final";
  public description!: string;
  public durationDays!: number | null;
  public fineAmount!: number | null;
  public issuedById!: number;
  public approvedById!: number | null;
  public status!: "pending" | "issued" | "appealed" | "enforced" | "closed";
  public issuedAt!: Date | null;
  public appealedAt!: Date | null;
  public appealOutcome!: string | null;
  public evidenceRefs!: object | null;
  public photo!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

DisciplinaryAction.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    incidentReportId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "incident_reports", key: "id" } },
    driverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "drivers", key: "id" } },
    actionType: {
      type: DataTypes.ENUM("warning", "suspension", "fine", "termination", "retraining", "demotion"),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("verbal", "written", "final"),
      allowNull: false,
      defaultValue: "written",
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    durationDays: { type: DataTypes.INTEGER, allowNull: true },
    fineAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    issuedById: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    approvedById: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    status: {
      type: DataTypes.ENUM("pending", "issued", "appealed", "enforced", "closed"),
      allowNull: false,
      defaultValue: "pending",
    },
    issuedAt: { type: DataTypes.DATE, allowNull: true },
    appealedAt: { type: DataTypes.DATE, allowNull: true },
    appealOutcome: { type: DataTypes.TEXT, allowNull: true },
    evidenceRefs: { type: DataTypes.JSONB, allowNull: true },
    photo: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "DisciplinaryAction",
    tableName: "disciplinary_actions",
    timestamps: true,
    indexes: [{ fields: ["incidentReportId"] }, { fields: ["driverId"] }, { fields: ["status"] }],
  }
);
