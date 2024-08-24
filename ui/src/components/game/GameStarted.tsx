import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type GameStartedProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const GameStarted: FC<GameStartedProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>ゲーム開始！！！</div>
      <Button onClick={() => updateGameStatus("GAME_ONGOING")}>次へ</Button>
    </>
  )
}