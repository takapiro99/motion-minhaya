import { FC } from "react";
import { Button } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type ConfirmingWaitingRoomJoinableProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const ConfirmingWaitingRoomJoinable: FC<ConfirmingWaitingRoomJoinableProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>入室可能か確認中です。</div>
      <Button onClick={() => updateGameStatus("PARTICIPANTS_WAITING")}>次へ</Button>
    </>
  )
}