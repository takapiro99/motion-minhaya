import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import { Button } from "semantic-ui-react";

export const ToTopPageButton: FC = () => {
  const navigate = useNavigate();
  const { updateGameStatus } = useContext(SocketContext);

  return (
    <Button
      onClick={() => {
        updateGameStatus("OUT_OF_GAME")
        navigate("/")
      }}
    >
      TopPage に戻る
    </Button>
  )
}