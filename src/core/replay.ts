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
  jobOfferIndexForRoll,
  jobSalary,
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
import {
  isMiniGameRewardType,
  miniGameRewardForRank,
  parseRankingPlayerIds,
  validateMiniGameRanking,
} from './minigameRewards';
import { applyNewsEffect, drawWeightedNews, type NewsDefinition } from './news';
import { createRandomSource } from './rng';
import { MVP_CARD_HAND_LIMIT, MVP_MAX_CARD_PLAYS_PER_TURN } from './rules';
import {
  SPECIAL_LOCATION_057,
  isLotteryNode057,
  lotteryReward057,
  miniGameEligiblePlayers057,
  specialHoldForGate057,
  specialHoldNodeId057,
  specialReleasePath057,
  specialReleaseSucceeds057,
} from './specialLocations057';
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
        summary: currentJob.special,
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
      title: '3 JOB XUẤT HIỆN!',
      impact: '💼🎲',
      description: 'Không chọn trực tiếp. Hãy đổ xúc xắc Job: 1–2 = A • 3–4 = B • 5–6 = C.',
      summary: 'Mỗi nghề có lương riêng khi qua cổng và một nhịp rủi ro/đặc tính khác nhau.',
      affectedPlayerIds: String(player.id),
    },
    player.id,
  );
  return 'job_choice';
}

function enterSpecialHold057(ctx: ReplayContext, player: PlayerState, location: 'jail' | 'hospital'): void {
  const fromNodeId = player.nodeId;
  const toNodeId = specialHoldNodeId057(location);
  getBoardNode(ctx.board, toNodeId);
  player.specialHold = location;
  player.nodeId = toNodeId;

  appendMatchEvent(ctx.state, 'move_step', {
    fromNodeId,
    toNodeId,
    step: 0,
    roll: 0,
    specialMove: true,
    affectedPlayerIds: String(player.id),
  }, player.id);

  const rule = SPECIAL_LOCATION_057[location];
  appendMatchEvent(ctx.state, 'special_hold', {
    location,
    nodeId: toNodeId,
    title: location === 'jail' ? 'BỊ GIỮ TẠI ĐỒN' : 'NHẬP VIỆN',
    impact: rule.icon,
    description: location === 'jail'
      ? 'Lượt sau đổ xúc xắc: 1 / 3 / 5 để được thả.'
      : 'Lượt sau đổ xúc xắc: đúng 2 / 4 / 5 để xuất viện.',
    summary: 'Trượt điều kiện thì ở lại và kết thúc lượt. Thành công sẽ thoát hành lang rồi đổ một D6 di chuyển MỚI trong cùng lượt.',
    affectedPlayerIds: String(player.id),
  }, player.id);
}

function resolveSpecialLanding057(ctx: ReplayContext, player: PlayerState): boolean {
  const node = getBoardNode(ctx.board, player.nodeId);
  const hold = specialHoldForGate057(node);
  if (hold) {
    enterSpecialHold057(ctx, player, hold);
    return true;
  }

  if (!isLotteryNode057(node)) return false;

  const lotteryRoll = rollD6(ctx.random);
  const amount = lotteryReward057(lotteryRoll);
  player.money += amount;
  appendMatchEvent(ctx.state, 'dice_roll', {
    result: lotteryRoll,
    rollKind: 'lottery',
    affectedPlayerIds: String(player.id),
  }, player.id);
  appendMatchEvent(ctx.state, 'lottery', {
    nodeId: node.id,
    roll: lotteryRoll,
    amount,
    resultMoney: player.money,
    title: `XỔ SỐ • +${amount} B$`,
    impact: SPECIAL_LOCATION_057.lottery.icon,
    description: `${player.name} đổ ${lotteryRoll} × ${SPECIAL_LOCATION_057.lottery.multiplier} B$ = +${amount} B$.`,
    summary: 'M23 trả thưởng hoàn toàn bằng D6 authoritative của HOST.',
    affectedPlayerIds: String(player.id),
  }, player.id);
  return true;
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

  if (resolveSpecialLanding057(ctx, player)) return 'done';

  if (node.feature === 'job') {
    return resolveJobTile(ctx, player, node.id);
  }

  if (node.feature === 'minigame') {
    const eligible = miniGameEligiblePlayers057(ctx.state.players);
    if (eligible.length === 0) {
      appendMatchEvent(
        ctx.state,
        'minigame_skipped',
        {
          nodeId: node.id,
          featureType: 'minigame',
          contentId: node.contentId ?? 'MINIGAME_SLOT_01',
          title: 'MINI GAME • BỎ QUA',
          impact: '🎮⏭️',
          description: 'Không có người chơi đủ điều kiện vì tất cả đang ở Đồn/Bệnh viện.',
          summary: '0 người hợp lệ = bỏ Mini Game, không có payout.',
          status: 'no_eligible_players',
          affectedPlayerIds: '',
        },
        player.id,
      );
      return 'done';
    }

    appendMatchEvent(
      ctx.state,
      'minigame_tile',
      {
        nodeId: node.id,
        featureType: 'minigame',
        contentId: node.contentId ?? 'MINIGAME_SLOT_01',
        title: eligible.length === 1 ? 'MINI GAME • THẮNG MẶC ĐỊNH' : 'MINI GAME',
        impact: '🎮',
        description: eligible.length === 1
          ? `${eligible[0]?.name ?? 'Người chơi'} là người duy nhất đủ điều kiện và tự động hạng #1.`
          : '3+ người: Nhiều ra ít bị. Phe sấp/ngửa thiểu số bị loại.',
        summary: eligible.length === 1
          ? 'Người ở Đồn/Bệnh viện bị loại khỏi Mini Game. Hệ thống tự xếp người còn lại hạng #1.'
          : 'Người ở Đồn/Bệnh viện không tham gia. Khi còn đúng 1v1, hệ thống tự chuyển sang Oẳn Tù Xì.',
        status: eligible.length === 1 ? 'auto_rank_1' : 'rules_locked',
        eligibleCount: eligible.length,
        affectedPlayerIds: eligible.map((entry) => entry.id).join(','),
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

function replaySpecialReleaseRoll057(ctx: ReplayContext, command: MatchCommand, player: PlayerState): void {
  const location = player.specialHold;
  if (!location) failCommand(ctx, command, 'special release requested without holding state.');

  transition(ctx, 'ROLLING');
  const result = rollD6(ctx.random);
  ctx.state.turn.lastRoll = result;
  appendMatchEvent(ctx.state, 'dice_roll', {
    result,
    rollKind: `${location}_release`,
    affectedPlayerIds: String(player.id),
  }, player.id);
  transition(ctx, 'MOVING');

  const success = specialReleaseSucceeds057(location, result);
  appendMatchEvent(ctx.state, 'special_release', {
    location,
    result,
    success,
    title: success
      ? location === 'jail' ? 'ĐƯỢC THẢ!' : 'XUẤT VIỆN!'
      : location === 'jail' ? 'CHƯA ĐƯỢC THẢ' : 'CHƯA ĐƯỢC XUẤT VIỆN',
    impact: success ? '✅' : '⛔',
    description: success
      ? 'Thoát hành lang xong sẽ đổ một D6 di chuyển MỚI trong cùng lượt.'
      : 'Trượt điều kiện. Ở lại vị trí giữ và kết thúc lượt.',
    affectedPlayerIds: String(player.id),
  }, player.id);

  if (!success) {
    transition(ctx, 'RESOLVING_TILE');
    finishAndAdvanceTurn(ctx, player);
    return;
  }

  const exitPath = specialReleasePath057(location);
  exitPath.forEach((toNodeId, index) => {
    getBoardNode(ctx.board, toNodeId);
    const fromNodeId = player.nodeId;
    player.nodeId = toNodeId;
    appendMatchEvent(ctx.state, 'move_step', {
      fromNodeId,
      toNodeId,
      step: index + 1,
      roll: result,
      specialMove: true,
      affectedPlayerIds: String(player.id),
    }, player.id);
  });

  delete player.specialHold;
  // Release D6 is only the escape/recovery check. It must never become movement.
  ctx.state.turn.lastRoll = null;
  transition(ctx, 'PRE_ROLL_ACTION');
}

function replayRoll(ctx: ReplayContext, commandIndex: number): number {
  const command = ctx.commands[commandIndex];
  const player = currentPlayer(ctx);
  if (command.type !== 'roll') failCommand(ctx, command, `expected roll, got ${command.type}.`);
  validateCommand(ctx, command);
  if (!ctx.phase.can('roll')) failCommand(ctx, command, `roll is invalid during ${ctx.phase.phase}.`);

  if (player.specialHold) {
    replaySpecialReleaseRoll057(ctx, command, player);
    return 0;
  }

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
      player.lapsCompleted = (player.lapsCompleted ?? 0) + 1;
      const currentJob = player.jobStatus === 'employed' ? jobById(JOBS, player.jobId) : undefined;
      const salaryAmount = currentJob ? jobSalary(currentJob, player.jobLevel) : 0;
      player.money += salaryAmount;
      appendMatchEvent(ctx.state, 'ready_pass', {
        amount: salaryAmount,
        salaryAmount,
        resultMoney: player.money,
        lapsCompleted: player.lapsCompleted,
        jobId: currentJob?.id ?? null,
        jobTitle: currentJob?.title ?? null,
        jobIcon: currentJob?.icon ?? null,
        jobLevel: player.jobLevel ?? 0,
        affectedPlayerIds: String(player.id),
      }, player.id);
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
  if (!ctx.phase.can('choose_job')) failCommand(ctx, command, `Job dice is invalid during ${ctx.phase.phase}.`);
  if (ctx.state.pendingJobPlayerId !== player.id) failCommand(ctx, command, 'pending Job offer belongs to another player.');

  const offered = ctx.state.pendingJobOfferIds ?? [];
  if (offered.length !== 3) failCommand(ctx, command, `Job dice requires exactly 3 offers, got ${offered.length}.`);
  const result = rollD6(ctx.random);
  const offerIndex = jobOfferIndexForRoll(result);
  const jobId = offered[offerIndex];
  const job = jobById(JOBS, jobId);
  if (!job) failCommand(ctx, command, `cannot find rolled Job ${String(jobId)}.`);

  appendMatchEvent(ctx.state, 'job_dice_roll', {
    result,
    offerIndex,
    jobId: job.id,
    affectedPlayerIds: String(player.id),
  }, player.id);

  applyJobSelection(player, job);
  delete ctx.state.pendingJobOfferIds;
  delete ctx.state.pendingJobPlayerId;
  appendMatchEvent(ctx.state, 'job_selected', {
    jobId: job.id,
    jobTitle: job.title,
    jobIcon: job.icon,
    roll: result,
    offerIndex,
    level: 1,
    salary: jobSalary(job, 1),
    title: `${job.icon} 🎲 ${result} → NHẬN VIỆC`,
    impact: job.icon,
    description: `${player.name} đổ ${result}, trúng ${job.title} • lương Lv.1 ${jobSalary(job, 1)} B$/cổng.`,
    summary: job.special,
    affectedPlayerIds: String(player.id),
  }, player.id);
  finishAndAdvanceTurn(ctx, player);
}

function replayMiniGameResult(ctx: ReplayContext, command: MatchCommand): void {
  if (command.type !== 'resolve_minigame') failCommand(ctx, command, `expected resolve_minigame, got ${command.type}.`);
  validateCommand(ctx, command);

  const sourceEventSeq = Number(command.data.sourceEventSeq);
  if (!Number.isInteger(sourceEventSeq) || sourceEventSeq <= 0) {
    failCommand(ctx, command, 'sourceEventSeq must be a positive integer.');
  }

  const sourceEvent = ctx.state.eventLog.find(
    (event) => event.seq === sourceEventSeq && event.type === 'minigame_tile',
  );
  if (!sourceEvent) failCommand(ctx, command, `cannot find Mini Game event #${sourceEventSeq}.`);

  if (ctx.state.eventLog.some(
    (event) => event.type === 'minigame_reward' && Number(event.data.sourceEventSeq) === sourceEventSeq,
  )) {
    failCommand(ctx, command, `Mini Game event #${sourceEventSeq} is already resolved.`);
  }

  const gameType = String(command.data.gameType ?? '');
  if (!isMiniGameRewardType(gameType)) failCommand(ctx, command, `invalid Mini Game reward type ${gameType || '(empty)'}.`);

  const rankingPlayerIds = parseRankingPlayerIds(command.data.rankingPlayerIds);
  const participantPlayerIds = parseRankingPlayerIds(sourceEvent.data.affectedPlayerIds);
  const rankingError = validateMiniGameRanking(rankingPlayerIds, participantPlayerIds);
  if (rankingError) failCommand(ctx, command, rankingError);

  rankingPlayerIds.forEach((playerId, index) => {
    const player = ctx.state.players.find((entry) => entry.id === playerId);
    if (!player) failCommand(ctx, command, `cannot find ranked player P${playerId}.`);
    const rank = index + 1;
    const amount = miniGameRewardForRank(gameType, rank);
    player.money += amount;
    appendMatchEvent(ctx.state, 'minigame_reward', {
      sourceEventSeq,
      gameType,
      rank,
      amount,
      resultMoney: player.money,
      title: `HẠNG ${rank} MINI GAME`,
      impact: rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '4️⃣',
      description: amount > 0 ? `${player.name} nhận +${amount} B$.` : `${player.name} không nhận B$.`,
      affectedPlayerIds: String(player.id),
    }, player.id);
  });
}

function replayCard(ctx: ReplayContext, command: MatchCommand): void {
  const caster = currentPlayer(ctx);
  if (command.type !== 'play_card') failCommand(ctx, command, `expected play_card, got ${command.type}.`);
  validateCommand(ctx, command);
  if (!ctx.phase.can('use_card')) failCommand(ctx, command, `card use is invalid during ${ctx.phase.phase}.`);
  if (caster.specialHold) failCommand(ctx, command, `${caster.name} must resolve ${caster.specialHold} release before using cards.`);
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
    playOrder: source.playOrder,
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
      if (command.type === 'resolve_minigame') {
        replayMiniGameResult(ctx, command);
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
