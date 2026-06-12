import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResponseHelper } from "../utils/response";
import { asyncHandler } from "../middlewares/error.middleware";
import { sequelize } from "../config/database";

// Token generate helper
const JWT_SECRET = process.env.JWT_SECRET || "demo-jwt-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "demo-jwt-refresh-secret-change-in-production";

const generateTokens = (userId: number, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Valid roles that match the User model ENUM exactly
const VALID_ROLES = ["admin", "operator", "user"] as const;
type ValidRole = typeof VALID_ROLES[number];

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHelper.error(res, "Email and password are required", 400);
    }

    if (!sequelize) {
      if (email === "admin@admin.com" && password === "admin123") {
        const { accessToken, refreshToken } = generateTokens(1, "admin");
        return ResponseHelper.success(res, {
          user: {
            id: 1,
            email: "admin@admin.com",
            firstName: "Admin",
            lastName: "User",
            role: "admin",
            isActive: true,
          },
          accessToken,
          refreshToken,
        }, "Login successful");
      }
      return ResponseHelper.error(res, "Invalid credentials", 401);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return ResponseHelper.error(res, "Invalid credentials", 401);
    }

    if (!user.isActive) {
      return ResponseHelper.error(res, "Account is deactivated", 403);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return ResponseHelper.error(res, "Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await user.update({ refreshToken });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = user.toJSON();

    return ResponseHelper.success(
      res,
      {
        user: userWithoutSensitive,
        accessToken,
        refreshToken,
      },
      "Login successful"
    );
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHelper.error(res, "Refresh token is required", 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      if (decoded.type !== "refresh") {
        return ResponseHelper.error(res, "Invalid token type", 401);
      }

      if (!sequelize) {
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role);
        return ResponseHelper.success(res, {
          user: { id: decoded.userId, email: "admin@admin.com", firstName: "Admin", lastName: "User", role: decoded.role, isActive: true },
          accessToken,
          refreshToken: newRefreshToken,
        }, "Token refreshed successfully");
      }

      const user = await User.findByPk(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return ResponseHelper.error(res, "Invalid refresh token", 401);
      }

      if (!user.isActive) {
        return ResponseHelper.error(res, "Account is deactivated", 403);
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

      await user.update({ refreshToken: newRefreshToken });

      const { password: _, refreshToken: __, ...userWithoutSensitive } = user.toJSON();

      return ResponseHelper.success(
        res,
        {
          user: userWithoutSensitive,
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      return ResponseHelper.error(res, "Invalid or expired refresh token", 401);
    }
  });

  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return ResponseHelper.error(res, "All fields are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ResponseHelper.error(res, "Invalid email format", 400);
    }

    if (password.length < 6) {
      return ResponseHelper.error(res, "Password must be at least 6 characters long", 400);
    }

    // FIX: role must match the DB ENUM exactly: "admin" | "operator" | "user"
    const assignedRole: ValidRole = VALID_ROLES.includes(role) ? role : "operator";

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return ResponseHelper.error(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: assignedRole,
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await user.update({ refreshToken });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = user.toJSON();

    return ResponseHelper.created(
      res,
      {
        user: userWithoutSensitive,
        accessToken,
        refreshToken,
      },
      "User created successfully"
    );
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.update({ refreshToken: null }, { where: { refreshToken } });
    }

    return ResponseHelper.success(res, null, "Logged out successfully");
  });
}
