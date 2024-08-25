import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Game } from "../../api/src/common/utils/db";
import { GameStatus } from "./domain/type";

type SocketContextType = {
  socket: Socket;
  gameStatus: GameStatus;
  updateGameStatus: (gameStatus: GameStatus) => void;
  game: Game;
  updateGame: (game: Game) => void;
  ping: () => void;
  enterWaitingRoom: (name: string) => void;
};

const socket = io(import.meta.env.SERVER_ORIGIN ?? "localhost:8080");

const ping = () => socket.emit("game", { action: "PING" });

const enterWaitingRoom = (name: string) => {
  socket.emit("game", {
    "action": "ENTER_WAITING_ROOM", 
    "name": name,
  })
}

export const SocketContext = createContext<SocketContextType>({
  socket,
  gameStatus: "OUT_OF_GAME",
  updateGameStatus: () => {},
  game: {
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  },
  updateGame: () => {},
  ping,
  enterWaitingRoom,
});

export const SocketContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("OUT_OF_GAME")
  const [game, setGame] = useState<Game>({
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  })

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected!", socket);
    });
    socket.on("game", (message) => {
      console.log(message);
      if (message.event === "PONG") {
        console.log("PONG received!");
        // update state なりなんなり
      }
    });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameStatus,
        updateGameStatus: setGameStatus,
        game,
        updateGame: setGame,
        ping,
        enterWaitingRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
