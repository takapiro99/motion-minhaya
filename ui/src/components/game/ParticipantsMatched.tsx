import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type ParticipantsMatchedProps = {}

export const ParticipantsMatched: FC = () => {
  const { updateGameStatus } = useContext(SocketContext)
  
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