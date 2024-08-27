import { ChangeEvent, FC, useContext } from "react";
import { Button, Input } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

// type NameInputingProps = {}

export const NameInputing: FC = () => {
  const { updateClientStatus, user, updateUser, enterWaitingRoom } = useContext(SocketContext)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateUser({
      ...user,
      name: event.target.value
    });
  }
  
  const handleButtonClick = () => {
    enterWaitingRoom(user.name)
    updateClientStatus("CONFIRMING_WAITING_ROOM_JOINABLE")
  }

  return (
    <>
      <div>名前を入力してください。</div>
      <Input
        value={user.name}
        onChange={handleInputChange}
      />
      <Button
        onClick={handleButtonClick}
        disabled={user.name === ""}
      >
        決定
      </Button>
    </>
  )
}