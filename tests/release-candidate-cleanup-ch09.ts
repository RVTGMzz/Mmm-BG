import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const html=readFileSync('index.html','utf8');
const manifest=JSON.parse(readFileSync('public/manifest.webmanifest','utf8')) as {name?:string;short_name?:string};
const playtest=readFileSync('public/PLAYTEST.txt','utf8');
const setup=readFileSync('src/scenes/SetupScene.ts','utf8');
const workflow=readFileSync('.github/workflows/ci.yml','utf8');
const splash=readFileSync('src/scenes/SplashScene069.ts','utf8');

assert.match(MEMEME_BUILD.version,/^0\.1\.70\.4\.\d+$/);
assert.equal(MEMEME_BUILD.lobbyHeader,`MMM • ${MEMEME_BUILD.version}`);
assert.match(MEMEME_BUILD.phase,/RELEASE CANDIDATE/);
assert.doesNotMatch(MEMEME_BUILD.lobbyHeader,/MeMeMe/);
assert.doesNotMatch(MEMEME_BUILD.boardHeader,/MeMeMe/);

assert.match(html,/<title>MMM Board Game • Playtest<\/title>/);
assert.doesNotMatch(html,/<title>MeMeMe/);
assert.equal(manifest.name,'MMM Board Game');
assert.equal(manifest.short_name,'MMM');

assert.match(playtest,new RegExp(`^MMM PLAYTEST ${MEMEME_BUILD.version.replaceAll('.', '\\.')}`, 'm'));
assert.doesNotMatch(playtest,/MeMeMe MVP|0\.1\.68|Copyright © 2026 MeMeMe/);
assert.match(playtest,/CH-08|reconnect|Socket cũ/i);
assert.match(playtest,/KHÓC NHÈ[\s\S]*40%/);
assert.match(playtest,/SECRET BABY[\s\S]*60%/);

assert.doesNotMatch(setup,/NEUTRAL PROOF/);
assert.match(setup,/character-layered-proof-ch02g/,'remove only dev label, not the approved layered runtime proof');
assert.ok(workflow.includes(MEMEME_BUILD.artifactName),'workflow artifact identity must match canonical buildInfo');
assert.doesNotMatch(workflow,/mmm-playtest-0\.1\.70\.4\.22-presentation-owner/);

// The old filename is retained intentionally until an approved MMM logo artwork exists.
assert.match(splash,/assets\/mememe-logo-main\.png/);

console.log('[release-candidate-cleanup-ch09] PASS MMM visible branding + current playtest guide + dev-label cleanup + RC artifact identity');
