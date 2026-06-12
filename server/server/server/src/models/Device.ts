import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Device extends Model {
  public id!: number;
  public imei!: string;
  public name!: string;
  public protocol!: string;
  public firmware!: string;
  public signal!: number;
  public battery!: number;
  public simStatus!: string;
  public isOnline!: boolean;
  public lastPing!: Date | null;
  public vehicleId!: number | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Device.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    imei: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    protocol: { type: DataTypes.STRING, allowNull: false },
    firmware: { type: DataTypes.STRING, allowNull: false },
    signal: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    battery: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    simStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: "Active" },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastPing: { type: DataTypes.DATE, allowNull: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "Device",
    tableName: "devices",
    timestamps: true,
  }
);
