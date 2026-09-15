import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntent,
} from '../src/core/authority';
import type { CardDefinition } from '../src/core/cards';
import { computeMatchChecksum } from '../src/core/checksum';
import type { NewsDefinition } from '../src/core/news';
import { chooseTestBotIntent } from '../src/core/testBot';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const DEMO_TURN_LIMIT = 12;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

interface BotRunResult {
  checksum: string;
  commands: number;
  rolls: number;
  releaseRolls: number;
  cards: number;
  branches: number;
}

function runAutoplay(seed: number): BotRunResult {
  const authority = createEmptyHostAuthority(
    {
      boardId: BOARD.id,
      startNodeId: BOARD.startNodeId,
      playerNames: ['CPU 1', 'CPU 2', 'CPU 3', 'CPU 4'],
      seed,
    },
    { board: BOARD, cards: CARDS, news: NEWS },
  );

  let safety = 0;
  let rolls = 0;
  let releaseRolls = 0;
  let cards = 0;
  let branches = 0;

  while (authority.state.turn.turnNumber <= DEMO_TURN_LIMIT && safety < 160) {
    safety += 1;
    const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
    assert(actor, `Missing actor at step ${safety}.`);

    const decision = chooseTestBotIntent(authority.state, BOARD, CARDS);
    assert(
      decision,
      `CPU had no decision at turn ${authority.state.turn.turnNumber} phase ${authority.state.turn.phase}.`,
    );

    if (decision.type === 'roll') {
      rolls += 1;
      if (actor.specialHold) releaseRolls += 1;
    }
    if (decision.type === 'play_card') cards += 1;
    if (decision.type === 'choose_branch') branches += 1;

    const intent: ClientIntent = {
      intentId: `cpu-${seed}-${safety}`,
      clientId: 'autoplay-ci',
      actorId: actor.id,
      type: decision.type,
      observedCommandSeq: hostAuthorityCommandSeq(authority),
      data: { ...decision.data },
    };

    const result = submitClientIntent(authority, intent);
    assert(
      result.status === 'accepted',
      `CPU intent rejected at step ${safety}: ${result.reason ?? decision.reason}`,
    );
  }

  assert(safety < 160, `CPU autoplay exceeded safety limit for seed ${seed}.`);
  assert(
    authority.state.turn.turnNumber === DEMO_TURN_LIMIT + 1,
    `CPU autoplay ended on turn ${authority.state.turn.turnNumber}, expected ${DEMO_TURN_LIMIT + 1}.`,
  );
  assert(
    authority.state.turn.phase === 'PRE_ROLL_ACTION',
    `CPU autoplay ended in unsafe phase ${authority.state.turn.phase}.`,
  );

  return {
    checksum: computeMatchChecksum(authority.state),
    commands: hostAuthorityCommandSeq(authority),
    rolls,
    releaseRolls,
    cards,
    branches,
  };
}

const deterministicA = runAutoplay(16021602);
const deterministicB = runAutoplay(16021602);
assert(
  deterministicA.checksum === deterministicB.checksum,
  `Same-seed CPU autoplay checksum mismatch: ${deterministicA.checksum} vs ${deterministicB.checksum}.`,
);
assert(
  deterministicA.commands === deterministicB.commands,
  `Same-seed CPU autoplay command count mismatch: ${deterministicA.commands} vs ${deterministicB.commands}.`,
);
assert(
  deterministicA.releaseRolls === deterministicB.releaseRolls,
  `Same-seed release-roll count mismatch: ${deterministicA.releaseRolls} vs ${deterministicB.releaseRolls}.`,
);

// 0.1.60 finish-lock can leave the last runner with a random-target Card but no
// active opponent. CPU must keep the Card and roll rather than sending a HOST-rejected intent.
const randomTargetCard = CARDS.find((card) => card.id === 'ACT_003');
assert(randomTargetCard?.targetMode === 'random_other', 'ACT_003 must remain the random-target regression fixture.');
const noTargetAuthority = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['Runner', 'Done 2', 'Done 3', 'Done 4'],
    seed: 611100,
  },
  { board: BOARD, cards: CARDS, news: NEWS },
);
const noTargetActor = noTargetAuthority.state.players[0];
assert(noTargetActor, 'Missing CPU fallback actor.');
noTargetActor.handCardIds = [randomTargetCard.id];
for (const opponent of noTargetAuthority.state.players.slice(1)) opponent.lapsCompleted = 1;
const noTargetDecision = chooseTestBotIntent(noTargetAuthority.state, BOARD, CARDS);
assert(noTargetDecision?.type === 'roll', `Random-target fallback must roll, got ${noTargetDecision?.type ?? 'none'}.`);
assert(noTargetActor.handCardIds.includes(randomTargetCard.id), 'Fallback must keep the unusable Card in hand.');

let totalRolls = 0;
let totalReleaseRolls = 0;
let totalCards = 0;
let totalBranches = 0;
let maxCommands = 0;
const MATCHES = 32;

for (let index = 0; index < MATCHES; index += 1) {
  const result = runAutoplay(16020000 + index);
  totalRolls += result.rolls;
  totalReleaseRolls += result.releaseRolls;
  totalCards += result.cards;
  totalBranches += result.branches;
  maxCommands = Math.max(maxCommands, result.commands);
}

const baseTurns = MATCHES * DEMO_TURN_LIMIT;
assert(totalRolls >= baseTurns, `Expected at least one roll per turn (${baseTurns}), got ${totalRolls}.`);
assert(totalRolls <= baseTurns * 2, `Special release flow produced too many rolls: ${totalRolls} for ${baseTurns} turns.`);
assert(totalReleaseRolls > 0, 'CPU stress fixture never exercised a Jail/Hospital release roll.');
assert(totalCards > 0, 'CPU stress fixture never exercised play_card.');
assert(totalBranches > 0, 'CPU stress fixture never exercised choose_branch.');

console.log(
  `[test-bot-ci] PASS matches=${MATCHES} turns=${baseTurns} rolls=${totalRolls} releaseRolls=${totalReleaseRolls} cards=${totalCards} branches=${totalBranches} maxCommands=${maxCommands} deterministic=${deterministicA.checksum}`,
);
console.log('[test-bot-ci] probes: normal-roll PASS • special-release PASS • card-use PASS • random-target-no-opponent fallback PASS • branch-choice PASS • no-deadlock PASS • same-seed PASS');
