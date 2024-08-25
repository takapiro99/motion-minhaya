import { FC, useContext } from "react"
import { Link } from "react-router-dom"
import { NameInputing } from "../game/NameInputing"
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable"
import { ParticipantsWaiting } from "../game/ParticipantsWaiting"
import { ParticipantsMatched } from "../game/ParticipantsMatched"
import { GameStarted } from "../game/GameStarted"
import { GameOngoing } from "../game/GameOngoing"
import { GameFinished } from "../game/GameFinished"
import { SocketContext } from "../../SocketContext"

export const GamePage: FC = () => {
  const { gameStatus } = useContext(SocketContext)

  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a game page.</div>
      {gameStatus === "OUT_OF_GAME" && <div>異常な gameStatus です。</div>}
      {gameStatus === "NAME_INPUTING" && <NameInputing />}
      {gameStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && <ConfirmingWaitingRoomJoinable />}
      {gameStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting />}
      {gameStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched />}
      {gameStatus === "GAME_STARTED" && <GameStarted />}
      {gameStatus === "GAME_ONGOING" && <GameOngoing />}
      {gameStatus === "GAME_FINISIED" && <GameFinished />}
    </div>
  )
}