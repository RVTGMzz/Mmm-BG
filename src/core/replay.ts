import { getBoardNode, getOutgoingEdges } from './board';
import {
  applyCardEffect,
  drawWeightedCard,
  pickRandomOtherTarget,
  type CardDefinition,
} from './cards';
import { rollD6 } from './dice';
import {
  advanceMatchTurn,
  createInitialMatchState,
  type MatchCommand,
  type MatchState,
} from './matchState';
import { applyNewsEffect, drawWeightedNews, type NewsDefinition } from './news';
import { createRandomSource } from './rng';
import { MVP_CARD_HAND_LIMIT, MVP_MAX_CARD_PLAYS_PER_TURN } from './rules';
import { TurnPhaseMachine } from './turnPhase';
import type { BoardDefinition, BoardEdge, PlayerState } from './types';

export interface ReplayResult {
  state: MatchState;
  consumedCommands: number;
  errors: string[];
}

interface ReplayContext {
  state: MatchState;
  phase: TurnPhaseMachine;
  random: () => number;
  board: BoardDefinition;
  cards: CardDefinition[];
  news: NewsDefinition[];
  commands: MatchCommand[];
}

function currentPlayer(ctx: ReplayContext): PlayerState {
  const player = ctx.state.players[ctx.state.turn.currentPlayerIndex];
  if (!player) throw new Error(`Replay missing player index ${ctx.state.turn.currentPlayerIndex}.`);
  return player;
}

function transition(ctx: ReplayContext, next: Parameters<TurnPhaseMachine['transition']>[0]): void {
  ctx.phase.transition(next);
}

function consumeSpectatorRandom(ctx: ReplayContext, excludedIds: number[]): void {
  const candidates = ctx.state.players.filter((player) => !excludedIds.includes(player.id));
  if (candidates.length > 0) ctx.random();
}

function resolveReplayTile(ctx: ReplayContext, player: PlayerState): void {
  const node = getBoardNode(ctx.board, player.nodeId);

  switch (node.type) {
    case 'money':
      player.money += node.value ?? 0;
      return;

    case 'card': {
      if (player.handCardIds.length >= MVP_CARD_HAND_LIMIT) return;
      const card = drawWeightedCard(ctx.cards, ctx.random);
      if (card) player.handCardIds.push(card.id);
      return;
    }

    case 'news': {
      const news = drawWeightedNews(ctx.news, ctx.random);
      if (!news) return;
      applyNewsEffect(news, player, ctx.state.players);
      consumeSpectatorRandom(ctx, [player.id]);
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

function findBranchEdge(outgoing: BoardEdge[], command: MatchCommand): BoardEdge {
  if (command.type !== 'choose_branch') {
    throw new Error(`Expected choose_branch command, got ${command.type}.`);
  }

  const to = Number(command.data.to);
  const edge = outgoing.find((candidate) => candidate.to === to);
  if (!edge) throw new Error(`Replay branch target ${String(command.data.to)} is not reachable.`);
  return edge;
}

function replayRoll(ctx: ReplayContext, commandIndex: number): number {
  const command = ctx.commands[commandIndex];
  const player = currentPlayer(ctx);

  if (command.type !== 'roll') throw new Error(`Expected roll command, got ${command.type}.`);
  if (command.actorId !== player.id) {
    throw new Error(`Roll actor mismatch: command P${command.actorId}, current P${player.id}.`);
  }
  if (!ctx.phase.can('roll')) throw new Error(`Roll is invalid during ${ctx.phase.phase}.`);

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
      if (!branchCommand) throw new Error(`Replay is missing branch choice after node ${player.nodeId}.`);
      if (branchCommand.actorId !== player.id) {
        throw new Error(`Branch actor mismatch: command P${branchCommand.actorId}, current P${player.id}.`);
      }
      edge = findBranchEdge(outgoing, branchCommand);
      consumedExtra += 1;
      transition(ctx, 'MOVING');
    }

    player.nodeId = edge.to;
    if (edge.to === ctx.board.startNodeId) player.money += 100;
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
  if (command.type !== 'play_card') throw new Error(`Expected play_card command, got ${command.type}.`);
  if (command.actorId !== caster.id) {
    throw new Error(`Card actor mismatch: command P${command.actorId}, current P${caster.id}.`);
  }
  if (!ctx.phase.can('use_card')) throw new Error(`Card use is invalid during ${ctx.phase.phase}.`);
  if (caster.cardBlockTurns > 0) throw new Error(`${caster.name} is card-locked during replay.`);
  if (caster.cardsPlayedThisTurn >= MVP_MAX_CARD_PLAYS_PER_TURN) {
    throw new Error(`${caster.name} exceeded the MVP card-per-turn limit during replay.`);
  }

  const cardId = String(command.data.cardId ?? '');
  const handIndex = caster.handCardIds.indexOf(cardId);
  if (handIndex < 0) throw new Error(`${caster.name} does not hold ${cardId} during replay.`);

  const card = ctx.cards.find((entry) => entry.id === cardId);
  if (!card) throw new Error(`Replay cannot find card ${cardId}.`);

  let target: PlayerState | undefined;
  if (card.targetMode === 'single_other') {
    const targetId = Number(command.data.targetId);
    target = ctx.state.players.find((player) => player.id === targetId && player.id !== caster.id);
    if (!target) throw new Error(`Replay cannot resolve target ${String(command.data.targetId)}.`);
  } else if (card.targetMode === 'random_other') {
    target = pickRandomOtherTarget(ctx.state.players, caster.id, ctx.random);
    if (!target) throw new Error(`Replay cannot draw a random target for ${card.id}.`);

    const recordedTargetId = Number(command.data.targetId);
    if (target.id !== recordedTargetId) {
      throw new Error(
        `Random target mismatch for ${card.id}: stream produced P${target.id}, command recorded P${recordedTargetId}.`,
      );
    }
  }

  transition(ctx, 'CARD_ACTION');
  const resolution = applyCardEffect(card, caster, ctx.state.players, target);
  caster.handCardIds.splice(handIndex, 1);
  caster.cardsPlayedThisTurn += 1;

  const primaryTarget =
    target ??
    ctx.state.players.find(
      (player) => player.id !== caster.id && resolution.affectedPlayerIds.includes(player.id),
    );
  consumeSpectatorRandom(ctx, [caster.id, ...(primaryTarget ? [primaryTarget.id] : [])]);
  transition(ctx, 'PRE_ROLL_ACTION');
}

/**
 * Rebuilds gameplay state from match seed + player names + explicit player commands.
 * Presentation event logs are not replayed. The returned state contains the same command stream.
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
  };
  const errors: string[] = [];

  if (source.boardId !== board.id) {
    errors.push(`Board mismatch: snapshot ${source.boardId}, runtime ${board.id}.`);
    return { state, consumedCommands: 0, errors };
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

      throw new Error(`Orphan choose_branch command at sequence ${command.seq}.`);
    } catch (error) {
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
  };
}
