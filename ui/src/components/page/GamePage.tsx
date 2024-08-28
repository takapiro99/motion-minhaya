import { FC, useContext } from "react"
import { NameInputing } from "../game/NameInputing"
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable"
import { ParticipantsWaiting } from "../game/ParticipantsWaiting"
// import { ParticipantsMatched } from "../game/ParticipantsMatched"
import { GameStarted } from "../game/GameStarted"
import { GameOngoing } from "../game/GameOngoing"
import { GameFinished } from "../game/GameFinished"
import { SocketContext } from "../../SocketContext"
import { ToTopPageButton } from "../utils/ToTopPageButton"
import { WaitingRoomUnjoinable } from "../game/WaitingRoomUnjoinable"

export const GamePage: FC = () => {
  const { clientStatus } = useContext(SocketContext)

  return (
    <div>
      <ToTopPageButton />
      <div>This is a game page.</div>
      {clientStatus === "OUT_OF_GAME" && <div>異常な clientStatus です。TopPage に戻ってください。</div>}
      {clientStatus === "NAME_INPUTING" && <NameInputing />}
      {clientStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && <ConfirmingWaitingRoomJoinable />}
      {clientStatus === "WAITING_ROOM_UNJOINABLE" && <WaitingRoomUnjoinable />}
      {clientStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting />}
      {/* {clientStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched />} */}
      {clientStatus === "GAME_STARTED" && <GameStarted />}
      {clientStatus === "GAME_ONGOING" && <GameOngoing />}
      {clientStatus === "GAME_FINISIED" && <GameFinished />}
    </div>
  )
}