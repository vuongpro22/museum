import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Preload,
} from "@react-three/drei";
import { Perf } from "r3f-perf";
import Museum from "./Museum";
import { ImageMetadata } from "../types/museum";
import { useAnimation } from "../contexts/AnimationContext";
import { useWebGLSupport } from "../hooks/useWebGLSupport";
import WebGLErrorBoundary from "./WebGLErrorBoundary";
import FallbackGallery from "./FallbackGallery";

interface SceneProps {
  images: ImageMetadata[];
}

const EmptyFallback = ({ onLoaded }: { onLoaded: () => void }) => {
  React.useEffect(() => {
    return () => {
      onLoaded();
    };
  }, [onLoaded]);

  return null;
};

const Scene: React.FC<SceneProps> = ({ images }) => {
  const { sceneOpacity, sceneBlur, handleAssetsLoaded } = useAnimation();
  const { isSupported, isLoading, error } = useWebGLSupport();
  const [webGLError, setWebGLError] = useState<string | null>(null);

  // Nếu đang loading hoặc WebGL không được hỗ trợ
  if (isLoading) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang kiểm tra hỗ trợ WebGL...</p>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    // Hiển thị gallery fallback thay vì error message
    return <FallbackGallery images={images} />;
  }

  return (
    <WebGLErrorBoundary>
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: sceneOpacity,
          filter: `blur(${sceneBlur}px)`,
          transition: "opacity 1.5s ease-in-out, filter 1s ease-out",
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 2, 14],
            fov: 60,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            // Kiểm tra WebGL context sau khi tạo
            if (!gl.getContext()) {
              setWebGLError('Không thể tạo WebGL context');
            }
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
            setWebGLError('Lỗi khởi tạo Canvas');
          }}
        >
          <Preload all />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          {/* <Perf minimal={true} /> */}
          <color attach="background" args={["#000000"]} />
          <Suspense fallback={<EmptyFallback onLoaded={handleAssetsLoaded} />}>
            <Museum images={images} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
};

export default Scene;
