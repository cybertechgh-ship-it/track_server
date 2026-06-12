import { Sequelize } from "sequelize";
import { resolve } from "path";
import dotenv from "dotenv";

// Always load from the server project root regardless of CWD (dev or dist/)
dotenv.config({ path: resolve(__dirname, "../../.env"), override: true });
// Fallback: also try one level up (running directly from src/)
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
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export { sequelize };

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
