import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh;
    Object_3: THREE.Mesh;
  };
  materials: {
    ["Material.001"]: THREE.MeshStandardMaterial;
  };
};

export function Chair(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF("/models/chair.glb") as GLTFResult;
  
  // Tạo material mới màu đỏ
  const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xa1131c,
    metalness: 0,
    roughness: 0.6
  });

  return (
    <group {...props} dispose={null} scale={[0.03, 0.03, 0.03]}>
      <mesh
        geometry={nodes.Object_3.geometry}
        material={redMaterial}
        castShadow
        receiveShadow
      />
    </group>
  );
}

useGLTF.preload("/models/chair.glb");
