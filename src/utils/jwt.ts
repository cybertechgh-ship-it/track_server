import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role, type: "refresh" }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};

export const generateTokens = (userId: number, role: string) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  return { accessToken, refreshToken };
};
