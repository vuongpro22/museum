import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

interface TVProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

const TV = ({ position, rotation }: TVProps) => {
  const gltf = useGLTF('/models/tv.glb') // đường dẫn tới GLB của bạn
  const { nodes, materials } = gltf

  useEffect(() => {
    console.log("GLTF loaded:", gltf)
    console.log("Available node keys:", Object.keys(nodes))
  }, [gltf])

  return (
    <group position={position} rotation={rotation}>
      {/* Tự động hiển thị tất cả node có geometry */}
      {Object.entries(nodes).map(([key, node]: any) => {
        if (node?.geometry) {
          console.log(`Rendering node: ${key}`)
          return (
            <mesh key={key} geometry={node.geometry} material={node.material || undefined}>
              {/* fallback material nếu node không có material */}
              {!node.material && <meshStandardMaterial color="orange" />}
            </mesh>
          )
        }
        return null
      })}
    </group>
  )
}

export default TV
