import { ChangeEvent, FC, useContext } from "react";
import { Button, Input } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type NameInputingProps = {}

export const NameInputing: FC = () => {
  const { updateGameStatus, userName, updateUserName, enterWaitingRoom } = useContext(SocketContext)
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateUserName(event.target.value)
  }
  const handleButtonClick = () => {
    enterWaitingRoom(userName)
    updateGameStatus("CONFIRMING_WAITING_ROOM_JOINABLE")
  }

  return (
    <>
      <div>名前を入力してください。</div>
      <Input
        value={userName}
        onChange={handleInputChange}
      />
      <Button
        onClick={handleButtonClick}
        disabled={userName === ""}
      >
        決定
      </Button>
    </>
  )
}