import { computeMatchChecksum } from './checksum';
import type { MatchEvent, MatchState } from './matchState';

export interface PlaytestPlayerReport061 {
  playerId: number;
  name: string;
  finalMoney: number;
  moneyDelta: number;
  lapsCompleted: number;
  finishOrder?: number;
  finishEventSeq?: number;
}

export interface PlaytestMatchReport061 {
  version: '0.1.61';
  boardId: string;
  seed: number;
  checksum: string;
  playerCount: number;
  startingMoney: number;
  turnsObserved: number;
  commandCount: number;
  eventCount: number;
  rngCalls: number;
  movementRolls: number;
  releaseRolls: number;
  lotteryRolls: number;
  cardsPlayed: number;
  newsTriggered: number;
  miniGamesTriggered: number;
  miniGamesSkipped: number;
  miniGameRewardTotal: number;
  jobOffers: number;
  jobsSelected: number;
  jobProgressChecks: number;
  jailReleaseAttempts: number;
  hospitalReleaseAttempts: number;
  lotteryCount: number;
  lotteryRewardTotal: number;
  finalMoneyTotal: number;
  finalMoneyAverage: number;
  finalMoneySpread: number;
  finishOrderPlayerIds: number[];
  players: PlaytestPlayerReport061[];
}

function countEvents(events: readonly MatchEvent[], type: string): number {
  return events.filter((event) => event.type === type).length;
}

function eventAmount(event: MatchEvent): number {
  const amount = Number(event.data.amount ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function rollKind(event: MatchEvent): string {
  return String(event.data.rollKind ?? 'movement');
}

export function buildPlaytestMatchReport061(match: MatchState): PlaytestMatchReport061 {
  const events = match.eventLog;
  const diceEvents = events.filter((event) => event.type === 'dice_roll');
  const finishEvents = events
    .filter((event) => event.type === 'ready_pass' && event.data.finishLocked === true)
    .slice()
    .sort((left, right) => left.seq - right.seq);
  const finishOrderPlayerIds = finishEvents
    .map((event) => event.actorId)
    .filter((id): id is number => Number.isInteger(id));
  const finishOrderByPlayer = new Map<number, { order: number; seq: number }>();
  finishEvents.forEach((event, index) => {
    if (event.actorId === undefined || finishOrderByPlayer.has(event.actorId)) return;
    finishOrderByPlayer.set(event.actorId, { order: index + 1, seq: event.seq });
  });

  const moneyValues = match.players.map((player) => player.money);
  const finalMoneyTotal = moneyValues.reduce((sum, value) => sum + value, 0);
  const maxMoney = moneyValues.length > 0 ? Math.max(...moneyValues) : 0;
  const minMoney = moneyValues.length > 0 ? Math.min(...moneyValues) : 0;
  const turnsObserved = events.length > 0
    ? Math.max(...events.map((event) => Math.max(1, event.turnNumber)))
    : Math.max(1, match.turn.turnNumber);

  const players: PlaytestPlayerReport061[] = match.players.map((player) => {
    const finish = finishOrderByPlayer.get(player.id);
    return {
      playerId: player.id,
      name: player.name,
      finalMoney: player.money,
      moneyDelta: player.money - match.startingMoney,
      lapsCompleted: Math.max(0, Math.floor(player.lapsCompleted ?? 0)),
      ...(finish ? { finishOrder: finish.order, finishEventSeq: finish.seq } : {}),
    };
  });

  const releaseEvents = events.filter((event) => event.type === 'special_release');
  return {
    version: '0.1.61',
    boardId: match.boardId,
    seed: match.seed,
    checksum: computeMatchChecksum(match),
    playerCount: match.players.length,
    startingMoney: match.startingMoney,
    turnsObserved,
    commandCount: match.commandLog.length,
    eventCount: events.length,
    rngCalls: match.rng.calls,
    movementRolls: diceEvents.filter((event) => !['lottery', 'jail_release', 'hospital_release'].includes(rollKind(event))).length,
    releaseRolls: diceEvents.filter((event) => ['jail_release', 'hospital_release'].includes(rollKind(event))).length,
    lotteryRolls: diceEvents.filter((event) => rollKind(event) === 'lottery').length,
    cardsPlayed: countEvents(events, 'card_play'),
    newsTriggered: countEvents(events, 'news'),
    miniGamesTriggered: countEvents(events, 'minigame_tile'),
    miniGamesSkipped: countEvents(events, 'minigame_skipped'),
    miniGameRewardTotal: events
      .filter((event) => event.type === 'minigame_reward')
      .reduce((sum, event) => sum + Math.max(0, eventAmount(event)), 0),
    jobOffers: countEvents(events, 'job_offer'),
    jobsSelected: countEvents(events, 'job_selected'),
    jobProgressChecks: countEvents(events, 'job_progress'),
    jailReleaseAttempts: releaseEvents.filter((event) => event.data.location === 'jail').length,
    hospitalReleaseAttempts: releaseEvents.filter((event) => event.data.location === 'hospital').length,
    lotteryCount: countEvents(events, 'lottery'),
    lotteryRewardTotal: events
      .filter((event) => event.type === 'lottery')
      .reduce((sum, event) => sum + Math.max(0, eventAmount(event)), 0),
    finalMoneyTotal,
    finalMoneyAverage: match.players.length > 0 ? Math.floor(finalMoneyTotal / match.players.length) : 0,
    finalMoneySpread: maxMoney - minMoney,
    finishOrderPlayerIds,
    players,
  };
}

function signedMoney(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}

export function formatPlaytestMatchReport061(report: PlaytestMatchReport061): string {
  const finish = report.finishOrderPlayerIds.length > 0
    ? report.finishOrderPlayerIds.map((id, index) => `#${index + 1} P${id + 1}`).join(' > ')
    : '(chưa có)';
  const playerLines = report.players.map((player) => {
    const finishLabel = player.finishOrder ? ` • đích #${player.finishOrder}` : '';
    return `P${player.playerId + 1} ${player.name}: ${player.finalMoney} B$ (${signedMoney(player.moneyDelta)}) • lap ${player.lapsCompleted}${finishLabel}`;
  });

  return [
    `MeMeMe PLAYTEST REPORT ${report.version}`,
    `board=${report.boardId} seed=${report.seed} checksum=${report.checksum}`,
    `players=${report.playerCount} start=${report.startingMoney}B$ turns=${report.turnsObserved} commands=${report.commandCount} events=${report.eventCount} rngCalls=${report.rngCalls}`,
    `rolls: move=${report.movementRolls} release=${report.releaseRolls} lottery=${report.lotteryRolls}`,
    `content: cards=${report.cardsPlayed} news=${report.newsTriggered} mini=${report.miniGamesTriggered} skippedMini=${report.miniGamesSkipped} jobs=${report.jobsSelected}/${report.jobOffers} progress=${report.jobProgressChecks}`,
    `special: jailRelease=${report.jailReleaseAttempts} hospitalRelease=${report.hospitalReleaseAttempts} lottery=${report.lotteryCount} (+${report.lotteryRewardTotal}B$)` ,
    `payout: mini=+${report.miniGameRewardTotal}B$ finalTotal=${report.finalMoneyTotal}B$ avg=${report.finalMoneyAverage}B$ spread=${report.finalMoneySpread}B$`,
    `finish: ${finish}`,
    ...playerLines,
  ].join('\n');
}
