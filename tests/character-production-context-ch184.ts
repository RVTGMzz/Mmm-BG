import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildPresentationModel } from '../src/ui/presentationModel';
import type { MatchEvent } from '../src/core/matchState';
import type { PlayerState } from '../src/core/types';

const players = [{ id: 0, name: 'P1', characterId: 'starter-crybaby' }] as unknown as PlayerState[];
const base = { seq: 10, actorId: 0, data: {} } as MatchEvent;

const passive = buildPresentationModel({ ...base, type: 'character_passive', data: { description: 'x' } } as MatchEvent, players);
assert.equal(passive?.contextEmotion, 'passive');

const hospitalFail = buildPresentationModel({ ...base, type: 'special_release', data: { location: 'hospital', success: false, result: 2 } } as MatchEvent, players);
assert.equal(hospitalFail?.contextEmotion, 'panic');

const jailSuccess = buildPresentationModel({ ...base, type: 'special_release', data: { location: 'jail', success: true, result: 6 } } as MatchEvent, players);
assert.equal(jailSuccess?.contextEmotion, 'happy');

const minigame = buildPresentationModel({ ...base, type: 'minigame_tile', data: { title: 'Mini' } } as MatchEvent, players);
assert.equal(minigame?.contextEmotion, 'shocked');

const layer = await readFile('src/ui/MatchPresentationLayer.ts', 'utf8');
const overlay = await readFile('src/ui/MiniGameOverlay.ts', 'utf8');
const quick = await readFile('src/scenes/MiniGameQuickScene.ts', 'utf8');

assert(layer.includes("setName('character-production-context-avatar-ch184')"));
assert(layer.includes("setName('character-context-custom-face-ch184')"));
assert(layer.indexOf('gameSession.getFace(playerId, uploadedExpression)') < layer.indexOf('const frame = characterProductionPortraitFrameCh182'),
  'uploaded face must remain first priority for contextual landing portraits');
assert(overlay.includes("setName('character-production-minigame-winner-ch184')"));
assert(overlay.includes("gameSession.getFace(winner.id, 'happy')"));
assert(quick.includes('CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182'));
assert(!layer.includes('Math.random()'));
assert(!overlay.includes('Math.random()'));

console.log('[character-production-context-ch184] PASS passive/special/Mini Game contextual portrait routing');
