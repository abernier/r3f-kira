import * as THREE from "three";
import { useEffect, useState, useMemo, useLayoutEffect } from "react";
import styled from "@emotion/styled";
import { Canvas, useThree } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import { Physics, Debug } from "@react-three/rapier";
import { XR, Controllers, Hands, VRButton, Interactive } from "@react-three/xr";

import Layout from "./Layout";
import Cube from "./components/Cube";
import Ball from "./components/Ball";
import Ground from "./components/Ground";
import { Rope } from "./components/Rope";

function App() {
  return (
    <Styled>
      <VRButton />
      <Canvas
        gl={{ logarithmicDepthBuffer: true }}
        shadows
        // camera={{
        //   position: [0, 15, 5],
        //   fov: 55,
        // }}
        //
      >
        <XR>
          {/* <Controllers /> */}
          <Hands />

          <Physics
            gravity={[0, -60, 0]}
            // timeStep={1 / 60}
            //
          >
            <Debug />

            <Layout>
              <Scene />
            </Layout>
          </Physics>
        </XR>
      </Canvas>
    </Styled>
  );
}
export const Styled = styled.div`
  position: fixed;
  inset: 0;
`;
export default App;

function Scene() {
  const gltf = useGLTF("https://threejs.org/examples/models/gltf/kira.glb");

  const OOI = useMemo(() => {
    const {
      head,
      lowerarm_l,
      Upperarm_l,
      hand_l,
      target_hand_l,
      boule,
      Kira_Shirt_left,
    } = gltf.nodes;
    return {
      head,
      lowerarm_l,
      Upperarm_l,
      hand_l,
      target_hand_l,
      boule,
      Kira_Shirt_left,
    };
  }, [gltf.nodes]);
  console.log("OOI", OOI);

  useLayoutEffect(() => {
    gltf.scene.traverse((n) => {
      console.log(n);
      if (n instanceof THREE.Mesh) {
        n.frustumCulled = false; // see: https://stackoverflow.com/a/32876611/133327
      }
    });
  }, [gltf.scene]);

  return (
    <>
      <primitive object={gltf.scene} />

      <Ground />
    </>
  );
}
