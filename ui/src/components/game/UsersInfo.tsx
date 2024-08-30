import { FC, useEffect, useState } from "react";
import { GameResult, Guess, Participant } from "../../../../api/src/common/models/game";
import { UserInfo } from "./UserInfo";

type UsersInfoProps = {
  participants: Participant[] | null,
  guesses: Guess[] | null,
  gameResult: GameResult[] | null,
}

export const UsersInfo: FC<UsersInfoProps> = ({
  participants,
  guesses,
  gameResult,
}) => {
  const [usersInfo, setUsersInfo] = useState<{
    name: string,
    buttonPressedTimeMs: number | null,
    guess: string | null,
    gamePoint: number,
  }[]>([])

  useEffect(() => {
    if (participants !== null) {
      const updatedUsersInfo = participants.map((participant) => {
        const clientId = participant.clientId
        const guess = guesses?.find((guess) => guess.clientId === clientId)
        const gamePoint = gameResult?.find((gameResult) => gameResult.clientId === clientId)?.gamePoint ?? 0
        return {
          name: participant.name,
          buttonPressedTimeMs: guess?.buttonPressedTimeMs ?? null,
          guess: guess?.guess ?? null,
          gamePoint: gamePoint,
        }
      })
      setUsersInfo(updatedUsersInfo)
    }
  }, [participants, guesses, gameResult])
  
  return (
    <>
      {usersInfo.map((userInfo, index) => {
        return (
          <UserInfo
            key={index}
            name={userInfo.name}
            buttonPressedTimeMs={userInfo.buttonPressedTimeMs}
            guess={userInfo.guess}
            gamePoint={userInfo.gamePoint}
          />
        )
      })}
    </>
  )
}