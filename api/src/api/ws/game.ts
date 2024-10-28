import { constants } from "@/common/constants";
import {
  Game,
  Guess,
  OnGoingGame,
  Participant,
  type Quiz,
  type WaitingParticipantsGame,
  createOngoingGame,
} from "@/common/models/game";
import type { MotionMinhayaWSClientMessage } from "@/common/models/messages";
import { db } from "@/common/utils/db";
import { emitter, getParticipantIDs } from "@/common/utils/emitter";
import { QuizInfo, storageAPI } from "@/common/utils/storage";
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
      return handleEnterWaitingGame(socket, body.name, io);
    case "BUTTON_PRESSED":
      return handlePressAnswerButton({
        gameId: body.gameId,
        quizNumber: body.quizNumber,
        clientId: body.clientId,
        timestamp: body.buttonPressedTimestamp,
      });
    case "GUESS_ANSWER":
      return handleGuessAnswer({
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

const handleEnterWaitingGame = (socket: Socket, name: string, io: Server) => {
  const waitingGames = db.game.getWaitingGames();

  if (waitingGames.length === 0) {
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
    emitter.emitWaitingGameJoined(socket, newWaitingGame, clientId);
    console.log(
      `[waitingRoom] 一人目の待機者。gameID: ${gameID}, name: ${name}`
    );
  } else if (waitingGames.length === 1) {
    // join existing Game
    const clientId = v4();
    const newWaitingGame = copy(waitingGames[0]);
    newWaitingGame.participants.push({
      connectionId: socket.id,
      clientId: clientId,
      name: name,
    });
    db.game.upsertWaitingGame(newWaitingGame);
    emitter.emitWaitingGameJoined(socket, newWaitingGame, clientId);
    console.log(
      `[waitingRoom] ${newWaitingGame.participants.length}人目の待機者。gameID: ${newWaitingGame.gameId}, name: ${name}`
    );
    emitter.emitWaitingRoomUpdated(
      getSocketIDsFromParticipants(newWaitingGame.participants),
      newWaitingGame,
      io
    );
    if (
      newWaitingGame.participants.length === constants.PARTICIPANTS_PER_GAME
    ) {
      // start game
      console.log(
        `[waitingRoom] ${constants.PARTICIPANTS_PER_GAME}人集まったのでゲームを開始`
      );
      db.game.updateOngoingGame(createOngoingGame(newWaitingGame));
      setTimeout(() => {
        emitter.emitGameStarted(
          newWaitingGame.participants
            .map((p) => p.connectionId)
            .filter((p) => p !== null),
          newWaitingGame,
          io
        );
      }, constants.PARTICIPANTS_GATHERING_START_GAME_MS);
      setTimeout(() => {
        startNewQuiz(newWaitingGame.gameId, io);
      }, constants.PARTICIPANTS_GATHERING_START_GAME_MS + constants.START_GAME_TO_START_QUIZ1_MS);
    }
  } else {
    emitter.emitWaitingRoomUnjoinable(socket);
  }
};

type HandlePressAnswerButtonProps = {
  gameId: string;
  quizNumber: number;
  clientId: string;
  timestamp: number;
};

const handlePressAnswerButton = ({
  gameId,
  quizNumber,
  clientId,
  timestamp,
}: HandlePressAnswerButtonProps) => {
  const ongoingGame = db.game.getGame(gameId);
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
      `[Error]: target quiz not found: ${gameId}, ${quizNumber}, ${clientId}, ${timestamp}`
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
      `[Error]: button pressed but target guess of quiz has found!!: ${gameId}, ${quizNumber}, ${clientId}, ${timestamp}`
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
      buttonPressedTimeMs: timestamp,
      guess: null,
      similarityPoint: -1, // 類似度点数
      quizPoint: -1, // この問題で得た点数
    },
  ];

  const newOngoingGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: newGuesses,
      },
    ],
  };

  db.game.updateOngoingGame(newOngoingGame);

  emitter.emitParticipantsAnswerStatusUpdated(
    getParticipantIDs(newOngoingGame),
    gameId,
    quizNumber,
    newGuesses,
    io
  );
};

type HandleGuessAnswerProps = {
  clientId: string;
  gameId: string;
  quizNumber: number;
  guess: string;
};

const handleGuessAnswer = async ({
  clientId,
  gameId,
  quizNumber,
  guess,
}: HandleGuessAnswerProps) => {
  const ongoingGame = db.game.getGame(gameId);
  if (!ongoingGame || ongoingGame.status !== "ONGOING") {
    return console.error(
      `[Error]: handleGuessAnswer but no ongoingGame ${clientId}, ${gameId}, ${quizNumber}, ${guess}`
    );
  }
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

  let newGuesses = [
    ...notTargetGuesses,
    {
      ...targetGuess,
      guess: guess,
    },
  ];
  const everyoneAnswered =
    newGuesses.length === constants.PARTICIPANTS_PER_GAME &&
    newGuesses
      .filter((g) => g.connectionId !== null)
      .every((guess) => guess.guess !== null);
  let motion: QuizInfo | null = null;
  // if finished, set points
  if (everyoneAnswered) {
    motion = await storageAPI.getQuizById(targetQuiz.motionId);
    if (!motion) {
      return console.error(`[Error]: handleGuessAnswer but motion not found`);
    }
    newGuesses = copy(newGuesses).map((guess) => {
      if (!motion) return guess;
      const correct = motion.answers.includes(guess.guess ?? "___");
      const answerSeikaiOrder = newGuesses
        .sort((a, b) => b.buttonPressedTimeMs - a.buttonPressedTimeMs)
        .filter((g) => motion?.answers.includes(g.guess ?? "___"))
        .findIndex((g) => g.clientId === guess.clientId);

      return {
        ...guess,
        similarityPoint: correct ? 1 : 0,
        quizPoint: correct ? (4 - answerSeikaiOrder) * 10 : 0,
      };
    });
  }
  const newOngoingGame: OnGoingGame = {
    ...ongoingGame,
    quizzes: [
      ...notTargetQuizzes,
      {
        ...targetQuiz,
        guesses: newGuesses,
      },
    ],
  };

  db.game.updateOngoingGame(newOngoingGame);
  // check if everyone answered
  if (everyoneAnswered) {
    // announce results
    setTimeout(() => {
      emitter.quizResult(
        newOngoingGame.participants
          .map((p) => p.connectionId)
          .filter((p) => p !== null),
        gameId,
        newOngoingGame.quizzes.find((q) => q.quizNumber === quizNumber)
          ?.guesses ?? [],
        newOngoingGame.gameResult,
        io,
        motion?.answers ?? []
      );
    }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS);

    // go next quiz or final result
    if (
      newOngoingGame.currentQuizNumberOneIndexed === constants.NUMBER_OF_QUIZZES
    ) {
      setTimeout(() => {
        emitter.gameResult(
          newOngoingGame.participants
            .map((p) => p.connectionId)
            .filter((p) => p !== null),
          gameId,
          newOngoingGame.participants.map((p) => {
            return {
              ...p,
              gamePoint: newOngoingGame.quizzes.reduce((acc, quiz) => {
                const guess = quiz.guesses.find(
                  (g) => g.clientId === p.clientId
                );
                if (!guess) return acc;
                return acc + guess.quizPoint;
              }, 0),
            };
          }),
          io
        );
      }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS + constants.QUIZ_RESULT_TO_NEXT_QUIZ_MS);
      return;
    } else {
      // go to next quiz
      setTimeout(() => {
        startNewQuiz(gameId, io);
      }, constants.ANSWERS_GATHERING_TO_QUIZ_RESULT_MS + constants.QUIZ_RESULT_TO_NEXT_QUIZ_MS);
    }
  } else {
    emitter.emitParticipantsAnswerStatusUpdated(
      newOngoingGame.participants
        .map((p) => p.connectionId)
        .filter((p) => p !== null),
      gameId,
      quizNumber,
      newGuesses,
      io
    );
  }

  emitter.emitParticipantsAnswerStatusUpdated(
    newOngoingGame.participants
      .map((p) => p.connectionId)
      .filter((p) => p !== null),
    gameId,
    quizNumber,
    newOngoingGame.quizzes.find((q) => q.quizNumber === quizNumber)?.guesses ??
      [],
    io
  );
};

const shuffleArray = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);
const startNewQuiz = async (gameId: string, io: Server) => {
  const ongoingGame = db.game.getGame(gameId);
  if (!ongoingGame || ongoingGame.status === "WAITING_PARTICIPANTS") {
    return console.error(`[Error]: startQuiz1 but was waiting game`);
  }
  const nextQuizIndex = ongoingGame.currentQuizNumberOneIndexed + 1;

  const newQuiz = await getRandomQuiz(gameId, nextQuizIndex); // !!
  if (newQuiz === null) {
    return console.error(`[Error]: startQuiz1 but newQuiz is null`);
  }

  const newGame: OnGoingGame = {
    ...ongoingGame,
    currentQuizNumberOneIndexed: nextQuizIndex,
    quizzes: ongoingGame.quizzes.concat(newQuiz),
  };
  db.game.updateOngoingGame(newGame);

  emitter.emitQuizStarted(
    getSocketIDsFromParticipants(ongoingGame.participants),
    newGame.gameId,
    newQuiz,
    io
  );
};

const getRandomQuiz = async (
  gameId: string,
  quizNumber: number
): Promise<Quiz | null> => {
  const quizzes = await storageAPI.listAllQuizzes();
  if (!quizzes) return null;
  const motionId = shuffleArray(quizzes)[0];
  return {
    motionId: motionId.split(".json")[0].split("motion/")[1],
    quizNumber: quizNumber,
    motionStartTimestamp: Date.now(),
    answerFinishTimestamp: Date.now() + constants.ANSWER_TIME_MS,
    guesses: [],
    answers: [],
  };
};

export const getSocketIDsFromParticipants = (
  participants: Participant[]
): string[] => {
  return participants.map((p) => p.connectionId).filter((p) => p !== null);
};
