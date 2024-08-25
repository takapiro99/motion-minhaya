import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type ConfirmingWaitingRoomJoinableProps = {}

export const ConfirmingWaitingRoomJoinable: FC = () => {
  const { updateGameStatus } = useContext(SocketContext)
  
  return (
    <>
      <div>入室可能か確認中です。</div>
      <Button onClick={() => updateGameStatus("PARTICIPANTS_WAITING")}>次へ</Button>
    </>
  )
}