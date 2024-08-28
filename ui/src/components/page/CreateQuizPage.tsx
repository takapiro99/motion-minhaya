import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ToTopPageButton } from "../utils/ToTopPageButton";
import "@mediapipe/pose";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import { RendererCanvas2d } from "../utils/renderCanvas";
import { Button, TextArea } from "semantic-ui-react";

type PoseDetector = poseDetection.PoseDetector;
const supportedModels = poseDetection.SupportedModels;
const createDetector = poseDetection.createDetector;

const RECORD_SECONDS = 10;

export const CreateQuizPage: FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererCanvas2d | null>(null);
  const [detector, setDetector] = useState<PoseDetector | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(RECORD_SECONDS);
  const [record, setRecord] = useState<poseDetection.Pose["keypoints3D"][]>([]);

  const startRecording = () => {
    setRecording(true);
    setRemainingSeconds(RECORD_SECONDS);

    const siID = setInterval(() => {
      setRemainingSeconds((prevSeconds) => {
        console.log(prevSeconds);
        if (prevSeconds === 1) {
          setRecording(false);
          clearInterval(siID);
          return RECORD_SECONDS; // 0秒になったら再設定
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

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
        if (recording) {
          if (poses.length > 0) {
            setRecord((prev) => [...prev, poses[0].keypoints3D]);
          }
        }
        // renderResult
        if (
          webcamRef.current?.video !== null &&
          webcamRef.current?.video !== undefined
        ) {
          rendererRef?.current?.draw(webcamRef.current?.video, poses);
        }
      } catch (error) {
        detector.dispose();
        alert(error);
      }
    }
  }, [detector, recording]);

  useEffect(() => {
    estimatePoses();
    const interval = setInterval(() => estimatePoses(), 100);
    return () => clearInterval(interval);
  }, [detector, estimatePoses]);

  useEffect(() => {
    console.log("initialize models");
    const loadModel = async () => {
      const model = supportedModels.BlazePose;
      console.log("blazepose selected");
      if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
        if (webcamRef.current.video.readyState < 2) {
          await new Promise((resolve) => {
            if (webcamRef.current?.video)
              webcamRef.current.video.onloadeddata = () => {
                resolve(webcamRef.current?.video);
              };
          });
        }
        canvasRef.current.width =
          webcamRef.current.video.getBoundingClientRect().width;
        canvasRef.current.height =
          webcamRef.current.video.getBoundingClientRect().height;
        rendererRef.current = new RendererCanvas2d(canvasRef.current);
        console.log("canvas initialized");
      }
      try {
        const detector = await createDetector(model, {
          runtime: "mediapipe",
          // modelType: "lite",
          modelType: "heavy",
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

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "auto",
          height: "auto",
          position: "absolute",
          top: "150px",
          left: "50%",
          transform: "translate(-50%, 0)",
        }}
        width="640"
        height="360"
      ></canvas>
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
          transform: "scaleX(-1)",
        }}
      />
      <ToTopPageButton />
      <div>
        <Button
          primary
          type="button"
          onClick={startRecording}
          disabled={recording || record.length > 0}
        >
          {recording
            ? `録画中（${remainingSeconds}秒）`
            : `録画開始(${RECORD_SECONDS}秒)`}
        </Button>
        <Button
          primary
          type="button"
          onClick={() => alert("TODO")}
          disabled={record.length === 0 || recording}
        >
          プレビュー(TODO)
        </Button>
        <Button
          primary
          type="button"
          onClick={() => alert("TODO")}
          disabled={record.length === 0 || recording}
        >
          正解ともに保存(TODO)
        </Button>
        <TextArea
          disabled={record.length === 0 || recording}
          placeholder="正答を入力"
        />
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
      </div>
    </div>
  );
};
