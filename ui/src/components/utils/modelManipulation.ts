import * as poseDetection from "@tensorflow-models/pose-detection";


export type Coord = {
  x: number,
  y: number,
  z?: number,
}

export type EulerAngles = {
  roll: number,
  pitch: number,
  yaw: number,
}

type GetManipulation = {
  head: EulerAngles,
  shoulder: EulerAngles,
}

export const getManipulation = (pose: poseDetection.Pose["keypoints3D"]): GetManipulation | undefined => {
  const origin = getOrigin(pose)
  if (origin === undefined) return
  const vFromOrigin = createVFromOrigin(origin)
  if (!pose) return


  // 頭部の、原点からのベクトルを算出。また、向きも算出する
  const vHead = vFromOrigin(pose[0])

  // 肩
  const vShoulders = vectorToPoint(pose[11], pose[12])



  return {
    head: calculateEulerAngles(vHead),
    shoulder: {
      roll: 0,
      pitch: Math.atan2(vShoulders.z ?? 0, vShoulders.x) - Math.PI / 2,
      yaw: Math.atan2(vShoulders.y, vShoulders.x),
    }
  }
}

const createVFromOrigin = (origin: Coord) => {
  return (point: Coord) => {
    return {
      x: point.x - origin.x,
      y: point.y - origin.y,
      z: (point.z ?? 0) - (origin.z ?? 0),
    }
  }
}


const getOrigin = (pose: poseDetection.Pose["keypoints3D"]): Coord | undefined => {
  if (!pose) return
  // 肩と肩の中間点を原点とする
  return {
    x: (pose[11].x + pose[12].x) / 2,
    y: (pose[11].y + pose[12].y) / 2,
    z: ((pose[11]?.z ?? 0) + (pose[12]?.z ?? 0)) / 2,
  }
}

const calculateEulerAngles = (vector: Coord): EulerAngles => {
  const roll = Math.atan2(vector.y, vector.z ?? 0); // X軸回転
  const pitch = Math.atan2(-vector.x, Math.sqrt(vector.y * vector.y + (vector.z ?? 0) * (vector.z ?? 0))); // Y軸回転
  const yaw = Math.atan2(vector.x, (vector.z ?? 0)); // Z軸回転

  return { roll, pitch, yaw };
};

const vectorToPoint = (point: Coord, origin: Coord): Coord => {
  return {
    x: point.x - origin.x,
    y: point.y - origin.y,
    z: (point.z ?? 0) - (origin.z ?? 0),
  };
};