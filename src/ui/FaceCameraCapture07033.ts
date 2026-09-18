import { tryLockMobileLandscape07031 } from './mobileLandscape07031';

export interface FaceCameraCaptureResult07033 {
  files: File[];
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Bạn chưa cho phép MeMeMe dùng camera.';
    if (error.name === 'NotFoundError') return 'Không tìm thấy camera trên thiết bị.';
    if (error.name === 'NotReadableError') return 'Camera đang được ứng dụng khác sử dụng.';
  }
  return error instanceof Error ? error.message : 'Không mở được camera.';
}

async function frameToFile(
  video: HTMLVideoElement,
  mirrored: boolean,
  index: number,
): Promise<File> {
  const width = Math.max(1, video.videoWidth || 1280);
  const height = Math.max(1, video.videoHeight || 720);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không tạo được ảnh từ camera.');

  if (mirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Không chụp được ảnh.')), 'image/webp', 0.92);
  });

  return new File([blob], `mememe-camera-${Date.now()}-${index + 1}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export class FaceCameraCapture07033 {
  static async capture(labels: string[]): Promise<FaceCameraCaptureResult07033 | undefined> {
    if (!labels.length) return { files: [] };
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Trình duyệt này chưa hỗ trợ camera trực tiếp.');
    }

    void tryLockMobileLandscape07031(false);

    let facingMode: 'user' | 'environment' = 'user';
    let stream: MediaStream | undefined;

    const openStream = async (): Promise<MediaStream> => {
      stream?.getTracks().forEach((track) => track.stop());
      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    };

    try {
      stream = await openStream();
    } catch (error) {
      throw new Error(cameraErrorMessage(error));
    }

    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.className = 'face-camera-overlay';
      overlay.innerHTML = `
        <section class="face-camera-panel" role="dialog" aria-modal="true" aria-label="Chụp ảnh biểu cảm">
          <header class="face-camera-head">
            <div>
              <strong>📷 CHỤP BIỂU CẢM</strong>
              <span class="face-camera-progress"></span>
            </div>
            <button type="button" class="face-camera-close" aria-label="Đóng">×</button>
          </header>
          <div class="face-camera-preview">
            <video autoplay playsinline muted></video>
            <div class="face-camera-guide"></div>
            <div class="face-camera-label"></div>
          </div>
          <div class="face-camera-actions">
            <button type="button" class="face-camera-flip">↺ ĐỔI CAMERA</button>
            <button type="button" class="face-camera-shot">● CHỤP</button>
          </div>
          <small>Camera chạy ngay trong MeMeMe nên không cần mở ứng dụng Camera/Photos.</small>
        </section>
      `;
      document.body.appendChild(overlay);

      const video = overlay.querySelector<HTMLVideoElement>('video');
      const label = overlay.querySelector<HTMLElement>('.face-camera-label');
      const progress = overlay.querySelector<HTMLElement>('.face-camera-progress');
      const shot = overlay.querySelector<HTMLButtonElement>('.face-camera-shot');
      const flip = overlay.querySelector<HTMLButtonElement>('.face-camera-flip');
      const close = overlay.querySelector<HTMLButtonElement>('.face-camera-close');
      if (!video || !label || !progress || !shot || !flip || !close) {
        stream?.getTracks().forEach((track) => track.stop());
        overlay.remove();
        reject(new Error('Không tạo được giao diện camera.'));
        return;
      }

      let index = 0;
      const files: File[] = [];
      let busy = false;

      const attach = () => {
        if (!stream) return;
        video.srcObject = stream;
        video.classList.toggle('mirrored', facingMode === 'user');
      };

      const render = () => {
        label.textContent = labels[index] ?? '';
        progress.textContent = `${index + 1}/${labels.length} • ${labels[index] ?? ''}`;
        shot.textContent = index === labels.length - 1 ? '● CHỤP & XONG' : '● CHỤP';
      };

      const cleanup = () => {
        stream?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        overlay.remove();
      };

      close.addEventListener('click', () => {
        cleanup();
        resolve(undefined);
      });

      flip.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        flip.disabled = true;
        try {
          facingMode = facingMode === 'user' ? 'environment' : 'user';
          stream = await openStream();
          attach();
          await video.play().catch(() => undefined);
        } catch (error) {
          cleanup();
          reject(new Error(cameraErrorMessage(error)));
        } finally {
          busy = false;
          flip.disabled = false;
        }
      });

      shot.addEventListener('click', async () => {
        if (busy || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        busy = true;
        shot.disabled = true;
        try {
          files.push(await frameToFile(video, facingMode === 'user', index));
          index += 1;
          if (index >= labels.length) {
            cleanup();
            resolve({ files });
            return;
          }
          render();
        } catch (error) {
          cleanup();
          reject(error);
          return;
        } finally {
          busy = false;
          shot.disabled = false;
        }
      });

      attach();
      render();
      void video.play().catch(() => undefined);
    });
  }
}
