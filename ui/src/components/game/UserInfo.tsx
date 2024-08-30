import { FC, useEffect, useState } from "react";
import { UserQuizStatus } from "../../domain/type";

type UserInfoProps = {
  name: string,
  buttonPressedTimeMs: number | null,
  guess: string | null,
  gamePoint: number,
}

export const UserInfo: FC<UserInfoProps> = ({
  name,
  buttonPressedTimeMs,
  guess,
  gamePoint,
}) => {
  const [userState, setUserState] = useState<UserQuizStatus>("BUTTON_NOT_PRESSED")

  useEffect(() => {
    if (buttonPressedTimeMs === null && guess === null){
      return setUserState("BUTTON_NOT_PRESSED")
    }
    if (buttonPressedTimeMs !== null && guess === null){
      return setUserState("BUTTON_PRESSED")
    }
    if (buttonPressedTimeMs !== null && guess !== null){
      return setUserState("ANSWER_SUBMITTED")
    }
  }, [buttonPressedTimeMs, guess])
  
  return (
    <>
      <div>{name}</div>
      <div>{userState}</div>
      <div>{gamePoint}</div>
    </>
  )
}