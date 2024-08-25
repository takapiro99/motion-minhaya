import type { OnGoingGame, WaitingGame } from "../models/game";
import { LowSync, MemorySync } from "./lowdb";

// With this adapter, calling `db.write()` will do nothing.
// One use case for this adapter can be for tests.

type None = {
  status: "NONE";
  gameId: null;
  participants: null;
  currentQuizNumberOneIndexed: null;
  quizzes: null;
  gameResult: null;
}

type WaitingParticipants = {
  status: "WAITING_PARTICIPANTS";
  gameId: string;
  participants: {
    connectionId: string | null;
    clientId: string;
    name: string;
  }[];
  currentQuizNumberOneIndexed: 1;
  quizzes: null;
  gameResult: null;
}

type OnGoing = {
  status: "ONGOING";
  gameId: string;
  participants: {
    connectionId: string | null;
    clientId: string;
    name: string;
  }[];
  currentQuizNumberOneIndexed: number;
  quizzes: {
    quizNumber: number;
    motionId: string;
    motionStartTimestamp: number; // unix timestamp
    answerFinishTimestamp: number; // unix timestamp
    guesses: {
      clientId: string;
      buttonPressedTimeMs: number;
      similarityPoint: number; // 類似度点数
      quizPoint: number; // この問題で得た点数
    }[];
  }[];
  gameResult:
    | {
        clientId: string;
        gamePoint: number;
      }[]
    | null;
}

export type Game = None | WaitingParticipants | OnGoing

type DataBase = {
  // games: Game[], <- でいいかも？
  games: (
    | {
      status: "WAITING_PARTICIPANTS";
      gameId: string;
      participants: {
        connectionId: string | null;
        clientId: string;
        name: string;
      }[];
      currentQuizNumberOneIndexed: 1;
      quizzes: null;
      gameResult: null;
    }
    | {
      status: "ONGOING";
      gameId: string;
      participants: {
        connectionId: string | null;
        clientId: string;
        name: string;
      }[];
      currentQuizNumberOneIndexed: number;
      quizzes: {
        quizNumber: number;
        motionId: string;
        motionStartTimestamp: number; // unix timestamp
        answerFinishTimestamp: number; // unix timestamp
        guesses: {
          clientId: string;
          buttonPressedTimeMs: number;
          similarityPoint: number; // 類似度点数
          quizPoint: number; // この問題で得た点数
        }[];
      }[];
      gameResult:
      | {
        clientId: string;
        gamePoint: number;
      }[]
      | null;
    }
  )[];
};

const defaultData: DataBase = {
  games: [],
};

const conn = new LowSync<DataBase>(new MemorySync<DataBase>(), defaultData);
conn.read();

export const db = {
  game: {
    getWaitingRooms: (): WaitingGame[] => {
      conn.read();
      if (!conn.data) return [];

      return conn.data.games.filter((room) => room.status === "WAITING_PARTICIPANTS");
    },
    upsertWaitingGame: (waitingGame: WaitingGame) => {
      conn.read();
      if (!conn.data) return [];

      const existingGame = conn.data.games.find((game) => game.gameId === waitingGame.gameId);
      if (existingGame) {
        conn.update((data) => {
          const existingGame = data.games.find((game) => game.gameId === waitingGame.gameId);
          if (!existingGame) return;
          existingGame.participants = waitingGame.participants;
        });
      } else {
        conn.update((data) => {
          data.games.push({
            status: "WAITING_PARTICIPANTS",
            gameId: waitingGame.gameId,
            participants: waitingGame.participants,
            quizzes: null,
            gameResult: null,
            currentQuizNumberOneIndexed: 1,
          });
        });
      }
    },
    getGame: (gameId: string): WaitingGame | OnGoingGame | undefined => {
      conn.read();
      if (!conn.data) return;
      const targetGame = conn.data.games.find((game) => game.gameId === gameId);
      if (!targetGame) return;
      return targetGame;
    },
    updateOngoingGame: (ongoingGame: OnGoingGame): void => {
      conn.read();
      if (!conn.data) return;

      conn.update((data) => {
        const existingGame = data.games.find((game) => game.gameId === ongoingGame.gameId);
        if (!existingGame || existingGame.status !== "ONGOING") return;
        for (const key of getKeys(ongoingGame)) {
          switch (key) {
            case "participants":
              existingGame[key] = ongoingGame[key];
              break;
            case "currentQuizNumberOneIndexed":
              existingGame[key] = ongoingGame[key];
              break;
            case "quizzes":
              existingGame[key] = ongoingGame[key];
              break;
            case "gameResult":
              existingGame[key] = ongoingGame[key];
              break;
            case "status":
            case "gameId":
              break;
            default:
              return key satisfies never;
          }
        }
      });
    },
  },
};

const getKeys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj);
};
