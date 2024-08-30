/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posedetection from "@tensorflow-models/pose-detection";
// import * as scatter from 'scatter-gl';

import * as params from "./params";
import { TClientQuizInfo } from "../page/CreateQuizPage";

// #ffffff - White
// #800000 - Maroon
// #469990 - Malachite
// #e6194b - Crimson
// #42d4f4 - Picton Blue
// #fabed4 - Cupid
// #aaffc3 - Mint Green
// #9a6324 - Kumera
// #000075 - Navy Blue
// #f58231 - Jaffa
// #4363d8 - Royal Blue
// #ffd8b1 - Caramel
// #dcbeff - Mauve
// #808000 - Olive
// #ffe119 - Candlelight
// #911eb4 - Seance
// #bfef45 - Inchworm
// #f032e6 - Razzle Dazzle Rose
// #3cb44b - Chateau Green
// #a9a9a9 - Silver Chalice
const COLOR_PALETTE = [
  "#ffffff",
  "#800000",
  "#469990",
  "#e6194b",
  "#42d4f4",
  "#fabed4",
  "#aaffc3",
  "#9a6324",
  "#000075",
  "#f58231",
  "#4363d8",
  "#ffd8b1",
  "#dcbeff",
  "#808000",
  "#ffe119",
  "#911eb4",
  "#bfef45",
  "#f032e6",
  "#3cb44b",
  "#a9a9a9",
];
export class RendererQuestionToCanvas2d {
  private ctx: CanvasRenderingContext2D | null;
  private canvasWidth: number;
  private canvasHeight: number;
  private scoreThreshold: number;
  private currentFrame: number;
  private currentPlay: number;
  private quizInfo: TClientQuizInfo | null;
  private normalizedPose: posedetection.Pose[] | null;
  private sid: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.flip(this.canvasWidth);
    this.scoreThreshold = 0;
    this.currentFrame = 0;
    this.currentPlay = 0;
    this.sid = 0;
    this.quizInfo = null;
    this.normalizedPose = null;
  }

  startPlaying(quizInfo: TClientQuizInfo) {
    this.quizInfo = quizInfo;
    this.currentFrame = 0;
    if (this.quizInfo == null) return alert("error 134892");

    const poseXMax = Math.max(
      ...this.quizInfo.pose.map((pose) =>
        Math.max(...pose.keypoints.map((kp) => kp.x)),
      ),
    );
    const poseYMax = Math.max(
      ...this.quizInfo.pose.map((pose) =>
        Math.max(...pose.keypoints.map((kp) => kp.y)),
      ),
    );
    const wScale = this.canvasWidth / poseXMax;
    const hScale = this.canvasHeight / poseYMax;
    const scale = Math.min(wScale, hScale);
    console.log(poseXMax, poseYMax, this.canvasHeight, this.canvasWidth, scale);
    const centerizeOffsetX = (this.canvasWidth - poseXMax * scale) / 2;
    const centerizeOffsetY = (this.canvasHeight - poseYMax * scale) / 2;

    this.normalizedPose = this.quizInfo.pose.map((pose) => {
      return {
        keypoints: pose.keypoints.map((kp) => {
          return {
            x: kp.x * scale + centerizeOffsetX,
            y: kp.y * scale + centerizeOffsetY,
            score: kp.score,
          };
        }),
      };
    });

    this.sid = setInterval(() => {
      if (this.currentFrame < (this?.quizInfo?.pose?.length || 0)) {
        this.draw();
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
        this.currentPlay++;
      }
    }, 110) as unknown as number;
  }

  // startPlaying(){}

  flip(videoWidth: number) {
    // Because the image from camera is mirrored, need to flip horizontally.
    this.ctx?.translate(videoWidth, 0);
    this.ctx?.scale(-1, 1);
  }

  stopPlaying() {
    clearInterval(this.sid);
  }

  draw() {
    if (this.ctx == null) return;
    this.clearCtx();
    this.ctx.fillStyle = "Black";
    this.ctx?.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    // if (mode === "WITHCAMERA") {
    //   this.ctx?.drawImage(video, 0, 0, this.canvasWidth, this.canvasHeight);
    // }
    // if (mode === "GALAXY") {
    // }
    // // The null check makes sure the UI is not in the middle of changing to a
    // // different model. If during model change, the result is from an old model,
    // // which shouldn't be rendered.
    // if (poses && poses.length > 0) {
    //   this.drawResults(poses, mode);
    // }
    if (this.normalizedPose == null) return;
    this.drawKeypoints2(this.normalizedPose[this.currentFrame].keypoints);
  }

  clearCtx() {
    this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param poses A list of poses to render.
   */
  drawResults(poses: posedetection.Pose[]) {
    for (const pose of poses) {
      this.drawResult(pose);
      // console.log(pose.keypoints3D);
    }
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param pose A pose with keypoints to render.
   */
  drawResult(pose: posedetection.Pose) {
    if (pose.keypoints != null) {
      // this.drawKeypoints(pose.keypoints, mode);
      // if (mode === "WITHCAMERA") {
      //   this.drawSkeleton(pose.keypoints, pose.id);
      // }
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  drawKeypoints2(keypoints: posedetection.Keypoint[]) {
    if (this.ctx == null) return;
    const keypointInd = posedetection.util.getKeypointIndexBySide(
      posedetection.SupportedModels.BlazePose,
    );
    this.ctx.fillStyle = "Red";
    this.ctx.strokeStyle = "White";
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // const writeOnly =
    //   mode === "GALAXY"
    //     ? [2, 5, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
    //     : [...Array(50)].map((_, i) => i);
    // const writeOnly = [...Array(50)].map((_, i) => i);
    // const writeOnly = [2, 5, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    // const writeOnly = [2, 5, 11,  25, 26, 27, 28];

    const writeOnly = this.currentPlay <= 1
      ? [2, 5, 11, 25, 26, 27, 28]
      : this.currentPlay <= 2
      ? [2, 5, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
      : [...Array(50)].map((_, i) => i);

    for (const i of keypointInd.middle) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }
    }

    this.ctx.fillStyle = "Green";
    for (const i of keypointInd.left) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }
    }

    this.ctx.fillStyle = "Orange";
    for (const i of keypointInd.right) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }
    }
  }

  // /**
  //  * Draw the keypoints on the video.
  //  * @param keypoints A list of keypoints.
  //  */
  // drawKeypoints(keypoints: posedetection.Keypoint[], mode: CreateQuizMode) {
  //   if (this.ctx == null) return;
  //   const keypointInd = posedetection.util.getKeypointIndexBySide(
  //     posedetection.SupportedModels.BlazePose,
  //   );
  //   this.ctx.fillStyle = "Red";
  //   this.ctx.strokeStyle = "White";
  //   this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

  //   const writeOnly =
  //     mode === "GALAXY"
  //       ? [2, 5, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
  //       : [...Array(50)].map((_, i) => i);

  //   for (const i of keypointInd.middle) {
  //     if (writeOnly.includes(i)) {
  //       this.drawKeypoint(keypoints[i]);
  //     }
  //   }

  //   this.ctx.fillStyle = "Green";
  //   for (const i of keypointInd.left) {
  //     if (writeOnly.includes(i)) {
  //       this.drawKeypoint(keypoints[i]);
  //     }
  //   }

  //   this.ctx.fillStyle = "Orange";
  //   for (const i of keypointInd.right) {
  //     if (writeOnly.includes(i)) {
  //       this.drawKeypoint(keypoints[i]);
  //     }
  //   }
  // }

  drawKeypoint(keypoint: posedetection.Keypoint) {
    if (this.ctx == null) return;
    // console.log(keypoint);

    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = this.scoreThreshold || 0;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  /**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   */
  drawSkeleton(keypoints: posedetection.Keypoint[], poseId?: number) {
    if (this.ctx == null) return;
    // Each poseId is mapped to a color in the color palette.
    const color = poseId != null ? COLOR_PALETTE[poseId % 20] : "White";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    posedetection.util
      .getAdjacentPairs(posedetection.SupportedModels.BlazePose)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = this.scoreThreshold || 0;
        if (this.ctx == null) return;
        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          this.ctx.beginPath();
          this.ctx.moveTo(kp1.x, kp1.y);
          this.ctx.lineTo(kp2.x, kp2.y);
          this.ctx.stroke();
        }
      });
  }
}
