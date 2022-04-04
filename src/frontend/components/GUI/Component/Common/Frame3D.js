import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  OrbitControls,
  Stage,
} from "@react-three/drei";
import { Html, useProgress } from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}
function Model({ url, ...props }) {
  const ref = useRef();
  useFrame((state) => (ref.current.rotation.y = state.clock.elapsedTime));
  const { scene, nodes, materials, animations } = useGLTF(url);

  const { actions } = useAnimations(animations, ref);
  useEffect(() => {
    // actions[0].play();
    // console.log("animations", animations);
    // console.log("actions", actions);
    if (animations.length) {
      actions[animations[0].name].play();
    }
  });
  useFrame(
    (state) => (ref.current.rotation.y = Math.sin(state.clock.elapsedTime))
  );

  return (
    <group ref={ref} {...props} dispose={null}>
      <Suspense fallback={<Loader />}>
        <primitive object={scene} {...props} />
      </Suspense>
    </group>
  );
}

// useGLTF.preload("/animation-salute.glb");

export default function NFT3D({ url, ...props }) {
  console.log("3d url", url, "type", props.type);
  return (
    // <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
    <Canvas
      // camera={{ position: [4, 0, 6.45], fov: 15 }}
      camera={{ fov: 45, zoom: 0.9, near: 1, far: 1000 }}
      style={{
        backgroundColor: "blue",
        width: "100%",
        height: "100%",
      }}
      // mode="concurrent"
    >
      <ambientLight intensity={1.25} />
      <ambientLight intensity={0.1} />
      <directionalLight intensity={0.4} />
      <Suspense fallback={<Loader />}>
        <Stage preset="rembrandt" intensity={1} environment="city">
          <Model url={url} {...props} />
        </Stage>
      </Suspense>
      {/* <OrbitControls /> */}
    </Canvas>
    // </div>
  );
}
