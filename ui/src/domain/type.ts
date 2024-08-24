// export type GameStatus = "NONE" | "PARTICIPANTS_WAITING" | "GAME_ONGOING"

export type GameStatus =
  | "NAME_INPUTING"
  | "CONFIRMING_WAITING_ROOM_JOINABLE"
  | "WAITING_ROOM_UNJOINABLE"
  | "PARTICIPANTS_WAITING"
  | "PARTICIPANTS_MATCHED"
  | "GAME_STARTED"
  | "GAME_ONGOING"
  | "GAME_FINISIED"