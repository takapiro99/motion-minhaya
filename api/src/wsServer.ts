import type { Server, Socket } from "socket.io";
import { copy, gameHandler } from "./api/ws/game";
import type { MotionMinhayaWSClientMessage } from "./common/models/messages";
import { db } from "./common/utils/db";
import { emitter } from "./common/utils/emitter";

export const wsRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      handleDisconnectConnection(socket);
    });

    socket.on("game", (message: MotionMinhayaWSClientMessage) => {
      gameHandler(message, socket);
    });
  });
};

const handleDisconnectConnection = (socket: Socket) => {
  console.log(`${socket.id} disconnected`);
  // 部屋から抜ける処理
  const rooms = db.game.getWaitingRooms();
  const inWaitingRoom = rooms.some((room) =>
    room.participants.some((participant) => participant.connectionId === socket.id),
  );
  if (inWaitingRoom) {
    const targetRoom = rooms.find((room) =>
      room.participants.some((participant) => participant.connectionId === socket.id),
    );
    if (!targetRoom) return;
    const newParticipants = copy(targetRoom).participants.map((participant) => {
      if (participant.connectionId === socket.id) {
        return {
          ...participant,
          connectionId: null,
        };
      }
      return participant;
    });
    const newRoom = { ...targetRoom, participants: newParticipants };
    console.log(`${socket.id} successfully left from waiting room. gameId: ${targetRoom.gameId}`);
    db.game.upsertWaitingGame(newRoom);
    emitter.emitWaitingRoomUpdated(socket, newRoom);
  }
  // TODO: ゲーム中の場合に抜ける処理
};
