import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import {
  miniGameRewardForRank,
  miniGameRewardType059,
  type MiniGameBaseRewardType,
  type MiniGameRewardType,
} from '../core/minigameRewards';
import {
  miniGameRewardCopy059,
  miniGameSlot059,
} from '../core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveMajorityMinorityRound,
  resolveRpsRound,
  type PalmChoice,
  type RpsChoice,
} from '../core/minigames';
import type { MatchEventValue } from '../core/matchState';
import type { PlayerState } from '../core/types';

export interface MiniGameOutcome {
  gameType: MiniGameRewardType;
  rankingPlayerIds: number[];
}

export interface MiniGameOverlayRun {
  root: Phaser.GameObjects.Container;
  done: Promise<MiniGameOutcome>;
}

type MiniGameHostSystem = {
  submitSystemIntent(
    type: 'resolve_minigame',
    data?: Record<string, MatchEventValue>,
  ): { status: 'accepted' | 'duplicate' | 'rejected'; reason?: string };
};

function deterministicBit(eventSeq: number, playerId: number, round: number): number {
  let value = (eventSeq * 1103515245 + (playerId + 1) * 12345 + round * 2654435761) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

function cpuPalm(eventSeq: number, playerId: number, round: number): PalmChoice {
  return deterministicBit(eventSeq, playerId, round) % 2 === 0 ? 'up' : 'down';
}

function cpuRps(eventSeq: number, playerId: number, round: number): RpsChoice {
  return (['rock', 'paper', 'scissors'] as const)[deterministicBit(eventSeq, playerId, round) % 3] ?? 'rock';
}

function rpsIcon(choice: RpsChoice): string {
  if (choice === 'rock') return '✊';
  if (choice === 'paper') return '🖐️';
  return '✌️';
}

function rpsLabel(choice: RpsChoice): string {
  if (choice === 'rock') return 'BÚA';
  if (choice === 'paper') return 'BAO';
  return 'KÉO';
}

function rewardTitle(gameType: MiniGameBaseRewardType): string {
  return gameType === 'rps' ? 'OẲN TÙ XÌ' : 'NHIỀU RA ÍT BỊ';
}

export function startMiniGameOverlay(
  scene: Phaser.Scene,
  players: readonly PlayerState[],
  eventSeq: number,
  contentId?: string,
): MiniGameOverlayRun {
  const slot = miniGameSlot059(contentId);
  const root = scene.add.container(640, 360).setDepth(990);
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.72).setInteractive();
  const panel = scene.add.rectangle(0, 0, 900, 540, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
  const title = scene.add.text(0, -224, `${slot.icon} ${slot.title}`, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '29px', fontStyle: 'bold', color: '#202020',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -184, `${slot.boardLabel} • ${slot.identity} • ${slot.description}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#6d655b', align: 'center', fixedWidth: 790,
  }).setOrigin(0.5);
  const stake = scene.add.text(0, -156, `NHIỀU RA ÍT BỊ: ${miniGameRewardCopy059(slot.contentId, 'majority_minority')}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#5d4773', align: 'center', fixedWidth: 780,
  }).setOrigin(0.5);
  const stage = scene.add.container(0, 22);
  root.add([backdrop, panel, title, subtitle, stake, stage]);

  const playerById = (id: number) => players.find((player) => player.id === id);
  const isInteractiveHuman = (id: number) => browserSession.current.mode === 'solo' && !browserSession.isCpuSeat(id);
  const clearStage = () => stage.removeAll(true);
  const wait = (ms: number) => new Promise<void>((resolve) => scene.time.delayedCall(ms, resolve));

  const choiceButtons = <T extends string>(
    player: PlayerState,
    choices: Array<{ value: T; icon: string; label: string; fill: number }>,
  ): Promise<T> => new Promise((resolve) => {
    clearStage();
    const prompt = scene.add.text(0, -95, `${player.name} • CHỌN KÍN`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '23px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const hint = scene.add.text(0, -58, 'Người khác chưa được xem lựa chọn của bạn.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#746a60',
    }).setOrigin(0.5);
    stage.add([prompt, hint]);
    const spacing = choices.length === 2 ? 210 : 185;
    choices.forEach((choice, index) => {
      const x = (index - (choices.length - 1) / 2) * spacing;
      const box = scene.add.rectangle(x, 35, 160, 155, choice.fill, 1)
        .setStrokeStyle(4, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const icon = scene.add.text(x, 8, choice.icon, { fontSize: '42px' }).setOrigin(0.5);
      const label = scene.add.text(x, 68, choice.label, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      box.on('pointerover', () => box.setScale(1.035));
      box.on('pointerout', () => box.setScale(1));
      box.on('pointerdown', () => {
        sfxController.play('ui_confirm');
        resolve(choice.value);
      });
      stage.add([box, icon, label]);
    });
  });

  const showResult = async (heading: string, body: string, ms = 1700) => {
    clearStage();
    const head = scene.add.text(0, -40, heading, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#202020', align: 'center',
    }).setOrigin(0.5);
    const text = scene.add.text(0, 35, body, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#4f4740', align: 'center', fixedWidth: 680, lineSpacing: 7,
    }).setOrigin(0.5);
    stage.add([head, text]);
    await wait(ms);
  };

  const showRpsDuel = async (
    a: PlayerState,
    b: PlayerState,
    choiceA: RpsChoice,
    choiceB: RpsChoice,
    tied: boolean,
    winnerId?: number,
  ) => {
    clearStage();
    subtitle.setText(`${slot.title} • 1 VS 1 • OẲN TÙ XÌ`);
    stake.setText(`OẲN TÙ XÌ: ${miniGameRewardCopy059(slot.contentId, 'rps')}`);

    const leftName = scene.add.text(-235, -108, a.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '21px', fontStyle: 'bold', color: '#202020', fixedWidth: 240, align: 'center',
    }).setOrigin(0.5);
    const rightName = scene.add.text(235, -108, b.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '21px', fontStyle: 'bold', color: '#202020', fixedWidth: 240, align: 'center',
    }).setOrigin(0.5);
    const leftCard = scene.add.rectangle(-235, 18, 260, 235, 0xffe09a, 1).setStrokeStyle(5, 0x242424, 1);
    const rightCard = scene.add.rectangle(235, 18, 260, 235, 0xd1b0f0, 1).setStrokeStyle(5, 0x242424, 1);
    const leftIcon = scene.add.text(-235, 5, '✊', { fontSize: '84px' }).setOrigin(0.5);
    const rightIcon = scene.add.text(235, 5, '✊', { fontSize: '84px' }).setOrigin(0.5);
    const leftChoice = scene.add.text(-235, 92, '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const rightChoice = scene.add.text(235, 92, '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const vs = scene.add.text(0, 0, 'VS', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ef4545',
    }).setOrigin(0.5);
    const chant = scene.add.text(0, 142, 'CHUẨN BỊ...', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#5d4773',
    }).setOrigin(0.5);
    const verdict = scene.add.text(0, 180, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#202020', align: 'center', fixedWidth: 700,
    }).setOrigin(0.5);
    stage.add([leftCard, rightCard, leftName, rightName, leftIcon, rightIcon, leftChoice, rightChoice, vs, chant, verdict]);

    const cycle = ['✊', '🖐️', '✌️'];
    const beats = ['OẲN...', 'TÙ...', 'XÌ!'];
    for (let index = 0; index < beats.length; index += 1) {
      chant.setText(beats[index]!);
      leftIcon.setText(cycle[index % cycle.length]!);
      rightIcon.setText(cycle[(index + 1) % cycle.length]!);
      scene.tweens.add({
        targets: [leftIcon, rightIcon],
        scaleX: 1.16,
        scaleY: 1.16,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut',
      });
      await wait(index === beats.length - 1 ? 420 : 330);
    }

    leftIcon.setText(rpsIcon(choiceA));
    rightIcon.setText(rpsIcon(choiceB));
    leftChoice.setText(rpsLabel(choiceA));
    rightChoice.setText(rpsLabel(choiceB));
    chant.setText('LẬT KÈO!');
    scene.tweens.add({
      targets: [leftIcon, rightIcon],
      scaleX: 1.24,
      scaleY: 1.24,
      duration: 145,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    scene.cameras.main.shake(95, 0.0011);
    await wait(520);

    if (tied) {
      verdict.setText('🤝 HÒA! CHƠI LẠI');
    } else {
      const winner = playerById(winnerId ?? -1);
      verdict.setText(`🏆 ${winner?.name ?? '???'} THẮNG KÈO!`);
      if (winnerId === a.id) leftCard.setStrokeStyle(7, 0xffd34d, 1);
      if (winnerId === b.id) rightCard.setStrokeStyle(7, 0xffd34d, 1);
    }
    await wait(tied ? 900 : 1150);
  };

  const showRanking = async (rankingPlayerIds: readonly number[], baseType: MiniGameBaseRewardType) => {
    if (rankingPlayerIds.length === 0) return;
    clearStage();
    title.setVisible(false);
    subtitle.setVisible(false);
    stake.setVisible(false);

    const payoutType = miniGameRewardType059(baseType, slot.contentId);
    const heading = scene.add.text(0, -126, '🏆 BẢNG XẾP HẠNG', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const medals = ['🥇', '🥈', '🥉', '4️⃣'];
    const rows = rankingPlayerIds.map((id, index) => {
      const player = playerById(id);
      const reward = miniGameRewardForRank(payoutType, index + 1);
      return `${medals[index] ?? `${index + 1}.`} Hạng ${index + 1} • ${player?.name ?? `P${id + 1}`} • ${reward > 0 ? `+${reward}` : '0'} Bimport Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import {
  miniGameRewardForRank,
  miniGameRewardType059,
  type MiniGameBaseRewardType,
  type MiniGameRewardType,
} from '../core/minigameRewards';
import {
  miniGameRewardCopy059,
  miniGameSlot059,
} from '../core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveMajorityMinorityRound,
  resolveRpsRound,
  type PalmChoice,
  type RpsChoice,
} from '../core/minigames';
import type { MatchEventValue } from '../core/matchState';
import type { PlayerState } from '../core/types';

export interface MiniGameOutcome {
  gameType: MiniGameRewardType;
  rankingPlayerIds: number[];
}

export interface MiniGameOverlayRun {
  root: Phaser.GameObjects.Container;
  done: Promise<MiniGameOutcome>;
}

type MiniGameHostSystem = {
  submitSystemIntent(
    type: 'resolve_minigame',
    data?: Record<string, MatchEventValue>,
  ): { status: 'accepted' | 'duplicate' | 'rejected'; reason?: string };
};

function deterministicBit(eventSeq: number, playerId: number, round: number): number {
  let value = (eventSeq * 1103515245 + (playerId + 1) * 12345 + round * 2654435761) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

function cpuPalm(eventSeq: number, playerId: number, round: number): PalmChoice {
  return deterministicBit(eventSeq, playerId, round) % 2 === 0 ? 'up' : 'down';
}

function cpuRps(eventSeq: number, playerId: number, round: number): RpsChoice {
  return (['rock', 'paper', 'scissors'] as const)[deterministicBit(eventSeq, playerId, round) % 3] ?? 'rock';
}

function rpsIcon(choice: RpsChoice): string {
  if (choice === 'rock') return '✊';
  if (choice === 'paper') return '🖐️';
  return '✌️';
}

function rpsLabel(choice: RpsChoice): string {
  if (choice === 'rock') return 'BÚA';
  if (choice === 'paper') return 'BAO';
  return 'KÉO';
}

function rewardTitle(gameType: MiniGameBaseRewardType): string {
  return gameType === 'rps' ? 'OẲN TÙ XÌ' : 'NHIỀU RA ÍT BỊ';
}

export function startMiniGameOverlay(
  scene: Phaser.Scene,
  players: readonly PlayerState[],
  eventSeq: number,
  contentId?: string,
): MiniGameOverlayRun {
  const slot = miniGameSlot059(contentId);
  const root = scene.add.container(640, 360).setDepth(990);
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.72).setInteractive();
  const panel = scene.add.rectangle(0, 0, 900, 540, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
  const title = scene.add.text(0, -224, `${slot.icon} ${slot.title}`, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '29px', fontStyle: 'bold', color: '#202020',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -184, `${slot.boardLabel} • ${slot.identity} • ${slot.description}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#6d655b', align: 'center', fixedWidth: 790,
  }).setOrigin(0.5);
  const stake = scene.add.text(0, -156, `NHIỀU RA ÍT BỊ: ${miniGameRewardCopy059(slot.contentId, 'majority_minority')}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#5d4773', align: 'center', fixedWidth: 780,
  }).setOrigin(0.5);
  const stage = scene.add.container(0, 22);
  root.add([backdrop, panel, title, subtitle, stake, stage]);

  const playerById = (id: number) => players.find((player) => player.id === id);
  const isInteractiveHuman = (id: number) => browserSession.current.mode === 'solo' && !browserSession.isCpuSeat(id);
  const clearStage = () => stage.removeAll(true);
  const wait = (ms: number) => new Promise<void>((resolve) => scene.time.delayedCall(ms, resolve));

  const choiceButtons = <T extends string>(
    player: PlayerState,
    choices: Array<{ value: T; icon: string; label: string; fill: number }>,
  ): Promise<T> => new Promise((resolve) => {
    clearStage();
    const prompt = scene.add.text(0, -95, `${player.name} • CHỌN KÍN`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '23px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const hint = scene.add.text(0, -58, 'Người khác chưa được xem lựa chọn của bạn.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#746a60',
    }).setOrigin(0.5);
    stage.add([prompt, hint]);
    const spacing = choices.length === 2 ? 210 : 185;
    choices.forEach((choice, index) => {
      const x = (index - (choices.length - 1) / 2) * spacing;
      const box = scene.add.rectangle(x, 35, 160, 155, choice.fill, 1)
        .setStrokeStyle(4, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const icon = scene.add.text(x, 8, choice.icon, { fontSize: '42px' }).setOrigin(0.5);
      const label = scene.add.text(x, 68, choice.label, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      box.on('pointerover', () => box.setScale(1.035));
      box.on('pointerout', () => box.setScale(1));
      box.on('pointerdown', () => {
        sfxController.play('ui_confirm');
        resolve(choice.value);
      });
      stage.add([box, icon, label]);
    });
  });

  const showResult = async (heading: string, body: string, ms = 1700) => {
    clearStage();
    const head = scene.add.text(0, -40, heading, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#202020', align: 'center',
    }).setOrigin(0.5);
    const text = scene.add.text(0, 35, body, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#4f4740', align: 'center', fixedWidth: 680, lineSpacing: 7,
    }).setOrigin(0.5);
    stage.add([head, text]);
    await wait(ms);
  };

  const showRpsDuel = async (
    a: PlayerState,
    b: PlayerState,
    choiceA: RpsChoice,
    choiceB: RpsChoice,
    tied: boolean,
    winnerId?: number,
  ) => {
    clearStage();
    subtitle.setText(`${slot.title} • 1 VS 1 • OẲN TÙ XÌ`);
    stake.setText(`OẲN TÙ XÌ: ${miniGameRewardCopy059(slot.contentId, 'rps')}`);

    const leftName = scene.add.text(-235, -108, a.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '21px', fontStyle: 'bold', color: '#202020', fixedWidth: 240, align: 'center',
    }).setOrigin(0.5);
    const rightName = scene.add.text(235, -108, b.name, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '21px', fontStyle: 'bold', color: '#202020', fixedWidth: 240, align: 'center',
    }).setOrigin(0.5);
    const leftCard = scene.add.rectangle(-235, 18, 260, 235, 0xffe09a, 1).setStrokeStyle(5, 0x242424, 1);
    const rightCard = scene.add.rectangle(235, 18, 260, 235, 0xd1b0f0, 1).setStrokeStyle(5, 0x242424, 1);
    const leftIcon = scene.add.text(-235, 5, '✊', { fontSize: '84px' }).setOrigin(0.5);
    const rightIcon = scene.add.text(235, 5, '✊', { fontSize: '84px' }).setOrigin(0.5);
    const leftChoice = scene.add.text(-235, 92, '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const rightChoice = scene.add.text(235, 92, '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const vs = scene.add.text(0, 0, 'VS', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ef4545',
    }).setOrigin(0.5);
    const chant = scene.add.text(0, 142, 'CHUẨN BỊ...', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#5d4773',
    }).setOrigin(0.5);
    const verdict = scene.add.text(0, 180, '', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#202020', align: 'center', fixedWidth: 700,
    }).setOrigin(0.5);
    stage.add([leftCard, rightCard, leftName, rightName, leftIcon, rightIcon, leftChoice, rightChoice, vs, chant, verdict]);

    const cycle = ['✊', '🖐️', '✌️'];
    const beats = ['OẲN...', 'TÙ...', 'XÌ!'];
    for (let index = 0; index < beats.length; index += 1) {
      chant.setText(beats[index]!);
      leftIcon.setText(cycle[index % cycle.length]!);
      rightIcon.setText(cycle[(index + 1) % cycle.length]!);
      scene.tweens.add({
        targets: [leftIcon, rightIcon],
        scaleX: 1.16,
        scaleY: 1.16,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut',
      });
      await wait(index === beats.length - 1 ? 420 : 330);
    }

    leftIcon.setText(rpsIcon(choiceA));
    rightIcon.setText(rpsIcon(choiceB));
    leftChoice.setText(rpsLabel(choiceA));
    rightChoice.setText(rpsLabel(choiceB));
    chant.setText('LẬT KÈO!');
    scene.tweens.add({
      targets: [leftIcon, rightIcon],
      scaleX: 1.24,
      scaleY: 1.24,
      duration: 145,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    scene.cameras.main.shake(95, 0.0011);
    await wait(520);

    if (tied) {
      verdict.setText('🤝 HÒA! CHƠI LẠI');
    } else {
      const winner = playerById(winnerId ?? -1);
      verdict.setText(`🏆 ${winner?.name ?? '???'} THẮNG KÈO!`);
      if (winnerId === a.id) leftCard.setStrokeStyle(7, 0xffd34d, 1);
      if (winnerId === b.id) rightCard.setStrokeStyle(7, 0xffd34d, 1);
    }
    await wait(tied ? 900 : 1150);
  };

;
    }).join('\n');
    const body = scene.add.text(0, 20, rows, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '22px', fontStyle: 'bold',
      color: '#4f4740', align: 'left', lineSpacing: 16, fixedWidth: 620,
    }).setOrigin(0.5);
    stage.add([heading, body]);
    await wait(2100);
  };

  const runRpsFinal = async (
    finalists: readonly number[],
    roundOffset: number,
  ): Promise<{ winnerId: number; loserId: number } | undefined> => {
    const a = playerById(finalists[0] ?? -1);
    const b = playerById(finalists[1] ?? -1);
    if (!a || !b) return undefined;
    subtitle.setText(`${slot.title} • CÒN 1 VS 1 • OẲN TÙ XÌ`);

    for (let round = 1; round <= 8; round += 1) {
      const choose = async (player: PlayerState): Promise<RpsChoice> => {
        if (!isInteractiveHuman(player.id)) return cpuRps(eventSeq, player.id, roundOffset + round);
        return choiceButtons(player, [
          { value: 'rock', icon: '✊', label: 'BÚA', fill: 0xffd983 },
          { value: 'paper', icon: '🖐️', label: 'BAO', fill: 0x9eddf0 },
          { value: 'scissors', icon: '✌️', label: 'KÉO', fill: 0xd1b0f0 },
        ]);
      };
      const choiceA = await choose(a);
      const choiceB = await choose(b);
      const result = resolveRpsRound(a.id, choiceA, b.id, choiceB);
      await showRpsDuel(a, b, choiceA, choiceB, result.tied, result.winnerId);
      if (result.tied) continue;

      const winnerId = result.winnerId;
      const loserId = result.loserId;
      if (winnerId === undefined || loserId === undefined) continue;
      return { winnerId, loserId };
    }

    await showResult('🌀 HÒA QUÁ NHIỀU', 'Oẳn tù xì tự kết thúc để không kẹt trận.');
    return undefined;
  };

  const runTournament = async (): Promise<MiniGameOutcome> => {
    let activeIds = players.map((player) => player.id);
    const eliminationOrder: number[] = [];
    const baseType: MiniGameBaseRewardType = minigameModeForActivePlayers(activeIds) === 'rps'
      ? 'rps'
      : 'majority_minority';
    const payoutType = miniGameRewardType059(baseType, slot.contentId);

    if (activeIds.length <= 1) {
      const rankingPlayerIds = [...activeIds];
      await showResult('🏆 THẮNG MẶC ĐỊNH', `${playerById(activeIds[0] ?? -1)?.name ?? 'Người chơi'} là người duy nhất đủ điều kiện.`);
      await showRanking(rankingPlayerIds, baseType);
      return { gameType: payoutType, rankingPlayerIds };
    }

    if (baseType === 'rps') {
      const final = await runRpsFinal(activeIds, 0);
      const rankingPlayerIds = final ? [final.winnerId, final.loserId] : [...activeIds];
      await showRanking(rankingPlayerIds, baseType);
      return { gameType: payoutType, rankingPlayerIds };
    }

    subtitle.setText(`${slot.title} • NHIỀU RA ÍT BỊ • phe thiểu số bị loại`);
    stake.setText(`THƯỞNG: ${miniGameRewardCopy059(slot.contentId, 'majority_minority')}`);
    let round = 0;
    let safety = 0;
    while (activeIds.length > 2 && safety < 16) {
      safety += 1;
      round += 1;
      const choices: Record<number, PalmChoice> = {};
      for (const id of activeIds) {
        const player = playerById(id);
        if (!player) continue;
        choices[id] = isInteractiveHuman(id)
          ? await choiceButtons(player, [
              { value: 'up', icon: '🤲', label: 'NGỬA', fill: 0x9eddf0 },
              { value: 'down', icon: '🖐️', label: 'SẤP', fill: 0xffd983 },
            ])
          : cpuPalm(eventSeq, id, round);
      }

      const result = resolveMajorityMinorityRound(activeIds, choices);
      const reveal = activeIds
        .map((id) => `${playerById(id)?.name ?? `P${id + 1}`}: ${choices[id] === 'up' ? 'NGỬA 🤲' : 'SẤP 🖐️'}`)
        .join('\n');
      if (result.tied) {
        await showResult('🤝 HÒA, RA LẠI!', `${reveal}\n\nKhông có phe thiểu số rõ ràng.`);
        continue;
      }

      eliminationOrder.push(...result.eliminatedPlayerIds);
      const losers = result.eliminatedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ');
      activeIds = result.survivingPlayerIds;
      const survivors = activeIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ');
      await showResult('😵 ÍT BỊ!', `${reveal}\n\n❌ Bị loại: ${losers}\n✅ Còn lại: ${survivors}`);
    }

    let rankingPlayerIds: number[];
    if (activeIds.length === 2) {
      const final = await runRpsFinal(activeIds, round * 10);
      rankingPlayerIds = final
        ? [final.winnerId, final.loserId, ...[...eliminationOrder].reverse()]
        : [...activeIds, ...[...eliminationOrder].reverse()];
      await showRanking(rankingPlayerIds, baseType);
      return { gameType: payoutType, rankingPlayerIds };
    }

    if (activeIds.length === 1) {
      rankingPlayerIds = [activeIds[0]!, ...[...eliminationOrder].reverse()];
      await showResult('🏆 NGƯỜI THẮNG MINI GAME!', `${playerById(activeIds[0]!)?.name ?? '???'} thắng.`);
      await showRanking(rankingPlayerIds, baseType);
      return { gameType: payoutType, rankingPlayerIds };
    }

    await showResult('🌀 HÒA QUÁ NHIỀU', 'Mini game tự kết thúc để không kẹt trận.');
    rankingPlayerIds = [...activeIds, ...[...eliminationOrder].reverse()];
    await showRanking(rankingPlayerIds, baseType);
    return { gameType: payoutType, rankingPlayerIds };
  };

  const done = runTournament().then((outcome) => {
    const hostSession = (scene as unknown as { hostSession?: MiniGameHostSystem }).hostSession;
    if (hostSession) {
      const receipt = hostSession.submitSystemIntent('resolve_minigame', {
        sourceEventSeq: eventSeq,
        gameType: outcome.gameType,
        rankingPlayerIds: outcome.rankingPlayerIds.join(','),
      });
      if (receipt.status === 'rejected') {
        console.warn(`[MiniGame] Host rejected payout for event #${eventSeq}: ${receipt.reason ?? 'unknown reason'}`);
      }
    }
    return outcome;
  });

  return { root, done };
}
