import { useEffect, useRef, useState } from "react";
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

export const PreviewContainer: React.FC = () => {
  return (
    <div style={{ border: "2px solid green", width: "700px", height: "700px" }}>
      <Canvas style={{ background: "#001122" }}>
        <Preview />
      </Canvas>
    </div>
  );
};

export const Preview = () => {
  const gltf = useLoader(GLTFLoader, "/gltf/scene.gltf");
  const modelRef = useRef<ThreeElements["primitive"]>(null);
  const clockRef = useRef({ elapsedTime: 0, direction: 1 });
  const angleRef = useRef(0);
  const directionRef = useRef(1);
  // useEffect(() => {
  //   if (modelRef.current) {
  //     // モデルのボーンにアクセス
  //     const leftArmBone = modelRef.current?.getObjectByName("left_upper_arm");
  //     if (leftArmBone) {
  //       // 例として左腕の回転を設定
  //       leftArmBone.rotation.x = Math.PI / 4;
  //     }
  //   }
  // }, [gltf]);

  useEffect(() => {
    if (modelRef.current) {
      // モデル内を探索してボーンの名前をコンソールに出力
      modelRef.current.traverse((object) => {
        if (object.isBone) {
          console.log("Bone name:", object.name);
        }
      });
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (modelRef.current) {
      // https://threejs.org/docs/#api/en/core/Object3D

      const leftArmBone = modelRef.current.getObjectByName("upper_armR_023");
      const pelvis = modelRef.current.getObjectByName("pelvis_03");
      const kneeL = modelRef.current.getObjectByName("IK_footR_034");
      const shinR = modelRef.current.getObjectByName("shinR_09");
      // console.log(leftArmBone);
      // console.log(modelRef.current);

      if (leftArmBone) {
        leftArmBone.rotation.x += 0.01;
        // pelvis.rotation.y += 0.01;
        kneeL.rotation.y += 0.01;
        shinR.rotation.y += 0.01;
        // kneeL.translateX(0.01);
      }

      const leftShinBone = modelRef.current.getObjectByName("shinL_05");

      if (leftShinBone) {
        // 角度を滑らかに更新
        angleRef.current += delta * directionRef.current * 0.5; // 速度を調整

        if (angleRef.current > (3 * Math.PI) / 4) {
          angleRef.current = (3 * Math.PI) / 4;
          directionRef.current = -1;
        } else if (angleRef.current < 0) {
          angleRef.current = 0;
          directionRef.current = 1;
        }

        leftShinBone.rotation.x = angleRef.current; // 回転角度を更新
      }
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
      <Box position={[1.2, 0, 0]} />
      <OrbitControls />
      <primitive ref={modelRef} object={gltf.scene} />
    </>
  );
};

function Box(props: { position: [number, number, number] }) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<ThreeElements["mesh"]>(null);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += delta));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
