import { FC, useContext, useLayoutEffect } from "react";
import { NameInputing } from "../game/NameInputing";
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable";
import { ParticipantsWaiting } from "../game/ParticipantsWaiting";
import { GameOngoing } from "../game/GameOngoing";
import { GameFinished } from "../game/GameFinished";
import { SocketContext } from "../../SocketContext";
import { WaitingRoomUnjoinable } from "../game/WaitingRoomUnjoinable";
import { Navigate } from "react-router-dom";

export const GamePage: FC = () => {
  const { clientStatus } = useContext(SocketContext);

  if (clientStatus === "OUT_OF_GAME") {
    alert("宇宙の力によって不正なステータスとなりました。トップに戻ります！");
    return <Navigate replace to="/" />;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        // background: "#111",
      }}
    >
      {clientStatus === "NAME_INPUTING" && <NameInputing />}
      {clientStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && (
        <ConfirmingWaitingRoomJoinable />
      )}
      {clientStatus === "WAITING_ROOM_UNJOINABLE" && <WaitingRoomUnjoinable />}
      {clientStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting />}
      {/* {clientStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched />} */}
      {/* {clientStatus === "GAME_STARTED" && <GameStarted />} */}
      {clientStatus === "GAME_ONGOING" && <GameOngoing />}
      {clientStatus === "GAME_FINISIED" && <GameFinished />}
    </div>
  );
};
