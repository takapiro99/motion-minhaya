import { Server } from "socket.io";
import { MotionMinhayaWSClientMessage, MotionMinhayaWSServerMessage } from "./common/models/messages";



export const wsRoutes = function (io: Server) {
  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    socket.on("game", (msg: MotionMinhayaWSClientMessage) => {
      console.log(msg);
      switch (msg.action) {
        case "PING":
          socket.emit("game", { event: "PONG" } satisfies MotionMinhayaWSServerMessage);
          break;
        case "PING_WITH_ACK":
          socket.emitWithAck("game", { event: "PONG_WITH_ACK", message: msg.message ?? "" } satisfies MotionMinhayaWSServerMessage);
          break;
        default:
          break;
      }
    })
  });
}