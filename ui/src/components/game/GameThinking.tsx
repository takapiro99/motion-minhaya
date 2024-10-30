import { useContext, useEffect, useRef, useState } from "react";
import { TClientQuizInfo } from "../page/CreateQuizPage";
import { RendererQuestionToCanvas2d } from "../utils/renderQuestion";
import { serverOrigin, SocketContext } from "../../SocketContext";
import { UsersInfo } from "./UsersInfo";
import { Button, Modal, ModalHeader } from "semantic-ui-react";

export const GameThinking: React.FC<{
  quizNum: number;
  leftTime: number;
  handleAnswerButtonClick: () => void;
}> = ({ quizNum, leftTime, handleAnswerButtonClick }) => {
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererQuestionToCanvas2d | null>(null);
  const [quizInfo, setQuizInfo] = useState<TClientQuizInfo | null>(null);
  const [open, setOpen] = useState(true);

  const { game } = useContext(SocketContext);

  useEffect(() => {
    const currentQuiz = game.quizzes?.find(
      (quiz) => quiz.quizNumber === game.currentQuizNumberOneIndexed,
    );
    const f = async () => {
      try {
        const res = await fetch(
          `${serverOrigin}/api/quiz/${currentQuiz?.motionId}`,
          {
            method: "GET",
          },
        );
        const quizResult = (await res.json()) as TClientQuizInfo;
        console.log(quizResult);
        setQuizInfo(quizResult);
      } catch (error) {
        alert("error occurred:" + error);
      }
    };
    resize();
    if (canvasRef.current) {
      rendererRef.current = new RendererQuestionToCanvas2d(canvasRef.current);
    }
    f();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      rendererRef.current?.stopPlaying();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (quizInfo) {
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    }
  }, [quizInfo]);

  useEffect(() => {
    if (!open) {
      if (quizInfo) {
        if (rendererRef.current) {
          rendererRef.current.startPlaying(quizInfo);
        }
      }
      return () => {
        rendererRef.current?.stopPlaying();
        rendererRef.current = null;
      };
    }
  }, [open]);

  let resize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasParentRef.current?.clientWidth ?? 0;
      canvasRef.current.height = canvasParentRef.current?.clientHeight ?? 0;
    }
  };

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
        open={open}
        style={{ width: "80%" }}
      >
        <ModalHeader style={{ textAlign: "center", fontSize: "3rem" }}>
          第{quizNum}問
        </ModalHeader>
        <Modal.Content style={{ textAlign: "center", fontSize: "2rem" }}>
          これ、何してる？
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
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
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
          ref={canvasParentRef}
        >
          <canvas ref={canvasRef}></canvas>
        </div>
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
        >
          <div
            style={{
              color: "snow",
              fontSize: "1.6rem",
              flex: 2,
              textAlign: "center",
            }}
          >
            第{quizNum}問
          </div>
          <Button
            size="big"
            style={{
              backgroundColor: "#A538EE",
              color: "white",
              borderRadius: "40px",
              border: "3px solid white",
              padding: "15px 10px",
              fontWeight: "normal",
              width: "100%",
              flex: 4,
            }}
            onClick={handleAnswerButtonClick}
            disabled={false}
          >
            わかった!
          </Button>
          <div
            style={{
              color: "snow",
              fontSize: "1.6rem",
              flex: 2,
              textAlign: "center",
            }}
          >
            <small>のこり</small>
            <div
              style={{
                marginTop: "12px",
                marginBottom: "12px",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {leftTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
