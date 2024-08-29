import React, { useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {
  Stats,
  OrbitControls,
  Environment,
  Sphere,
  useEnvironment,
} from "@react-three/drei";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Object3D } from "three";
import { getManipulation } from "../utils/modelManipulation";

export const PreviewContainer: React.FC<{
  currentPose: poseDetection.Pose["keypoints3D"] | null;
}> = ({ currentPose }) => {
  return (
    <div style={{ border: "2px solid green", width: "700px", height: "700px" }}>
      <Canvas style={{ background: "#001122" }}>
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
  const angleRef = useRef(0);
  const directionRef = useRef(1);

  // useEffect(() => {
  //   if (modelRef.current) {
  //     // モデル内を探索してボーンの名前をコンソールに出力
  //     modelRef.current.traverse((object) => {
  //       if (object.isBone) {
  //         console.log("Bone name:", object.name);
  //       }
  //     });
  //   }
  // }, [gltf]);

  const getBone = (num: number): Object3D => {
    if (!modelRef.current) return {} as Object3D;
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

  function orgRound(value: number, base: number) {
    return Math.round(value * base) / base;
  }

  useFrame((state, delta) => {
    if (modelRef.current) {
      // https://threejs.org/docs/#api/en/core/Object3D

      // getBone(14).rotation.y += 0.01;
      if (currentPose) {
        const manipulation = getManipulation(currentPose);
        if (!manipulation) return;
        const { head, shoulder } = manipulation;
        getBone(14).rotation.y = head.pitch * 2;
        // getBone(14).rotation.x = head.yaw;
        console.log(orgRound(shoulder.pitch, 100));
        // getBone(12).rotation.z = Math.PI / 6;
        // getBone(12).rotation.z = shoulder.yaw;
        getBone(12).rotation.z = shoulder.yaw - 0.2;
      }
      // getBone(28).translateX(0.1);

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
      <Environment map={envMap} background />
      <ambientLight intensity={Math.PI / 9} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={2}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={1} />
      <OrbitControls />
      <primitive ref={modelRef} object={gltf.scene} />
    </>
  );
};
