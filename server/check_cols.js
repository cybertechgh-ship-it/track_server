require("dotenv").config({ path: "C:/Users/TGNE/Desktop/cytrack/.env" });
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { rejectUnauthorized: false } },
  logging: false,
});
(async () => {
  try {
    const [results] = await sequelize.query(
      "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position"
    );
    const byTable = {};
    for (const r of results) {
      byTable[r.table_name] = byTable[r.table_name] || [];
      byTable[r.table_name].push(r.column_name);
    }
    console.log(JSON.stringify(byTable, null, 2));
  } catch (e) {
    console.error("ERR", e.message);
  } finally {
    await sequelize.close();
  }
})();
