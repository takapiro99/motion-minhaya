import { useState } from "react"
import { GameStatus } from "../domain/type"

export type UseGame = {
  gameStatus: GameStatus,
  updateGameStatus: (gameStatus: GameStatus) => void,
}

export const useGame = (): UseGame => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("NONE")
  return {
    gameStatus: gameStatus,
    updateGameStatus: setGameStatus,
  }
}