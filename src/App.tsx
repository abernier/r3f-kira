import * as THREE from "three";
import {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useKeyboardControls,
  useGLTF,
  CubeCamera,
  useFBO,
} from "@react-three/drei";
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

  const { fbo, camera, update } = useCubeCamera({ resolution: 256 });

  useFrame(() => {
    OOI.boule.visible = false; // hide sphere before taking cube photos
    camera.position.copy(OOI.boule.getWorldPosition(new THREE.Vector3()));
    update(); // 📸 shoot cubeCamera
    OOI.boule.visible = true; // reveal back the sphere
  });

  useEffect(() => {
    (OOI.boule as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      envMap: fbo.texture,
    });
  }, [OOI.boule, fbo.texture]);

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

function useCubeCamera({
  resolution = 256,
  near = 0.1,
  far = 1000,
}: {
  resolution?: number;
  near?: number;
  far?: number;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const fbo = useMemo(() => {
    const fbo = new THREE.WebGLCubeRenderTarget(resolution);
    fbo.texture.encoding = gl.outputEncoding;
    fbo.texture.type = THREE.HalfFloatType;
    return fbo;
  }, [resolution, gl.outputEncoding]);

  const camera = useMemo(
    () => new THREE.CubeCamera(near, far, fbo),
    [near, far, fbo]
  );

  const update = useCallback(() => {
    camera.update(gl, scene);
  }, [gl, scene, camera]);

  return { fbo, camera, update };
}
