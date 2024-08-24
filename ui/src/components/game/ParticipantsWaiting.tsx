import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type ParticipantsWaitingProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const ParticipantsWaiting: FC<ParticipantsWaitingProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>現在の参加者: ⚪︎/4</div>
      <Button onClick={() => updateGameStatus("PARTICIPANTS_MATCHED")}>次へ</Button>
    </>
  )
}