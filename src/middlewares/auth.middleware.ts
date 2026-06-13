import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ResponseHelper } from "../utils/response";
import { logger } from "../config/logger";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHelper.error(res, "Access token is required", 401, "NO_TOKEN");
    }

    const token = authHeader.substring(7);

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError: any) {
      // Return specific codes so the client interceptor knows whether to refresh
      if (jwtError.name === "TokenExpiredError") {
        return ResponseHelper.error(res, "Token expired", 401, "TOKEN_EXPIRED");
      }
      return ResponseHelper.error(res, "Invalid token", 401, "INVALID_TOKEN");
    }

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return ResponseHelper.error(res, "Invalid token", 401, "INVALID_TOKEN");
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return ResponseHelper.error(res, "Authentication failed", 401, "AUTH_ERROR");
  }
};

// Backwards compatibility alias
export const authenticate = authenticateToken;

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ResponseHelper.error(
        res,
        "Access denied - insufficient permissions",
        403,
        "FORBIDDEN"
      );
    }
    next();
  };
};
