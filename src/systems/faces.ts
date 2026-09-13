export const FACE_RUNTIME_SIZE = 320;
const OUTER_RADIUS_RATIO = 0.484375;
const WHITE_RADIUS_RATIO = 0.453125;
const FACE_RADIUS_RATIO = 0.40234375;

export interface FaceTransform {
  zoom: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_FACE_TRANSFORM: FaceTransform = {
  zoom: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
};

export function clampFaceTransform(transform: FaceTransform): FaceTransform {
  return {
    zoom: Math.max(1, Math.min(3, Number.isFinite(transform.zoom) ? transform.zoom : 1)),
    rotation: Math.max(-180, Math.min(180, Number.isFinite(transform.rotation) ? transform.rotation : 0)),
    offsetX: Math.max(-1, Math.min(1, Number.isFinite(transform.offsetX) ? transform.offsetX : 0)),
    offsetY: Math.max(-1, Math.min(1, Number.isFinite(transform.offsetY) ? transform.offsetY : 0)),
  };
}

export function loadFaceImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc ảnh đã chọn.'));
    };

    image.src = url;
  });
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  fillStyle: string,
): void {
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function drawFaceSticker(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: FaceTransform,
  size: number,
): void {
  const resolved = clampFaceTransform(transform);
  const center = size / 2;
  const outerRadius = size * OUTER_RADIUS_RATIO;
  const whiteRadius = size * WHITE_RADIUS_RATIO;
  const faceRadius = size * FACE_RADIUS_RATIO;
  const faceDiameter = faceRadius * 2;

  ctx.clearRect(0, 0, size, size);
  drawCircle(ctx, center, outerRadius, '#202020');
  drawCircle(ctx, center, whiteRadius, '#fffaf0');

  const naturalWidth = Math.max(1, image.naturalWidth || image.width);
  const naturalHeight = Math.max(1, image.naturalHeight || image.height);
  const coverScale = Math.max(faceDiameter / naturalWidth, faceDiameter / naturalHeight);
  const scale = coverScale * resolved.zoom;
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  const offsetScale = faceRadius * 0.92;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, faceRadius, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(
    center + resolved.offsetX * offsetScale,
    center + resolved.offsetY * offsetScale,
  );
  ctx.rotate((resolved.rotation * Math.PI) / 180);
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

export function renderFacePreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: FaceTransform,
): void {
  const size = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height)));
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawFaceSticker(ctx, image, transform, size);
}

export function encodeFaceSticker(
  image: HTMLImageElement,
  transform: FaceTransform,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = FACE_RUNTIME_SIZE;
  canvas.height = FACE_RUNTIME_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');

  drawFaceSticker(ctx, image, transform, FACE_RUNTIME_SIZE);

  // WebP keeps the circular alpha edge while reducing memory/network payload.
  // Browsers without WebP canvas support automatically fall back to PNG.
  return canvas.toDataURL('image/webp', 0.84);
}

export async function buildFaceSticker(
  file: File,
  transform: FaceTransform = DEFAULT_FACE_TRANSFORM,
): Promise<string> {
  const image = await loadFaceImage(file);
  return encodeFaceSticker(image, transform);
}

export function faceTextureKey(playerId: number, expression: string): string {
  return `face-p${playerId}-${expression}`;
}
