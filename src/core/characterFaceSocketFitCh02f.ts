import type { NormalizedFaceSocket } from './characterSystem';

export interface FaceSourceBoundsCh02f { width: number; height: number; }

export interface FaceSocketFitResultCh02f {
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  scale: number;
}

export function fitFaceSourceToSocketCh02f(
  source: FaceSourceBoundsCh02f,
  socket: NormalizedFaceSocket,
  poseWidth: number,
  poseHeight: number,
): FaceSocketFitResultCh02f {
  if (!(source.width > 0) || !(source.height > 0)) throw new Error('Face source bounds must be positive.');
  if (!(poseWidth > 0) || !(poseHeight > 0)) throw new Error('Pose canvas bounds must be positive.');
  const targetWidth = poseWidth * socket.scale;
  const aspect = source.height / source.width;
  const targetHeight = targetWidth * aspect;
  const centerX = poseWidth * socket.x;
  const centerY = poseHeight * socket.y;
  return {
    x: centerX - targetWidth / 2,
    y: centerY - targetHeight / 2,
    width: targetWidth,
    height: targetHeight,
    rotationDeg: socket.rotationDeg ?? 0,
    scale: socket.scale,
  };
}

export interface FaceShapeProbeCh02f {
  id: 'round' | 'long' | 'square' | 'narrow';
  width: number;
  height: number;
}

export const FACE_SHAPE_PROBES_CH02F: readonly FaceShapeProbeCh02f[] = [
  { id: 'round', width: 1, height: 1 },
  { id: 'long', width: 0.78, height: 1.15 },
  { id: 'square', width: 1.06, height: 1 },
  { id: 'narrow', width: 0.66, height: 1.12 },
];

export function faceFitStaysInsidePoseCh02f(
  fit: FaceSocketFitResultCh02f,
  poseWidth: number,
  poseHeight: number,
): boolean {
  return fit.x >= 0
    && fit.y >= 0
    && fit.x + fit.width <= poseWidth
    && fit.y + fit.height <= poseHeight;
}