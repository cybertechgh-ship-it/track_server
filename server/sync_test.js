require("dotenv").config({ path: "C:/Users/TGNE/Desktop/cytrack/.env" });
const { sequelize } = require("./dist/config/database");
require("./dist/models/index");
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("SYNC OK");
  } catch (e) {
    console.error("SYNC ERR:", e.message);
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
