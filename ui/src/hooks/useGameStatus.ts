import { useState } from "react"
import { GameStatus } from "../domain/type"

export type UseGameStatus = {
  gameStatus: GameStatus,
  updateGameStatus: (gameStatus: GameStatus) => void,
}

// SocketContext に移植したので消すかも
export const useGameStatus = (): UseGameStatus => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("NAME_INPUTING")
  return {
    gameStatus: gameStatus,
    updateGameStatus: setGameStatus,
  }
}