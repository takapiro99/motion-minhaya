import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketContext";

// type GameFinishedProps = {}

export const GameFinished: FC = () => {
  const { updateClientStatus } = useContext(SocketContext)
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
          updateClientStatus("OUT_OF_GAME")
          navigate("/")
        }}
      >
        TopPage に戻る
      </Button>
    </>
  )
}