import type { Server, Socket } from "socket.io";
import type { OnGoingGame, Quiz, WaitingParticipantsGame } from "../models/game";
import type { MotionMinhayaWSServerMessage } from "../models/messages";
import { db } from "./db";

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
  emitWaitingGameJoined: (socket: Socket, waitingGame: WaitingParticipantsGame, clientId: string) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_JOINED", ...waitingGame, clientId });
  },
  emitWaitingRoomUpdated: (socketIDs: string[], waitingGame: WaitingParticipantsGame, io: Server) => {
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, { event: "WAITING_ROOM_UPDATED", ...waitingGame });
      }
    })
  },
  emitWaitingRoomUnjoinable: (socket: Socket) => {
    emitToSocketAck(socket, { event: "WAITING_ROOM_UNJOINABLE" });
  },
  emitGameStarted: (socketIDs: string[], game: WaitingParticipantsGame, io: Server) => {
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, {
          event: "GAME_STARTED",
          gameId: game.gameId,
          participants: game.participants,
        });
      }
    })
  },
  emitQuizStarted: (socketIDs: string[], gameId: string, quiz: Quiz, io: Server) => {
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, {
          event: "QUIZ_STARTED",
          gameId: gameId,
          quizNumber: quiz?.quizNumber,
          motionId: quiz?.motionId,
          motionStartTimestamp: quiz?.motionStartTimestamp,
          answerFinishTimestamp: quiz?.answerFinishTimestamp,
        });
      }
    })
  },
  emitParticipantsAnswerStatusUpdated: (socketIDs: string[], gameId: string, quizNumber: number, guesses: OnGoingGame["quizzes"][number]["guesses"], io: Server) => {
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, {
          event: "PARTICIPANTS_ANSWER_STATUS_UPDATED",
          gameId: gameId,
          quizNumber: quizNumber,
          // participants: guesses.map((guess) => {
          //   return {
          //     clientId: guess.clientId,
          //     name: guess.name,
          //     status: guess.guess !== null ? "ANSWER_SUBMITTED" : guess.buttonPressedTimeMs ? "BUTTON_PRESSED" : "BUTTON_NOT_PRESSED",
          //     buttonPressedTimeMs: guess.buttonPressedTimeMs,
          //   }
          // })
          guesses: guesses, // 動作未確認
        });
      }
    })
  },
  // 動作未確認
  quizResult: (socketIDs: string[], gameId: string, guesses: OnGoingGame["quizzes"][number]["guesses"], gameResult: OnGoingGame["gameResult"], io: Server, answers: string[]) => {
    const quizNum = db.game.getGame(gameId)?.currentQuizNumberOneIndexed;
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, {
          event: "QUIZ_RESULT",
          gameId: gameId,
          quizNumber: quizNum as number,
          guesses: guesses,
          gameResult: gameResult,
          answers: answers,
        });
      }
    })
  },
  // 動作未確認
  gameResult: (socketIDs: string[], gameId: string, gameResult: OnGoingGame["gameResult"], io: Server) => {
    socketIDs.forEach((socketID) => {
      const socket = io.sockets.sockets.get(socketID);
      if (socket) {
        emitToSocketAck(socket, {
          event: "GAME_RESULT",
          gameId: gameId,
          gameResult: gameResult,
        });
      }
    })
  }
};
