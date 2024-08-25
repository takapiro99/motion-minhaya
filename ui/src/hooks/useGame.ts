import { useState } from "react"
import { Game } from "../../../api/src/common/utils/db"

export type UseGame = {
  game: Game,
  updateGame: (game: Game) => void,
}

export const useGame = (): UseGame => {
  const [game, setGame] = useState<Game>({
    status: "NONE",
    gameId: null,
    participants: null,
    currentQuizNumberOneIndexed: null,
    quizzes: null,
    gameResult: null,
  })
  
  return {
    game: game,
    updateGame: setGame,
  }
}