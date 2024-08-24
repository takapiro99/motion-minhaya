import { FC } from "react"
import { Link } from "react-router-dom"
import { useGame } from "../hooks/useGame"
import { Button } from "semantic-ui-react"
import { GameStatus } from "../domain/type"

export const GamePage: FC = () => {
  const {gameStatus, updateGameStatus} = useGame()
  const handleOnClickButton = (newGameStatus: GameStatus) => {
    updateGameStatus(newGameStatus)
  }

  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a game page.</div>
      {gameStatus === "NONE" &&
        <>
          <div>gameStatus is NONE</div>
          <Button onClick={() => handleOnClickButton("PARTICIPANTS_WAITING")}>
            to PARTICIPANTS_WAITING
          </Button>
        </>
      }
      {gameStatus === "PARTICIPANTS_WAITING" &&
        <>
          <div>gameStatus is PARTICIPANTS_WAITING</div>
          <Button onClick={() => handleOnClickButton("GAME_ONGOING")}>
            to GAME_ONGOING
          </Button>
        </>
      }
      {gameStatus === "GAME_ONGOING" &&
        <>
          <div>gameStatus is GAME_ONGOING</div>
          <Button onClick={() => handleOnClickButton("NONE")}>
            to NONE
          </Button>
        </>
      }
    </div>
  )
}