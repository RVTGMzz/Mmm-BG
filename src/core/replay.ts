import { getBoardNode, getOutgoingEdges } from './board';
import {
  applyCardEffect,
  drawWeightedCard,
  pickRandomOtherTarget,
  type CardDefinition,
} from './cards';
import {
  formatCommandValidationError,
  validateMatchCommandEnvelope,
} from './commandValidation';
import { rollD6 } from './dice';
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

  // This consumes the exact same single RNG call as the previous presentation hook,
  // but now records which spectator that call selected so every synced client can
  // render the same reaction without consuming or guessing additional randomness.
  const index = Math.min(candidates.length - 1, Math.floor(ctx.random() * candidates.length));
  return candidates[index]?.id;
}

function resolveReplayTile(ctx: ReplayContext, player: PlayerState): void {
  const node = getBoardNode(ctx.board, player.nodeId);

  // Every resolved landing now emits a presentation-only event before its tile effect.
  // This gives host/client the same "I landed here" feedback without changing checksum,
  // authority, command order, or RNG consumption.
  appendMatchEvent(
    ctx.state,
    'tile_land',
    {
      nodeId: node.id,
      tileType: node.type,
      value: node.value ?? 0,
    },
    player.id,
  );

  switch (node.type) {
    case 'money': {
      const amount = node.value ?? 0;
      player.money += amount;
      appendMatchEvent(
        ctx.state,
        'money_tile',
        {
          nodeId: node.id,
          amount,
          resultMoney: player.money,
        },
        player.id,
      );
      return;
    }

    case 'card': {
      if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) {
        appendMatchEvent(
          ctx.state,
          'card_draw_blocked',
          { nodeId: node.id, reason: 'hand_limit' },
          player.id,
        );
        return;
      }
      const card = drawWeightedCard(ctx.cards, ctx.random);
      if (card) {
        player.handCardIds.push(card.id);
        appendMatchEvent(
          ctx.state,
          'card_draw',
          {
            nodeId: node.id,
            cardId: card.id,
            title: card.title,
            rarity: card.rarity,
            impact: card.impact,
            description: card.description,
          },
          player.id,
        );
      }
      return;
    }

    case 'news': {
      const news = drawWeightedNews(ctx.news, ctx.random);
      if (!news) return;
      const resolution = applyNewsEffect(news, player, ctx.state.players);
      const spectatorId = consumeSpectatorRandom(ctx, [player.id]);
      appendMatchEvent(
        ctx.state,
        'news',
        {
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
        },
        player.id,
      );
      return;
    }

    case 'ready':
    case 'normal':
      return;
  }
}

function finishReplayTurn(ctx: ReplayContext, player: PlayerState): void {
  if (player.cardBlockTurns > 0) player.cardBlockTurns -= 1;
  player.cardsPlayedThisTurn = 0;
}

function findBranchEdge(
  ctx: ReplayContext,
  outgoing: BoardEdge[],
  command: MatchCommand,
): BoardEdge {
  if (command.type !== 'choose_branch') {
    failCommand(ctx, command, `expected choose_branch, got ${command.type}.`);
  }

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
  transition(ctx, 'MOVING');

  let consumedExtra = 0;
  for (let step = 0; step < result; step += 1) {
    const outgoing = getOutgoingEdges(ctx.board, player.nodeId);
    if (outgoing.length === 0) break;

    let edge = outgoing[0];
    if (outgoing.length > 1) {
      transition(ctx, 'BRANCH_CHOICE');
      const branchCommand = ctx.commands[commandIndex + consumedExtra + 1];
      if (!branchCommand) {
        failCommand(ctx, command, `missing branch choice after node ${player.nodeId}.`);
      }
      validateCommand(ctx, branchCommand);
      edge = findBranchEdge(ctx, outgoing, branchCommand);
      consumedExtra += 1;
      transition(ctx, 'MOVING');
    }

    player.nodeId = edge.to;
    if (edge.to === ctx.board.startNodeId) {
      player.money += 100;
      appendMatchEvent(
        ctx.state,
        'ready_pass',
        { amount: 100, resultMoney: player.money },
        player.id,
      );
    }
  }

  transition(ctx, 'RESOLVING_TILE');
  resolveReplayTile(ctx, player);
  transition(ctx, 'TURN_END');
  finishReplayTurn(ctx, player);
  advanceMatchTurn(ctx.state);
  transition(ctx, 'TURN_START');
  transition(ctx, 'PRE_ROLL_ACTION');

  return consumedExtra;
}

function replayCard(ctx: ReplayContext, command: MatchCommand): void {
  const caster = currentPlayer(ctx);
  if (command.type !== 'play_card') failCommand(ctx, command, `expected play_card, got ${command.type}.`);

  validateCommand(ctx, command);
  if (!ctx.phase.can('use_card')) {
    failCommand(ctx, command, `card use is invalid during ${ctx.phase.phase}.`);
  }
  if (caster.cardBlockTurns > 0) failCommand(ctx, command, `${caster.name} is card-locked.`);
  if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) {
    failCommand(ctx, command, `${caster.name} exceeded the MVP card-per-turn limit.`);
  }

  const cardId = String(command.data.cardId ?? '');
  const handIndex = caster.handCardIds.indexOf(cardId);
  if (handIndex < 0) failCommand(ctx, command, `${caster.name} does not hold ${cardId}.`);

  const card = ctx.cards.find((entry) => entry.id === cardId);
  if (!card) failCommand(ctx, command, `cannot find card ${cardId}.`);

  transition(ctx, 'CARD_ACTION');

  let target: PlayerState | undefined;
  if (card.targetMode === 'single_other') {
    const targetId = Number(command.data.targetId);
    target = ctx.state.players.find((player) => player.id === targetId && player.id !== caster.id);
    if (!target) failCommand(ctx, command, `cannot resolve target ${String(command.data.targetId)}.`);
  } else if (card.targetMode === 'random_other') {
    target = pickRandomOtherTarget(ctx.state.players, caster.id, ctx.random);
    if (!target) failCommand(ctx, command, 'random_other has no valid target.');

    const recordedTargetId = Number(command.data.targetId);
    if (Number.isFinite(recordedTargetId) && recordedTargetId >= 0 && recordedTargetId !== target.id) {
      failCommand(
        ctx,
        command,
        `random target mismatch: command P${recordedTargetId}, deterministic P${target.id}.`,
      );
    }
  }

  const resolution = applyCardEffect(card, caster, ctx.state.players, target);
  caster.handCardIds.splice(handIndex, 1);
  caster.cardsPlayedThisTurn += 1;

  const primaryTarget =
    target ??
    ctx.state.players.find(
      (player) => player.id !== caster.id && resolution.affectedPlayerIds.includes(player.id),
    );
  const spectatorId = consumeSpectatorRandom(
    ctx,
    [caster.id, ...(primaryTarget ? [primaryTarget.id] : [])],
  );
  const reactionEventId =
    primaryTarget && card.targetMode !== 'all_others' ? 'CARD_ATTACK_DEMO' : null;

  appendMatchEvent(
    ctx.state,
    'card_play',
    {
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
    },
    caster.id,
  );

  transition(ctx, 'PRE_ROLL_ACTION');
}

/**
 * Rebuilds gameplay state from match seed + player names + explicit player commands.
 * Presentation event logs are rebuilt deterministically from the same command stream,
 * but are excluded from gameplay checksums and command envelope validation.
 */
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

      failCommand(ctx, command, `orphan choose_branch at sequence ${command.seq}.`);
    } catch (error) {
      if (ctx.failedCommandSeq === undefined) ctx.failedCommandSeq = command.seq;
      errors.push(error instanceof Error ? error.message : String(error));
      break;
    }
  }

  state.commandLog = source.commandLog.slice(0, index).map((command) => ({
    ...command,
    data: { ...command.data },
  }));
  state.nextCommandSeq = state.commandLog.length + 1;

  return {
    state,
    consumedCommands: index,
    errors,
    checkpoints: ctx.checkpoints,
    failedCommandSeq: ctx.failedCommandSeq,
  };
}
