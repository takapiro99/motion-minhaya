import type { Server, Socket } from "socket.io";
import { copy, gameHandler } from "./api/ws/game";
import type { MotionMinhayaWSClientMessage } from "./common/models/messages";
import { db } from "./common/utils/db";
import { emitter } from "./common/utils/emitter";

export const wsRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      handleDisconnectConnection(socket, io);
    });

    socket.on("game", (message: MotionMinhayaWSClientMessage) => {
      gameHandler(message, socket, io);
    });
  });
};

const handleDisconnectConnection = (socket: Socket, io: Server) => {
  console.log(`${socket.id} disconnected`);
  // 部屋から抜ける処理
  const waitingGames = db.game.getWaitingGames();
  const targetGame = waitingGames.find((game) =>
    game.participants.some(
      (participant) => participant.connectionId === socket.id
    )
  );
  if (!targetGame) return;
  const updatedParticipants = copy(targetGame).participants.filter(
    (participant) => participant.connectionId !== socket.id
  );
  const updatedGame = { ...targetGame, participants: updatedParticipants };
  console.log(
    `${socket.id} successfully left from waiting room. gameId: ${targetGame.gameId}`
  );
  db.game.upsertWaitingGame(updatedGame);
  emitter.emitWaitingRoomUpdated(
    updatedGame.participants
      .map((p) => p.connectionId)
      .filter((p) => p !== null),
    updatedGame,
    io
  );
  // TODO: ゲーム中の場合に抜ける処理
};
