import { FC, useContext, useEffect } from "react";
import { NameInputing } from "../game/NameInputing";
import { ConfirmingWaitingRoomJoinable } from "../game/ConfirmingWaitingRoomJoinable";
import { ParticipantsWaiting } from "../game/ParticipantsWaiting";
import { GameOngoing } from "../game/GameOngoing";
import { GameFinished } from "../game/GameFinished";
import { SocketContext } from "../../SocketContext";
import { WaitingRoomUnjoinable } from "../game/WaitingRoomUnjoinable";
import { Navigate } from "react-router-dom";
import useSound from "use-sound";
import waitingRoomAndGameResultBGM from "../../../public/music/waitingRoomAndGameResult.mp3";
import onGoingGameBGM from "../../../public/music/onGoingGame.mp3";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  gamePage: {
    height: "100%",
    width: "100%",
    // background: "#111",
  },
});

export const GamePage: FC = () => {
  const classes = useStyles();
  const { clientStatus } = useContext(SocketContext);
  const [
    playWaitingRoomAndGameResultBGM,
    { stop: stopWaitingRoomAndGameResultBGM },
  ] = useSound(waitingRoomAndGameResultBGM, { volume: 0, loop: true }); // MEMO: うるさいので一旦ミュートにしている (元々は volume: 0.3)
  useEffect(() => {
    playWaitingRoomAndGameResultBGM();
    return () => {
      stopWaitingRoomAndGameResultBGM();
    };
  }, [playWaitingRoomAndGameResultBGM]);
  const [playOnGoingGameBGM, { stop: stopOnGoingGameBGM }] = useSound(
    onGoingGameBGM,
    { volume: 0, loop: true }, // MEMO: うるさいので一旦ミュートにしている (元々は volume: 0.3)
  );

  useEffect(() => {
    if (clientStatus === "GAME_ONGOING") {
      playOnGoingGameBGM();
    }
    return () => {
      stopOnGoingGameBGM();
    };
  }, [clientStatus]);

  if (clientStatus === "OUT_OF_GAME") {
    alert("宇宙の力によって不正なステータスとなりました。トップに戻ります！");
    return <Navigate replace to="/" />;
  }

  return (
    <div className={classes.gamePage}>
      {clientStatus === "NAME_INPUTING" && <NameInputing />}

      {/* これは実質ない */}
      {clientStatus === "CONFIRMING_WAITING_ROOM_JOINABLE" && (
        <ConfirmingWaitingRoomJoinable />
      )}
      {/* これも実質ない */}
      {clientStatus === "WAITING_ROOM_UNJOINABLE" && <WaitingRoomUnjoinable />}

      {clientStatus === "PARTICIPANTS_WAITING" && <ParticipantsWaiting />}
      {/* {clientStatus === "PARTICIPANTS_MATCHED" && <ParticipantsMatched />} */}
      {/* {clientStatus === "GAME_STARTED" && <GameStarted />} */}
      {clientStatus === "GAME_ONGOING" &&
        (() => {
          stopWaitingRoomAndGameResultBGM();
          // playOnGoingGameBGM();
          return <GameOngoing />;
        })()}
      {clientStatus === "GAME_FINISIED" &&
        (() => {
          stopOnGoingGameBGM();
          return <GameFinished />;
        })()}
    </div>
  );
};
