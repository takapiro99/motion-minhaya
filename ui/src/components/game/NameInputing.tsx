import { FC } from "react";
import { Button, Input } from "semantic-ui-react";
import { GameStatus } from "../../domain/type";

type NameInputingProps = {
  updateGameStatus: (gameStatus: GameStatus) => void
}

export const NameInputing: FC<NameInputingProps> = ({updateGameStatus}) => {
  return (
    <>
      <div>名前を入力してください。</div>
      <Input />
      <Button onClick={() => updateGameStatus("CONFIRMING_WAITING_ROOM_JOINABLE")}>決定</Button>
    </>
  )
}