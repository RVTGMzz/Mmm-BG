import Phaser from 'phaser';

/**
 * CH-19 responsive stage.
 *
 * Every screen was laid out for a 1280x720 design. Instead of letterboxing
 * other aspect ratios, the game canvas takes the real aspect ratio of the
 * window (anything from 5:4 to 21:9): the short side stays 720 (or 1280) and
 * the long side grows. Each scene's camera is scrolled so the 1280x720 design
 * area sits in the middle; backdrops are painted large enough to fill the
 * extra space and HUD elements may pin themselves to the real edges
 * (stageRectCh19 / pinToStageCh19). The board scene's own UI camera is
 * resized and centred the same way while its world camera simply sees more
 * of the island.
 */

export const DESIGN_W_CH19 = 1280;
export const DESIGN_H_CH19 = 720;
const MIN_ASPECT = 5 / 4;
const MAX_ASPECT = 21 / 9;

export function stageSizeForCh19(width: number, height: number): { width: number; height: number } {
  const aspect = Phaser.Math.Clamp(width / Math.max(1, height), MIN_ASPECT, MAX_ASPECT);
  if (aspect >= DESIGN_W_CH19 / DESIGN_H_CH19) return { width: Math.round(DESIGN_H_CH19 * aspect), height: DESIGN_H_CH19 };
  return { width: DESIGN_W_CH19, height: Math.round(DESIGN_W_CH19 / aspect) };
}

export function windowStageSizeCh19(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: DESIGN_W_CH19, height: DESIGN_H_CH19 };
  const vv = window.visualViewport;
  const w = vv?.width || window.innerWidth || DESIGN_W_CH19;
  const h = vv?.height || window.innerHeight || DESIGN_H_CH19;
  return stageSizeForCh19(w, h);
}

/** Visible stage rectangle in design coordinates (x/y may be negative). */
export function stageRectCh19(scene: Phaser.Scene): { x: number; y: number; w: number; h: number } {
  const w = Number(scene.scale.gameSize.width) || DESIGN_W_CH19;
  const h = Number(scene.scale.gameSize.height) || DESIGN_H_CH19;
  return { x: -(w - DESIGN_W_CH19) / 2, y: -(h - DESIGN_H_CH19) / 2, w, h };
}

const UI_CAMERA_NAMES = new Set(['canonical-ui-0561']);
const FITTED = Symbol('ch19-stage-fit');
// stored on the camera: a restarted scene gets fresh cameras and is fitted again
type Fitted = Phaser.Cameras.Scene2D.Camera & { [FITTED]?: string };

/** Scenes whose main camera moves over a world (the board) keep their scroll. */
function isWorldScene(scene: Phaser.Scene): boolean {
  return scene.cameras.cameras.some((c) => UI_CAMERA_NAMES.has(c.name));
}

export function fitSceneToStageCh19(scene: Phaser.Scene): void {
  const { width, height } = scene.scale.gameSize;
  const sig = `${width}x${height}`;
  const r = stageRectCh19(scene);
  if (isWorldScene(scene)) {
    for (const cam of scene.cameras.cameras) {
      if (UI_CAMERA_NAMES.has(cam.name)) {
        if (cam.width !== width || cam.height !== height) cam.setSize(width, height);
        if (cam.scrollX !== r.x || cam.scrollY !== r.y) cam.setScroll(r.x, r.y);
      } else if (cam === scene.cameras.main && (cam.width !== width || cam.height !== height)) {
        cam.setSize(width, height);
      }
    }
    return;
  }
  const cam = scene.cameras.main as Fitted;
  if (!cam || cam[FITTED] === sig) return;
  cam[FITTED] = sig;
  if (cam.width !== width || cam.height !== height) cam.setSize(width, height);
  cam.setScroll(r.x, r.y);
}

/** Keeps the canvas at the window's aspect ratio and every live scene centred. */
export function installResponsiveStageCh19(game: Phaser.Game): void {
  let frame = 0;
  const resize = () => {
    const { width, height } = windowStageSizeCh19();
    if (game.scale.gameSize.width !== width || game.scale.gameSize.height !== height) {
      game.scale.setGameSize(width, height);
    }
  };
  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { frame = 0; resize(); });
  };
  // size the stage as soon as the scale manager exists (before the first scene draws)
  if (game.isBooted) resize();
  else game.events.once(Phaser.Core.Events.BOOT, resize);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('fullscreenchange', schedule);
  // cameras are re-fitted every frame for live scenes (cheap: only on change)
  game.events.on(Phaser.Core.Events.PRE_RENDER, () => {
    for (const scene of game.scene.getScenes(true)) fitSceneToStageCh19(scene);
  });
}
