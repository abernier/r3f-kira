import { ReactNode, useEffect, useRef } from "react";
import * as THREE from "three";
import { useXR } from "@react-three/xr";
import {
  Environment,
  PerspectiveCamera,
  useKeyboardControls,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { useControls, folder } from "leva";

import Gamepads from "./Gamepads";

function Layout({
  children,
  bg = "#ffffff",
}: {
  children?: ReactNode;
  bg?: string;
}) {
  //
  // ESC key to exit XR
  //

  const gl = useThree((state) => state.gl);
  // gl.xr.setFramebufferScaleFactor(2.0);

  const escPressed = useKeyboardControls((state) => state.esc);
  useEffect(() => {
    gl.xr.getSession()?.end(); // https://stackoverflow.com/a/71566927/133327
  }, [escPressed, gl.xr]);

  //
  //
  //

  const [gui, setGui] = useControls(() => ({
    Layout: folder(
      {
        bg,
        grid: true,
        axes: true,
        camera: folder({
          fov: 50,
          player: {
            value: [0.9728517749133652, 1.1044765132727201, 0.7316689528482836],
            step: 0.1,
          }, // ~= position of the camera (the player holds the camera)
          lookAt: {
            value: [0, 0, 0],
            step: 0.1,
          },
        }),
        gamepads: folder({
          nipples: true,
        }),
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  return (
    <>
      <Camera position={gui.player} lookAt={gui.lookAt} fov={gui.fov} />

      <Gamepads
        nipples={gui.nipples}
        sensitivity={{
          left: { x: 1 / 10, y: 1 / 10 },
          right: { x: 1 / 10, y: 1 / 10 },
        }}
      />

      <Environment background>
        <mesh scale={100}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color={gui.bg} side={THREE.BackSide} />
        </mesh>
      </Environment>

      {/* <spotLight
        position={[15, 15, 15]}
        // angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      /> */}
      <ambientLight intensity={1} />

      {gui.grid && <gridHelper args={[30, 30, 30]} position-y=".01" />}
      {gui.axes && <axesHelper args={[5]} />}

      {children}
    </>
  );
}

function Camera({
  position,
  lookAt,
  fov,
}: {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}) {
  const cameraRef = useRef<THREE.Camera>(); // non-XR camera

  const player = useXR((state) => state.player);

  //
  //  🤳 Camera (player position + cam lookAt rotation)
  //

  useEffect(() => {
    player.position.set(...position);
  }, [player, position]);

  // useFrame(() => {
  //   cameraRef.current?.lookAt(...lookAt);
  // });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} fov={fov} near={0.001} makeDefault />
    </>
  );
}

export default Layout;
