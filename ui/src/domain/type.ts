// export type GameStatus = "NONE" | "PARTICIPANTS_WAITING" | "GAME_ONGOING"

export type GameStatus =
  | "OUT_OF_GAME"
  | "NAME_INPUTING"
  | "CONFIRMING_WAITING_ROOM_JOINABLE"
  | "WAITING_ROOM_UNJOINABLE"
  | "PARTICIPANTS_WAITING"
  // | "PARTICIPANTS_MATCHED"
  | "GAME_STARTED"
  | "GAME_ONGOING"
  | "GAME_FINISIED"

export type QuizStatus = 
  | "NOT_STARTED"
  | "CAN_ANSWER"
  | "ANSWERING"
  | "ANSWERED"
  | "IN_RESULT"