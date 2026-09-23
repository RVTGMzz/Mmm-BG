import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rules = readFileSync('docs/CANONICAL_UI_UX_RULES.md', 'utf8');
const packageJson = readFileSync('package.json', 'utf8');
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');

assert.match(rules, /MANDATORY DESIGN CONTRACT/);
assert.match(rules, /Mobile readability is the baseline/);
assert.match(rules, /Summary first, detail on demand/);
assert.match(rules, /Maximum three persistent information lines/);
assert.match(rules, /Idle player HUD is compact; active player HUD expands/);
assert.match(rules, /Focus must communicate interaction/);
assert.match(rules, /Job Hub uses compact cards plus optional details/);
assert.match(rules, /Modal priority is absolute/);
assert.match(rules, /Text must stay inside its owner/);
assert.match(rules, /Floating bubbles must respect viewport edges/);
assert.match(rules, /Reduce copy before reducing font size/);
assert.match(rules, /Touch and keyboard are the supported input surface/);
// The web gamepad milestone superseded the old controller-deferred policy.
assert.match(rules, /Steam Deck web-controller routing is implemented/);
assert.match(rules, /real-device runtime acceptance is still pending/);
const main = readFileSync('src/main.ts', 'utf8');
assert.match(main, /installSteamDeckController070424\(game\)/);
assert.doesNotMatch(main, /installGlobalGamepadUiNavigation0651\(game\)/);
assert.match(rules, /Do not encode meaning only by colour/);
assert.match(rules, /Soft rounded surfaces are the default shape language/);
assert.match(rules, /soft rounded corners by default/);
assert.match(rules, /UI changes must preserve gameplay authority/);
assert.match(rules, /0\.1\.68\.2 is the first implementation pass required to follow this contract end-to-end/);
assert.match(rules, /0\.1\.69 \*\*First Impression Polish\*\*/);
assert.match(rules, /0\.1\.70\.4\.6 \*\*UI Interaction Pass\*\*/);
assert.match(packageJson, /"test:canonical-ui-ux"\s*:\s*"tsx tests\/canonical-ui-ux-contract\.ts"/);
assert.match(ci, /Canonical UI UX design contract[\s\S]*npm run test:canonical-ui-ux/);
console.log('[canonical-ui-ux] PASS mobile readability + disclosure + active HUD + modal ownership + soft corners + input parity + authority-safe contract');
