import type { Server } from "socket.io";
import { gameHandler } from "./api/ws/game";
import type { MotionMinhayaWSClientMessage } from "./common/models/messages";

export const wsRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    socket.on("game", (message: MotionMinhayaWSClientMessage) => {
      gameHandler(message, socket);
    });
  });
};
