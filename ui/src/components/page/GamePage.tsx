import { FC, useContext } from "react"
import { NameInputing } from "../game/NameInputing"
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable"
import { ParticipantsWaiting } from "../game/ParticipantsWaiting"
// import { ParticipantsMatched } from "../game/ParticipantsMatched"
import { GameStarted } from "../game/GameStarted"
import { GameOngoing } from "../game/GameOngoing"
import { GameFinished } from "../game/GameFinished"
import { SocketContext } from "../../SocketContext"
import { ToTopPageButton } from "../utils/toTopPageButton"
import { WaitingRoomUnjoinable } from "../game/WaitingRoomUnjoinable"

export const GamePage: FC = () => {
  const { gameStatus } = useContext(SocketContext)

  return (
    <div>
      <ToTopPageButton />
      <div>This is a game page.</div>
      {gameStatus === "OUT_OF_GAME" && <div>異常な gameStatus です。TopPage に戻ってください。</div>}
      {gameStatus === "NAME_INPUTING" && <NameInputing />}
      {gameStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && <ConfirmingWaitingRoomJoinable />}
      {gameStatus === "WAITING_ROOM_UNJOINABLE" && <WaitingRoomUnjoinable />}
      {gameStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting />}
      {/* {gameStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched />} */}
      {gameStatus === "GAME_STARTED" && <GameStarted />}
      {gameStatus === "GAME_ONGOING" && <GameOngoing />}
      {gameStatus === "GAME_FINISIED" && <GameFinished />}
    </div>
  )
}