import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ToTopPageButton } from "../utils/ToTopPageButton";
import "@mediapipe/pose";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";

type PoseDetector = poseDetection.PoseDetector;
const supportedModels = poseDetection.SupportedModels;
const createDetector = poseDetection.createDetector;

console.log("createQuiz!");

export const CreateQuizPage: FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [detector, setDetector] = useState<PoseDetector | null>(null);

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
        console.log(poses);
      } catch (error) {
        detector.dispose();
        alert(error);
      }
    }
  }, [detector]);
  console.log(estimatePoses);

  useEffect(() => {
    const interval = setInterval(() => {
      estimatePoses();
    }, 100); // 100msごとにポーズ推定を行う
    return () => clearInterval(interval);
  }, [detector, estimatePoses]);

  useEffect(() => {
    console.log("initialize models");
    const loadModel = async () => {
      const model = supportedModels.BlazePose;
      console.log("blazepose selected");
      try {
        const detector = await createDetector(model, {
          runtime: "mediapipe",
          // modelType: "lite",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
          // solutionPath: "node_modules/@mediapipe/pose",
        });
        console.log("set detector done");
        setDetector(detector);
      } catch (error) {
        console.warn(error);
      }
    };
    if (webcamRef.current) {
      try {
        loadModel();
      } catch (error) {
        console.warn(error);
      }
    }
  }, []);

  return (
    <div>
      <ToTopPageButton />
      <div>This is a create quiz page.</div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          width: 640,
          height: 360,
        }}
      />
    </div>
  );
};
