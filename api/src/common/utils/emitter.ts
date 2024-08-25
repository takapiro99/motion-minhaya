import type { Socket } from "socket.io";
import type { Quiz, WaitingGame } from "../models/game";
import type { MotionMinhayaWSServerMessage } from "../models/messages";

const emitToSocket = (socket: Socket, body: MotionMinhayaWSServerMessage) => {
  console.log(`[emit: ${body.event}] ${socket.id} <== ${JSON.stringify(body)}`);
  socket.emit("game", body);
};
const emitToSocketAck = (socket: Socket, body: MotionMinhayaWSServerMessage) => {
  console.log(`[emit(with ack): ${body.event}] ${socket.id} <== ${JSON.stringify(body)}`);
  socket.emitWithAck("game", body);
};

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
  emitWaitingRoomUpdated: (socket: Socket, waitingGame: WaitingGame) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_UPDATED", ...waitingGame });
  },
  emitWaitingRoomUnjoinable: (socket: Socket) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_UNJOINABLE" });
  },
  emitGameStarted: (socket: Socket, game: WaitingGame) => {
    emitToSocketAck(socket, {
      event: "GAME_STARTED",
      gameId: game.gameId,
      participants: game.participants,
    });
  },
  emitQuizStarted: (socket: Socket, gameId: string, quiz: Quiz) => {
    emitToSocketAck(socket, {
      event: "QUIZ_STARTED",
      gameId: gameId,
      quizNumber: quiz.quizNumber,
      motionId: quiz.motionId,
      motionStartTimestamp: quiz.motionStartTimestamp.toString(),
      answerFinishTimestamp: quiz.answerFinishTimestamp.toString(),
    });
  },
};
