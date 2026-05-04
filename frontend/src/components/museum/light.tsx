import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Group, SpotLight, Object3D } from "three";

type LightProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
};

const Light: React.FC<LightProps> = ({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
  const groupRef = useRef<Group>(null);
  const targetRef = useRef<Object3D>(null);
  const lightRef = useRef<SpotLight>(null);
  const { scene } = useGLTF("/models/light.glb");

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      <primitive object={scene} />

      {/* Target để ánh sáng chiếu tới */}
      <object3D ref={targetRef} position={[0, -2, 0]} />

      {/* Ánh sáng phát ra từ đèn chùm */}
      <spotLight
        ref={lightRef}
        position={[0, -0.1, 0]} // đặt sát dưới đèn
        intensity={50}          // tăng độ sáng tùy ý
        angle={Math.PI / 2}
        distance={10}
        penumbra={0.5}
        decay={1.5}
        castShadow
      />
    </group>
  );
};

export default Light;

useGLTF.preload("/models/light.glb");
