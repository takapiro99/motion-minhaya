import { FC } from "react"
import { Link } from "react-router-dom"
import { useGameStatus } from "../../hooks/useGameStatus"
import { NameInputing } from "../game/NameInputing"
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable"
import { ParticipantsWaiting } from "../game/ParticipantsWaiting"
import { ParticipantsMatched } from "../game/ParticipantsMatched"
import { GameStarted } from "../game/GameStarted"
import { GameOngoing } from "../game/GameOngoing"
import { GameFinished } from "../game/GameFinished"

export const GamePage: FC = () => {
  const {gameStatus, updateGameStatus} = useGameStatus()

  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a game page.</div>
      {gameStatus === "NAME_INPUTING" && <NameInputing updateGameStatus={updateGameStatus}/>}
      {gameStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && <ConfirmingWaitingRoomJoinable updateGameStatus={updateGameStatus}/>}
      {gameStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting updateGameStatus={updateGameStatus}/>}
      {gameStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched updateGameStatus={updateGameStatus}/>}
      {gameStatus === "GAME_STARTED" && <GameStarted updateGameStatus={updateGameStatus}/>}
      {gameStatus === "GAME_ONGOING" && <GameOngoing updateGameStatus={updateGameStatus}/>}
      {gameStatus === "GAME_FINISIED" && <GameFinished updateGameStatus={updateGameStatus}/>}
    </div>
  )
}