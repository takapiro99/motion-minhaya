import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type ParticipantsMatchedProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const ParticipantsMatched: FC<ParticipantsMatchedProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>参加者が決定しました。</div>
      <ul>
        <li>たろう</li>
        <li>じろう</li>
        <li>さぶろう</li>
        <li>しろう</li>
      </ul>
      <Button onClick={() => updateGameStatus("GAME_STARTED")}>次へ</Button>
    </>
  )
}