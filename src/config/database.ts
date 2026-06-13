import { Sequelize } from "sequelize";
import { resolve } from "path";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config({ path: resolve(__dirname, "../../.env"), override: true });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: resolve(__dirname, "../.env"), override: true });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Check your server/.env file."
  );
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === "development" ? (msg: string) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export { sequelize };

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    throw error;
  }
};
