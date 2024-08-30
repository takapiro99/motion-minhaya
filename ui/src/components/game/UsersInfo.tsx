import { FC, useEffect, useState } from "react";
import {
  GameResult,
  Guess,
  Participant,
} from "../../../../api/src/common/models/game";
import { UserQuizStatus } from "../../domain/type";

type UsersInfoProps = {
  participants: Participant[] | null;
  guesses: Guess[] | null;
  gameResult: GameResult[] | null;
};

export const UsersInfo: FC<UsersInfoProps> = ({
  participants,
  guesses,
  gameResult,
}) => {
  const [usersInfo, setUsersInfo] = useState<
    {
      name: string;
      buttonPressedTimeMs: number | null;
      guess: string | null;
      gamePoint: number;
    }[]
  >([]);

  useEffect(() => {
    if (participants !== null) {
      const updatedUsersInfo = participants.map((participant) => {
        const clientId = participant.clientId;
        const guess = guesses?.find((guess) => guess.clientId === clientId);
        const gamePoint =
          gameResult?.find((gameResult) => gameResult.clientId === clientId)
            ?.gamePoint ?? 0;
        return {
          name: participant.name,
          buttonPressedTimeMs: guess?.buttonPressedTimeMs ?? null,
          guess: guess?.guess ?? null,
          gamePoint: gamePoint,
        };
      });
      setUsersInfo(updatedUsersInfo);
    }
  }, [participants, guesses, gameResult]);

  return (
    <div
      style={{
        background: "snow",
        width: "100%",
        height: "100%",
        border: "solid red 2px",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {usersInfo.map((userInfo, index) => {
        return (
          <UserInfo
            key={index}
            name={userInfo.name}
            buttonPressedTimeMs={userInfo.buttonPressedTimeMs}
            guess={userInfo.guess}
            gamePoint={userInfo.gamePoint}
          />
        );
      })}
    </div>
  );
};

type UserInfoProps = {
  name: string;
  buttonPressedTimeMs: number | null;
  guess: string | null;
  gamePoint: number;
};

export const UserInfo: FC<UserInfoProps> = ({
  name,
  buttonPressedTimeMs,
  guess,
  gamePoint,
}) => {
  const [userState, setUserState] =
    useState<UserQuizStatus>("BUTTON_NOT_PRESSED");

  useEffect(() => {
    if (buttonPressedTimeMs === null && guess === null) {
      return setUserState("BUTTON_NOT_PRESSED");
    }
    if (buttonPressedTimeMs !== null && guess === null) {
      return setUserState("BUTTON_PRESSED");
    }
    if (buttonPressedTimeMs !== null && guess !== null) {
      return setUserState("ANSWER_SUBMITTED");
    }
  }, [buttonPressedTimeMs, guess]);

  return (
    <div
      style={{
        position: "relative",
        border: "solid #eee 1px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: "6px",
      }}
    >
      <div style={{ fontSize: "1em" }}>{name}</div>

      <div
        style={{
          fontWeight: "bold",
          visibility: userState === "BUTTON_NOT_PRESSED" ? "visible" : "hidden",
        }}
      >
        <span
          style={{ color: "#6D23AA", fontWeight: "bold", fontSize: "1.5em" }}
        >
          {gamePoint}&nbsp;
        </span>
        pt
      </div>
      {userState === "BUTTON_PRESSED" && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "grey",
          }}
        >
          入力中…
        </div>
      )}
      {userState === "ANSWER_SUBMITTED" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%) rotate(-15deg) translateY(-4px)",
            color: "white",
            background: "#23C16B",
            padding: "5px 25px",
            borderRadius: "30px",
          }}
        >
          完了
        </div>
      )}
    </div>
  );
};
