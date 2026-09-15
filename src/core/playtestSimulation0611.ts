import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntent,
  type HostAuthorityRuntime,
} from './authority';
import { miniGameRewardType059 } from './minigameRewards';
import { isPlayerFinished060 } from './pacingEconomy060';
import {
  buildPlaytestMatchReport061,
  type PlaytestMatchReport061,
} from './playtestTelemetry061';
import { chooseTestBotIntent } from './testBot';

export interface FullMatchSimulation0611 {
  seed: number;
  report: PlaytestMatchReport061;
  submittedCommands: number;
  miniGameResolutions: number;
}

export interface SimulationMetric0611 {
  min: number;
  p50: number;
  p90: number;
  max: number;
  average: number;
}

export interface SimulationBatchSummary0611 {
  version: '0.1.61.1';
  matches: number;
  seedStart: number;
  seedEnd: number;
  turns: SimulationMetric0611;
  commands: SimulationMetric0611;
  finalMoneyTotal: SimulationMetric0611;
  finalMoneySpread: SimulationMetric0611;
  movementRolls: SimulationMetric0611;
  releaseRolls: SimulationMetric0611;
  cardsPlayed: SimulationMetric0611;
  newsTriggered: SimulationMetric0611;
  miniGamesTriggered: SimulationMetric0611;
  miniGameRewardTotal: SimulationMetric0611;
  jobsSelected: SimulationMetric0611;
  lotteryCount: SimulationMetric0611;
  lotteryRewardTotal: SimulationMetric0611;
  finishFirstSeatCounts: number[];
  moneyLeaderSeatCounts: number[];
  maxTurnSeed: number;
  maxSpreadSeed: number;
}

function parsePlayerIds(value: unknown): number[] {
  return String(value ?? '')
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry));
}

function rotateRanking(ids: readonly number[], seed: number, sourceEventSeq: number): number[] {
  if (ids.length <= 1) return [...ids];
  const sorted = [...ids].sort((left, right) => left - right);
  const offset = Math.abs((seed * 31 + sourceEventSeq * 17) % sorted.length);
  return sorted.slice(offset).concat(sorted.slice(0, offset));
}

function unresolvedMiniGameEvent(match: PlaytestMatchReport061 extends never ? never : import('./matchState').MatchState) {
  return match.eventLog.find((event) => {
    if (event.type !== 'minigame_tile') return false;
    return !match.eventLog.some(
      (candidate) =>
        candidate.type === 'minigame_reward' &&
        Number(candidate.data.sourceEventSeq) === event.seq,
    );
  });
}

function allPlayersFinished(match: import('./matchState').MatchState): boolean {
  return match.players.length > 0 && match.players.every((player) => isPlayerFinished060(player));
}

function submitMiniGameResolution0611(
  runtime: HostAuthorityRuntime,
  seed: number,
  authority: ReturnType<typeof createEmptyHostAuthority>,
  serial: number,
): boolean {
  const sourceEvent = unresolvedMiniGameEvent(authority.state);
  if (!sourceEvent) return false;

  const participantIds = parsePlayerIds(sourceEvent.data.affectedPlayerIds);
  if (participantIds.length === 0) return false;

  const contentId = String(sourceEvent.data.contentId ?? 'MINIGAME_SLOT_01');
  const baseType = participantIds.length === 2 ? 'rps' : 'majority_minority';
  const gameType = miniGameRewardType059(baseType, contentId);
  const rankingPlayerIds = rotateRanking(participantIds, seed, sourceEvent.seq);
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
  if (!actor) throw new Error(`Simulation seed ${seed}: missing current actor for Mini Game #${sourceEvent.seq}.`);

  const intent: ClientIntent = {
    intentId: `sim-${seed}-mini-${serial}-${sourceEvent.seq}`,
    clientId: 'host-system',
    actorId: actor.id,
    type: 'resolve_minigame',
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data: {
      sourceEventSeq: sourceEvent.seq,
      gameType,
      rankingPlayerIds: rankingPlayerIds.join(','),
    },
  };

  const receipt = submitClientIntent(authority, intent);
  if (receipt.status !== 'accepted') {
    throw new Error(
      `Simulation seed ${seed}: Mini Game #${sourceEvent.seq} rejected: ${receipt.reason ?? 'unknown reason'} (${runtime.board.id}).`,
    );
  }
  return true;
}

export function runFullMatchSimulation0611(
  runtime: HostAuthorityRuntime,
  seed: number,
  playerNames: readonly string[] = ['CPU 1', 'CPU 2', 'CPU 3', 'CPU 4'],
  safetyLimit = 1600,
): FullMatchSimulation0611 {
  const authority = createEmptyHostAuthority(
    {
      boardId: runtime.board.id,
      startNodeId: runtime.board.startNodeId,
      playerNames: [...playerNames],
      seed,
    },
    runtime,
  );

  let submittedCommands = 0;
  let miniGameResolutions = 0;
  let serial = 0;

  while (!allPlayersFinished(authority.state)) {
    if (submittedCommands >= safetyLimit) {
      throw new Error(
        `Simulation seed ${seed}: exceeded ${safetyLimit} commands at turn ${authority.state.turn.turnNumber} phase ${authority.state.turn.phase}.`,
      );
    }

    serial += 1;
    if (submitMiniGameResolution0611(runtime, seed, authority, serial)) {
      submittedCommands += 1;
      miniGameResolutions += 1;
      continue;
    }

    const actor = authority.state.players[authority.state.turn.currentPlayerIndex];
    if (!actor) {
      throw new Error(`Simulation seed ${seed}: missing actor at turn ${authority.state.turn.turnNumber}.`);
    }

    const decision = chooseTestBotIntent(authority.state, runtime.board, runtime.cards);
    if (!decision) {
      throw new Error(
        `Simulation seed ${seed}: bot has no decision at turn ${authority.state.turn.turnNumber} phase ${authority.state.turn.phase}.`,
      );
    }

    const intent: ClientIntent = {
      intentId: `sim-${seed}-${serial}`,
      clientId: 'simulation-lab-0611',
      actorId: actor.id,
      type: decision.type,
      observedCommandSeq: hostAuthorityCommandSeq(authority),
      data: { ...decision.data },
    };
    const receipt = submitClientIntent(authority, intent);
    if (receipt.status !== 'accepted') {
      throw new Error(
        `Simulation seed ${seed}: ${decision.type} rejected at turn ${authority.state.turn.turnNumber}: ${receipt.reason ?? decision.reason}.`,
      );
    }
    submittedCommands += 1;
  }

  // A Mini Game cannot live on READY, but keeping this explicit makes the simulator
  // robust if future board content ever changes while preserving the current rule set.
  while (submitMiniGameResolution0611(runtime, seed, authority, ++serial)) {
    submittedCommands += 1;
    miniGameResolutions += 1;
    if (submittedCommands >= safetyLimit) throw new Error(`Simulation seed ${seed}: Mini Game drain exceeded safety limit.`);
  }

  const report = buildPlaytestMatchReport061(authority.state);
  if (report.finishOrderPlayerIds.length !== authority.state.players.length) {
    throw new Error(
      `Simulation seed ${seed}: finish order has ${report.finishOrderPlayerIds.length}/${authority.state.players.length} players.`,
    );
  }

  return {
    seed,
    report,
    submittedCommands,
    miniGameResolutions,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function metric(values: readonly number[]): SimulationMetric0611 {
  if (values.length === 0) return { min: 0, p50: 0, p90: 0, max: 0, average: 0 };
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (ratio: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))] ?? 0;
  return {
    min: sorted[0] ?? 0,
    p50: percentile(0.5),
    p90: percentile(0.9),
    max: sorted.at(-1) ?? 0,
    average: round1(values.reduce((sum, value) => sum + value, 0) / values.length),
  };
}

export function summarizeSimulationBatch0611(runs: readonly FullMatchSimulation0611[]): SimulationBatchSummary0611 {
  if (runs.length === 0) throw new Error('Simulation batch requires at least one completed match.');
  const ordered = [...runs].sort((left, right) => left.seed - right.seed);
  const playerCount = Math.max(...runs.map((run) => run.report.playerCount));
  const finishFirstSeatCounts = Array.from({ length: playerCount }, () => 0);
  const moneyLeaderSeatCounts = Array.from({ length: playerCount }, () => 0);

  for (const run of runs) {
    const finishFirst = run.report.finishOrderPlayerIds[0];
    if (finishFirst !== undefined && finishFirstSeatCounts[finishFirst] !== undefined) finishFirstSeatCounts[finishFirst] += 1;
    const topMoney = Math.max(...run.report.players.map((player) => player.finalMoney));
    for (const player of run.report.players) {
      if (player.finalMoney === topMoney && moneyLeaderSeatCounts[player.playerId] !== undefined) {
        moneyLeaderSeatCounts[player.playerId] += 1;
      }
    }
  }

  const maxTurnRun = runs.reduce((best, run) => run.report.turnsObserved > best.report.turnsObserved ? run : best, runs[0]!);
  const maxSpreadRun = runs.reduce((best, run) => run.report.finalMoneySpread > best.report.finalMoneySpread ? run : best, runs[0]!);

  return {
    version: '0.1.61.1',
    matches: runs.length,
    seedStart: ordered[0]!.seed,
    seedEnd: ordered.at(-1)!.seed,
    turns: metric(runs.map((run) => run.report.turnsObserved)),
    commands: metric(runs.map((run) => run.report.commandCount)),
    finalMoneyTotal: metric(runs.map((run) => run.report.finalMoneyTotal)),
    finalMoneySpread: metric(runs.map((run) => run.report.finalMoneySpread)),
    movementRolls: metric(runs.map((run) => run.report.movementRolls)),
    releaseRolls: metric(runs.map((run) => run.report.releaseRolls)),
    cardsPlayed: metric(runs.map((run) => run.report.cardsPlayed)),
    newsTriggered: metric(runs.map((run) => run.report.newsTriggered)),
    miniGamesTriggered: metric(runs.map((run) => run.report.miniGamesTriggered)),
    miniGameRewardTotal: metric(runs.map((run) => run.report.miniGameRewardTotal)),
    jobsSelected: metric(runs.map((run) => run.report.jobsSelected)),
    lotteryCount: metric(runs.map((run) => run.report.lotteryCount)),
    lotteryRewardTotal: metric(runs.map((run) => run.report.lotteryRewardTotal)),
    finishFirstSeatCounts,
    moneyLeaderSeatCounts,
    maxTurnSeed: maxTurnRun.seed,
    maxSpreadSeed: maxSpreadRun.seed,
  };
}

function metricLine(label: string, value: SimulationMetric0611): string {
  return `${label}: avg=${value.average} min=${value.min} p50=${value.p50} p90=${value.p90} max=${value.max}`;
}

export function formatSimulationBaseline0611(summary: SimulationBatchSummary0611): string {
  return [
    `MeMeMe SIMULATION BASELINE ${summary.version}`,
    `matches=${summary.matches} seeds=${summary.seedStart}..${summary.seedEnd}`,
    metricLine('turns', summary.turns),
    metricLine('commands', summary.commands),
    metricLine('finalMoneyTotal', summary.finalMoneyTotal),
    metricLine('finalMoneySpread', summary.finalMoneySpread),
    metricLine('movementRolls', summary.movementRolls),
    metricLine('releaseRolls', summary.releaseRolls),
    metricLine('cardsPlayed', summary.cardsPlayed),
    metricLine('newsTriggered', summary.newsTriggered),
    metricLine('miniGamesTriggered', summary.miniGamesTriggered),
    metricLine('miniGameRewardTotal', summary.miniGameRewardTotal),
    metricLine('jobsSelected', summary.jobsSelected),
    metricLine('lotteryCount', summary.lotteryCount),
    metricLine('lotteryRewardTotal', summary.lotteryRewardTotal),
    `finishFirstSeatCounts=${summary.finishFirstSeatCounts.join(',')}`,
    `moneyLeaderSeatCounts=${summary.moneyLeaderSeatCounts.join(',')}`,
    `outliers: maxTurnsSeed=${summary.maxTurnSeed} maxSpreadSeed=${summary.maxSpreadSeed}`,
    'NOTE: deterministic CI bot baseline only; it is not a substitute for human pacing/feel feedback.',
  ].join('\n');
}
