import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Webhook extends Model {
  public id!: number;
  public name!: string;
  public url!: string;
  public events!: string[];
  public secret!: string | null;
  public isActive!: boolean;
  public lastTriggeredAt!: Date | null;
  public failureCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Webhook.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  events: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  secret: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastTriggeredAt: { type: DataTypes.DATE, allowNull: true },
  failureCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, modelName: "Webhook", tableName: "webhooks", timestamps: true });
