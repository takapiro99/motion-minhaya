import { useState } from "react"
import { GameStatus } from "../domain/type"

export type UseGameStatus = {
  gameStatus: GameStatus,
  updateGameStatus: (gameStatus: GameStatus) => void,
}

export const useGameStatus = (): UseGameStatus => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("NAME_INPUTING")
  return {
    gameStatus: gameStatus,
    updateGameStatus: setGameStatus,
  }
}