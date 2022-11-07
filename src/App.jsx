import * as THREE from "three";
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Instances,
  Instance,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

const particles = Array.from({ length: 150 }, () => ({
  factor: THREE.MathUtils.randInt(10, 100),
  speed: THREE.MathUtils.randFloat(0.1, 1),
  xFactor: THREE.MathUtils.randFloatSpread(2000),
  yFactor: THREE.MathUtils.randFloatSpread(1000),
  zFactor: THREE.MathUtils.randFloatSpread(1000),
}));

const heartShape = new THREE.Shape();

heartShape.moveTo(25, 25);
heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

const extrudeSettings = {
  depth: 8,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 2,
  bevelSize: 1,
  bevelThickness: 1,
};

export default function App() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false }}
      camera={{ fov: 100, position: [0, 0, 60], near: 10, far: 150 }}
    >
      <color attach="background" args={["#f0f0f0"]} />
      <fog attach="fog" args={["white", 60, 110]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[100, 10, -50]} intensity={20} castShadow />
      <pointLight position={[-100, -100, -100]} intensity={10} color="red" />
      <Bubbles />
      <ContactShadows
        position={[0, -30, 0]}
        opacity={0.6}
        scale={130}
        blur={1}
        far={40}
      />
      <EffectComposer multisampling={0}>
        <SSAO
          samples={31}
          radius={0.1}
          intensity={30}
          luminanceInfluence={0.1}
          color="red"
        />
      </EffectComposer>
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

function Bubbles() {
  const ref = useRef();

  useFrame(
    (state, delta) =>
      void (ref.current.rotation.y = THREE.MathUtils.damp(
        ref.current.rotation.y,
        (-state.mouse.x * Math.PI) / 6,
        2.75,
        delta
      ))
  );
  return (
    <Instances
      limit={particles.length}
      ref={ref}
      castShadow
      receiveShadow
      scale={0.05}
      rotation={[0, 0, 3]}
      position={[0, 10, 0]}
    >
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial roughness={0} color="#ff0022" />
      {particles.map((data, i) => (
        <Bubble key={i} {...data} />
      ))}
    </Instances>
  );
}

function Bubble({ factor, speed, xFactor, yFactor, zFactor }) {
  const ref = useRef();
  useFrame((state) => {
    const t = factor + state.clock.elapsedTime * (speed / 2);
    ref.current.scale.setScalar(Math.max(1.5, Math.cos(t) * 5));
    ref.current.position.set(
      Math.cos(t) +
        Math.sin(t * 1) / 10 +
        xFactor +
        Math.cos((t / 10) * factor) +
        (Math.sin(t * 1) * factor) / 10,
      Math.sin(t) +
        Math.cos(t * 2) / 10 +
        yFactor +
        Math.sin((t / 10) * factor) +
        (Math.cos(t * 2) * factor) / 10,
      Math.sin(t) +
        Math.cos(t * 2) / 10 +
        zFactor +
        Math.cos((t / 10) * factor) +
        (Math.sin(t * 3) * factor) / 10
    );
  });
  return <Instance ref={ref} />;
}
