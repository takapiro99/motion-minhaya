import { constants } from "@/common/constants";
import type { WaitingGame } from "@/common/models/game";
import { type MotionMinhayaWSClientMessage, MotionMinhayaWSServerMessage } from "@/common/models/messages";
import { db } from "@/common/utils/db";
import { emitter } from "@/common/utils/emitter";
import type { Socket } from "socket.io";
import { v4 } from "uuid";

export const copy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const gameHandler = (body: MotionMinhayaWSClientMessage, socket: Socket) => {
  switch (body.action) {
    case "PING":
      return handlePing(socket);
    case "PING_WITH_ACK":
      return handlePingWithAck(socket, body.message ?? "");
    case "ENTER_WAITING_ROOM":
      return handleEnterWaitingRoom(socket, body.name);
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

const handleEnterWaitingRoom = (socket: Socket, name: string) => {
  // 空きがあればいれて、保存する
  // 追加されたよーというイベントを投げる
  // 4人だったらゲームを始める処理を呼ぶ
  const waitingRooms = db.game.getWaitingRooms();

  if (waitingRooms.length === 0) {
    // create new Game
    const clientId = v4();
    const newWaitingGame: WaitingGame = {
      gameId: v4(),
      participants: [
        {
          connectionId: socket.id,
          clientId: clientId,
          name: name,
        },
      ],
    };
    db.game.upsertWaitingGame(newWaitingGame);
    emitter.emitWaitingRoomJoined(socket, newWaitingGame, clientId);
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
    if (newWaitingGame.participants.length === constants.PARTICIPANTS_PER_GAME) {
      // start game
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
