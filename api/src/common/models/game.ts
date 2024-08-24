export type GameClientAction =
  | "PING"
  | "PING_WITH_ACK"
  | "ENTER_WAITING_ROOM"
  | "BUTTON_PRESSED"
  | "GUESS_ANSWER"

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
  | "QUIZ_RESULT"



export type WaitingGame = {
  gameId: string
  participants: {
    connectionId: string | null
    clientId: string
    name: string
  }[]
}