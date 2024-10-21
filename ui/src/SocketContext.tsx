import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Game,
  Quiz,
  WaitingParticipantsGame,
} from "../../api/src/common/models/game";
import {
  ButtonPressedProps,
  ClientStatus,
  GuessAnswerProps,
  User,
} from "./domain/type";
import { MotionMinhayaWSServerMessage } from "../../api/src/common/models/messages";

export const serverOrigin = import.meta.env.DEV
  ? "http://localhost:8080"
  : "https://motion-minhaya-sxmhgfgw6q-an.a.run.app";

type SocketContextType = {
  socket: Socket;
  clientStatus: ClientStatus;
  updateClientStatus: (clientStatus: ClientStatus) => void;
  game: Game;
  updateGame: (game: Game) => void;
  user: User;
  updateUser: (user: User) => void;
  ping: () => void;
  enterWaitingRoom: (name: string) => void;
  buttonPressed: (buttonPressedProps: ButtonPressedProps) => void;
  guessAnswer: (guessAnswerProps: GuessAnswerProps) => void;
};

const socket = io(serverOrigin);

const ping = () => socket.emit("game", { action: "PING" });

const enterWaitingRoom = (name: string) => {
  socket.emit("game", {
    action: "ENTER_WAITING_ROOM",
    name: name,
  });
};

const buttonPressed = ({
  gameId,
  quizNumber,
  clientId,
  buttonPressedTimestamp,
}: ButtonPressedProps) => {
  socket.emit("game", {
    action: "BUTTON_PRESSED",
    gameId: gameId,
    quizNumber: quizNumber,
    clientId: clientId,
    buttonPressedTimestamp: buttonPressedTimestamp,
  });
};

const guessAnswer = ({
  gameId,
  quizNumber,
  clientId,
  guess,
}: GuessAnswerProps) => {
  socket.emit("game", {
    action: "GUESS_ANSWER",
    clientId: clientId,
    gameId: gameId,
    quizNumber: quizNumber,
    guess: guess,
  });
};

export const SocketContext = createContext<SocketContextType>({
  socket,
  clientStatus: "OUT_OF_GAME",
  updateClientStatus: () => { },
  game: {
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  },
  updateGame: () => { },
  user: {
    connectionId: null,
    clientId: null,
    name: "",
  },
  updateUser: () => { },
  ping,
  enterWaitingRoom,
  buttonPressed,
  guessAnswer,
});

export const SocketContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clientStatus, setClientStatus] = useState<ClientStatus>("OUT_OF_GAME");
  const [game, setGame] = useState<Game>({
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  });
  const [user, setUser] = useState<User>({
    // TODO: ローカルストレージに保存・取得したい
    connectionId: null,
    clientId: null,
    name: "",
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected!", socket);
    });
    socket.on("game", (message: MotionMinhayaWSServerMessage) => {
      console.log(`${message.event} received!`);
      console.log(message);
      switch (message.event) {
        case "PONG":
        case "PONG_WITH_ACK":
        case "USER_CONNECTION_UPDATED": // 設計はしたけど実装しなかったからなにもしない
          // なにもしない
          break;
        case "WAITING_ROOM_JOINED": {
          const participants = message.participants;
          const myClientId = message.clientId;
          const myConnectionId = participants.find((p) => p.clientId === myClientId)?.connectionId ?? null;
          setGame({
            ...game,
            status: "WAITING_PARTICIPANTS",
            gameId: message.gameId,
            participants: participants,
          } as WaitingParticipantsGame);
          setClientStatus("PARTICIPANTS_WAITING");
          setUser({ ...user, connectionId: myConnectionId, clientId: myClientId });
          break;
        }
        case "WAITING_ROOM_UPDATED": {
          setGame({ ...game, participants: message.participants } as WaitingParticipantsGame);
          break;
        }
        case "WAITING_ROOM_UNJOINABLE": {
          setClientStatus("WAITING_ROOM_UNJOINABLE");
          break;
        }
        case "GAME_STARTED": {
          setGame({
            ...game,
            status: "ONGOING",
            gameId: message.gameId, // 不要な更新？
            participants: message.participants,
            currentQuizNumberOneIndexed: 0, // まだ始まっていないという意味
            quizzes: [],
            gameResult: [],
          });
          setClientStatus("GAME_ONGOING");
          break;
        }
        case "QUIZ_STARTED": {
          if (game.status !== "ONGOING") {
            return console.error("vvvv");
          }
          const addedQuiz = {
            quizNumber: message.quizNumber,
            motionId: message.motionId,
            motionStartTimestamp: message.motionStartTimestamp,
            answerFinishTimestamp: message.answerFinishTimestamp,
            guesses: [],
            answers: [],
          } as Quiz;
          setGame({
            ...game,
            status: "ONGOING", // 不要な更新？
            gameId: message.gameId as string, // 不要な更新？
            currentQuizNumberOneIndexed: message.quizNumber as number,
            quizzes: game.quizzes ? [...game.quizzes, addedQuiz] : [addedQuiz],
          });
          if (clientStatus !== "GAME_ONGOING") setClientStatus("GAME_ONGOING");
          break;
        }
        case "PARTICIPANTS_ANSWER_STATUS_UPDATED": {
          console.log("game: ", game);
          if (game.status !== "ONGOING") {
            return console.error(`[Error] game.status is not ONGOING`);
          }
          const currentQuizNumber = message.quizNumber as number;
          const currentQuiz = game.quizzes.find(
            (quiz) => quiz.quizNumber === currentQuizNumber,
          );
          if (currentQuiz === undefined) {
            return console.error(`[Error] currentQuiz cannot found`);
          }
          console.log("currentQuiz", currentQuiz);
          const notCurrentQuiz = game.quizzes.filter(
            (quiz) => quiz.quizNumber !== currentQuizNumber,
          );
          const addedQuiz = {
            ...currentQuiz,
            guesses: message.guesses,
          };
          console.log("addedQuiz", addedQuiz);
          setGame({
            ...game,
            status: "ONGOING", // 不要な更新？
            gameId: message.gameId as string, // 不要な更新？
            quizzes: [...notCurrentQuiz, addedQuiz],
          });
          break;
        }
        case "QUIZ_RESULT": {
          if (game.status !== "ONGOING") {
            return console.error(`[Error] game.status is not ONGOING`);
          }
          const currentQuizNumber = message.quizNumber;
          const currentQuiz = game.quizzes?.find(
            (quiz) => quiz.quizNumber === currentQuizNumber,
          );
          if (!currentQuiz) {
            return console.error(`[Error] currentQuiz cannot found`);
          }
          const notCurrentQuiz =
            game.quizzes?.filter(
              (quiz) => quiz.quizNumber !== currentQuizNumber,
            ) ?? [];
          const addedQuiz: Quiz = {
            ...currentQuiz,
            guesses: message.guesses,
            answers: message.answers,
          };
          setGame({
            ...game,
            status: "ONGOING", // 不要な更新？
            gameId: message.gameId, // 不要な更新？
            quizzes: [...notCurrentQuiz, addedQuiz],
            gameResult: message.gameResult,
          });
          break;
        }
        case "GAME_RESULT": {
          if (game.status !== "ONGOING") {
            return console.error(`[Error] game.status is not ONGOING`);
          }
          console.log("GAME_RESULT recieved!");
          setGame({
            ...game,
            status: "ONGOING", // 不要な更新？
            gameId: message.gameId, // 不要な更新？
            gameResult: message.gameResult,
          });
          setClientStatus("GAME_FINISIED");
          break;
        }

        default:
          return message satisfies never
      }
    });
    return () => {
      socket.off("game");
    };
  }, [clientStatus, game, user]);

  // clientStatus の状態確認用
  useEffect(() => {
    console.log("clientStatus:", clientStatus);
  }, [clientStatus]);

  // game の状態確認用
  useEffect(() => {
    console.log("game:", game);
  }, [game]);

  // user の状態確認用
  useEffect(() => {
    console.log("user:", user);
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        clientStatus: clientStatus,
        updateClientStatus: setClientStatus,
        game,
        updateGame: setGame,
        user,
        updateUser: setUser,
        ping,
        enterWaitingRoom,
        buttonPressed,
        guessAnswer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
