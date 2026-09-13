import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  type ClientIntentType,
} from '../src/core/authority';
import { getOutgoingEdges } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import { computeMatchChecksum } from '../src/core/checksum';
import { demoMatchLapProgress, shouldEndDemoMatch } from '../src/core/demoMatch';
import {
  DemoShellClientSession,
  DemoShellHostSession,
  type DemoShellMessage,
} from '../src/core/demoShellSession';
import { InMemoryTransportHub } from '../src/core/localTransport';
import { serializeMatchState } from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import {
  TwoTabClientSession,
  TwoTabHostSession,
  type TwoTabMessage,
} from '../src/core/twoTabSession';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const ROOM = 'MEDEMO15';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const runtime = { board: BOARD, cards: CARDS, news: NEWS };
const authority = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['Host P1', 'Client P2', 'Host P3', 'Host P4'],
    seed: 150915,
  },
  runtime,
);

const gameHub = new InMemoryTransportHub<TwoTabMessage>();
const host = new TwoTabHostSession(ROOM, authority, gameHub.createEndpoint('host'));
const client = new TwoTabClientSession(ROOM, 'client-p2-demo', 1, gameHub.createEndpoint('client-p2-demo'));
host.start();
client.start();
assert(client.joined, 'Demo client failed to join game authority session.');

const shellHub = new InMemoryTransportHub<DemoShellMessage>();
const shellHost = new DemoShellHostSession(4, shellHub.createEndpoint('shell-host'), 3);
const shellClient = new DemoShellClientSession('shell-client', shellHub.createEndpoint('shell-client'));
shellHost.start();
shellClient.start();

assert(shellHost.shell.status === 'waiting', 'Demo shell should start waiting.');
assert(shellClient.shell?.status === 'waiting', 'Client did not receive waiting shell state.');
assert(shellHost.shell.turnLimit === 12, 'Legacy shell turnLimit metadata should remain backward-compatible.');
assert(!shouldEndDemoMatch(authority.state, shellHost.shell), 'Fresh match must not score before anybody completes a lap.');

shellHost.begin(hostAuthorityCommandSeq(authority));
assert(shellHost.shell.status === 'active', 'Host failed to start demo shell.');
assert(shellClient.shell?.status === 'active', 'Client did not receive active demo shell state.');

function submitForCurrent(type: ClientIntentType, data: Record<string, string | number | boolean | null> = {}): void {
  const current = authority.state.players[authority.state.turn.currentPlayerIndex];
  assert(current, 'Missing current player during demo fixture.');
  if (current.id === 1) client.submitIntent(type, data);
  else host.submitLocalIntent(type, current.id, data);
}

let safety = 0;
while (shellHost.shell.status === 'active' && safety < 240) {
  safety += 1;
  const current = authority.state.players[authority.state.turn.currentPlayerIndex];
  assert(current, 'Demo shell missing current player.');

  if (authority.state.turn.phase === 'PRE_ROLL_ACTION') {
    submitForCurrent('roll');
  } else if (authority.state.turn.phase === 'BRANCH_CHOICE') {
    const edge = getOutgoingEdges(BOARD, current.nodeId)[0];
    assert(edge, `Branch at node ${current.nodeId} has no outgoing edge.`);
    submitForCurrent('choose_branch', { to: edge.to });
  } else if (authority.state.turn.phase === 'JOB_CHOICE') {
    const jobId = authority.state.pendingJobOfferIds?.[0];
    assert(jobId, 'Demo shell Job choice missing offer.');
    submitForCurrent('choose_job', { jobId });
  } else {
    throw new Error(`Demo shell stalled in ${authority.state.turn.phase}.`);
  }

  if (shouldEndDemoMatch(authority.state, shellHost.shell)) {
    shellHost.finish(authority.state, hostAuthorityCommandSeq(authority));
  }
}

assert(safety < 240, 'One-lap match did not terminate inside safety limit.');
const lapProgress = demoMatchLapProgress(authority.state);
assert(lapProgress.completedPlayers === 4, `Expected all 4 players to finish one lap, got ${lapProgress.completedPlayers}/4.`);
assert(authority.state.players.every((player) => (player.lapsCompleted ?? 0) >= 1), 'Match ended before every player completed one lap.');
assert(shellHost.shell.status === 'ended', 'Host shell did not end after everybody completed one lap.');
assert(shellClient.shell?.status === 'ended', 'Client did not receive one-lap match-end shell state.');
assert(shellHost.shell.winnerIds.length >= 1, 'Demo match ended without winner.');
assert(JSON.stringify(shellClient.shell?.winnerIds) === JSON.stringify(shellHost.shell.winnerIds), 'Client winner list differs from host.');

const endedChecksum = computeMatchChecksum(authority.state);
const endedWinnerIds = [...shellHost.shell.winnerIds];
const fresh = createEmptyHostAuthority(
  {
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: authority.state.players.map((player) => player.name),
    seed: 150916,
    startingMoney: authority.state.startingMoney,
  },
  runtime,
);

authority.source = fresh.source;
authority.state = fresh.state;
authority.receipts.clear();
const rematchChecksum = computeMatchChecksum(fresh.state);
host.transport.send({
  kind: 'state',
  commandSeq: 0,
  checksum: rematchChecksum,
  serializedState: serializeMatchState(fresh.state),
});
shellHost.resetAndBegin(fresh.state.players.length, 0);

assert(shellHost.shell.status === 'active', 'Rematch shell did not restart active.');
assert(shellClient.shell?.status === 'active', 'Client did not receive rematch active state.');
assert(client.observedCommandSeq === 0, 'Client command boundary did not reset for rematch.');
assert(client.state?.turn.turnNumber === 1, 'Client match state did not reset to turn 1.');
assert(client.state?.players.every((player) => player.money === fresh.state.startingMoney), 'Client rematch money did not reset.');
assert(client.state?.players.every((player) => (player.lapsCompleted ?? 0) === 0), 'Client rematch lap progress did not reset.');

console.log(`[demo-shell-ci] PASS one-lap-score turns=${authority.source.turn.turnNumber - 1} endedChecksum=${endedChecksum} winners=${endedWinnerIds.map((id) => `P${id + 1}`).join('+')} rematchChecksum=${rematchChecksum}`);
console.log('[demo-shell-ci] probes: waiting sync PASS • start sync PASS • Job choice PASS • all players complete 1 lap PASS • score-after-lap PASS • winner sync PASS • rematch reset PASS');

shellHost.close();
shellClient.close();
host.close();
client.close();