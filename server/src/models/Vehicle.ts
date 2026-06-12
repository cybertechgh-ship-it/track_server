import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Vehicle extends Model {
  public id!: number;
  public plateNumber!: string;
  public brand!: string;
  public model!: string;
  public year!: number;
  public esp32DeviceId!: string;
  public isActive!: boolean;
  public speedLimit!: number;
  public totalOdometer!: number;
  public lastServiceOdometer!: number;
  public serviceIntervalKm!: number;
  public color!: string;
  public photo!: string;
  public registrationDate!: string;
  public registrationDoc!: string;
  public notes!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    plateNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    brand: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    esp32DeviceId: { type: DataTypes.STRING, allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    speedLimit: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 120 },
    totalOdometer: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    lastServiceOdometer: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    serviceIntervalKm: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 10000 },
    color: { type: DataTypes.STRING, allowNull: true, defaultValue: '#1976d2' },
    photo: { type: DataTypes.TEXT, allowNull: true },
    registrationDate: { type: DataTypes.DATEONLY, allowNull: true },
    registrationDoc: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Vehicle",
    tableName: "vehicles",
    timestamps: true,
  }
);
