import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type GameStartedProps = {}

export const GameStarted: FC = () => {
  const { updateGameStatus } = useContext(SocketContext)
  
  return (
    <>
      <div>ゲーム開始！！！</div>
      <Button onClick={() => updateGameStatus("GAME_ONGOING")}>次へ</Button>
    </>
  )
}