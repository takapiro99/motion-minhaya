import type { GameClientAction, GameResult, GameServerEvent, Guess, Participant } from "./game";

type MotionMinhayaWSClientMessageBase = {
  action: GameClientAction;
};

export type MotionMinhayaWSClientMessage =
  | (MotionMinhayaWSClientMessageBase & {
    action: "PING";
  })
  | {
    action: "PING_WITH_ACK";
    message: string;
  }
  | {
    action: "ENTER_WAITING_ROOM";
    name: string;
  }
  | {
    action: "BUTTON_PRESSED";
    gameId: string;
    quizNumber: number;
    clientId: string;
    buttonPressedTimestamp: number;
  }
  | {
    action: "GUESS_ANSWER";
    clientId: string,
    gameId: string,
    quizNumber: number,
    guess: string,
  };

type MotionMinhayaWSServerMessageBase = {
  event: GameServerEvent;
};

export type MotionMinhayaWSServerMessage =
  | (MotionMinhayaWSServerMessageBase & {
    event: "PONG";
  })
  | {
    event: "PONG_WITH_ACK";
    message: string;
  }
  | {
    event: "USER_CONNECTION_UPDATED";
    // TODO
  }
  | {
    event: "WAITING_ROOM_JOINED";
    gameId: string;
    clientId: string;
    participants: Participant[];
  }
  | {
    event: "WAITING_ROOM_UPDATED";
    gameId: string;
    participants: Participant[];
  }
  | {
    event: "WAITING_ROOM_UNJOINABLE";
  }
  | {
    event: "GAME_STARTED";
    gameId: string;
    participants: Participant[];
  }
  | {
    event: "QUIZ_STARTED";
    gameId: string;
    quizNumber: number;
    motionId: string;
    motionStartTimestamp: number;
    answerFinishTimestamp: number;
  }
  | {
    event: "PARTICIPANTS_ANSWER_STATUS_UPDATED"
    gameId: string
    quizNumber: number
    // participants: {
    //   clientId: string
    //   name: string
    //   status: "BUTTON_NOT_PRESSED" | "BUTTON_PRESSED" | "ANSWER_SUBMITTED"
    //   buttonPressedTimeMs: number | null
    // }[]
    guesses: Guess[] // Guess[] を返すようにしてみた
  }
  | {
    event: "QUIZ_RESULT";
    gameId: string
    quizNumber: number
    // resultByParticipants: {
    //   clientId: string,
    //   name: string,
    //   buttonPressedTimeMs: number
    //   similarityPoint: number, // 類似度点数
    //   quizPoint: number // この問題で得た点数
    //   gamePoint: number // ゲーム累積の点数
    // }[]
    guesses: Guess[] // Guess[] を返すようにしてみた
    answers: string[]
    gameResult: GameResult[] // GameResult[] を返すようにしてみた
  }
  | {
    event: "GAME_RESULT";
    gameId: string
    // resultByParticipants: {
    //   clientId: string
    //   name: string
    //   gamePoint: number
    // }[]
    gameResult: GameResult[] // GameResult[] を返すようにしてみた
  }

