const STICKER_SIZE = 256;
const OUTER_RADIUS = 124;
const WHITE_RADIUS = 116;
const FACE_RADIUS = 103;

function loadImage(file: File): Promise<HTMLImageElement> {
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

function drawCircle(ctx: CanvasRenderingContext2D, radius: number, fillStyle: string): void {
  ctx.beginPath();
  ctx.arc(STICKER_SIZE / 2, STICKER_SIZE / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export async function buildFaceSticker(file: File): Promise<string> {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_SIZE;
  canvas.height = STICKER_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');
  }

  ctx.clearRect(0, 0, STICKER_SIZE, STICKER_SIZE);

  // MeMeMe sticker treatment: black outer rim + thick cream/white border.
  drawCircle(ctx, OUTER_RADIUS, '#202020');
  drawCircle(ctx, WHITE_RADIUS, '#fffaf0');

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;
  const faceDiameter = FACE_RADIUS * 2;
  const faceX = (STICKER_SIZE - faceDiameter) / 2;
  const faceY = (STICKER_SIZE - faceDiameter) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(STICKER_SIZE / 2, STICKER_SIZE / 2, FACE_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    faceX,
    faceY,
    faceDiameter,
    faceDiameter,
  );
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export function faceTextureKey(playerId: number, expression: string): string {
  return `face-p${playerId}-${expression}`;
}
