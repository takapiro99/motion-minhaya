import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import { Button } from "semantic-ui-react";

export const ToTopPageButton: FC = () => {
  const navigate = useNavigate();
  const { updateClientStatus, updateGame } = useContext(SocketContext);

  return (
    <Button
      onClick={() => {
        updateGame({
          status: "NONE",
          gameId: null,
          participants: null,
          currentQuizNumberOneIndexed: null,
          quizzes: null,
          gameResult: null,
        })
        updateClientStatus("OUT_OF_GAME")
        navigate("/")
      }}
    >
      TopPage に戻る
    </Button>
  )
}