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
import * as posedetection from '@tensorflow-models/pose-detection';
// import * as scatter from 'scatter-gl';

// import * as params from './params';
// import { type CreateQuizMode } from '../components/CreateQuizPage';

const params = {
  DEFAULT_LINE_WIDTH: 2,
  DEFAULT_RADIUS: 4,
};
type CreateQuizMode = "WITHCAMERA" | "GALAXY";

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
  '#ffffff', '#800000', '#469990', '#e6194b', '#42d4f4', '#fabed4', '#aaffc3',
  '#9a6324', '#000075', '#f58231', '#4363d8', '#ffd8b1', '#dcbeff', '#808000',
  '#ffe119', '#911eb4', '#bfef45', '#f032e6', '#3cb44b', '#a9a9a9'
];
export class RendererCanvas2d {
  private ctx: CanvasRenderingContext2D | null;
  private videoWidth: number
  private videoHeight: number
  private scoreThreshold: number

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.flip(this.videoWidth);
    this.scoreThreshold = 0
  }

  flip(videoWidth: number) {
    // Because the image from camera is mirrored, need to flip horizontally.
    this.ctx?.translate(videoWidth, 0);
    this.ctx?.scale(-1, 1);
  }

  draw(video: HTMLVideoElement, poses: posedetection.Pose[], mode: CreateQuizMode) {
    if (this.ctx == null) return
    if (mode === "WITHCAMERA") {
      this.ctx?.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
    }
    if (mode === "GALAXY") {
      this.clearCtx()
      this.ctx.fillStyle = 'Black';
      this.ctx?.fillRect(0, 0, this.videoWidth, this.videoHeight);
    }
    // The null check makes sure the UI is not in the middle of changing to a
    // different model. If during model change, the result is from an old model,
    // which shouldn't be rendered.
    if (poses && poses.length > 0) {
      this.drawResults(poses, mode);
    }
  }

  clearCtx() {
    this.ctx?.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param poses A list of poses to render.
   */
  drawResults(poses: posedetection.Pose[], mode: CreateQuizMode) {
    for (const pose of poses) {
      this.drawResult(pose, mode);
      // console.log(pose.keypoints3D);
    }
  }

  /**
   * Draw the keypoints and skeleton on the video.
   * @param pose A pose with keypoints to render.
   */
  drawResult(pose: posedetection.Pose, mode: CreateQuizMode) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints, mode);
      if (mode === "WITHCAMERA") {
        this.drawSkeleton(pose.keypoints, pose.id);
      }
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  drawKeypoints(keypoints: posedetection.Keypoint[], mode: CreateQuizMode) {
    if (this.ctx == null) return
    const keypointInd =
      posedetection.util.getKeypointIndexBySide(posedetection.SupportedModels.BlazePose);
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    const writeOnly = mode === "GALAXY" ? [2, 5, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28] : [...Array(50)].map((_, i) => i)

    for (const i of keypointInd.middle) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }

    }

    this.ctx.fillStyle = 'Green';
    for (const i of keypointInd.left) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }
    }

    this.ctx.fillStyle = 'Orange';
    for (const i of keypointInd.right) {
      if (writeOnly.includes(i)) {
        this.drawKeypoint(keypoints[i]);
      }
    }
  }

  drawKeypoint(keypoint: posedetection.Keypoint) {
    if (this.ctx == null) return
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
    if (this.ctx == null) return
    // Each poseId is mapped to a color in the color palette.
    const color = poseId != null ? COLOR_PALETTE[poseId % 20] : 'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    posedetection.util.getAdjacentPairs(posedetection.SupportedModels.BlazePose).forEach(([
      i, j
    ]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = this.scoreThreshold || 0;
      if (this.ctx == null) return
      if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        this.ctx.stroke();
      }
    });
  }
}



