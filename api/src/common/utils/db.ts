import { copy } from "@/api/ws/game";
import type { OnGoingGame, WaitingParticipantsGame } from "../models/game";
import { LowSync, MemorySync } from "./lowdb";

// With this adapter, calling `db.write()` will do nothing.
// One use case for this adapter can be for tests.

type DataBase = {
  games: (WaitingParticipantsGame | OnGoingGame)[];
};

const defaultData: DataBase = {
  games: [],
};

const conn = new LowSync<DataBase>(new MemorySync<DataBase>(), defaultData);
conn.read();

export const db = {
  game: {
    getWaitingGames: (): WaitingParticipantsGame[] => {
      conn.read();
      if (!conn.data) return [];

      const res = conn.data.games.filter(
        (room) => room.status === "WAITING_PARTICIPANTS"
      );
      return copy(res);
    },
    upsertWaitingGame: (waitingGame: WaitingParticipantsGame) => {
      conn.read();
      if (!conn.data) return [];

      const existingGame = conn.data.games.find(
        (game) => game.gameId === waitingGame.gameId
      );
      if (existingGame) {
        conn.update((data) => {
          const existingGame = data.games.find(
            (game) => game.gameId === waitingGame.gameId
          );
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
            currentQuizNumberOneIndexed: null,
          });
        });
      }
    },
    getGame: (
      gameId: string
    ): WaitingParticipantsGame | OnGoingGame | undefined => {
      conn.read();
      if (!conn.data) return;
      const targetGame = conn.data.games.find((game) => game.gameId === gameId);
      if (!targetGame) return;
      return copy(targetGame);
    },
    updateOngoingGame: (ongoingGame: OnGoingGame): void => {
      conn.read();
      if (!conn.data) return;
      const ongoingGameCopy = copy(ongoingGame);

      conn.update((data) => {
        const existingGame = data.games.find(
          (game) => game.gameId === ongoingGameCopy.gameId
        );
        // if (!existingGame || existingGame.status !== "ONGOING") return; // WAITING_PARTICIPANTS -> ONGOING に遷移できない
        if (!existingGame) return;
        for (let key of getKeys(ongoingGameCopy)) {
          switch (key) {
            case "participants":
              existingGame[key] = ongoingGameCopy[key];
              break;
            case "currentQuizNumberOneIndexed":
              existingGame[key] = ongoingGameCopy[key];
              break;
            case "quizzes":
              existingGame[key] = ongoingGameCopy[key];
              break;
            case "gameResult":
              existingGame[key] = ongoingGameCopy[key];
              break;
            case "status":
              existingGame[key] = ongoingGameCopy[key];
              break;
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
