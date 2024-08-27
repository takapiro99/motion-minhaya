import { FC, useContext } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type ConfirmingWaitingRoomJoinableProps = {}

export const ConfirmingWaitingRoomJoinable: FC = () => {
  const { updateClientStatus } = useContext(SocketContext)
  
  return (
    <>
      <div>入室可能か確認中です。</div>
      <Button onClick={() => updateClientStatus("PARTICIPANTS_WAITING")}>次へ</Button>
    </>
  )
}