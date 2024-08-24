import { copy } from "@/api/ws/game";
import { LowSync, MemorySync } from "lowdb";
import { v4 as uuidv4 } from "uuid";
import type { WaitingGame } from "../models/game";

// With this adapter, calling `db.write()` will do nothing.
// One use case for this adapter can be for tests.

type DataBase = {
  games: {
    status: "WAITING_PARTICIPANTS" | "ONGOING";
    gameId: string;
    participants: {
      connectionId: string | null;
      clientId: string;
      name: string;
    }[];
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
    } | null;
    gameResult:
      | {
          clientId: string;
          gamePoint: number;
        }[]
      | null;
  }[];
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
      return conn.data.games.filter((room) => room.status === "WAITING_PARTICIPANTS");
    },
    upsertWaitingGame: (waitingGame: WaitingGame) => {
      conn.read();
      const existingGame = conn.data.games.find((game) => game.gameId === waitingGame.gameId);
      if (existingGame) {
        conn.update((data) => {
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
          });
        });
      }
    },
  },
};
