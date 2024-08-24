import { Socket } from "socket.io";
import { WaitingGame } from "../models/game";
import { MotionMinhayaWSServerMessage } from "../models/messages";

const emitToSocket = (socket: Socket, body: MotionMinhayaWSServerMessage) => {
  socket.emit("game", body);
}
const emitToSocketAck = (socket: Socket, body: MotionMinhayaWSServerMessage) => {
  socket.emitWithAck("game", body);
}

export const emitter = {
  emitPong: (socket: Socket) => {
    emitToSocket(socket, { event: "PONG" });
  },
  emitPongWithAck: (socket: Socket, message: string) => {
    emitToSocketAck(socket, { event: "PONG_WITH_ACK", message: message });
  },
  emitWaitingRoomJoined: (socket: Socket, waitingGame: WaitingGame, clientId: string) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_JOINED", ...waitingGame, clientId });
  },
  emitWaitingRoomUnjoinable: (socket: Socket) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_UNJOINABLE" });
  },
}
