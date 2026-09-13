import jobsJson from '../content/core/jobs_mvp.json';
import { getBoardNode, getOutgoingEdges } from './board';
import {
  applyCardEffect,
  drawWeightedCard,
  pickRandomOtherTarget,
  type CardDefinition,
  type TacticalCardChoice,
} from './cards';
import {
  formatCommandValidationError,
  validateMatchCommandEnvelope,
} from './commandValidation';
import { rollD6 } from './dice';
import { resolveFunctionTileFoundation } from './functionTiles';
import {
  applyJobSelection,
  drawUniqueJobOffer,
  jobById,
  resolveCareerCheck,
  type JobDefinition,
} from './jobs';
import {
  advanceMatchTurn,
  appendMatchEvent,
  createInitialMatchState,
  type MatchCommand,
  type MatchState,
} from './matchState';
import { applyNewsEffect, drawWeightedNews, type NewsDefinition } from './news';
import { createRandomSource } from './rng';
import { MVP_CARD_HAND_LIMIT, MVP_MAX_CARD_PLAYS_PER_TURN } from './rules';
import { TurnPhaseMachine } from './turnPhase';
import type { BoardDefinition, BoardEdge, PlayerState } from './types';

const JOBS = jobsJson as JobDefinition[];

export interface ReplayCommandCheckpoint {
  seq: number;
  type: MatchCommand['type'];
  turnNumber: number;
  playerIndex: number;
  phase: MatchState['turn']['phase'];
  revision: number;
  checksum: string;
}

export interface ReplayResult {
  state: MatchState;
  consumedCommands: number;
  errors: string[];
  checkpoints: ReplayCommandCheckpoint[];
  failedCommandSeq?: number;
}

interface ReplayContext {
  state: MatchState;
  phase: TurnPhaseMachine;
  random: () => number;
  board: BoardDefinition;
  cards: CardDefinition[];
  news: NewsDefinition[];
  commands: MatchCommand[];
  checkpoints: ReplayCommandCheckpoint[];
  failedCommandSeq?: number;
}

type TileResolutionResult = 'done' | 'job_choice';

function currentPlayer(ctx: ReplayContext): PlayerState {
  const player = ctx.state.players[ctx.state.turn.currentPlayerIndex];
  if (!player) throw new Error(`Replay missing player index ${ctx.state.turn.currentPlayerIndex}.`);
  return player;
}

function transition(ctx: ReplayContext, next: Parameters<TurnPhaseMachine['transition']>[0]): void {
  ctx.phase.transition(next);
}

function failCommand(ctx: ReplayContext, command: MatchCommand, message: string): never {
  ctx.failedCommandSeq = command.seq;
  throw new Error(`Command #${command.seq} ${command.type}: ${message}`);
}

function validateCommand(ctx: ReplayContext, command: MatchCommand): void {
  const validation = validateMatchCommandEnvelope(ctx.state, command);
  if (!validation.ok) {
    ctx.failedCommandSeq = command.seq;
    throw new Error(formatCommandValidationError(command, validation));
  }

  ctx.checkpoints.push({
    seq: command.seq,
    type: command.type,
    turnNumber: ctx.state.turn.turnNumber,
    playerIndex: ctx.state.turn.currentPlayerIndex,
    phase: ctx.state.turn.phase,
    revision: ctx.state.turn.revision,
    checksum: validation.actualChecksum,
  });
}

function consumeSpectatorRandom(ctx: ReplayContext, excludedIds: number[]): number | undefined {
  const candidates = ctx.state.players.filter((player) => !excludedIds.includes(player.id));
  if (candidates.length === 0) return undefined;

  const index = Math.min(candidates.length - 1, Math.floor(ctx.random() * candidates.length));
  return candidates[index]?.id;
}

function resolveJobTile(ctx: ReplayContext, player: PlayerState, nodeId: number): TileResolutionResult {
  const currentJob = player.jobStatus === 'employed' ? jobById(JOBS, player.jobId) : undefined;
  if (currentJob) {
    const resolution = resolveCareerCheck(player, currentJob, ctx.random);
    appendMatchEvent(
      ctx.state,
      'job_progress',
      {
        nodeId,
        jobId: currentJob.id,
        jobTitle: currentJob.title,
        jobIcon: currentJob.icon,
        outcome: resolution.outcome,
        previousLevel: resolution.previousLevel,
        level: resolution.level,
        title: resolution.title,
        impact: currentJob.icon,
        description: resolution.summary,
        summary: resolution.summary,
        affectedPlayerIds: String(player.id),
      },
      player.id,
    );
    return 'done';
  }

  const offer = drawUniqueJobOffer(JOBS, ctx.random, 3);
  ctx.state.pendingJobOfferIds = offer.map((job) => job.id);
  ctx.state.pendingJobPlayerId = player.id;
  appendMatchEvent(
    ctx.state,
    'job_offer',
    {
      nodeId,
      optionIds: offer.map((job) => job.id).join(','),
      optionTitles: offer.map((job) => `${job.icon} ${job.title}`).join(' | '),
      title: 'CHỌN 1 TRONG 3 JOB',
      impact: '💼',
      description: 'Bạn bắt buộc ghé Job Hub. Chọn một trong ba nghề vừa xuất hiện.',
      summary: 'Pool hiện có 10 nghề. Mỗi vòng quay lại Job Hub sẽ kiểm tra thăng/hạ cấp hoặc biến cố nghề nghiệp.',
      affectedPlayerIds: String(player.id),
    },
    player.id,
  );
  return 'job_choice';
}

function resolveReplayTile(ctx: ReplayContext, player: PlayerState): TileResolutionResult {
  const node = getBoardNode(ctx.board, player.nodeId);

  appendMatchEvent(
    ctx.state,
    'tile_land',
    {
      nodeId: node.id,
      tileType: node.type,
      featureType: node.feature ?? null,
      contentId: node.contentId ?? null,
      value: node.value ?? 0,
      affectedPlayerIds: String(player.id),
    },
    player.id,
  );

  if (node.feature === 'job') {
    return resolveJobTile(ctx, player, node.id);
  }

  if (node.feature === 'minigame') {
    appendMatchEvent(
      ctx.state,
      'minigame_tile',
      {
        nodeId: node.id,
        featureType: 'minigame',
        contentId: node.contentId ?? 'MINIGAME_SLOT_01',
        title: 'MINI GAME',
        impact: '🎮',
        description: '3+ người: Nhiều ra ít bị. Phe sấp/ngửa thiểu số bị loại.',
        summary: 'Khi chỉ còn 1v1, hệ thống tự chuyển sang Oẳn Tù Xì. Engine luật đã khóa; UI trận con sẽ nối ở build kế.',
        status: 'rules_locked',
        affectedPlayerIds: ctx.state.players.map((entry) => entry.id).join(','),
      },
      player.id,
    );
    return 'done';
  }

  const functionTile = resolveFunctionTileFoundation(node, player);
  if (functionTile) {
    appendMatchEvent(
      ctx.state,
      functionTile.eventType,
      {
        nodeId: node.id,
        featureType: functionTile.kind,
        contentId: functionTile.contentId,
        title: functionTile.title,
        impact: functionTile.impact,
        description: functionTile.description,
        summary: functionTile.summary,
        status: 'foundation',
        affectedPlayerIds: functionTile.affectedPlayerIds.join(','),
      },
      player.id,
    );
    return 'done';
  }

  switch (node.type) {
    case 'money': {
      const amount = node.value ?? 0;
      player.money += amount;
      appendMatchEvent(ctx.state, 'money_tile', { nodeId: node.id, amount, resultMoney: player.money }, player.id);
      return 'done';
    }
    case 'card': {
      if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) {
        appendMatchEvent(ctx.state, 'card_draw_blocked', { nodeId: node.id, reason: 'hand_limit', affectedPlayerIds: String(player.id) }, player.id);
        return 'done';
      }
      const card = drawWeightedCard(ctx.cards, ctx.random);
      if (card) {
        player.handCardIds.push(card.id);
        appendMatchEvent(ctx.state, 'card_draw', {
          nodeId: node.id,
          cardId: card.id,
          title: card.title,
          rarity: card.rarity,
          impact: card.impact,
          description: card.description,
          affectedPlayerIds: String(player.id),
        }, player.id);
      }
      return 'done';
    }
    case 'news': {
      const news = drawWeightedNews(ctx.news, ctx.random);
      if (!news) return 'done';
      const resolution = applyNewsEffect(news, player, ctx.state.players);
      const spectatorId = consumeSpectatorRandom(ctx, [player.id]);
      appendMatchEvent(ctx.state, 'news', {
        nodeId: node.id,
        newsId: news.id,
        title: news.title,
        rarity: news.rarity,
        impact: news.impact,
        description: news.description,
        summary: resolution.summary,
        amount: resolution.amount ?? 0,
        reactionEventId: news.reactionEventId ?? null,
        spectatorId: spectatorId ?? -1,
        affectedPlayerIds: resolution.affectedPlayerIds.join(','),
      }, player.id);
      return 'done';
    }
    case 'ready':
    case 'normal':
      return 'done';
  }
}

function finishReplayTurn(ctx: ReplayContext, player: PlayerState): void {
  if (player.cardBlockTurns > 0) player.cardBlockTurns -= 1;
  player.cardsPlayedThisTurn = 0;
}

function finishAndAdvanceTurn(ctx: ReplayContext, player: PlayerState): void {
  transition(ctx, 'TURN_END');
  finishReplayTurn(ctx, player);
  advanceMatchTurn(ctx.state);
  transition(ctx, 'TURN_START');
  transition(ctx, 'PRE_ROLL_ACTION');
}

function findBranchEdge(ctx: ReplayContext, outgoing: BoardEdge[], command: MatchCommand): BoardEdge {
  if (command.type !== 'choose_branch') failCommand(ctx, command, `expected choose_branch, got ${command.type}.`);
  const to = Number(command.data.to);
  const edge = outgoing.find((candidate) => candidate.to === to);
  if (!edge) failCommand(ctx, command, `branch target ${String(command.data.to)} is not reachable.`);
  return edge;
}

function replayRoll(ctx: ReplayContext, commandIndex: number): number {
  const command = ctx.commands[commandIndex];
  const player = currentPlayer(ctx);
  if (command.type !== 'roll') failCommand(ctx, command, `expected roll, got ${command.type}.`);
  validateCommand(ctx, command);
  if (!ctx.phase.can('roll')) failCommand(ctx, command, `roll is invalid during ${ctx.phase.phase}.`);

  transition(ctx, 'ROLLING');
  const result = rollD6(ctx.random);
  ctx.state.turn.lastRoll = result;
  appendMatchEvent(ctx.state, 'dice_roll', { result, affectedPlayerIds: String(player.id) }, player.id);
  transition(ctx, 'MOVING');

  let consumedExtra = 0;
  for (let step = 0; step < result; step += 1) {
    const outgoing = getOutgoingEdges(ctx.board, player.nodeId);
    if (outgoing.length === 0) break;

    let edge = outgoing[0];
    if (outgoing.length > 1) {
      transition(ctx, 'BRANCH_CHOICE');
      const branchCommand = ctx.commands[commandIndex + consumedExtra + 1];
      if (!branchCommand) failCommand(ctx, command, `missing branch choice after node ${player.nodeId}.`);
      validateCommand(ctx, branchCommand);
      edge = findBranchEdge(ctx, outgoing, branchCommand);
      consumedExtra += 1;
      transition(ctx, 'MOVING');
    }

    const fromNodeId = player.nodeId;
    player.nodeId = edge.to;
    appendMatchEvent(ctx.state, 'move_step', {
      fromNodeId,
      toNodeId: edge.to,
      step: step + 1,
      roll: result,
      affectedPlayerIds: String(player.id),
    }, player.id);

    if (edge.to === ctx.board.startNodeId) {
      player.money += 100;
      appendMatchEvent(ctx.state, 'ready_pass', { amount: 100, resultMoney: player.money, affectedPlayerIds: String(player.id) }, player.id);
    }

    const steppedNode = getBoardNode(ctx.board, edge.to);
    if (steppedNode.feature === 'job') break;
  }

  transition(ctx, 'RESOLVING_TILE');
  const resolution = resolveReplayTile(ctx, player);
  if (resolution === 'job_choice') {
    transition(ctx, 'JOB_CHOICE');
    return consumedExtra;
  }

  finishAndAdvanceTurn(ctx, player);
  return consumedExtra;
}

function replayJobChoice(ctx: ReplayContext, command: MatchCommand): void {
  const player = currentPlayer(ctx);
  if (command.type !== 'choose_job') failCommand(ctx, command, `expected choose_job, got ${command.type}.`);
  validateCommand(ctx, command);
  if (!ctx.phase.can('choose_job')) failCommand(ctx, command, `job choice is invalid during ${ctx.phase.phase}.`);
  if (ctx.state.pendingJobPlayerId !== player.id) failCommand(ctx, command, 'pending Job offer belongs to another player.');

  const jobId = String(command.data.jobId ?? '');
  const offered = ctx.state.pendingJobOfferIds ?? [];
  if (!offered.includes(jobId)) failCommand(ctx, command, `${jobId} is not in the current 3-Job offer.`);
  const job = jobById(JOBS, jobId);
  if (!job) failCommand(ctx, command, `cannot find Job ${jobId}.`);

  applyJobSelection(player, job);
  delete ctx.state.pendingJobOfferIds;
  delete ctx.state.pendingJobPlayerId;
  appendMatchEvent(ctx.state, 'job_selected', {
    jobId: job.id,
    jobTitle: job.title,
    jobIcon: job.icon,
    level: 1,
    title: `${job.icon} NHẬN VIỆC`,
    impact: job.icon,
    description: `${player.name} chọn nghề ${job.title}.`,
    summary: 'Bắt đầu ở Lv.1. Lần sau qua Job Hub sẽ kiểm tra thăng/hạ cấp và biến cố nghề nghiệp.',
    affectedPlayerIds: String(player.id),
  }, player.id);
  finishAndAdvanceTurn(ctx, player);
}

function replayCard(ctx: ReplayContext, command: MatchCommand): void {
  const caster = currentPlayer(ctx);
  if (command.type !== 'play_card') failCommand(ctx, command, `expected play_card, got ${command.type}.`);
  validateCommand(ctx, command);
  if (!ctx.phase.can('use_card')) failCommand(ctx, command, `card use is invalid during ${ctx.phase.phase}.`);
  if (caster.cardBlockTurns > 0) failCommand(ctx, command, `${caster.name} is card-locked.`);
  if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) failCommand(ctx, command, `${caster.name} exceeded the MVP card-per-turn limit.`);

  const cardId = String(command.data.cardId ?? '');
  const handIndex = caster.handCardIds.indexOf(cardId);
  if (handIndex < 0) failCommand(ctx, command, `${caster.name} does not hold ${cardId}.`);
  const card = ctx.cards.find((entry) => entry.id === cardId);
  if (!card) failCommand(ctx, command, `cannot find card ${cardId}.`);

  transition(ctx, 'CARD_ACTION');
  let target: PlayerState | undefined;
  if (card.targetMode === 'single_other') {
    const targetId = Number(command.data.targetId);
    target = ctx.state.players.find((entry) => entry.id === targetId && entry.id !== caster.id);
    if (!target) failCommand(ctx, command, `cannot resolve target ${String(command.data.targetId)}.`);
  } else if (card.targetMode === 'random_other') {
    target = pickRandomOtherTarget(ctx.state.players, caster.id, ctx.random);
    if (!target) failCommand(ctx, command, 'random_other has no valid target.');
    const recordedTargetId = Number(command.data.targetId);
    if (Number.isFinite(recordedTargetId) && recordedTargetId >= 0 && recordedTargetId !== target.id) {
      failCommand(ctx, command, `random target mismatch: command P${recordedTargetId}, deterministic P${target.id}.`);
    }
  }

  const tacticalChoice = card.effect.type === 'tactical_choice'
    ? String(command.data.choice ?? '') as TacticalCardChoice
    : undefined;
  const resolution = applyCardEffect(card, caster, ctx.state.players, target, tacticalChoice);
  caster.handCardIds.splice(handIndex, 1);
  caster.cardsPlayedThisTurn += 1;

  const primaryTarget = target ?? ctx.state.players.find((entry) => entry.id !== caster.id && resolution.affectedPlayerIds.includes(entry.id));
  const spectatorId = consumeSpectatorRandom(ctx, [caster.id, ...(primaryTarget ? [primaryTarget.id] : [])]);
  const reactionEventId = primaryTarget && card.targetMode !== 'all_others' ? 'CARD_ATTACK_DEMO' : null;

  appendMatchEvent(ctx.state, 'card_play', {
    cardId: card.id,
    title: card.title,
    rarity: card.rarity,
    impact: card.impact,
    description: card.description,
    summary: resolution.summary,
    amount: resolution.amount ?? 0,
    targetId: primaryTarget?.id ?? -1,
    spectatorId: spectatorId ?? -1,
    reactionEventId,
    tacticalChoice: tacticalChoice ?? null,
    affectedPlayerIds: resolution.affectedPlayerIds.join(','),
  }, caster.id);
  transition(ctx, 'PRE_ROLL_ACTION');
}

export function replayMatchCommands(
  source: MatchState,
  board: BoardDefinition,
  cards: CardDefinition[],
  news: NewsDefinition[],
): ReplayResult {
  const state = createInitialMatchState({
    boardId: source.boardId,
    startNodeId: board.startNodeId,
    playerNames: source.players.map((player) => player.name),
    seed: source.seed,
    startingMoney: source.startingMoney,
  });
  const phase = new TurnPhaseMachine(state.turn);
  const ctx: ReplayContext = {
    state,
    phase,
    random: createRandomSource(state.rng),
    board,
    cards,
    news,
    commands: source.commandLog,
    checkpoints: [],
  };
  const errors: string[] = [];

  if (source.boardId !== board.id) {
    errors.push(`Board mismatch: snapshot ${source.boardId}, runtime ${board.id}.`);
    return { state, consumedCommands: 0, errors, checkpoints: [] };
  }

  transition(ctx, 'PRE_ROLL_ACTION');

  let index = 0;
  while (index < source.commandLog.length) {
    const command = source.commandLog[index];
    try {
      if (command.type === 'roll') {
        const extra = replayRoll(ctx, index);
        index += extra + 1;
        continue;
      }
      if (command.type === 'play_card') {
        replayCard(ctx, command);
        index += 1;
        continue;
      }
      if (command.type === 'choose_job') {
        replayJobChoice(ctx, command);
        index += 1;
        continue;
      }
      failCommand(ctx, command, `orphan choose_branch at sequence ${command.seq}.`);
    } catch (error) {
      if (ctx.failedCommandSeq === undefined) ctx.failedCommandSeq = command.seq;
      errors.push(error instanceof Error ? error.message : String(error));
      break;
    }
  }

  state.commandLog = source.commandLog.slice(0, index).map((command) => ({ ...command, data: { ...command.data } }));
  state.nextCommandSeq = state.commandLog.length + 1;

  return {
    state,
    consumedCommands: index,
    errors,
    checkpoints: ctx.checkpoints,
    failedCommandSeq: ctx.failedCommandSeq,
  };
}
