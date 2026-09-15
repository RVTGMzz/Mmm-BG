import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntent,
} from '../src/core/authority';
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];

const junctions = BOARD.nodes.filter((node) => getOutgoingEdges(BOARD, node.id).length > 1);
assert.equal(junctions.length, 3, 'Draft D must retain exactly three luck junctions.');

for (const junction of junctions) {
  const outgoing = getOutgoingEdges(BOARD, junction.id);
  for (const roll of [1, 3, 5]) {
    const edge = pickParityEdge(outgoing, roll);
    assert(edge, `node ${junction.id} odd ${roll} has no route`);
    assert(edge.label?.includes('TRÁI'), `node ${junction.id} odd ${roll} must route LEFT, got ${edge.label}`);
  }
  for (const roll of [2, 4, 6]) {
    const edge = pickParityEdge(outgoing, roll);
    assert(edge, `node ${junction.id} even ${roll} has no route`);
    assert(edge.label?.includes('PHẢI'), `node ${junction.id} even ${roll} must route RIGHT, got ${edge.label}`);
  }
}

// Start directly on a junction so both odd and even D6 results must resolve a
// route immediately. On the canonical board, odd rolls can legitimately land
// exactly on the first junction with no remaining pip, so a first-turn-only
// seed sweep would unfairly observe only even routes.
const parityFixture: BoardDefinition = {
  id: 'parity-junction-062',
  name: '0.1.62 immediate parity junction fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: -20, y: 20, type: 'normal' },
    { id: 2, x: 20, y: 20, type: 'normal' },
    { id: 3, x: 0, y: 40, type: 'normal' },
    { id: 4, x: 0, y: 60, type: 'normal' },
  ],
  edges: [
    { from: 0, to: 1, route: 'branch', label: '← TRÁI · TEST' },
    { from: 0, to: 2, route: 'main', label: 'PHẢI → · TEST' },
    { from: 1, to: 3, route: 'merge' },
    { from: 2, to: 3, route: 'merge' },
    { from: 3, to: 4, route: 'main' },
    { from: 4, to: 0, route: 'main' },
  ],
};
const fixtureRuntime = { board: parityFixture, cards: CARDS, news: NEWS };
const fixtureEdges = getOutgoingEdges(parityFixture, 0);

const observed = new Map<string, { seed: number; to: number; hostSeq: number }>();
for (let seed = 620000; seed < 621024 && observed.size < 2; seed += 1) {
  const authority = createEmptyHostAuthority(
    {
      boardId: parityFixture.id,
      startNodeId: parityFixture.startNodeId,
      playerNames: ['P1', 'P2'],
      seed,
    },
    fixtureRuntime,
  );
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
  assert(actor, `seed ${seed} missing current actor`);
  const intent: ClientIntent = {
    intentId: `branch-062-${seed}`,
    clientId: 'branch-062-test',
    actorId: actor.id,
    type: 'roll',
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data: {},
  };
  const result = submitClientIntent(authority, intent);
  assert.equal(result.status, 'accepted', `seed ${seed} movement roll rejected: ${result.reason ?? 'unknown'}`);
  assert.notEqual(authority.state.turn.phase, 'BRANCH_CHOICE', 'HOST must never expose a manual branch pause after an accepted roll.');

  const auto = authority.source.commandLog.find(
    (command) => command.type === 'choose_branch' && command.data.automatic === true,
  );
  assert(auto, `seed ${seed} immediate-junction roll must produce an automatic branch command`);
  const parity = String(auto.data.parity);
  assert(parity === 'odd' || parity === 'even', `seed ${seed} auto branch missing parity marker`);
  assert(hostAuthorityCommandSeq(authority) >= 2, 'Auto branch must be committed as an authoritative command.');
  assert.equal(result.hostCommandSeq, hostAuthorityCommandSeq(authority), 'Roll receipt must acknowledge HOST auto-branch command sequence.');
  observed.set(parity, { seed, to: Number(auto.data.to), hostSeq: hostAuthorityCommandSeq(authority) });
}

assert(observed.has('odd'), 'Could not observe an odd LEFT auto-branch in deterministic immediate-junction sweep.');
assert(observed.has('even'), 'Could not observe an even RIGHT auto-branch in deterministic immediate-junction sweep.');

const oddTarget = observed.get('odd')!.to;
const evenTarget = observed.get('even')!.to;
assert(fixtureEdges.find((edge) => edge.to === oddTarget)?.label?.includes('TRÁI'), 'Observed odd HOST branch did not go LEFT.');
assert(fixtureEdges.find((edge) => edge.to === evenTarget)?.label?.includes('PHẢI'), 'Observed even HOST branch did not go RIGHT.');

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene062Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene062.ts', import.meta.url), 'utf8');
const scene063Source = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene063.ts', import.meta.url), 'utf8');
const authoritySource = readFileSync(new URL('../src/core/authority.ts', import.meta.url), 'utf8');

assert(mainSource.includes('CareerMinigameBoardScene063 as ActiveBoardScene'), '0.1.63 may wrap 0.1.62 but must remain the active runtime.');
assert(scene063Source.includes('extends CareerMinigameBoardScene062'), '0.1.63 must retain the 0.1.62 parity-routing runtime directly.');
assert(scene062Source.includes('extends CareerMinigameBoardScene061'), '0.1.62 must retain the 0.1.61 runtime chain.');
assert(scene062Source.includes('this.add.circle'), '0.1.62 movement spaces must render as circles.');
assert(scene062Source.includes('body.destroy()'), '0.1.62 must replace inherited rectangular tile bodies rather than stack both shapes.');
assert(scene062Source.includes('return 23'), '0.1.62 round-space baseline must remain available beneath the 0.1.63 polish layer.');
assert(scene062Source.includes('LẺ ← TRÁI • CHẴN → PHẢI'), 'Runtime must state the luck routing rule visibly.');
assert(!scene062Source.includes('showBranchPicker'), '0.1.62 active gameplay layer must not expose a manual branch picker.');
assert(CANONICAL_PRESENTATION_0561.normalFollowZoom >= 2.1, 'Active-token camera must retain the closer 0.1.62 framing.');
assert.equal(CANONICAL_PRESENTATION_0561.overviewZoom, 0.88, 'Overview must remain available at the established full-board framing.');
assert(authoritySource.includes('autoResolveParityBranches062'), 'HOST authority must own automatic branch resolution.');
assert(!authoritySource.includes('Math.random'), '0.1.62 branch luck must reuse the movement D6, never a second RNG stream.');

console.log(
  `[random-branch-round-tiles-062] PASS beneath 0.1.63 junctions=3 oddSeed=${observed.get('odd')!.seed} evenSeed=${observed.get('even')!.seed} zoom=${CANONICAL_PRESENTATION_0561.normalFollowZoom}`,
);
console.log('[random-branch-round-tiles-062] HOST odd=LEFT even=RIGHT • no manual pause • round baseline retained • Overview retained');
