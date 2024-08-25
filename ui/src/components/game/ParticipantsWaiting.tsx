import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";

import { SocketContext } from "../../SocketContext";

// type ParticipantsWaitingProps = {}

export const ParticipantsWaiting: FC = () => {
  const { updateGameStatus } = useContext(SocketContext)
  
  return (
    <>
      <div>現在の参加者: ⚪︎/4</div>
      <Button onClick={() => updateGameStatus("PARTICIPANTS_MATCHED")}>次へ</Button>
    </>
  )
}