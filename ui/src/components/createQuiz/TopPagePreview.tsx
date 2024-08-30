import React, { useRef } from "react";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { Bone } from "three";

export const TopPagePreview: React.FC<{}> = () => {
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

  useFrame(() => {
    // https://threejs.org/docs/#api/en/core/Object3D
    if (modelRef.current) {
      getBone(0).rotation.set(-1, 0, 0);
      getBone(1).rotateZ(0.001);
      getBone(1).rotateY(0.01);
    }
  });
  // const envMap = useEnvironment({
  //   files: "/gltf/background.hdr",
  // });

  return (
    <>
      {/* <Environment map={envMap} background /> */}
      <ambientLight intensity={1} color={"#ffa0f0"} />
      <spotLight
        position={[10, 30, 30]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={5}
        color={"#FF00F0"}
      />
      <pointLight
        position={[-10, -10, -10]}
        decay={0}
        intensity={1}
        color={"#ffa0f0"}
      />
      {/* <OrbitControls /> */}
      <primitive ref={modelRef} object={gltf.scene} />
    </>
  );
};
