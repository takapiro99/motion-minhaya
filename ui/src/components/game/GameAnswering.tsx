import { useContext, useState } from "react";
import { Button, Input, Modal, ModalHeader } from "semantic-ui-react";
import { UsersInfo } from "./UsersInfo";
import { SocketContext } from "../../SocketContext";

export const GameAnswering: React.FC<{
  quizNum: number;
  leftTime: number;
  handleSubmit: (guess: string) => void;
  answered?: boolean;
}> = ({ quizNum, leftTime, handleSubmit, answered }) => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const { game } = useContext(SocketContext);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        margin: "0 auto",
        background: "#111",
      }}
      id="particles-js"
    >
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open || answered}
        style={{ maxWidth: "500px", borderRadius: "12px" }}
        closeOnDimmerClick={false}
        closeOnEscape={false}
        closeOnPortalMouseLeave={false}
        closeOnTriggerBlur={false}
        closeOnTriggerMouseLeave={false}
        closeOnDocumentClick={false}
        closeOnTriggerClick={false}
      >
        <ModalHeader
          style={{
            textAlign: "center",
            fontSize: "3rem",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            background: "#CBA5ED",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <div style={{ color: "#6D23AA", fontSize: "1.8rem" }}>
            {answered ? "回答済み！" : "回答中…"}
          </div>
          <div style={{ color: "#6D23AA" }}>{leftTime}</div>
        </ModalHeader>

        <Modal.Content
          style={{
            textAlign: "center",
            fontSize: "2rem",
            width: "100%",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Input
            value={input}
            placeholder={"答えを入力"}
            onChange={(_, data) => setInput(data.value)}
            style={{ width: "100%" }}
            disabled={answered}
          />
          <div>
            {!answered && (
              <Button
                style={{
                  background: "#A538EE",
                  color: "white",
                  padding: "15px 35px",
                  borderRadius: "30px",
                  marginTop: "20px",
                  border: "none",
                  cursor: "pointer",
                }}
                size="big"
                onClick={() => {
                  handleSubmit(input);
                  setOpen(false);
                }}
                disabled={answered || input.length === 0}
              >
                完了
              </Button>
            )}
          </div>
        </Modal.Content>
      </Modal>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, 0)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // margin: "0 auto",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          // gap: "30px",
        }}
      >
        <div style={{ height: "80px", width: "100%" }}>
          <UsersInfo
            participants={game.participants}
            guesses={
              game.quizzes?.find(
                (quiz) => quiz.quizNumber === game.currentQuizNumberOneIndexed,
              )?.guesses ?? null
            }
            gameResult={game.gameResult}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: "680px",
            height: "100%",
            flex: 1,
          }}
        ></div>
        <div
          className="footer"
          style={{
            height: "120px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            alignItems: "center",
          }}
        ></div>
      </div>
    </div>
  );
};
