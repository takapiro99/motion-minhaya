import { constants } from "@/common/constants";
import { Participant, type Quiz, type WaitingParticipantsGame, createOngoingGame } from "@/common/models/game";
import type { MotionMinhayaWSClientMessage } from "@/common/models/messages";
import { db } from "@/common/utils/db";
import { emitter } from "@/common/utils/emitter";
import type { Server, Socket } from "socket.io";
import { v4 } from "uuid";

export const copy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const gameHandler = (body: MotionMinhayaWSClientMessage, socket: Socket, io: Server) => {
  console.log(`[receive: ${body.action}] ${socket.id} -> ${JSON.stringify(body)}`);
  switch (body.action) {
    case "PING":
      return handlePing(socket);
    case "PING_WITH_ACK":
      return handlePingWithAck(socket, body.message ?? "");
    case "ENTER_WAITING_ROOM":
      return handleEnterWaitingRoom(socket, body.name, io);
    case "BUTTON_PRESSED":
      return handleButtonPressed(socket);
    case "GUESS_ANSWER":
      return handleGuessAnswer(socket, body.answer);
    default:
      return body satisfies never;
  }
};

const handlePing = (socket: Socket) => emitter.emitPong(socket);

const handlePingWithAck = (socket: Socket, message: string) => emitter.emitPongWithAck(socket, message);

const handleEnterWaitingRoom = (socket: Socket, name: string, io: Server) => {
  // 空きがあればいれて、保存する
  // 追加されたよーというイベントを投げる
  // 4人だったらゲームを始める処理を呼ぶ
  const waitingRooms = db.game.getWaitingRooms();

  if (waitingRooms.length === 0) {
    // create new Game
    const gameID = v4();
    const clientId = v4();
    const newWaitingGame: WaitingParticipantsGame = {
      status: "WAITING_PARTICIPANTS",
      gameId: gameID,
      participants: [
        {
          connectionId: socket.id,
          clientId: clientId,
          name: name,
        },
      ],
      currentQuizNumberOneIndexed: null,
      quizzes: null,
      gameResult: null,
    };
    db.game.upsertWaitingGame(newWaitingGame);
    emitter.emitWaitingRoomJoined(socket, newWaitingGame, clientId);
    console.log(`[waitingRoom] 一人目の待機者。gameID: ${gameID}, name: ${name}`);
  } else if (waitingRooms.length === 1) {
    // join existing Game
    const clientId = v4();
    const newWaitingGame = copy(waitingRooms[0]);
    newWaitingGame.participants.push({
      connectionId: socket.id,
      clientId: clientId,
      name: name,
    });
    db.game.upsertWaitingGame(newWaitingGame);
    emitter.emitWaitingRoomJoined(socket, newWaitingGame, clientId);
    console.log(
      `[waitingRoom] ${newWaitingGame.participants.length}人目の待機者。gameID: ${newWaitingGame.gameId}, name: ${name}`,
    );
    emitter.emitWaitingRoomUpdated(getSocketIDsFromParticipants(newWaitingGame.participants), newWaitingGame, io);
    if (newWaitingGame.participants.length === constants.PARTICIPANTS_PER_GAME) {
      // start game
      console.log(`[waitingRoom] 4人集まったのでゲームを開始`);
      db.game.updateOngoingGame(createOngoingGame(newWaitingGame));
      emitter.emitGameStarted(
        newWaitingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
        newWaitingGame,
        io
      );
      startQuiz1(newWaitingGame.gameId, io);
    }
  } else {
    emitter.emitWaitingRoomUnjoinable(socket);
  }
};

const handleButtonPressed = (socket: Socket) => {
  // TODO
};

const handleGuessAnswer = (socket: Socket, answer: string) => {
  // TODO
};

const startQuiz1 = (gameId: string, io: Server) => {
  const waitingGame = db.game.getGame(gameId);
  if (!waitingGame || waitingGame.status !== "WAITING_PARTICIPANTS") return;
  const ongoingGame = createOngoingGame(waitingGame);
  db.game.updateOngoingGame({
    ...ongoingGame,
    quizzes: ongoingGame.quizzes.concat(getRandomQuiz(gameId, ongoingGame.currentQuizNumberOneIndexed + 1)),
  });
  emitter.emitQuizStarted(
    getSocketIDsFromParticipants(ongoingGame.participants),
    ongoingGame.gameId,
    ongoingGame.quizzes[ongoingGame.currentQuizNumberOneIndexed - 1],
    io
  );
};

const getRandomQuiz = (gameId: string, quizNumber: number): Quiz => {
  return {
    motionId: "00000000-0000-4B00-9000-0000000001", // TODO
    quizNumber: quizNumber,
    motionStartTimestamp: Date.now(),
    answerFinishTimestamp: Date.now() + constants.ANSWER_TIME_MS,
    guesses: [],
  };
};

export const getSocketIDsFromParticipants = (participants: Participant[]): string[] => {
  return participants.map((p) => p.connectionId).filter((p) => p !== null);
}