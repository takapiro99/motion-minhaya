import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";
import { ToTopPageButton } from "../utils/ToTopPageButton";

export const TopPage: FC = () => {
  const navigate = useNavigate();
  const { updateClientStatus, ping } = useContext(SocketContext);

  return (
    <div>
      <ToTopPageButton />
      <div>This is a top page.</div>
      <Button
        onClick={() => {
          updateClientStatus("NAME_INPUTING")
          navigate("/game")}
        }
      >
        問題を解く
      </Button>
      <Button onClick={() => navigate("/create-quiz")}>問題を作る</Button>
      <Button onClick={() => ping()}>ping</Button>
    </div>
  );
};
