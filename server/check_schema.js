require("dotenv").config({ path: "C:/Users/TGNE/Desktop/cytrack/.env" });
const { sequelize } = require("./dist/config/database");
const models = require("./dist/models/index");

(async () => {
  try {
    const [cols] = await sequelize.query(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public'"
    );
    const dbCols = {};
    for (const c of cols) {
      dbCols[c.table_name] = dbCols[c.table_name] || new Set();
      dbCols[c.table_name].add(c.column_name);
    }

    for (const key of Object.keys(models)) {
      const m = models[key];
      if (!m || !m.rawAttributes || !m.getTableName) continue;
      let tableName = m.getTableName();
      if (typeof tableName === "object") tableName = tableName.tableName;
      const dbSet = dbCols[tableName];
      if (!dbSet) {
        console.log(`TABLE MISSING: ${tableName} (model ${key})`);
        continue;
      }
      const modelCols = Object.values(m.rawAttributes).map(a => a.field || a.fieldName);
      const missing = modelCols.filter(c => !dbSet.has(c));
      if (missing.length) {
        console.log(`${tableName}: MISSING COLUMNS -> ${missing.join(", ")}`);
      }
    }
    console.log("CHECK DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await sequelize.close();
  }
})();
