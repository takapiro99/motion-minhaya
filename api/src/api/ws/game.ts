import { constants } from "@/common/constants";
import {
  Guess,
  OnGoingGame,
  Participant,
  type Quiz,
  type WaitingParticipantsGame,
  createOngoingGame,
} from "@/common/models/game";
import type { MotionMinhayaWSClientMessage } from "@/common/models/messages";
import { db } from "@/common/utils/db";
import { emitter } from "@/common/utils/emitter";
import { io } from "@/index";
import type { Server, Socket } from "socket.io";
import { v4 } from "uuid";

export const copy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const gameHandler = (
  body: MotionMinhayaWSClientMessage,
  socket: Socket,
  io: Server
) => {
  console.log(
    `[receive: ${body.action}] ${socket.id} -> ${JSON.stringify(body)}`
  );
  switch (body.action) {
    case "PING":
      return handlePing(socket);
    case "PING_WITH_ACK":
      return handlePingWithAck(socket, body.message ?? "");
    case "ENTER_WAITING_ROOM":
      return handleEnterWaitingRoom(socket, body.name, io);
    case "BUTTON_PRESSED":
      return handleButtonPressed({
        // socket,
        gameId: body.gameId,
        quizNumber: body.quizNumber,
        clientId: body.clientId,
        buttonPressedTimestamp: body.buttonPressedTimestamp,
      });
    case "GUESS_ANSWER":
      return handleGuessAnswer({
        socket,
        gameId: body.gameId,
        quizNumber: body.quizNumber,
        clientId: body.clientId,
        guess: body.guess,
      });
    default:
      return body satisfies never;
  }
};

const handlePing = (socket: Socket) => emitter.emitPong(socket);

const handlePingWithAck = (socket: Socket, message: string) =>
  emitter.emitPongWithAck(socket, message);

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
    console.log(
      `[waitingRoom] 一人目の待機者。gameID: ${gameID}, name: ${name}`
    );
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
      `[waitingRoom] ${newWaitingGame.participants.length}人目の待機者。gameID: ${newWaitingGame.gameId}, name: ${name}`
    );
    emitter.emitWaitingRoomUpdated(
      getSocketIDsFromParticipants(newWaitingGame.participants),
      newWaitingGame,
      io
    );
    console.log(newWaitingGame);
    if (
      newWaitingGame.participants.length === constants.PARTICIPANTS_PER_GAME
    ) {
      // start game
      console.log(`[waitingRoom] ${constants.PARTICIPANTS_PER_GAME}人集まったのでゲームを開始`);
      db.game.updateOngoingGame(createOngoingGame(newWaitingGame));
      setTimeout(() => {
        emitter.emitGameStarted(
          newWaitingGame.participants
            .map((p) => p.connectionId)
            .filter((p) => p !== null),
          newWaitingGame,
          io
        );
      }, constants.PARTICIPANTS_GATHERING_START_GAME_MS)
      setTimeout(() => {
        startQuiz1(newWaitingGame.gameId, io);
      }, constants.PARTICIPANTS_GATHERING_START_GAME_MS + constants.START_GAME_TO_START_QUIZ1_MS)
    }
  } else {
    emitter.emitWaitingRoomUnjoinable(socket);
  }
};

type handleButtonPressedProps = {
  // socket: Socket,
  gameId: string;
  quizNumber: number;
  clientId: string;
  buttonPressedTimestamp: number;
};

const handleButtonPressed = ({
  // socket,
  gameId,
  quizNumber,
  clientId,
  buttonPressedTimestamp,
}: handleButtonPressedProps) => {
  const ongoingGame = db.game.getGame(gameId); // as OnGoingGame
  if (!ongoingGame || ongoingGame.status !== "ONGOING") {
    return console.error(`[Error] handleButtonPressedでongoingじゃないよ？`);
  }

  const targetQuiz = ongoingGame.quizzes.find(
    (quiz) => quiz.quizNumber === quizNumber
  );
  const notTargetQuizzes = ongoingGame.quizzes.filter(
    (quiz) => quiz.quizNumber !== quizNumber
  );
  if (!targetQuiz) {
    return console.error(
      `[Error]: target quiz not found: ${gameId}, ${quizNumber}, ${clientId}, ${buttonPressedTimestamp}`
    );
  }
  const targetGuess = targetQuiz.guesses.find(
    (guess) => guess.clientId === clientId
  );
  const notTargetGuesses = targetQuiz.guesses.filter(
    (guess) => guess.clientId !== clientId
  );
  if (targetGuess) {
    return console.error(
      `[Error]: button pressed but target guess of quiz has found!!: ${gameId}, ${quizNumber}, ${clientId}, ${buttonPressedTimestamp}`
    );
  }
  const targetParticipant = ongoingGame.participants.find(
    (p) => p.clientId == clientId
  );
  if (!targetParticipant) {
    return console.error(`[Error]: button pressed but no participant found.`);
  }
  const newOngoingGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: [
          ...notTargetGuesses,
          {
            connectionId: targetParticipant.connectionId,
            clientId: clientId,
            name: targetParticipant.name,
            buttonPressedTimeMs: buttonPressedTimestamp,
            guess: null,
            similarityPoint: -1, // 類似度点数
            quizPoint: -1, // この問題で得た点数
          },
        ],
      },
    ],
  };

  console.log("newOngoingGame", JSON.stringify(newOngoingGame));
  db.game.updateOngoingGame(newOngoingGame);

  const updatedOngoingGame = db.game.getGame(gameId);
  console.log("updateOngoingGame", JSON.stringify(updatedOngoingGame)); // guesses: [Array] となっているので直す
  // emitter.emitParticipantsAnswerStatusUpdated(
  //   updatedOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
  //   gameId,
  //   quizNumber,
  //   updatedOngoingGame?.quizzes[quizNumber].guesses,
  //   io,
  // )
  if (!updatedOngoingGame || updatedOngoingGame.status !== "ONGOING") {
    return console.log("aaa")
  }
  console.log("updateOngoingGame", updatedOngoingGame); // guesses: [Array] となっているので直す
  const a = updatedOngoingGame.quizzes.find((quiz) => quiz.quizNumber == quizNumber)?.guesses
  if (a === undefined) {
    return console.error("aaa")
  }
  emitter.emitParticipantsAnswerStatusUpdated(
    updatedOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
    gameId,
    quizNumber,
    a,
    io,
  )
};

type handleGuessAnswerProps = {
  socket: Socket,
  clientId: string;
  gameId: string;
  quizNumber: number;
  guess: string;
};

const handleGuessAnswer = ({
  socket,
  clientId,
  gameId,
  quizNumber,
  guess,
}: handleGuessAnswerProps) => {
  const ongoingGame = db.game.getGame(gameId) as OnGoingGame;
  const targetQuiz = ongoingGame.quizzes.find(
    (quiz) => quiz.quizNumber === quizNumber
  );
  const notTargetQuizzes = ongoingGame.quizzes.filter(
    (quiz) => quiz.quizNumber !== quizNumber
  );
  if (!targetQuiz) {
    return console.error(
      `[Error]: handleGuessAnswer no ongoingQuiz ${clientId}, ${gameId}, ${quizNumber}, ${guess}`
    );
  }
  const targetGuess = targetQuiz.guesses.find(
    (guess) => guess.clientId === clientId
  );
  const notTargetGuesses = targetQuiz.guesses.filter(
    (guess) => guess.clientId !== clientId
  );
  if (!targetGuess) {
    return console.error(
      `[Error]: hangleGuessAnswer but target guess of quiz not found: ${gameId}, ${quizNumber}, ${clientId}, ${guess}`
    );
  }
  const updated: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: [
          ...notTargetGuesses,
          {
            ...targetGuess,
            guess: guess,
          },
        ],
      },
    ],
  }
  console.log(JSON.stringify(updated.quizzes[0].guesses));
  console.log(JSON.stringify(updated.quizzes[0].guesses));
  console.log(JSON.stringify(updated.quizzes[0].guesses));


  db.game.updateOngoingGame(updated);
  emitter.emitParticipantsAnswerStatusUpdated(
    updated.participants.map(p => p.connectionId).filter((p) => p !== null),
    gameId,
    quizNumber,
    updated.quizzes.find((q) => q.quizNumber === quizNumber)?.guesses ?? [],
    io,
  )
};

const startQuiz1 = (gameId: string, io: Server) => {
  const ongoingGame = db.game.getGame(gameId);
  if (!ongoingGame || ongoingGame.status === "WAITING_PARTICIPANTS") {
    return console.error(`[Error]: startQuiz1 but was waiting game`);
  }
  // const ongoingGame = createOngoingGame(waitingGame);
  db.game.updateOngoingGame({
    ...ongoingGame,
    quizzes: ongoingGame.quizzes.concat(
      getRandomQuiz(gameId, ongoingGame.currentQuizNumberOneIndexed + 1)
    ),
  });
  const latestOngoingGame = db.game.getGame(gameId) as OnGoingGame; // updateOngoingGame しても ongoingGame は更新されないので再取得する
  emitter.emitQuizStarted(
    getSocketIDsFromParticipants(ongoingGame.participants),
    latestOngoingGame.gameId,
    latestOngoingGame.quizzes[ongoingGame.currentQuizNumberOneIndexed],
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

export const getSocketIDsFromParticipants = (
  participants: Participant[]
): string[] => {
  return participants.map((p) => p.connectionId).filter((p) => p !== null);
};
