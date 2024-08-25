import type { GameClientAction, GameServerEvent, Participant } from "./game";

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
    }
  | {
      action: "GUESS_ANSWER";
      answer: string;
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
      motionStartTimestamp: string;
      answerFinishTimestamp: string;
    }
  | {
      event: "PARTICIPANTS_ANSWER_STATUS_UPDATED";
    }
  | {
      event: "QUIZ_RESULT";
    };
