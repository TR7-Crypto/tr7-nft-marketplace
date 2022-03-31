import React, { useRef, useEffect, Suspense } from "react";
import { act, Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
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
        <primitive object={scene} {...props} position={[0, -0.9, 0]} />
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
      camera={{ position: [4, 0, 6.45], fov: 15 }}
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
      <Suspense fallback={null}>
        <Model url={url} {...props} />
      </Suspense>
      {/* <OrbitControls /> */}
    </Canvas>
    // </div>
  );
}
