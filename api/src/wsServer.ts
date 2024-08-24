import { Server } from "socket.io";
import { MotionMinhayaWSClientMessage } from "./common/models/messages";
import { gameHandler } from "./api/ws/game";
import { db } from "./common/utils/db";



export const wsRoutes = (io: Server) => {
  io.on("connection", (socket) => {

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    socket.on("game", (message: MotionMinhayaWSClientMessage) => {
      gameHandler(message, socket);
    })
  });
}