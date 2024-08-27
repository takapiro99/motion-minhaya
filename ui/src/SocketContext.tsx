import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Game } from "../../api/src/common/models/game";
import { ClientStatus } from "./domain/type";

type SocketContextType = {
  socket: Socket;
  clientStatus: ClientStatus;
  updateClientStatus: (clientStatus: ClientStatus) => void;
  game: Game;
  updateGame: (game: Game) => void;
  userName: string;
  updateUserName: (userName: string) => void;
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
  clientStatus: "OUT_OF_GAME",
  updateClientStatus: () => {},
  game: {
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  },
  updateGame: () => {},
  userName: "",
  updateUserName: () => {},
  ping,
  enterWaitingRoom,
});

export const SocketContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clientStatus, setClientStatus] = useState<ClientStatus>("OUT_OF_GAME")
  const [game, setGame] = useState<Game>({
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  })
  const [userName, setUserName] = useState<string>("") // TODO: ローカルストレージに保存・取得したい

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
      if (message.event === "WAITING_ROOM_JOINED") {
        console.log("WAITING_ROOM_JOINED recieved!")
        setGame(message)
        setClientStatus("PARTICIPANTS_WAITING")
      }
      if (message.event === "WAITING_ROOM_UPDATED") {
        console.log("WAITING_ROOM_UPDATED recieved!")
        setGame(message)
      }
      if (message.event === "WAITING_ROOM_UNJOINABLE") {
        console.log("WAITING_ROOM_UNJOINABLE recieved!")
        setClientStatus("WAITING_ROOM_UNJOINABLE")
      }
      if (message.event === "GAME_STARTED") {
        console.log("GAME_STARTED recieved!")
        setGame(message)
        setClientStatus("GAME_STARTED")
      }
      if (message.event === "QUIZ_STARTED") {
        console.log("QUIZ_STARTED recieved!")
        setGame(message)
        if (clientStatus !== "GAME_ONGOING") setClientStatus("GAME_ONGOING")
      }
    });
  }, []);

  // clientStatus の状態確認用
  useEffect(() => {
    console.log("clientStatus:", clientStatus)
  }, [clientStatus])

  // game の状態確認用
  useEffect(() => {
    console.log("game:", game)
  }, [game])

  return (
    <SocketContext.Provider
      value={{
        socket,
        clientStatus: clientStatus,
        updateClientStatus: setClientStatus,
        game,
        updateGame: setGame,
        userName,
        updateUserName: setUserName,
        ping,
        enterWaitingRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
