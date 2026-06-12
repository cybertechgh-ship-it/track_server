require("dotenv").config({ path: "C:/Users/TGNE/Desktop/cytrack/.env" });
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { rejectUnauthorized: false } },
  logging: console.log,
});
(async () => {
  try {
    await sequelize.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "registrationDate" DATE`);
    await sequelize.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS "registrationDoc" TEXT`);
    console.log("DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await sequelize.close();
  }
})();
