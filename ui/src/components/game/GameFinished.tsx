import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";
import { useNavigate } from "react-router-dom";

type GameFinishedProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const GameFinished: FC<GameFinishedProps> = ({updateGameStatus}) => {
  const navigate = useNavigate()

  return (
    <>
      <div>ゲーム終了！！！</div>
      <ul>
        <li>たろう: 100 点</li>
        <li>じろう: 100 点</li>
        <li>さぶろう: 100 点</li>
        <li>しろう: 100 点</li>
      </ul>
      <Button
        onClick={() => {
          updateGameStatus("NAME_INPUTING")
          navigate("/")
        }}
      >
        TopPage に戻る
      </Button>
    </>
  )
}