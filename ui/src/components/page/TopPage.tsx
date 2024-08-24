import { FC, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";

export const TopPage: FC = () => {
  const navigate = useNavigate();
  const { ping } = useContext(SocketContext);

  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> |{" "}
      <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a top page.</div>
      <Button onClick={() => navigate("/game")}>問題を解く</Button>
      <Button onClick={() => navigate("/create-quiz")}>問題を作る</Button>
      <Button onClick={() => ping()}>ping</Button>
    </div>
  );
};
