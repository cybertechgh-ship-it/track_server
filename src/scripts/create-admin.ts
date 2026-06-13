import { sequelize } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger";

async function createAdmin() {
  try {
    await sequelize.sync();

    const adminExists = await User.findOne({ where: { email: "admin@admin.com" } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 12);

      await User.create({
        email: "admin@admin.com",
        password: hashedPassword,
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        isActive: true,
      });

      logger.info("Admin user created successfully!");
      logger.info("Email: admin@admin.com");
      logger.info("Password: admin123");
    } else {
      logger.info("Admin user already exists");
    }

    process.exit(0);
  } catch (error) {
    logger.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
