import Phaser from 'phaser';
import {
  MINI_GAME_CHOICE_LAYOUT_070431,
  MINI_GAME_DUEL_LAYOUT_070423,
} from './miniGameLayout070423';
import { MINI_GAME_VISUAL_VF07 } from './visualFoundationMiniGameVf07';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { createScrollableTextViewport070429 } from './scrollableTextViewport070429';
import { characterWinnerVoiceCh04d } from './characterMiniGameWinnerVoiceCh04d';
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
  resolveThreeDoorsRound,
  resolveSoloBuoyRound,
  resolveCutTopDiceRound,
  type PalmChoice,
  type RpsChoice,
  type ThreeDoorChoice,
  type SoloBuoyChoice,
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

function cpuThreeDoor(eventSeq: number, playerId: number, round: number): ThreeDoorChoice {
  return (['a', 'b', 'c'] as const)[deterministicBit(eventSeq, playerId, round) % 3] ?? 'a';
}

function cpuSoloBuoy(eventSeq: number, playerId: number, round: number): SoloBuoyChoice {
  return (['1', '2', '3'] as const)[deterministicBit(eventSeq, playerId, round) % 3] ?? '1';
}

function threeDoorRoll(eventSeq: number, round: number): number {
  return deterministicBit(eventSeq, 97, round) % 6 + 1;
}

function cutTopDiceRoll(eventSeq: number, playerId: number, round: number): number {
  return deterministicBit(eventSeq, playerId + 211, round + 71) % 6 + 1;
}

function threeDoorLabel(choice: ThreeDoorChoice): string {
  return choice === 'a' ? 'A' : choice === 'b' ? 'B' : 'C';
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
  if (gameType === 'rps') return 'OẲN TÙ XÌ';
  if (gameType === 'three_doors') return 'BA CỬA';
  if (gameType === 'solo_buoy') return 'PHAO ĐƠN';
  if (gameType === 'cut_top_dice') return 'CẮT TOP XÚC XẮC';
  return 'NHIỀU RA ÍT BỊ';
}

export function startMiniGameOverlay(
  scene: Phaser.Scene,
  players: readonly PlayerState[],
  eventSeq: number,
  contentId?: string,
): MiniGameOverlayRun {
  const slot = miniGameSlot059(contentId);
  // The fullscreen Mini Game owns the UI camera above the P1–P4 HUD (depth 1000).
  const root = scene.add.container(640, 360).setDepth(1500).setName('minigame-modal').setScrollFactor(0);
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.72).setInteractive();
  const panel = scene.add.rectangle(
    0, 0, MINI_GAME_VISUAL_VF07.bounds.width, MINI_GAME_VISUAL_VF07.bounds.height,
    MINI_GAME_VISUAL_VF07.shellFill, 1,
  )
    .setStrokeStyle(MINI_GAME_VISUAL_VF07.shellStrokeWidth, MINI_GAME_VISUAL_VF07.shellStroke, 1);
  const headerBand = scene.add.rectangle(0, -222, MINI_GAME_VISUAL_VF07.bounds.safeWidth, 96, MINI_GAME_VISUAL_VF07.headerFill, 1)
    .setStrokeStyle(3, MINI_GAME_VISUAL_VF07.shellStroke, 0.18);
  const headerSticker = scene.add.rectangle(-390, -222, 96, 60, MINI_GAME_VISUAL_VF07.stickerFill, 1)
    .setStrokeStyle(3, MINI_GAME_VISUAL_VF07.shellStroke, 0.55);
  const title = scene.add.text(0, -238, `${slot.icon} ${slot.title}`, {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '31px', fontStyle: 'bold', color: '#30251f',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -196, `${slot.boardLabel} • ${slot.identity} • ${slot.description}`, {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
    fontSize: '17px',
    color: '#6d5549',
    align: 'center',
    fixedWidth: 820,
    wordWrap: { width: 810, useAdvancedWrap: true },
    maxLines: 2,
    lineSpacing: 2,
  }).setOrigin(0.5).setName('vf07-minigame-subtitle');
  const stake = scene.add.text(0, -163, '', {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText, align: 'center', fixedWidth: 840,
  }).setOrigin(0.5).setVisible(false);
  const stage = scene.add.container(0, 22).setName('vf07-minigame-stage');
  root.add([backdrop, panel, headerBand, headerSticker, title, subtitle, stake, stage]);

  const playerById = (id: number) => players.find((player) => player.id === id);
  const isInteractiveHuman = (id: number) => browserSession.current.mode === 'solo' && !browserSession.isCpuSeat(id);
  const clearStage = () => {
    stage.removeAll(true);
    panel.setSize(MINI_GAME_VISUAL_VF07.bounds.width, MINI_GAME_VISUAL_VF07.bounds.height).setY(0);
    headerBand.setVisible(true);
    headerSticker.setVisible(true);
    title.setVisible(true);
    subtitle.setVisible(true);
  };
  const wait = (ms: number) => new Promise<void>((resolve) => scene.time.delayedCall(ms, resolve));

  const choiceButtons = <T extends string>(
    player: PlayerState,
    choices: Array<{ value: T; icon: string; label: string; fill: number }>,
  ): Promise<T> => new Promise((resolve) => {
    clearStage();
    const l = MINI_GAME_CHOICE_LAYOUT_070431;
    const prompt = scene.add.text(0, l.promptY, `${player.name} • CHỌN KÍN`, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText,
    }).setOrigin(0.5).setName('vf07-minigame-choice-prompt');
    const hint = scene.add.text(0, l.hintY, '← → / A D • ENTER / SPACE • D-PAD + A', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: MINI_GAME_VISUAL_VF07.mutedText,
    }).setOrigin(0.5).setName('vf07-minigame-choice-hint');
    stage.add([prompt, hint]);

    const spacing = choices.length === 2 ? l.twoChoiceSpacing : l.multiChoiceSpacing;
    const boxes: Phaser.GameObjects.Rectangle[] = [];
    let selectedIndex = 0;
    let settled = false;
    let gamepadTimer: Phaser.Time.TimerEvent | undefined;
    let previousPadLeft = false;
    let previousPadRight = false;
    let previousPadConfirm = false;

    const refreshFocus = () => {
      boxes.forEach((box, index) => {
        const focused = index === selectedIndex;
        box
          .setScale(focused ? 1.055 : 1)
          .setStrokeStyle(focused ? 7 : 4, focused ? MINI_GAME_VISUAL_VF07.choiceFocusStroke : MINI_GAME_VISUAL_VF07.shellStroke, 1);
      });
    };

    const moveFocus = (delta: number) => {
      if (settled || choices.length === 0) return;
      selectedIndex = (selectedIndex + delta + choices.length) % choices.length;
      sfxController.play('ui_confirm');
      refreshFocus();
    };

    const cleanupControls = () => {
      scene.input.keyboard?.off('keydown', keyboardHandler);
      gamepadTimer?.remove(false);
      gamepadTimer = undefined;
    };

    const commit = (index = selectedIndex) => {
      if (settled) return;
      const choice = choices[index];
      if (!choice) return;
      settled = true;
      cleanupControls();
      sfxController.play('ui_confirm');
      resolve(choice.value);
    };

    const keyboardHandler = (event: KeyboardEvent) => {
      const key = event.key.toLocaleLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        moveFocus(-1);
        return;
      }
      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        moveFocus(1);
        return;
      }
      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        commit();
        return;
      }
      const directIndex = Number(key) - 1;
      if (Number.isInteger(directIndex) && directIndex >= 0 && directIndex < choices.length) commit(directIndex);
    };

    choices.forEach((choice, index) => {
      const x = (index - (choices.length - 1) / 2) * spacing;
      const box = scene.add.rectangle(x, l.cardCenterY, l.cardWidth, l.cardHeight, choice.fill, 1)
        .setStrokeStyle(4, MINI_GAME_VISUAL_VF07.shellStroke, 1)
        .setInteractive({ useHandCursor: true })
        .setName(`vf07-minigame-choice-box-${index}`);
      boxes.push(box);
      const icon = scene.add.text(x, l.cardCenterY + l.iconOffsetY, choice.icon, {
        fontSize: '46px',
      }).setOrigin(0.5);
      const label = scene.add.text(x, l.cardCenterY + l.labelOffsetY, choice.label, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: MINI_GAME_VISUAL_VF07.cocoaText,
      }).setOrigin(0.5).setName(`vf07-minigame-choice-label-${index}`);
      box.on('pointerover', () => {
        selectedIndex = index;
        refreshFocus();
      });
      box.on('pointerdown', () => commit(index));
      stage.add([box, icon, label]);
    });

    const privacyRail = scene.add.rectangle(
      0,
      l.privacyY,
      l.privacyWidth,
      l.privacyHeight,
      MINI_GAME_VISUAL_VF07.resultFill,
      0.94,
    )
      .setStrokeStyle(2, MINI_GAME_VISUAL_VF07.shellStroke, 0.24)
      .setName('vf07-minigame-choice-privacy-rail');
    const privacyHint = scene.add.text(
      0,
      l.privacyY,
      '🔒 LỰA CHỌN ĐƯỢC GIỮ KÍN • CÙNG LẬT SAU KHI CHỐT',
      {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: MINI_GAME_VISUAL_VF07.mutedText,
        align: 'center',
        fixedWidth: 620,
      },
    ).setOrigin(0.5).setName('vf07-minigame-choice-privacy-hint');
    stage.add([privacyRail, privacyHint]);

    refreshFocus();
    scene.input.keyboard?.on('keydown', keyboardHandler);

    gamepadTimer = scene.time.addEvent({
      delay: 70,
      loop: true,
      callback: () => {
        const pads = typeof navigator !== 'undefined' && navigator.getGamepads
          ? Array.from(navigator.getGamepads()).filter((pad): pad is Gamepad => Boolean(pad))
          : [];
        const pad = pads[0];
        if (!pad) {
          previousPadLeft = false;
          previousPadRight = false;
          previousPadConfirm = false;
          return;
        }

        const axisX = pad.axes[0] ?? 0;
        const left = Boolean(pad.buttons[14]?.pressed || axisX < -0.55);
        const right = Boolean(pad.buttons[15]?.pressed || axisX > 0.55);
        const confirm = Boolean(pad.buttons[0]?.pressed);

        if (left && !previousPadLeft) moveFocus(-1);
        if (right && !previousPadRight) moveFocus(1);
        if (confirm && !previousPadConfirm) commit();

        previousPadLeft = left;
        previousPadRight = right;
        previousPadConfirm = confirm;
      },
    });
  });

  const showResult = async (heading: string, body: string, ms = 1700) => {
    clearStage();
    const resultPaper = scene.add.rectangle(0, 10, 780, 330, MINI_GAME_VISUAL_VF07.resultFill, 1)
      .setStrokeStyle(4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35);
    const resultBadge = scene.add.rectangle(0, -116, 400, 62, MINI_GAME_VISUAL_VF07.stickerFill, 1)
      .setStrokeStyle(3, MINI_GAME_VISUAL_VF07.shellStroke, 0.5);
    const head = scene.add.text(0, -116, heading, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '29px',
      fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText,
      align: 'center',
      fixedWidth: 360,
    }).setOrigin(0.5).setName('vf07-minigame-result-heading');
    stage.add([resultPaper, resultBadge, head]);

    const bodyViewport = createScrollableTextViewport070429(scene, stage, {
      x: -340,
      y: -62,
      width: 680,
      height: 188,
      minHeight: 44,
      text: body,
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: 24,
      color: MINI_GAME_VISUAL_VF07.cocoaText,
      align: 'center',
      lineSpacing: 9,
      name: 'vf07-minigame-result-scroll',
    });
    bodyViewport.text.setName('vf07-minigame-result-body');
    const resultBottom = -62 + bodyViewport.height + (bodyViewport.isScrollable ? 54 : 24);
    resultPaper.setSize(780, resultBottom + 150).setY((resultBottom - 150) / 2);
    const shellBottom = stage.y + resultBottom + 24;
    panel.setSize(960, shellBottom + 282).setY((shellBottom - 270) / 2);

    const scrollHint = scene.add.text(0, resultBottom - 25, bodyViewport.isScrollable ? '↕ KÉO / CUỘN ĐỂ ĐỌC HẾT' : '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.mutedText,
      align: 'center',
      fixedWidth: 680,
    }).setOrigin(0.5).setName('vf07-minigame-scroll-hint');
    stage.add(scrollHint);

    scene.tweens.add({
      targets: [resultPaper, resultBadge, head, bodyViewport.root, scrollHint],
      alpha: { from: 0.35, to: 1 },
      duration: 190,
      ease: 'Sine.easeOut',
    });
    await wait(bodyViewport.isScrollable ? Math.max(ms, 5200) : ms);
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
    const l = MINI_GAME_DUEL_LAYOUT_070423;

    // Names have their own row, well clear of both cards. Result and replay
    // status stay in a single bottom rail, never on the card's upper edges.
    const leftName = scene.add.text(-l.cardCenterX, l.nameY, a.name, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '22px', fontStyle: 'bold', color: '#30251f',
      fixedWidth: l.cardWidth + 12, align: 'center',
    }).setOrigin(0.5);
    const rightName = scene.add.text(l.cardCenterX, l.nameY, b.name, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '22px', fontStyle: 'bold', color: '#30251f',
      fixedWidth: l.cardWidth + 12, align: 'center',
    }).setOrigin(0.5);
    const leftCard = scene.add.rectangle(-l.cardCenterX, l.cardCenterY, l.cardWidth, l.cardHeight, 0xffe09a, 1)
      .setStrokeStyle(4, 0x4b332b, 1);
    const rightCard = scene.add.rectangle(l.cardCenterX, l.cardCenterY, l.cardWidth, l.cardHeight, 0xd1b0f0, 1)
      .setStrokeStyle(4, 0x4b332b, 1);
    const leftIcon = scene.add.text(-l.cardCenterX, -14, '✊', { fontSize: '74px' }).setOrigin(0.5);
    const rightIcon = scene.add.text(l.cardCenterX, -14, '✊', { fontSize: '74px' }).setOrigin(0.5);
    const leftChoice = scene.add.text(-l.cardCenterX, 55, '?', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '19px',
      fontStyle: 'bold', color: '#30251f',
    }).setOrigin(0.5);
    const rightChoice = scene.add.text(l.cardCenterX, 55, '?', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '19px',
      fontStyle: 'bold', color: '#30251f',
    }).setOrigin(0.5);
    const vs = scene.add.text(0, l.cardCenterY, 'VS', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '34px', fontStyle: 'bold', color: '#ef4545',
    }).setOrigin(0.5);
    const chant = scene.add.text(0, l.chantY, 'CHUẨN BỊ...', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '24px',
      fontStyle: 'bold', color: '#5d4773', fixedWidth: 640, align: 'center',
    }).setOrigin(0.5);
    const verdict = scene.add.text(0, l.verdictY, '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '21px',
      fontStyle: 'bold', color: '#30251f', align: 'center', fixedWidth: 700,
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
        scaleX: 1.12, scaleY: 1.12, duration: 120,
        yoyo: true, ease: 'Back.easeOut',
      });
      await wait(index === beats.length - 1 ? 420 : 330);
    }

    chant.setText('LẬT KÈO!');
    leftCard.setScale(0.92, 1);
    rightCard.setScale(0.92, 1);
    leftIcon.setAlpha(0);
    rightIcon.setAlpha(0);
    leftChoice.setAlpha(0);
    rightChoice.setAlpha(0);
    scene.tweens.add({
      targets: [leftCard, rightCard],
      scaleX: { from: 0.92, to: 1 }, duration: 150, ease: 'Back.easeOut',
    });
    await wait(110);
    leftIcon.setText(rpsIcon(choiceA));
    rightIcon.setText(rpsIcon(choiceB));
    leftChoice.setText(rpsLabel(choiceA));
    rightChoice.setText(rpsLabel(choiceB));
    scene.tweens.add({
      targets: [leftIcon, rightIcon, leftChoice, rightChoice],
      alpha: { from: 0, to: 1 }, scaleX: { from: 0.82, to: 1 }, scaleY: { from: 0.82, to: 1 },
      duration: 170, ease: 'Back.easeOut',
    });
    scene.tweens.add({
      targets: vs,
      scaleX: { from: 1.35, to: 1 }, scaleY: { from: 1.35, to: 1 }, duration: 180, ease: 'Back.easeOut',
    });
    scene.cameras.main.shake(95, 0.0011);
    await wait(520);

    if (tied) {
      chant.setText('🤝 HÒA KÈO');
      verdict.setText('CHƠI LẠI!');
    } else {
      const winner = playerById(winnerId ?? -1);
      chant.setText('🏆 KẾT QUẢ');
      verdict.setText(`${winner?.name ?? '???'} THẮNG KÈO!`);
      if (winnerId === a.id) leftCard.setStrokeStyle(5, 0xe7ae35, 1);
      if (winnerId === b.id) rightCard.setStrokeStyle(5, 0xe7ae35, 1);
    }
    await wait(tied ? 900 : 1150);
  };

  const showRanking = async (rankingPlayerIds: readonly number[], baseType: MiniGameBaseRewardType) => {
    if (rankingPlayerIds.length === 0) return;
    clearStage();
    title.setVisible(false);
    subtitle.setVisible(false);
    stake.setVisible(false);
    headerBand.setVisible(false);
    headerSticker.setVisible(false);

    const payoutType = miniGameRewardType059(baseType, slot.contentId);
    const podiumPaper = scene.add.rectangle(0, 12, 780, 380, MINI_GAME_VISUAL_VF07.resultFill, 1)
      .setStrokeStyle(4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35);
    const podiumRibbon = scene.add.rectangle(0, -136, 470, 66, MINI_GAME_VISUAL_VF07.headerFill, 1)
      .setStrokeStyle(3, MINI_GAME_VISUAL_VF07.shellStroke, 0.45);
    const heading = scene.add.text(0, -136, '🏆 BẢNG XẾP HẠNG', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '29px',
      fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText,
    }).setOrigin(0.5).setName('vf07-minigame-ranking-heading');

    const medals = ['🥇', '🥈', '🥉', '4️⃣'];
    const rows = rankingPlayerIds.map((id, index) => {
      const player = playerById(id);
      const reward = miniGameRewardForRank(payoutType, index + 1);
      const rewardCopy = reward > 0 ? `+${reward}` : '0';
      return `${medals[index] ?? `${index + 1}.`} Hạng ${index + 1} • ${player?.name ?? `P${id + 1}`} • ${rewardCopy} B$`;
    }).join('\n');

    stage.add([podiumPaper, podiumRibbon, heading]);
    const rowsViewport = createScrollableTextViewport070429(scene, stage, {
      x: -340,
      y: -90,
      width: 680,
      height: 180,
      minHeight: 44,
      text: rows,
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: 24,
      fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText,
      align: 'left',
      lineSpacing: 12,
      name: 'vf07-minigame-ranking-scroll',
    });
    rowsViewport.text.setName('vf07-minigame-ranking-rows');

    const winnerId = rankingPlayerIds[0];
    const winner = winnerId === undefined ? undefined : playerById(winnerId);
    const winnerReward = winnerId === undefined ? 0 : miniGameRewardForRank(payoutType, 1);
    const winnerVoice = winner
      ? characterWinnerVoiceCh04d(winner.id, winner.name, winnerReward, eventSeq)
      : '';

    const rowsBottom = -90 + rowsViewport.height;
    const winnerVoiceText = scene.add.text(0, rowsBottom + 38, winnerVoice ? `💬 ${winner?.name ?? 'Winner'}: ${winnerVoice}` : '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#5d4773',
      align: 'center',
      fixedWidth: 680,
      wordWrap: { width: 670, useAdvancedWrap: true },
      maxLines: 2,
    }).setOrigin(0.5).setVisible(Boolean(winnerVoice)).setName('vf07-minigame-winner-voice');

    const rewardHint = scene.add.text(
      0,
      rowsBottom + (winnerVoice ? 88 : 32),
      rowsViewport.isScrollable
        ? '↕ KÉO / CUỘN BẢNG • KẾT QUẢ ĐÃ CHỐT'
        : 'KẾT QUẢ ĐÃ CHỐT • TIỀN THƯỞNG TỰ ĐỘNG ÁP DỤNG',
      {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: MINI_GAME_VISUAL_VF07.mutedText,
        align: 'center',
        fixedWidth: 680,
      },
    ).setOrigin(0.5).setName('vf07-minigame-ranking-hint');

    const rankingBottom = rewardHint.y + 30;
    podiumPaper.setSize(780, rankingBottom + 168).setY((rankingBottom - 168) / 2);
    panel.setSize(900, rankingBottom + 210).setY(22 + (rankingBottom - 190) / 2);
    stage.add([winnerVoiceText, rewardHint]);
    scene.tweens.add({
      targets: [podiumPaper, podiumRibbon, heading, rowsViewport.root, winnerVoiceText, rewardHint],
      alpha: { from: 0.25, to: 1 },
      duration: 210,
      ease: 'Sine.easeOut',
    });
    await wait(rowsViewport.isScrollable ? 5000 : 2600);
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
    const baseType: MiniGameBaseRewardType = minigameModeForActivePlayers(activeIds, slot.mode3Plus);
    const payoutType = miniGameRewardType059(baseType, slot.contentId);
    stake
      .setText(`${rewardTitle(baseType)} • ${miniGameRewardCopy059(slot.contentId, baseType)}`)
      .setVisible(true);

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

    let round = 0;
    let safety = 0;

    if (baseType === 'three_doors') {
      subtitle.setText(`${slot.title} • BA CỬA • D6: 1–2=A • 3–4=B • 5–6=C`);
      while (activeIds.length > 2 && safety < 16) {
        safety += 1;
        round += 1;
        const choices: Record<number, ThreeDoorChoice> = {};
        for (const id of activeIds) {
          const player = playerById(id);
          if (!player) continue;
          choices[id] = isInteractiveHuman(id)
            ? await choiceButtons(player, [
                { value: 'a', icon: '🚪', label: 'CỬA A', fill: 0xffd983 },
                { value: 'b', icon: '🚪', label: 'CỬA B', fill: 0x9eddf0 },
                { value: 'c', icon: '🚪', label: 'CỬA C', fill: 0xd1b0f0 },
              ])
            : cpuThreeDoor(eventSeq, id, round);
        }

        const roll = threeDoorRoll(eventSeq, round);
        const result = resolveThreeDoorsRound(activeIds, choices, roll);
        const reveal = activeIds
          .map((id) => `${playerById(id)?.name ?? `P${id + 1}`}: CỬA ${threeDoorLabel(choices[id] ?? 'a')}`)
          .join('\n');
        const door = threeDoorLabel(result.winningDoor);

        if (result.tied) {
          const reason = result.survivingPlayerIds.length === activeIds.length
            && activeIds.every((id) => choices[id] === result.winningDoor)
            ? 'Tất cả cùng trúng cửa, chưa ai bị loại.'
            : 'Không ai chọn đúng cửa, ra lại!';
          await showResult(`🎲 ${roll} • CỬA ${door}`, `${reveal}\n\n🤝 ${reason}`);
          continue;
        }

        eliminationOrder.push(...result.eliminatedPlayerIds);
        const losers = result.eliminatedPlayerIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        activeIds = result.survivingPlayerIds;
        const survivors = activeIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        await showResult(
          `🎲 ${roll} • CỬA ${door} TRÚNG!`,
          `${reveal}\n\n✅ Đi tiếp: ${survivors}\n❌ Bị loại: ${losers}`,
        );
      }
    } else if (baseType === 'solo_buoy') {
      subtitle.setText(`${slot.title} • PHAO ĐƠN • chỉ phao có đúng 1 người mới nổi`);
      while (activeIds.length > 2 && safety < 16) {
        safety += 1;
        round += 1;
        const choices: Record<number, SoloBuoyChoice> = {};
        for (const id of activeIds) {
          const player = playerById(id);
          if (!player) continue;
          choices[id] = isInteractiveHuman(id)
            ? await choiceButtons(player, [
                { value: '1', icon: '🛟', label: 'PHAO 1', fill: 0xffd983 },
                { value: '2', icon: '🛟', label: 'PHAO 2', fill: 0x9eddf0 },
                { value: '3', icon: '🛟', label: 'PHAO 3', fill: 0xd1b0f0 },
              ])
            : cpuSoloBuoy(eventSeq, id, round);
        }

        const result = resolveSoloBuoyRound(activeIds, choices);
        const reveal = activeIds
          .map((id) => `${playerById(id)?.name ?? `P${id + 1}`}: PHAO ${choices[id] ?? '1'}`)
          .join('\n');
        const countCopy = `Phao 1: ${result.counts['1']} • Phao 2: ${result.counts['2']} • Phao 3: ${result.counts['3']}`;

        if (result.tied) {
          const everyoneUnique = activeIds.every((id) => {
            const choice = choices[id];
            return choice ? result.counts[choice] === 1 : false;
          });
          const reason = everyoneUnique
            ? 'Ai cũng đứng một mình, chưa ai chìm.'
            : 'Không có phao đơn nào nổi, chọn lại!';
          await showResult('🛟 CHƯA AI RỚT!', `${reveal}\n\n${countCopy}\n🤝 ${reason}`);
          continue;
        }

        eliminationOrder.push(...result.eliminatedPlayerIds);
        activeIds = result.survivorPlayerIds;
        const survivors = activeIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        const losers = result.eliminatedPlayerIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        await showResult(
          '🛟 PHAO ĐƠN NỔI!',
          `${reveal}\n\n${countCopy}\n✅ Nổi: ${survivors}\n❌ Chìm: ${losers}`,
        );
      }
    } else if (baseType === 'cut_top_dice') {
      subtitle.setText(`${slot.title} • CẮT TOP XÚC XẮC • 2 điểm cao nhất đi tiếp`);
      const finalists: number[] = [];
      let contenders = [...activeIds];
      let slotsOpen = 2;

      while (contenders.length > slotsOpen && safety < 16) {
        safety += 1;
        round += 1;
        const rolls: Record<number, number> = {};
        for (const id of contenders) rolls[id] = cutTopDiceRoll(eventSeq, id, round);

        const result = resolveCutTopDiceRound(contenders, rolls, slotsOpen);
        finalists.push(...result.lockedPlayerIds);
        eliminationOrder.push(...result.eliminatedPlayerIds);

        const rollCopy = contenders
          .map((id) => `${playerById(id)?.name ?? `P${id + 1}`} 🎲 ${rolls[id]}`)
          .join('  •  ');
        const lockedCopy = result.lockedPlayerIds.length > 0
          ? `✅ Giữ ghế Top: ${result.lockedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ')}`
          : '';
        const eliminatedCopy = result.eliminatedPlayerIds.length > 0
          ? `❌ Rời Top: ${result.eliminatedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ')}`
          : '';

        if (result.complete) {
          await showResult(
            `🎲 CẮT TOP • VÒNG ${round}`,
            [rollCopy, lockedCopy, eliminatedCopy].filter(Boolean).join('\n'),
          );
          contenders = [];
          slotsOpen = 0;
          break;
        }

        const tieCopy = result.rerollPlayerIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        await showResult(
          '🎲 HÒA Ở RANH TOP • ĐỔ LẠI',
          [
            rollCopy,
            lockedCopy,
            eliminatedCopy,
            `🔁 ${tieCopy} đổ lại để tranh ${result.slotsOpen} ghế còn lại.`,
          ].filter(Boolean).join('\n'),
        );

        contenders = result.rerollPlayerIds;
        slotsOpen = result.slotsOpen;
      }

      if (contenders.length === slotsOpen && slotsOpen > 0) {
        finalists.push(...contenders);
      }

      activeIds = finalists.slice(0, 2);
      if (activeIds.length < 2) {
        const fallbackPool = players
          .map((player) => player.id)
          .filter((id) => !activeIds.includes(id) && !eliminationOrder.includes(id));
        activeIds.push(...fallbackPool.slice(0, 2 - activeIds.length));
      }
    } else {
      subtitle.setText(`${slot.title} • NHIỀU RA ÍT BỊ • phe thiểu số bị loại`);
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
      clearStage();
      const revealPaper = scene.add.rectangle(0, 8, 780, 300, MINI_GAME_VISUAL_VF07.resultFill, 1)
        .setStrokeStyle(4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35);
      const revealTitle = scene.add.text(0, -112, `VÒNG ${round} • CÙNG LẬT!`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '24px', fontStyle: 'bold',
        color: MINI_GAME_VISUAL_VF07.cocoaText, align: 'center',
      }).setOrigin(0.5);
      const revealRows = activeIds.map((id, index) => {
        const player = playerById(id);
        const up = choices[id] === 'up';
        const x = activeIds.length <= 2 ? (index === 0 ? -190 : 190) : -270 + (index % 2) * 540;
        const y = activeIds.length <= 2 ? 8 : -28 + Math.floor(index / 2) * 92;
        const chip = scene.add.rectangle(x, y, 310, 76, up ? 0x9eddf0 : 0xffd983, 1)
          .setStrokeStyle(3, MINI_GAME_VISUAL_VF07.shellStroke, 0.7);
        const label = scene.add.text(x, y, `${player?.name ?? `P${id + 1}`}  ${up ? '🤲 NGỬA' : '🖐️ SẤP'}`, {
          fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '18px', fontStyle: 'bold',
          color: MINI_GAME_VISUAL_VF07.cocoaText, fixedWidth: 288, align: 'center',
        }).setOrigin(0.5);
        return [chip, label];
      }).flat();
      stage.add([revealPaper, revealTitle, ...revealRows]);
      scene.tweens.add({ targets: revealRows, scaleX: { from: 0.88, to: 1 }, alpha: { from: 0.25, to: 1 }, duration: 180, ease: 'Back.easeOut' });
      await wait(520);
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
