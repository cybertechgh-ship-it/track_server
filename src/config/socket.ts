import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "./logger";

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:9041",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on("device-connect", (deviceId) => {
      socket.join(`device-${deviceId}`);
      logger.info(`Device ${deviceId} connected`);
    });

    socket.on("admin-connect", () => {
      socket.join("admin");
      logger.info("Admin connected");
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
