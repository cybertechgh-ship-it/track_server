import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Geofence extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public type!: "circle" | "polygon";
  public centerLat!: number | null;
  public centerLng!: number | null;
  public radius!: number | null;
  public polygon!: object | null;
  public alertOnEnter!: boolean;
  public alertOnExit!: boolean;
  public isActive!: boolean;
  public color!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Geofence.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.ENUM("circle", "polygon"), allowNull: false, defaultValue: "circle" },
    centerLat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    centerLng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    radius: { type: DataTypes.FLOAT, allowNull: true },
    polygon: { type: DataTypes.JSONB, allowNull: true },
    alertOnEnter: { type: DataTypes.BOOLEAN, defaultValue: true },
    alertOnExit: { type: DataTypes.BOOLEAN, defaultValue: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    color: { type: DataTypes.STRING, defaultValue: "#1976d2" },
  },
  {
    sequelize,
    modelName: "Geofence",
    tableName: "geofences",
    timestamps: true,
  }
);
