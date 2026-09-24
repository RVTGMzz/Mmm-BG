import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCharacterFaceCompositeCh02d } from '../src/core/characterFaceCompositeCh02d';

const fullNeutral = 'data:image/webp;base64,NONCIRCULAR_NEUTRAL';
const roundNeutral = 'data:image/webp;base64,CIRCULAR_NEUTRAL';
const fullAngry = 'data:image/webp;base64,NONCIRCULAR_ANGRY';
const roundAngry = 'data:image/webp;base64,CIRCULAR_ANGRY';

const faces = {
  neutral: {
    dataUrl: roundNeutral,
    compositeSourceDataUrl: fullNeutral,
    textureKey: 'neutral',
  },
  angry: {
    dataUrl: roundAngry,
    compositeSourceDataUrl: fullAngry,
    textureKey: 'angry',
  },
};

const neutral = resolveCharacterFaceCompositeCh02d(faces, 'neutral');
assert.equal(neutral?.sourceDataUrl, fullNeutral);
assert.equal(neutral?.sourceKind, 'non-circular');
assert.equal(neutral?.expression, 'neutral');

const panic = resolveCharacterFaceCompositeCh02d(faces, 'panic');
assert.equal(panic?.sourceDataUrl, fullAngry, 'panic should deterministically reuse angry capture');
assert.equal(panic?.sourceKind, 'non-circular');
assert.equal(panic?.expression, 'angry');

const legacy = resolveCharacterFaceCompositeCh02d({
  neutral: { dataUrl: roundNeutral, textureKey: 'legacy' },
}, 'neutral');
assert.equal(legacy?.sourceDataUrl, roundNeutral);
assert.equal(legacy?.sourceKind, 'legacy-avatar');

assert.equal(resolveCharacterFaceCompositeCh02d({}, 'happy'), undefined);

const setupSource = await readFile('src/scenes/SetupScene.ts', 'utf8');
const protocolSource = await readFile('src/core/turnOrderSession.ts', 'utf8');
const turnSource = await readFile('src/scenes/TurnOrderScene.ts', 'utf8');
const cssSource = await readFile('src/characterSelectCh02c.css', 'utf8');

assert(setupSource.includes('resolveCharacterFaceCompositeCh02d(player.faces'), 'Character Select must use the shared composite resolver');
assert(setupSource.includes('faceComposite.sourceDataUrl'), 'selected Character card must preview retained head source');
assert(protocolSource.includes('compositeFaces?: Partial<Record<TurnOrderFaceExpression07042, string>>'), 'online profile wire must carry non-circular sources');
assert(
  protocolSource.includes('composite.length <= 700_000')
    || protocolSource.includes('composite.length > 700_000'),
  'wire must bound composite image payloads',
);
assert(turnSource.includes('compositeSourceDataUrl: profile.compositeFaces?.[expression]'), 'remote profile must restore composite face source');
assert(cssSource.includes('does not crop to a hard circle'), 'preview CSS must explicitly preserve non-circular direction');

console.log('[character-face-composite-ch02d] PASS non-circular preference + reaction fallback + online propagation');
