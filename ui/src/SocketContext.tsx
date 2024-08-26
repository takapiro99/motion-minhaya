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
  userName: "",
  updateUserName: () => {},
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
        setGame({
          status: "WAITING_PARTICIPANTS",
          gameId: message.gameId,
          participants: message.participants,
          currentQuizNumberOneIndexed: 1,
          quizzes: null,
          gameResult: null,
        })
        setGameStatus("PARTICIPANTS_WAITING")
      }
      if (message.event === "WAITING_ROOM_UPDATED") {
        console.log("WAITING_ROOM_UPDATED recieved!")
        setGame({
          status: "WAITING_PARTICIPANTS",
          gameId: message.gameId,
          participants: message.participants,
          currentQuizNumberOneIndexed: 1,
          quizzes: null,
          gameResult: null,
        })
      }
      if (message.event === "WAITING_ROOM_UNJOINABLE") {
        console.log("WAITING_ROOM_UNJOINABLE recieved!")
        setGameStatus("WAITING_ROOM_UNJOINABLE")
      }
      if (message.event === "GAME_STARTED") {
        console.log("GAME_STARTED recieved!")
        setGame({
          status: "WAITING_PARTICIPANTS",
          gameId: message.gameId,
          participants: message.participants,
          currentQuizNumberOneIndexed: 1,
          quizzes: null,
          gameResult: null,
        })
        setGameStatus("GAME_STARTED")
      }
      if (message.event === "QUIZ_STARTED") {
        console.log("QUIZ_STARTED recieved!")
        const addedQuiz = {
          quizNumber: message.quizNumber,
          motionId: message.motionId,
          motionStartTimestamp: message.motionStartTimestamp,
          answerFinishTimestamp: message.answerFinishTimestamp,
          guesses: null, // 確認する
        }
        setGame({
          status: "ONGOING",
          gameId: message.gameId,
          participants: message.participants,
          currentQuizNumberOneIndexed: message.quizNumber,
          quizzes: game.quizzes ? game.quizzes.concat(addedQuiz) : addedQuiz,
          gameResult: null,
        })
        if (gameStatus !== "GAME_ONGOING") setGameStatus("GAME_ONGOING")
      }
    });
  }, []);

  // gameStatus の状態確認用
  useEffect(() => {
    console.log("gameStatus:", gameStatus)
  }, [gameStatus])

  // game の状態確認用
  useEffect(() => {
    console.log("game:", game)
  }, [game])

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameStatus,
        updateGameStatus: setGameStatus,
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
