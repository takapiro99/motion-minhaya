import { FC, useEffect, useState } from "react";
import { GameResult, Guess } from "../../../../api/src/common/models/game";
import { UserInfo } from "./UserInfo";

type UsersInfoProps = {
  guesses: Guess[] | null,
  gameResult: GameResult[] | null,
}

export const UsersInfo: FC<UsersInfoProps> = ({
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
    if (guesses !== null && gameResult !== null) {
      const updatedUsersInfo = guesses.map(guess => {
        const participantResult = gameResult.find(result => result.clientId === guess.clientId)
        return {
          name: guess.name,
          buttonPressedTimeMs: guess.buttonPressedTimeMs,
          guess: guess.guess,
          gamePoint: participantResult?.gamePoint || 0,
        }
      })
      setUsersInfo(updatedUsersInfo);
    }
    console.log("usersInfo", usersInfo)
  }, [guesses, gameResult])
  
  
  return (
    <>
      {usersInfo.forEach(userInfo => {
        <UserInfo 
          name={userInfo.name}
          buttonPressedTimeMs={userInfo.buttonPressedTimeMs}
          guess={userInfo.guess}
          gamePoint={userInfo.gamePoint}
        />
      })}
    </>
  )
}