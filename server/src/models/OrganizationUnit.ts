import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class OrganizationUnit extends Model {
  public id!: number;
  public name!: string;
  public type!: "headquarters" | "region" | "depot" | "branch" | "team";
  public parentId!: number | null;
  public managerId!: number | null;
  public code!: string | null;
  public location!: string | null;
  public status!: "active" | "inactive";
  public photo!: string | null;
  public description!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

OrganizationUnit.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("headquarters", "region", "depot", "branch", "team"),
      allowNull: false,
      defaultValue: "branch",
    },
    parentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "organization_units", key: "id" } },
    managerId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
    code: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
    photo: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "OrganizationUnit",
    tableName: "organization_units",
    timestamps: true,
    indexes: [{ fields: ["parentId"] }, { fields: ["managerId"] }],
  }
);
