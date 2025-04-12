import { FC, useCallback, useEffect, useRef, useState } from "react";
import "@mediapipe/pose";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import { RendererCanvas2d } from "../utils/renderCanvas";
import {
  Button,
  Form,
  Message,
  MessageHeader,
  TextArea,
} from "semantic-ui-react";

export const serverOrigin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://motion-minhaya-sxmhgfgw6q-an.a.run.app";

type PoseDetector = poseDetection.PoseDetector;
const supportedModels = poseDetection.SupportedModels;
const createDetector = poseDetection.createDetector;

const RECORD_SECONDS = 10;
const MODEL_TYPE: "lite" | "heavy" = "heavy";

export type CreateQuizMode = "WITHCAMERA" | "GALAXY";

export type TClientQuizInfo = {
  quizID: string;
  pose: poseDetection.Pose[]; // 正規化された状態
  createdAt: string;
  answers: string[];
  screenAspectRatio: number; // 縦/横
};

export const CreateQuizPage: FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererCanvas2d | null>(null);
  const [detector, setDetector] = useState<PoseDetector | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(RECORD_SECONDS);
  const [record, setRecord] = useState<poseDetection.Pose[]>([]);
  const [mode, setMode] = useState<CreateQuizMode>("WITHCAMERA");
  const [answers, setAnswers] = useState<string[]>([]);

  const [quizUploading, setQuizUploading] = useState<boolean>(false);

  const reset = () => {
    setRecording(false);
    setRemainingSeconds(RECORD_SECONDS);
    setRecord([]);
    setAnswers([]);
    setQuizUploading(false);
  };

  const startRecording = () => {
    setRecording(true);
    setRemainingSeconds(RECORD_SECONDS);

    const siID = setInterval(() => {
      setRemainingSeconds((prevSeconds) => {
        if (prevSeconds === 1) {
          setRecording(false);
          clearInterval(siID);
          return RECORD_SECONDS; // 0秒になったら再設定
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

  // estimate, render, and maybe save
  const estimatePoses = useCallback(async () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video !== null &&
      detector
    ) {
      try {
        const video = webcamRef.current.video as HTMLVideoElement;
        const poses = await detector.estimatePoses(video, {
          flipHorizontal: false,
        });
        if (poses.length > 0) {
          if (recording) setRecord((prev) => [...prev, poses[0]]);
        }
        // renderResult
        if (
          webcamRef.current?.video !== null &&
          webcamRef.current?.video !== undefined
        ) {
          rendererRef?.current?.draw(webcamRef.current?.video, poses, mode);
        }
      } catch (error) {
        detector.dispose();
        alert(error);
      }
    }
  }, [detector, recording, mode]);

  useEffect(() => {
    estimatePoses();
    const interval = setInterval(() => estimatePoses(), 100);
    return () => clearInterval(interval);
  }, [detector, estimatePoses]);

  // setup
  useEffect(() => {
    console.log("initialize models");
    const loadModel = async () => {
      const model = supportedModels.BlazePose;
      if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
        if (webcamRef.current.video.readyState < 2) {
          await new Promise((resolve) => {
            if (webcamRef.current?.video)
              webcamRef.current.video.onloadeddata = () => {
                resolve(webcamRef.current?.video);
              };
          });
        }
        const vid = webcamRef.current.video;
        canvasRef.current.width = vid.getBoundingClientRect().width;
        canvasRef.current.height = vid.getBoundingClientRect().height;
        rendererRef.current = new RendererCanvas2d(canvasRef.current);
      }
      try {
        const detector = await createDetector(model, {
          runtime: "mediapipe",
          modelType: MODEL_TYPE,
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
          // solutionPath: "node_modules/@mediapipe/pose",
        });
        console.log("set detector done");
        setDetector(detector);
      } catch (error) {
        console.warn(error);
      }
    };
    if (
      webcamRef.current &&
      webcamRef.current.video !== null &&
      canvasRef.current
    ) {
      try {
        loadModel();
      } catch (error) {
        console.warn(error);
      }
    }
  }, []);

  const handleSaveQuiz = async () => {
    if (record.length === 0 || answers.length === 0) return;
    setQuizUploading(true);
    const quizInfo: TClientQuizInfo = {
      quizID: "",
      pose: record,
      answers: answers,
      createdAt: new Date().toISOString(),
      screenAspectRatio:
        (canvasRef.current?.height ?? 1) / (canvasRef.current?.width ?? 1),
    };
    let resQuiz: TClientQuizInfo = {} as TClientQuizInfo;
    try {
      const res = await fetch(`${serverOrigin}/api/quiz`, {
        method: "POST",
        body: JSON.stringify(quizInfo),
        headers: {
          "Content-Type": "application/json",
        },
      });
      resQuiz = await res.json();
      alert("done!");
      reset();
    } catch (error) {
      alert(error);
    } finally {
    }
    try {
      const res = await fetch(`${serverOrigin}/api/quiz/${resQuiz.quizID}`, {
        method: "GET",
      });
      const quizResult = await res.json();
      console.log(quizResult);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <Webcam
          ref={webcamRef}
          mirrored
          width={1280}
          height={720}
          style={{
            width: "auto",
            height: "auto",
            visibility: "hidden",
            position: "absolute",
          }}
        />
      </div>
      <div style={{ margin: "10px 0px" }}>
        <Button type="button" onClick={() => (window.location.href = "/")}>
          トップに戻る
        </Button>
      </div>
      <Form>
        <TextArea
          disabled={record.length === 0 || recording}
          placeholder="正答を入力（半角カンマ区切りで）"
          value={answers.join(",")}
          onChange={(e) => setAnswers(e.target.value.split(","))}
        />
      </Form>
      <div style={{marginTop: "10px"}}>
        <Button
          secondary
          type="button"
          onClick={() => {
            setMode(mode === "WITHCAMERA" ? "GALAXY" : "WITHCAMERA");
          }}
        >
          モード：{mode === "GALAXY" ? "Galaxy" : "カメラ付き"}
        </Button>
        <Button
          color="red"
          type="button"
          onClick={startRecording}
          disabled={recording || record.length > 0}
        >
          {recording
            ? `録画中（${remainingSeconds}秒）`
            : `録画開始(${RECORD_SECONDS}秒)`}
        </Button>
        <Button
          secondary
          type="button"
          onClick={() => {
            setRecord([]);
          }}
          disabled={record.length === 0 || recording}
        >
          リセット
        </Button>
        <Button
          primary
          type="button"
          onClick={handleSaveQuiz}
          disabled={
            record.length === 0 ||
            recording ||
            quizUploading ||
            answers.length === 0
          }
          loading={quizUploading}
        >
          正解ともに保存
        </Button>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100vw",
            maxWidth: "640px",
            height: "auto",
            textAlign: "center",
          }}
          width="640"
          height="360"
        ></canvas>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {recording && (
          <Message negative size="massive">
            <MessageHeader>
              Recording!! のこり{remainingSeconds}秒
            </MessageHeader>
          </Message>
        )}
      </div>
    </>
  );
};
