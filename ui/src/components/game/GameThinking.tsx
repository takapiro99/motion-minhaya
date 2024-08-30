import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { TClientQuizInfo } from "../page/CreateQuizPage";
import { RendererQuestionToCanvas2d } from "../utils/renderQuestion";
import { serverOrigin, SocketContext } from "../../SocketContext";
import { UsersInfo } from "./UsersInfo";
import { Button } from "semantic-ui-react";

export const GameThinking: React.FC<{
  quizNum: number;
  leftTime: number;
  handleAnswerButtonClick: () => void;
}> = ({ quizNum, leftTime, handleAnswerButtonClick }) => {
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererQuestionToCanvas2d | null>(null);

  const [quizInfo, setQuizInfo] = useState<TClientQuizInfo | null>(null);

  const { game } = useContext(SocketContext);

  useEffect(() => {
    // const currentQuiz = game.quizzes?.find(
    //   (quiz) => quiz.quizNumber === game.currentQuizNumberOneIndexed,
    // );
    const f = async () => {
      const res = await fetch(
        `${serverOrigin}/api/quiz/2ab227a9-4bf9-4944-8859-326c675cce71`,
        {
          method: "GET",
        },
      );
      const quizResult = (await res.json()) as TClientQuizInfo;
      console.log(quizResult);
      setQuizInfo(quizResult);
    };
    resize();
    if (canvasRef.current) {
      rendererRef.current = new RendererQuestionToCanvas2d(canvasRef.current);
    }
    f();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (quizInfo) {
      if (rendererRef.current) {
        rendererRef.current.startPlaying(quizInfo);
      }
    }
    return () => {
      rendererRef.current?.stopPlaying();
      rendererRef.current = null;
    };
  }, [quizInfo]);

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
            border: "2px solid blue",
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
            border: "2px solid red",
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
