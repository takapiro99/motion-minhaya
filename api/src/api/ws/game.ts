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
import { storageAPI } from "@/common/utils/storage";
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

  const newGuesses: Guess[] = [
    ...notTargetGuesses,
    {
      connectionId: targetParticipant.connectionId,
      clientId: clientId,
      name: targetParticipant.name,
      buttonPressedTimeMs: buttonPressedTimestamp,
      guess: null,
      similarityPoint: -1, // 類似度点数
      quizPoint: -1, // この問題で得た点数
    }
  ]

  const newOngoingGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: newGuesses,
      },
    ]
  };

  console.log("newOngoingGame", JSON.stringify(newOngoingGame));
  db.game.updateOngoingGame(newOngoingGame);

  emitter.emitParticipantsAnswerStatusUpdated(
    newOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
    gameId,
    quizNumber,
    newGuesses,
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

const handleGuessAnswer = async ({
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
  const newGuesses = [
    ...notTargetGuesses,
    {
      ...targetGuess,
      guess: guess,
    },
  ]
  const newOngoingGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: newGuesses
      },
    ],
  };

  db.game.updateOngoingGame(newOngoingGame);

  // check if everyone answered
  if (newGuesses.every((guess) => guess.guess !== null)) {
    // 
    // const a = storageAPI.getQuizById(targetQuiz.motionId);


    // announce results
    setTimeout(() => {
      emitter.quizResult(
        newOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
        gameId,
        newOngoingGame.quizzes.find((q) => q.quizNumber === quizNumber)?.guesses ?? [],
        newOngoingGame.gameResult,
        io
      );
    }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS);

    // go next quiz or final result
    if (newOngoingGame.currentQuizNumberOneIndexed = constants.NUMBER_OF_QUIZZES) {
      setTimeout(() => {
        emitter.gameResult(
          newOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
          gameId,
          newOngoingGame.gameResult,
          io
        );
      }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS + constants.QUIZ_RESULT_TO_NEXT_QUIZ_MS);
      return
    } else {
      // go to next quiz
      setTimeout(() => {
        startQuiz1(gameId, io);
      }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS + constants.QUIZ_RESULT_TO_NEXT_QUIZ_MS);
    }
  } else {
    emitter.emitParticipantsAnswerStatusUpdated(
      newOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
      gameId,
      quizNumber,
      newGuesses,
      io,
    )
  }

  emitter.emitParticipantsAnswerStatusUpdated(
    newOngoingGame.participants.map(p => p.connectionId).filter((p) => p !== null),
    gameId,
    quizNumber,
    newOngoingGame.quizzes.find((q) => q.quizNumber === quizNumber)?.guesses ?? [],
    io,
  )
};

const shuffleArray = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);
const startQuiz1 = async (gameId: string, io: Server) => {
  const ongoingGame = db.game.getGame(gameId);
  if (!ongoingGame || ongoingGame.status === "WAITING_PARTICIPANTS") {
    return console.error(`[Error]: startQuiz1 but was waiting game`);
  }
  const newQuiz = await getRandomQuiz(gameId, ongoingGame.currentQuizNumberOneIndexed + 1)
  if (newQuiz === null) {
    return console.error(`[Error]: startQuiz1 but newQuiz is null`);
  }

  const newGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: ongoingGame.quizzes.concat(newQuiz),
  }
  db.game.updateOngoingGame(newGame);

  emitter.emitQuizStarted(
    getSocketIDsFromParticipants(ongoingGame.participants),
    newGame.gameId,
    newGame.quizzes[ongoingGame.currentQuizNumberOneIndexed],
    io
  );
};

const getRandomQuiz = async (gameId: string, quizNumber: number): Promise<Quiz | null> => {
  const quizzes = await storageAPI.listAllQuizzes();
  if (!quizzes) return null
  const motionId = shuffleArray(quizzes)[0];
  return {
    motionId: motionId.split(".json")[0], // TODO
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
