import type { GameClientAction, GameServerEvent } from "./game";

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
      participants: {
        connectionId: string | null;
        clientId: string;
        name: string;
      }[];
    }
  | {
      event: "WAITING_ROOM_UPDATED";
    }
  | {
      event: "WAITING_ROOM_UNJOINABLE";
    }
  | {
      event: "GAME_STARTED";
    }
  | {
      event: "QUIZ_STARTED";
    }
  | {
      event: "PARTICIPANTS_ANSWER_STATUS_UPDATED";
    }
  | {
      event: "QUIZ_RESULT";
    };
