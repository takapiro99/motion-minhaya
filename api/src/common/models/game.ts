export type GameClientAction = "PING" | "PING_WITH_ACK" | "ENTER_WAITING_ROOM" | "BUTTON_PRESSED" | "GUESS_ANSWER";

export type GameServerEvent =
  | "PONG"
  | "PONG_WITH_ACK"
  | "USER_CONNECTION_UPDATED"
  | "WAITING_ROOM_JOINED"
  | "WAITING_ROOM_UPDATED"
  | "WAITING_ROOM_UNJOINABLE"
  | "GAME_STARTED"
  | "QUIZ_STARTED"
  | "PARTICIPANTS_ANSWER_STATUS_UPDATED"
  | "QUIZ_RESULT";

export type WaitingGame = {
  status: "WAITING_PARTICIPANTS";
  gameId: string;
  participants: Participant[];
  currentQuizNumberOneIndexed: 1;
  quizzes: null;
  gameResult: null;
};

export type OnGoingGame = {
  status: "ONGOING";
  gameId: string;
  participants: Participant[];
  currentQuizNumberOneIndexed: number;
  quizzes: Quiz[];
  gameResult: (Participant & {
    gamePoint: number;
  })[] | null;
};

export const createOngoingGame = (waitingGame: WaitingGame): OnGoingGame => {
  return {
    status: "ONGOING",
    gameId: waitingGame.gameId,
    participants: waitingGame.participants,
    currentQuizNumberOneIndexed: 1,
    quizzes: [],
    gameResult: null,
  };
};

export type Quiz = {
  quizNumber: number;
  motionId: string;
  motionStartTimestamp: number; // unix timestamp
  answerFinishTimestamp: number; // unix timestamp
  guesses: (Participant & {
    buttonPressedTimeMs: number;
    guess: string | null;
    similarityPoint: number; // 類似度点数
    quizPoint: number; // この問題で得た点数
  })[];
};

export type Participant = {
  connectionId: string | null;
  clientId: string;
  name: string;
};
