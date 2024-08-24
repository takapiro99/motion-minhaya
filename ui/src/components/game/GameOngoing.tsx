import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type GameOngoingProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const GameOngoing: FC<GameOngoingProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>第 1 問</div>
      <Button>回答する</Button>
      <Button onClick={() => updateGameStatus("GAME_FINISIED")}>次へ</Button>
    </>
  )
}