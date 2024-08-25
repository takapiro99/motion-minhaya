import { ChangeEvent, FC, useContext, useState } from "react";
import { Button, Input } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type NameInputingProps = {}

export const NameInputing: FC = () => {
  const [name, setName] = useState<string>("") // TODO: ローカルストレージに保存・取得したい
  const { updateGameStatus, enterWaitingRoom } = useContext(SocketContext)
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }
  const handleButtonClick = () => {
    enterWaitingRoom(name)
    updateGameStatus("CONFIRMING_WAITING_ROOM_JOINABLE")
  }

  return (
    <>
      <div>名前を入力してください。</div>
      <Input
        value={name}
        onChange={handleInputChange}
      />
      <Button onClick={handleButtonClick}>決定</Button>
    </>
  )
}