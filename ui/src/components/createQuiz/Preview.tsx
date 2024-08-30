import React, { useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useEnvironment } from "@react-three/drei";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Bone, Object3D, Quaternion, Vector3, Vector3Like } from "three";
import { Coord } from "../utils/modelManipulation";

export const PreviewContainer: React.FC<{
  currentPose: poseDetection.Pose["keypoints3D"] | null;
}> = ({ currentPose }) => {
  return (
    <div style={{ border: "2px solid green", width: "700px", height: "700px" }}>
      <Canvas
        style={{ background: "#001122" }}
        camera={{ position: [0, 2.4, 1.5] }}
      >
        <Preview currentPose={currentPose} />
      </Canvas>
    </div>
  );
};

export const Preview: React.FC<{
  currentPose: poseDetection.Pose["keypoints3D"] | null;
}> = ({ currentPose }) => {
  const gltf = useLoader(GLTFLoader, "/gltf/scene.gltf");
  const modelRef = useRef<ThreeElements["primitive"]>(null);

  const getBone = (num: number): Bone => {
    if (!modelRef.current) return {} as Bone;
    const names = [
      "_rootJoint",
      "root_01",
      "spine_01_02",
      "pelvis_03",
      "thighL_04",
      "shinL_05",
      "footL_06",
      "toeL_07",
      "thighR_08",
      "shinR_09",
      "footR_010",
      "toeR_011",
      "spine_02_012",
      "spine_03_013",
      "head_014",
      "shoulderL_015",
      "upper_armL_016",
      "forearmL_017",
      "handL_018",
      "fingersL_019",
      "thumb_01L_020",
      "thumb_02L_021",
      "shoulderR_022",
      "upper_armR_023",
      "handR_024",
      "fingersR_025",
      "thumb_01R_026",
      "thumb_02R_027",
      "TAR_kneeL_028",
      "IK_handL_029",
      "IK_footL_030",
      "TAR_elbowL_031",
      "TAR_kneeR_032",
      "IK_handR_033",
      "IK_footR_034",
      "TAR_elbowR_035",
      "forearmR_00",
    ];
    return modelRef.current.getObjectByName(names[num]);
  };

  const getCurrentPose = (num: number) => {
    type Ret = {
      x: number;
      y: number;
      z: number;
      score?: number;
      name?: string;
    };
    if (!currentPose) return {} as Ret;
    return currentPose[num] as Ret;
  };

  // 2つの関節位置からボーンの回転を計算する関数
  function calculateBoneRotation(
    startPoint: Vector3Like,
    endPoint: Vector3Like,
  ) {
    const direction = new Vector3()
      .subVectors(endPoint, startPoint)
      .normalize();
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(-1, 0, 0),
      direction,
    );
    return quaternion;
  }

  useFrame((state, delta) => {
    // https://threejs.org/docs/#api/en/core/Object3D
    if (modelRef.current) {
      // console.log(getBone(12));

      // const shoulderL = getBone(16);
      const shoulderL = new Vector3(
        getCurrentPose(11).x,
        getCurrentPose(11).y,
        getCurrentPose(11).z,
      );
      const elbowL = new Vector3(
        getCurrentPose(13).x,
        getCurrentPose(13).y,
        getCurrentPose(13).z,
      );

      const upperArmBoneL = getBone(16);
      // upperArmBoneL.rotation.x = 0
      // upperArmBoneL.rotation.y = 0
      // upperArmBoneL.rotation.z = 0
      upperArmBoneL.quaternion.copy(calculateBoneRotation(shoulderL, elbowL));

      // const leftElbow = new THREE.Vector3(keypoints3D[2].x, keypoints3D[2].y, keypoints3D[2].z);
      // const leftUpperArmBone = nodes.LeftUpperArmBoneName;
      // leftUpperArmBone.quaternion.copy(calculateBoneRotation(leftShoulder, leftElbow));
      // if (leftShinBone) {
      //   // 角度を滑らかに更新
      //   angleRef.current += delta * directionRef.current * 0.5; // 速度を調整
      //   if (angleRef.current > (3 * Math.PI) / 4) {
      //     angleRef.current = (3 * Math.PI) / 4;
      //     directionRef.current = -1;
      //   } else if (angleRef.current < 0) {
      //     angleRef.current = 0;
      //     directionRef.current = 1;
      //   }
      //   getBone(5).rotation.x = angleRef.current; // 回転角度を更新
      // }
    }
  });
  const envMap = useEnvironment({
    files: "/gltf/background.hdr",
  });

  return (
    <>
      {/* <Environment map={envMap} background /> */}
      <ambientLight intensity={1} color={"#ff00f0"} />
      <spotLight
        position={[10, 30, 30]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={5}
        color={"#ff00f0"}
      />
      <pointLight
        position={[-10, -10, -10]}
        decay={0}
        intensity={1}
        color={"#ff00f0"}
      />
      {/* <OrbitControls /> */}
      <primitive ref={modelRef} object={gltf.scene} />
    </>
  );
};
