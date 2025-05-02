import React, { useRef, useCallback, useContext, useEffect } from "react";
import * as THREE from "three";
import { CameraControls } from "@react-three/drei";
import { ZoomContext } from "../../contexts/ZoomContext";
import { useDetectGPU } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

interface CameraManagerProps {
  onFrameChange?: (index: number) => void;
  currentFrameIndex: number;
  frameRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  imagesCount: number;
}

const CameraManager: React.FC<CameraManagerProps> = ({
  onFrameChange,
  currentFrameIndex,
  frameRefs,
  imagesCount,
}) => {
  const { isMobile } = useDetectGPU();
  const cameraControlsRef = useRef<CameraControls>(null);
  const { setZoomedFrameId } = useContext(ZoomContext);
  const { viewport } = useThree();

  useEffect(() => {
    if (currentFrameIndex >= 0) {
      setZoomedFrameId(currentFrameIndex);
    } else {
      setZoomedFrameId(null);
    }
  }, [currentFrameIndex, setZoomedFrameId]);

  const getScaleFactor = useCallback(() => {
    const baseScale = 2.5;
    if (isMobile) {
      if (viewport.width < 2) return 6.5;
      if (viewport.width < 4) return 5;
      return 4.5;
    }

    const aspectRatio = viewport.width / viewport.height;
    if (aspectRatio > 2) return baseScale * 1.2;

    return baseScale;
  }, [isMobile, viewport.width, viewport.height]);

  const getYOffset = useCallback(() => {
    if (isMobile) {
      if (viewport.width < 2) return 0.4;
      if (viewport.width < 4) return 0.35;
      return 0.3;
    }

    return 0.1;
  }, [isMobile, viewport.width]);

  const getResetPolarAngle = useCallback(() => {
    const defaultZ = isMobile ? 18 : 14;
    const eye = new THREE.Vector3(0, 2, defaultZ);
    const target = new THREE.Vector3(0, 0, 0);
    const dir = eye.clone().sub(target).normalize();
    return Math.acos(dir.y); // polar angle in radians
  }, [isMobile]);

  const zoomToFrame = useCallback(
    async (index: number) => {
      if (!cameraControlsRef.current) return;

      const mesh = frameRefs.current[index];
      if (!mesh) return;

      const frameWorldPosition = new THREE.Vector3();
      mesh.getWorldPosition(frameWorldPosition);

      const localFrontPoint = new THREE.Vector3(0, 0, 1);
      const worldFrontPoint = localFrontPoint.clone();
      mesh.localToWorld(worldFrontPoint);

      const frontDirection = worldFrontPoint
        .clone()
        .sub(frameWorldPosition)
        .normalize();

      frontDirection.multiplyScalar(getScaleFactor());

      const targetPosition = frameWorldPosition.clone().add(frontDirection);

      await cameraControlsRef.current.setLookAt(
        targetPosition.x,
        targetPosition.y - getYOffset(),
        targetPosition.z,
        frameWorldPosition.x,
        frameWorldPosition.y - getYOffset(),
        frameWorldPosition.z,
        true
      );

      if (onFrameChange) onFrameChange(index);
    },
    [frameRefs, onFrameChange, getScaleFactor, getYOffset]
  );

  const resetCamera = useCallback(async () => {
    if (!cameraControlsRef.current) return;
    const defaultZ = isMobile ? 18 : 14;

    await cameraControlsRef.current.setLookAt(0, 2, defaultZ, 0, 0, 0, true);

    if (onFrameChange) onFrameChange(-1);
  }, [onFrameChange, isMobile]);

  useEffect(() => {
    if (!cameraControlsRef.current) return;

    const polarAngle = getResetPolarAngle();

    if (currentFrameIndex >= 0) {
      cameraControlsRef.current.minAzimuthAngle = THREE.MathUtils.degToRad(0);
      cameraControlsRef.current.maxAzimuthAngle = THREE.MathUtils.degToRad(0);
      cameraControlsRef.current.minPolarAngle = THREE.MathUtils.degToRad(80);
      cameraControlsRef.current.maxPolarAngle = THREE.MathUtils.degToRad(80);
    } else {
      cameraControlsRef.current.minAzimuthAngle = THREE.MathUtils.degToRad(-15);
      cameraControlsRef.current.maxAzimuthAngle = THREE.MathUtils.degToRad(15);
      cameraControlsRef.current.minPolarAngle = polarAngle;
      cameraControlsRef.current.maxPolarAngle = polarAngle;
    }
  }, [currentFrameIndex, getResetPolarAngle]);

  useEffect(() => {
    if (currentFrameIndex >= 0 && currentFrameIndex < imagesCount) {
      zoomToFrame(currentFrameIndex);
    } else if (currentFrameIndex === -1) {
      resetCamera();
    }
  }, [currentFrameIndex, imagesCount, zoomToFrame, resetCamera]);

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        events={true}
        mouseButtons={{
          left: THREE.MOUSE.LEFT,
          middle: THREE.MOUSE.MIDDLE,
          right: THREE.MOUSE.RIGHT,
          wheel: THREE.MOUSE.DOLLY,
        }}
        touches={{
          one: currentFrameIndex < 0 ? 1 : 0,
          two: 0,
          three: 0,
        }}
        enabled={true}
        minAzimuthAngle={currentFrameIndex >= 0 ? 0 : THREE.MathUtils.degToRad(-15)}
        maxAzimuthAngle={currentFrameIndex >= 0 ? 0 : THREE.MathUtils.degToRad(15)}
        minPolarAngle={getResetPolarAngle()}
        maxPolarAngle={getResetPolarAngle()}
      />
    </>
  );
};

export { CameraManager, type CameraManagerProps };
