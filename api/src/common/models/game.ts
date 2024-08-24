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

export type OnGoingGame = {
  gameId: string
  participants: {
    connectionId: string | null
    clientId: string
    name: string
  }[]
  currentQuizNumberOneIndexed: number
  quizzes: {
    quizNumber: number,
    motionId: string,
    motionStartTimestamp: number // unix timestamp
    answerFinishTimestamp: number // unix timestamp
    guesses: {
      clientId: string
      buttonPressedTimeMs: number
      similarityPoint: number, // 類似度点数
      quizPoint: number // この問題で得た点数
    }[]
    gameResult: {
      clientId: string
      gamePoint: number
    }[] | null
  }[]
}