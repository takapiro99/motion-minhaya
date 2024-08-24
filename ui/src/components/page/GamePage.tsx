import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useGame } from "../../hooks/useGame"
import { Button } from "semantic-ui-react"
import { GameStatus } from "../../domain/type"
import { NameInputing } from "../game/NameInputing"
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable"
import { ParticipantsWaiting } from "../game/ParticipantsWaiting"

export const GamePage: FC = () => {
  const {gameStatus, updateGameStatus} = useGame()
  const handleOnClickButton = (newGameStatus: GameStatus) => {
    updateGameStatus(newGameStatus)
  }
  const navigate = useNavigate()

  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a game page.</div>
      {gameStatus === "NAME_INPUTING" && <NameInputing updateGameStatus={updateGameStatus}/>}
      {gameStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && <ConfirmingWaitingRoomJoinable updateGameStatus={updateGameStatus}/>}
      {gameStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting updateGameStatus={updateGameStatus}/>}
      {gameStatus === "PARTICIPANTS_MATCHED" &&
        <>
          <div>gameStatus is PARTICIPANTS_MATCHED</div>
          <Button onClick={() => handleOnClickButton("GAME_STARTED")}>
            to GAME_STARTED
          </Button>
        </>
      }
      {gameStatus === "GAME_STARTED" &&
        <>
          <div>gameStatus is GAME_STARTED</div>
          <Button onClick={() => handleOnClickButton("GAME_ONGOING")}>
            to GAME_ONGOING
          </Button>
        </>
      }
      {gameStatus === "GAME_ONGOING" &&
        <>
          <div>gameStatus is GAME_ONGOING</div>
          <Button onClick={() => handleOnClickButton("GAME_FINISIED")}>
            to GAME_FINISIED
          </Button>
        </>
      }
      {gameStatus === "GAME_FINISIED" &&
        <>
          <div>gameStatus is GAME_FINISIED</div>
          <Button 
            onClick={() => {
              handleOnClickButton("NAME_INPUTING")
              navigate("/")
            }}
          >
            to TopPage
          </Button>
        </>
      }
    </div>
  )
}