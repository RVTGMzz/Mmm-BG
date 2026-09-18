import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_FACE_STYLE_PRESET,
  type FaceStylePreset,
} from '../src/systems/faces';

const main = readFileSync('src/main.ts', 'utf8');
const guard = readFileSync('src/ui/mobileLandscape07031.ts', 'utf8');
const mobileCss = readFileSync('src/mobileViewport066.css', 'utf8');
const faces = readFileSync('src/systems/faces.ts', 'utf8');
const editor = readFileSync('src/ui/FaceImageEditor.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const splash = readFileSync('src/scenes/SplashScene069.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const index = readFileSync('index.html', 'utf8');
const manifest = readFileSync('public/manifest.webmanifest', 'utf8');
const camera = readFileSync('src/ui/FaceCameraCapture07033.ts', 'utf8');

assert.equal(DEFAULT_FACE_STYLE_PRESET, 'game-soft');
const preset: FaceStylePreset = DEFAULT_FACE_STYLE_PRESET;
assert.equal(preset, 'game-soft');

assert.match(main, /installMobileLandscapeGuard07031\(\)/);
assert.match(guard, /XOAY NGANG ĐIỆN THOẠI/);
assert.match(guard, /requireInitialMobileLandscape07032/);
assert.match(guard, /waitForMobileLandscapeAfterPicker07032/);
assert.match(guard, /recoverMobileLandscapeSilently07033/);
assert.match(guard, /No rotate dialog is shown again/);
assert.match(guard, /initialLandscapePending07033/);
assert.match(guard, /Only the first launch is allowed to block on portrait/i);
assert.match(guard, /orientation\.lock\('landscape'\)/);
assert.match(guard, /requestFullscreen/);
assert.match(guard, /portrait07031/);
assert.match(mobileCss, /mememe-landscape-guard/);
assert.match(mobileCss, /mememe-phone-portrait/);

assert.match(faces, /'game-soft': 'brightness\(1\.04\) contrast\(1\.12\) saturate\(1\.10\)'/);
assert.match(faces, /stylePreset: FaceStylePreset = DEFAULT_FACE_STYLE_PRESET/);
assert.match(faces, /ctx\.filter = FACE_STYLE_FILTERS\[stylePreset\]/);

assert.match(editor, /face-editor-landscape-body/);
assert.match(editor, /GAME SOFT/);
assert.match(editor, /ẢNH GỐC/);
assert.match(editor, /stylePreset = DEFAULT_FACE_STYLE_PRESET/);
assert.match(editor, /encodeFaceSticker\(image, resolved, stylePreset\)/);
assert.match(editor, /contextLabel = ''/);
assert.match(editor, /CHỈNH ẢNH\$\{contextLabel/);
assert(!editor.includes('recoverMobileLandscapeAfterPicker07031'));
assert.match(styles, /grid-template-columns: minmax\(260px, 340px\) 1fr/);
assert.match(styles, /pointer: coarse\) and \(orientation: landscape/);
assert.match(styles, /face-editor-landscape \.face-editor-controls \{ grid-template-columns: 1fr 1fr/);
assert.match(index, /manifest\.webmanifest/);
assert.match(manifest, /"orientation": "landscape"/);
assert.match(manifest, /"display": "fullscreen"/);
assert(!splash.includes('activateMobileLandscapeFromIntro07031'));
assert.match(splash, /CHẠM ĐỂ BẮT ĐẦU/);
assert.match(setup, /waitForMobileLandscapeAfterPicker07032\(\)/);
assert.match(setup, /prepareForNativePicker07033\(\)/);
assert.match(setup, /face-batch-\$\{playerId\}/);
assert.match(setup, /multiple/);
assert.match(setup, /CHỌN 3 ẢNH/);
assert.match(setup, /1 ẢNH CHO CẢ 3/);
assert.match(setup, /handleFaceBatchSelection/);
assert.match(setup, /files\.slice\(0, 3\)/);
assert.match(styles, /face-batch-actions/);
assert.match(styles, /face-batch-button/);
assert.match(setup, /CHỤP 3 BIỂU CẢM/);
assert.match(setup, /CHỤP 1 CHO CẢ 3/);
assert.match(setup, /FaceCameraCapture07033\.capture/);
assert.match(setup, /handleFaceCameraCapture/);
assert.match(camera, /navigator\.mediaDevices\.getUserMedia/);
assert.match(camera, /facingMode/);
assert.match(camera, /frameToFile/);
assert.match(camera, /CHỤP & XONG/);
assert.match(camera, /ĐỔI CAMERA/);
assert.match(styles, /face-camera-overlay/);
assert.match(styles, /face-camera-preview/);

console.log('[mobile-landscape-face-style-07031] PASS phone landscape guard + landscape face editor + default GAME SOFT preset');
