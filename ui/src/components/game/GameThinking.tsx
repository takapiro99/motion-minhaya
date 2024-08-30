import { useEffect, useRef, useState } from "react";
import { TClientQuizInfo } from "../page/CreateQuizPage";
import { RendererQuestionToCanvas2d } from "../utils/renderQuestion";
import { serverOrigin } from "../../SocketContext";

export const GameThinking = () => {
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererQuestionToCanvas2d | null>(null);

  const [quizInfo, setQuizInfo] = useState<TClientQuizInfo | null>(null);

  useEffect(() => {
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
  }, [quizInfo]);

  // useEffect(() => {
  //   estimatePoses();
  //   const interval = setInterval(() => estimatePoses(), 100);
  //   return () => clearInterval(interval);
  // }, [detector, estimatePoses]);

  let resize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasParentRef.current?.clientWidth ?? 0;
      canvasRef.current.height = canvasParentRef.current?.clientHeight ?? 0;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        border: "2px solid blue",
        width: "100%",
        maxWidth: "680px",
        height: "100%",
      }}
      ref={canvasParentRef}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
