import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Driver extends Model {
  public id!: number;
  public rfidCardId!: string;
  public firstName!: string;
  public lastName!: string;
  public phone!: string;
  public email!: string;
  public isActive!: boolean;
  public licenseNumber!: string;
  public licenseExpiry!: Date;
  public licenseDoc!: string;
  public behaviorScore!: number;
  public totalTrips!: number;
  public totalDistance!: number;
  public photo!: string;
  public notes!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Driver.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rfidCardId: { type: DataTypes.STRING, allowNull: false, unique: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    licenseExpiry: { type: DataTypes.DATE, allowNull: true },
    licenseNumber: { type: DataTypes.STRING, allowNull: true },
    behaviorScore: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 100 },
    totalTrips: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    totalDistance: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    photo: { type: DataTypes.TEXT, allowNull: true },
    licenseDoc: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Driver",
    tableName: "drivers",
    timestamps: true,
  }
);
