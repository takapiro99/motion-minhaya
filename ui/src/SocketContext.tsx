import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Game, GameResult, Guess, OnGoingGame, Participant, Quiz, WaitingParticipantsGame } from "../../api/src/common/models/game";
import { ButtonPressedProps, ClientStatus, GuessAnswerProps, User } from "./domain/type";


export const serverOrigin = import.meta.env.DEV
  ? "localhost:8080"
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
    "action": "ENTER_WAITING_ROOM", 
    "name": name,
  })
}

const buttonPressed = ({
  gameId,
  quizNumber,
  clientId,
  buttonPressedTimestamp,
}: ButtonPressedProps) => {
  socket.emit("game", {
    "action": "BUTTON_PRESSED",
		"gameId": gameId,
		"quizNumber": quizNumber,
		"clientId": clientId,
		"buttonPressedTimestamp": buttonPressedTimestamp,
  })
}

const guessAnswer = ({
  gameId,
  quizNumber,
  clientId,
  guess,
}: GuessAnswerProps) => {
  socket.emit("game", {
    "action": "GUESS_ANSWER",
		"clientId": clientId,
		"gameId": gameId,
		"quizNumber": quizNumber,
		"guess": guess,
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
  user: {
    connectionId: null,
    clientId: null,
    name: "",
  },
  updateUser: () => {},
  ping,
  enterWaitingRoom,
  buttonPressed,
  guessAnswer,
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
  const [user, setUser] = useState<User>({ // TODO: ローカルストレージに保存・取得したい
    connectionId: null,
    clientId: null,
    name: "",
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
      if (message.event === "WAITING_ROOM_JOINED") {
        console.log("WAITING_ROOM_JOINED recieved!")
        const participants = message.participants as Participant[]
        const myClientId = message.clientId as string
        const myConnectionId = participants.find((participant) => participant.clientId === myClientId)?.connectionId ?? null
        setGame({
          ...game,
          status: "WAITING_PARTICIPANTS",
          gameId: message.gameId as string,
          participants: participants,
        } as WaitingParticipantsGame)
        setClientStatus("PARTICIPANTS_WAITING")
        setUser({
          ...user,
          connectionId: myConnectionId,
          clientId: myClientId,
        })
      }
      if (message.event === "WAITING_ROOM_UPDATED") {
        console.log("WAITING_ROOM_UPDATED recieved!")
        setGame({
          ...game,
          status: "WAITING_PARTICIPANTS", // 不要な更新？
          gameId: message.gameId as string, // 不要な更新？
          participants: message.participants as Participant[],
        } as WaitingParticipantsGame)
      }
      if (message.event === "WAITING_ROOM_UNJOINABLE") {
        console.log("WAITING_ROOM_UNJOINABLE recieved!")
        setClientStatus("WAITING_ROOM_UNJOINABLE")
      }
      if (message.event === "GAME_STARTED") {
        console.log("GAME_STARTED recieved!")
        setGame({
          ...game,
          status: "ONGOING",
          gameId: message.gameId as string, // 不要な更新？
          participants: message.participants as Participant[],
          currentQuizNumberOneIndexed: 0, // まだ始まっていないという意味
          quizzes: [] as Quiz[],
        } as OnGoingGame)
        setClientStatus("GAME_ONGOING")
      }
      if (message.event === "QUIZ_STARTED") {
        console.log("QUIZ_STARTED recieved!")
        const addedQuiz = {
          quizNumber: message.quizNumber as number,
          motionId: message.motionId as string,
          motionStartTimestamp: message.motionStartTimestamp as number,
          answerFinishTimestamp: message.answerFinishTimestamp as number,
          guesses: [] as Guess[],
        } as Quiz
        setGame({
          ...game, 
          status: "ONGOING", // 不要な更新？
          gameId: message.gameId as string, // 不要な更新？
          currentQuizNumberOneIndexed: message.quizNumber as number,
          quizzes: game.quizzes ? [...game.quizzes, addedQuiz] : [addedQuiz],
        } as OnGoingGame)
        if (clientStatus !== "GAME_ONGOING") setClientStatus("GAME_ONGOING")
      }
      // 動作未確認
      if (message.event === "PARTICIPANTS_ANSWER_STATUS_UPDATED") {
        console.log("PARTICIPANTS_ANSWER_STATUS_UPDATED recieved!")
        const currentQuizNumber = message.quizNumber as number
        const currentQuiz = game.quizzes?.filter(quiz => quiz.quizNumber === currentQuizNumber)
        const notCurrentQuiz = game.quizzes?.filter(quiz => quiz.quizNumber !== currentQuizNumber)
        const addedQuiz = {
          ...currentQuiz,
          guesses: message.guesses as Guess[],
        }
        setGame({
          ...game, 
          status: "ONGOING", // 不要な更新？
          gameId: message.gameId as string, // 不要な更新？
          quizzes: notCurrentQuiz ? [...notCurrentQuiz, addedQuiz] : addedQuiz,
        } as OnGoingGame)
      }
      // 動作未確認
      if (message.event === "QUIZ_RESULT") {
        console.log("QUIZ_RESULT recieved!")
        const currentQuizNumber = message.quizNumber as number
        const currentQuiz = game.quizzes?.filter(quiz => quiz.quizNumber === currentQuizNumber)
        const notCurrentQuiz = game.quizzes?.filter(quiz => quiz.quizNumber !== currentQuizNumber)
        const addedQuiz = {
          ...currentQuiz,
          guesses: message.guesses as Guess[],
        }
        setGame({
          ...game, 
          status: "ONGOING", // 不要な更新？
          gameId: message.gameId as string, // 不要な更新？
          quizzes: notCurrentQuiz ? [...notCurrentQuiz, addedQuiz] : addedQuiz,
          gameResult: message.gameResult as GameResult[],
        } as OnGoingGame)
      }
      // 動作未確認
      if (message.event === "GAME_RESULT") {
        console.log("GAME_RESULT recieved!")
        setGame({
          ...game, 
          status: "ONGOING", // 不要な更新？
          gameId: message.gameId as string, // 不要な更新？
          gameResult: message.gameResult as GameResult[],
        } as OnGoingGame)
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

  // user の状態確認用
  useEffect(() => {
    console.log("user:", user)
  }, [user])

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
