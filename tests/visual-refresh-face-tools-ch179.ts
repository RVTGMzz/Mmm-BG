import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/visualRefreshCh17.css', 'utf8');
const editor = readFileSync('src/ui/FaceImageEditor.ts', 'utf8');
const camera = readFileSync('src/ui/FaceCameraCapture07033.ts', 'utf8');

assert.match(css, /CH-17\.9 Face Editor \/ Camera/);
assert.match(css, /\.face-editor::before/);
assert.match(css, /\.face-editor-stage-wrap \{/);
assert.match(css, /\.face-editor-filter-options button\.selected/);
assert.match(css, /\.face-editor-confirm \{/);
assert.match(css, /\.face-batch-button\.camera \{/);
assert.match(css, /\.face-camera-panel::before/);
assert.match(css, /\.face-camera-preview \{/);
assert.match(css, /\.face-camera-actions \.face-camera-shot/);

assert.match(editor, /renderFacePreview\(canvas, image, transform, stylePreset\)/);
assert.match(editor, /encodeFaceSticker\(image, resolved, stylePreset\)/);
assert.match(editor, /encodeFaceCompositeSource\(image, resolved, stylePreset\)/);
assert.match(editor, /clampFaceTransform\(transform\)/);

assert.match(camera, /navigator\.mediaDevices\.getUserMedia/);
assert.match(camera, /frameToFile\(video, facingMode === 'user', index\)/);
assert.match(camera, /stream\?\.getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);

assert.doesNotMatch(editor, /Math\.random\s*\(/);
assert.doesNotMatch(camera, /Math\.random\s*\(/);

console.log('[visual-refresh-face-tools-ch179] PASS Face Editor + Camera material refresh; transform/capture behavior retained');
