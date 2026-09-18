import {
  clampFaceTransform,
  DEFAULT_FACE_STYLE_PRESET,
  DEFAULT_FACE_TRANSFORM,
  encodeFaceSticker,
  loadFaceImage,
  renderFacePreview,
  type FaceStylePreset,
  type FaceTransform,
} from '../systems/faces';
import { recoverMobileLandscapeAfterPicker07031 } from './mobileLandscape07031';

export interface FaceImageEditorResult {
  dataUrl: string;
  transform: FaceTransform;
  stylePreset: FaceStylePreset;
}

function distance(a: PointerEvent, b: PointerEvent): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export class FaceImageEditor {
  static async open(file: File): Promise<FaceImageEditorResult | undefined> {
    recoverMobileLandscapeAfterPicker07031();
    const image = await loadFaceImage(file);

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'face-editor-overlay face-editor-landscape-overlay';
      overlay.innerHTML = `
        <section class="face-editor face-editor-landscape" role="dialog" aria-modal="true" aria-label="Chỉnh ảnh khuôn mặt">
          <div class="face-editor-head">
            <div>
              <strong>CHỈNH ẢNH</strong>
              <span>Kéo để canh mặt • pinch/cuộn để zoom • mặc định dùng GAME SOFT</span>
            </div>
            <button class="face-editor-close" type="button" aria-label="Đóng">×</button>
          </div>
          <div class="face-editor-landscape-body">
            <div class="face-editor-stage-wrap">
              <canvas class="face-editor-canvas" width="360" height="360"></canvas>
              <div class="face-editor-guide" aria-hidden="true"></div>
            </div>
            <div class="face-editor-side">
              <div class="face-editor-filter">
                <span class="face-editor-section-label">STYLE ẢNH</span>
                <div class="face-editor-filter-options">
                  <button type="button" data-face-preset="game-soft" class="selected" aria-pressed="true">🎮 GAME SOFT</button>
                  <button type="button" data-face-preset="original" aria-pressed="false">ẢNH GỐC</button>
                </div>
                <small>GAME SOFT chỉ cân sáng, tương phản và màu nhẹ để avatar đồng đều hơn. Có thể thay preset này khi làm lại visual game.</small>
              </div>
              <div class="face-editor-controls">
                <label>ZOOM <span class="face-editor-zoom-value">100%</span>
                  <input class="face-editor-zoom" type="range" min="100" max="300" step="1" value="100" />
                </label>
                <label>XOAY <span class="face-editor-rotate-value">0°</span>
                  <input class="face-editor-rotate" type="range" min="-180" max="180" step="1" value="0" />
                </label>
              </div>
              <div class="face-editor-actions secondary">
                <button class="face-editor-rotate-left" type="button">↶ -90°</button>
                <button class="face-editor-reset" type="button">↺ RESET</button>
                <button class="face-editor-rotate-right" type="button">↷ +90°</button>
              </div>
              <div class="face-editor-actions">
                <button class="face-editor-cancel" type="button">HỦY</button>
                <button class="face-editor-confirm" type="button">DÙNG ẢNH NÀY ✓</button>
              </div>
              <p class="face-editor-note">Avatar vẫn xuất 320×320 WebP. Giao diện chỉnh ảnh ưu tiên landscape nhưng vùng crop vẫn vuông để khớp avatar tròn trong game.</p>
            </div>
          </div>
        </section>
      `;
      document.body.appendChild(overlay);

      const canvas = overlay.querySelector<HTMLCanvasElement>('.face-editor-canvas');
      const zoom = overlay.querySelector<HTMLInputElement>('.face-editor-zoom');
      const rotate = overlay.querySelector<HTMLInputElement>('.face-editor-rotate');
      const zoomValue = overlay.querySelector<HTMLSpanElement>('.face-editor-zoom-value');
      const rotateValue = overlay.querySelector<HTMLSpanElement>('.face-editor-rotate-value');
      const close = overlay.querySelector<HTMLButtonElement>('.face-editor-close');
      const cancel = overlay.querySelector<HTMLButtonElement>('.face-editor-cancel');
      const confirm = overlay.querySelector<HTMLButtonElement>('.face-editor-confirm');
      const reset = overlay.querySelector<HTMLButtonElement>('.face-editor-reset');
      const rotateLeft = overlay.querySelector<HTMLButtonElement>('.face-editor-rotate-left');
      const rotateRight = overlay.querySelector<HTMLButtonElement>('.face-editor-rotate-right');
      const presetButtons = [...overlay.querySelectorAll<HTMLButtonElement>('[data-face-preset]')];
      if (!canvas || !zoom || !rotate) {
        overlay.remove();
        resolve(undefined);
        return;
      }

      let transform: FaceTransform = { ...DEFAULT_FACE_TRANSFORM };
      let stylePreset: FaceStylePreset = DEFAULT_FACE_STYLE_PRESET;
      const pointers = new Map<number, PointerEvent>();
      let lastDrag: { x: number; y: number } | undefined;
      let pinchDistance = 0;
      let pinchZoom = 1;

      const draw = () => {
        transform = clampFaceTransform(transform);
        renderFacePreview(canvas, image, transform, stylePreset);
        zoom.value = String(Math.round(transform.zoom * 100));
        rotate.value = String(Math.round(transform.rotation));
        if (zoomValue) zoomValue.textContent = `${Math.round(transform.zoom * 100)}%`;
        if (rotateValue) rotateValue.textContent = `${Math.round(transform.rotation)}°`;
        for (const button of presetButtons) {
          const selected = button.dataset.facePreset === stylePreset;
          button.classList.toggle('selected', selected);
          button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        }
      };

      const cleanup = () => {
        window.removeEventListener('keydown', onKeyDown);
        overlay.remove();
      };

      const finish = (result?: FaceImageEditorResult) => {
        cleanup();
        resolve(result);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') finish();
      };
      window.addEventListener('keydown', onKeyDown);

      for (const button of presetButtons) {
        button.addEventListener('click', () => {
          stylePreset = button.dataset.facePreset === 'original' ? 'original' : 'game-soft';
          draw();
        });
      }

      zoom.addEventListener('input', () => {
        transform.zoom = Number(zoom.value) / 100;
        draw();
      });
      rotate.addEventListener('input', () => {
        transform.rotation = Number(rotate.value);
        draw();
      });
      reset?.addEventListener('click', () => {
        transform = { ...DEFAULT_FACE_TRANSFORM };
        stylePreset = DEFAULT_FACE_STYLE_PRESET;
        draw();
      });
      rotateLeft?.addEventListener('click', () => {
        transform.rotation = Math.max(-180, transform.rotation - 90);
        draw();
      });
      rotateRight?.addEventListener('click', () => {
        transform.rotation = Math.min(180, transform.rotation + 90);
        draw();
      });

      canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        transform.zoom += event.deltaY < 0 ? 0.08 : -0.08;
        draw();
      }, { passive: false });

      canvas.addEventListener('pointerdown', (event) => {
        canvas.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, event);
        if (pointers.size === 1) {
          lastDrag = { x: event.clientX, y: event.clientY };
        } else if (pointers.size === 2) {
          const values = [...pointers.values()];
          pinchDistance = distance(values[0], values[1]);
          pinchZoom = transform.zoom;
          lastDrag = undefined;
        }
      });

      canvas.addEventListener('pointermove', (event) => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, event);

        if (pointers.size >= 2) {
          const values = [...pointers.values()];
          const nextDistance = distance(values[0], values[1]);
          if (pinchDistance > 0) transform.zoom = pinchZoom * (nextDistance / pinchDistance);
          draw();
          return;
        }

        if (!lastDrag) return;
        const dx = event.clientX - lastDrag.x;
        const dy = event.clientY - lastDrag.y;
        transform.offsetX += dx / (canvas.clientWidth * 0.42);
        transform.offsetY += dy / (canvas.clientHeight * 0.42);
        lastDrag = { x: event.clientX, y: event.clientY };
        draw();
      });

      const releasePointer = (event: PointerEvent) => {
        pointers.delete(event.pointerId);
        if (pointers.size === 1) {
          const remaining = [...pointers.values()][0];
          lastDrag = { x: remaining.clientX, y: remaining.clientY };
        } else {
          lastDrag = undefined;
        }
        if (pointers.size < 2) pinchDistance = 0;
      };
      canvas.addEventListener('pointerup', releasePointer);
      canvas.addEventListener('pointercancel', releasePointer);

      close?.addEventListener('click', () => finish());
      cancel?.addEventListener('click', () => finish());
      overlay.addEventListener('pointerdown', (event) => {
        if (event.target === overlay) finish();
      });
      confirm?.addEventListener('click', () => {
        const resolved = clampFaceTransform(transform);
        finish({
          dataUrl: encodeFaceSticker(image, resolved, stylePreset),
          transform: resolved,
          stylePreset,
        });
      });

      draw();
    });
  }
}
