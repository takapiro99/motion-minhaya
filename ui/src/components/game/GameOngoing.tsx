import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type GameOngoingProps = {}

export const GameOngoing: FC = () => {
  const { updateGameStatus } = useContext(SocketContext)
  
  return (
    <>
      <div>第 1 問</div>
      <Button>回答する</Button>
      <Button onClick={() => updateGameStatus("GAME_FINISIED")}>次へ</Button>
    </>
  )
}