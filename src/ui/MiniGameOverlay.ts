import Phaser from 'phaser';
import {
  MINI_GAME_CHOICE_LAYOUT_070431,
  MINI_GAME_DUEL_LAYOUT_070423,
} from './miniGameLayout070423';
import { MINI_GAME_VISUAL_VF07 } from './visualFoundationMiniGameVf07';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { controlsMiniGameSeatCh16 } from './minigameSeatControlCh16';
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
  resolveFinalSprint,
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

function finalSprintRoll(eventSeq: number, playerId: number, leg: number): number {
  return deterministicBit(eventSeq, playerId + 307, leg + 113) % 6 + 1;
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
  if (gameType === 'final_sprint') return 'ĐUA 3 CHẶNG';
  return 'NHIỀU RA ÍT BỊ';
}

function paintRoundedSurfaceCh141(
  surface: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  fill: number,
  fillAlpha: number,
  radius: number,
  strokeWidth: number,
  stroke: number,
  strokeAlpha: number,
): Phaser.GameObjects.Graphics {
  surface.clear();
  surface.setData('ch141Width', width);
  surface.setData('ch141Height', height);
  surface.fillStyle(fill, fillAlpha);
  surface.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  if (strokeWidth > 0 && strokeAlpha > 0) {
    surface.lineStyle(strokeWidth, stroke, strokeAlpha);
    surface.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  }
  return surface;
}

function roundedSurfaceCh141(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  fillAlpha: number,
  radius: number = MINI_GAME_VISUAL_VF07.surfaceRadius,
  strokeWidth: number = 0,
  stroke: number = MINI_GAME_VISUAL_VF07.shellStroke,
  strokeAlpha: number = 0,
): Phaser.GameObjects.Graphics {
  const surface = scene.add.graphics().setPosition(x, y);
  return paintRoundedSurfaceCh141(surface, width, height, fill, fillAlpha, radius, strokeWidth, stroke, strokeAlpha);
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
  const panel = roundedSurfaceCh141(
    scene, 0, 0, MINI_GAME_VISUAL_VF07.bounds.width, MINI_GAME_VISUAL_VF07.bounds.height,
    MINI_GAME_VISUAL_VF07.shellFill, 1, MINI_GAME_VISUAL_VF07.shellRadius,
    MINI_GAME_VISUAL_VF07.shellStrokeWidth, MINI_GAME_VISUAL_VF07.shellStroke, 1,
  ).setName('vf07-minigame-shell-ch141');
  const headerBand = roundedSurfaceCh141(
    scene, 0, -222, MINI_GAME_VISUAL_VF07.bounds.safeWidth, 112, MINI_GAME_VISUAL_VF07.headerFill, 1,
    MINI_GAME_VISUAL_VF07.surfaceRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.18,
  ).setName('vf07-minigame-header-ch141');
  const headerSticker = roundedSurfaceCh141(
    scene, -390, -222, 96, 60, MINI_GAME_VISUAL_VF07.stickerFill, 1,
    MINI_GAME_VISUAL_VF07.chipRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.55,
  ).setName('vf07-minigame-sticker-ch141');
  const title = scene.add.text(0, -246, `${slot.icon} ${slot.title}`, {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '31px', fontStyle: 'bold', color: '#30251f',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -204, `${slot.boardLabel} • ${slot.identity}`, {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
    fontSize: '17px',
    color: '#6d5549',
    align: 'center',
    fixedWidth: 820,
    wordWrap: { width: 810, useAdvancedWrap: true },
    maxLines: 2,
    lineSpacing: 2,
  }).setOrigin(0.5).setName('vf07-minigame-subtitle').setVisible(false);
  const stake = scene.add.text(0, -145, '', {
    fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText, align: 'center', fixedWidth: 840,
  }).setOrigin(0.5).setVisible(false);
  const stage = scene.add.container(0, 22).setName('vf07-minigame-stage');
  root.add([backdrop, panel, headerBand, headerSticker, title, subtitle, stake, stage]);

  const playerById = (id: number) => players.find((player) => player.id === id);
  const isInteractiveHuman = (id: number) => controlsMiniGameSeatCh16(browserSession.current, id);
  const clearStage = () => {
    stage.removeAll(true);
    paintRoundedSurfaceCh141(
      panel, MINI_GAME_VISUAL_VF07.bounds.width, MINI_GAME_VISUAL_VF07.bounds.height,
      MINI_GAME_VISUAL_VF07.shellFill, 1, MINI_GAME_VISUAL_VF07.shellRadius,
      MINI_GAME_VISUAL_VF07.shellStrokeWidth, MINI_GAME_VISUAL_VF07.shellStroke, 1,
    ).setY(0);
    headerBand.setVisible(true);
    headerSticker.setVisible(true);
    title.setVisible(true);
    subtitle.setVisible(false);
    stake.setVisible(false);
    headerSticker.setVisible(false);
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
    const boxes: Phaser.GameObjects.Graphics[] = [];
    let selectedIndex = 0;
    let settled = false;
    let gamepadTimer: Phaser.Time.TimerEvent | undefined;
    let previousPadLeft = false;
    let previousPadRight = false;
    let previousPadConfirm = false;

    const refreshFocus = () => {
      boxes.forEach((box, index) => {
        const focused = index === selectedIndex;
        paintRoundedSurfaceCh141(
          box, l.cardWidth, l.cardHeight, choices[index]?.fill ?? MINI_GAME_VISUAL_VF07.resultFill, 1,
          MINI_GAME_VISUAL_VF07.surfaceRadius, focused ? 7 : 4,
          focused ? MINI_GAME_VISUAL_VF07.choiceFocusStroke : MINI_GAME_VISUAL_VF07.shellStroke, 1,
        ).setScale(focused ? 1.055 : 1);
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
      const box = roundedSurfaceCh141(
        scene, x, l.cardCenterY, l.cardWidth, l.cardHeight, choice.fill, 1,
        MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 1,
      )
        .setInteractive(
          new Phaser.Geom.Rectangle(-l.cardWidth / 2, -l.cardHeight / 2, l.cardWidth, l.cardHeight),
          Phaser.Geom.Rectangle.Contains,
        )
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

    const privacyRail = roundedSurfaceCh141(
      scene, 0, l.privacyY, l.privacyWidth, l.privacyHeight, MINI_GAME_VISUAL_VF07.resultFill, 0.94,
      MINI_GAME_VISUAL_VF07.chipRadius, 2, MINI_GAME_VISUAL_VF07.shellStroke, 0.24,
    ).setName('vf07-minigame-choice-privacy-rail');
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

  const showResult = async (heading: string, body: string, ms = 1700, manualAdvance = false) => {
    clearStage();
    const resultPaper = roundedSurfaceCh141(
      scene, 0, 10, 780, 330, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setName('vf07-minigame-result-paper-ch141');
    const resultBadge = roundedSurfaceCh141(
      scene, 0, -116, 400, 62, MINI_GAME_VISUAL_VF07.stickerFill, 1,
      MINI_GAME_VISUAL_VF07.chipRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.5,
    ).setName('vf07-minigame-result-badge-ch141');
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
    paintRoundedSurfaceCh141(
      resultPaper, 780, resultBottom + 150, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setY((resultBottom - 150) / 2);
    const shellBottom = stage.y + resultBottom + 24;
    paintRoundedSurfaceCh141(
      panel, 960, shellBottom + 282, MINI_GAME_VISUAL_VF07.shellFill, 1,
      MINI_GAME_VISUAL_VF07.shellRadius, MINI_GAME_VISUAL_VF07.shellStrokeWidth,
      MINI_GAME_VISUAL_VF07.shellStroke, 1,
    ).setY((shellBottom - 270) / 2);

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
    if (manualAdvance) {
      scrollHint
        .setText(bodyViewport.isScrollable
          ? '↕ CUỘN ĐỂ ĐỌC • ENTER / SPACE / A: TIẾP'
          : 'ENTER / SPACE / A: TIẾP')
        .setPadding(12, 8, 12, 8)
        .setInteractive({ useHandCursor: true })
        .setName('vf07-minigame-rules-continue-ch142');

      await new Promise<void>((resolve) => {
        let settled = false;
        let previousConfirm = false;
        let padTimer: Phaser.Time.TimerEvent | undefined;
        const cleanup = () => {
          scene.input.keyboard?.off('keydown', keyboard);
          scrollHint.off('pointerdown', commit);
          padTimer?.remove(false);
        };
        const commit = () => {
          if (settled) return;
          settled = true;
          cleanup();
          sfxController.play('ui_confirm');
          resolve();
        };
        const keyboard = (event: KeyboardEvent) => {
          if (event.repeat) return;
          if (event.key !== 'Enter' && event.key !== ' ' && event.code !== 'Space') return;
          event.preventDefault();
          commit();
        };
        scrollHint.on('pointerdown', commit);
        scene.input.keyboard?.on('keydown', keyboard);
        padTimer = scene.time.addEvent({
          delay: 70,
          loop: true,
          callback: () => {
            const pads = typeof navigator !== 'undefined' && navigator.getGamepads
              ? Array.from(navigator.getGamepads()).filter((pad): pad is Gamepad => Boolean(pad))
              : [];
            const confirm = Boolean(pads[0]?.buttons[0]?.pressed);
            if (confirm && !previousConfirm) commit();
            previousConfirm = confirm;
          },
        });
      });
      return;
    }

    await wait(bodyViewport.isScrollable ? Math.max(ms, 5200) : ms);
  };



  const rulesCopy = (baseType: MiniGameBaseRewardType): string => {
    const payout = `💰 THƯỞNG  ${miniGameRewardCopy059(slot.contentId, baseType)}`;
    if (baseType === 'rps') {
      return [
        '🎯 MỤC TIÊU  Thắng kèo 1 VS 1.',
        '🎮 CHƠI  Chọn BÚA / BAO / KÉO rồi cùng lật.',
        '🤝 HÒA  Giống nhau → chơi lại.',
        payout,
      ].join('\n');
    }
    if (baseType === 'three_doors') {
      return [
        '🎯 MỤC TIÊU  Chọn đúng cửa sống.',
        '🎮 CHỌN  🚪 A   🚪 B   🚪 C',
        '🎲 D6  1–2 → A   •   3–4 → B   •   5–6 → C',
        '🤝 HÒA  Không ai hoặc tất cả cùng trúng → chơi lại.',
        payout,
      ].join('\n');
    }
    if (baseType === 'solo_buoy') {
      return [
        '🎯 MỤC TIÊU  Đứng một mình trên phao.',
        '🎮 CHỌN  🛟 1   🛟 2   🛟 3',
        '✅ SỐNG  Chỉ phao có đúng 1 người mới nổi.',
        '🤝 HÒA  Không ai rớt hoặc không ai sống → chọn lại.',
        payout,
      ].join('\n');
    }
    if (baseType === 'cut_top_dice') {
      return [
        '🎯 MỤC TIÊU  Giành 1 trong 2 ghế Top.',
        '🎲 CHƠI  Mỗi người đổ 1 D6.',
        '✅ TOP  Hai điểm cao nhất đi tiếp.',
        '🤝 HÒA RANH TOP  Chỉ nhóm hòa đổ lại.',
        payout,
      ].join('\n');
    }
    if (baseType === 'final_sprint') {
      return [
        '🎯 MỤC TIÊU  Lấy tổng điểm sau 3 chặng.',
        '🏁 CHƠI  Mỗi chặng mỗi người đổ 1 D6.',
        '✅ TOP  Cộng 3 D6 → lấy Top 2.',
        '🤝 HÒA RANH TOP  Chỉ nhóm hòa chạy hiệp phụ.',
        payout,
      ].join('\n');
    }
    return [
      '🎯 MỤC TIÊU  Tránh phe ít người hơn.',
      '🎮 CHỌN KÍN  🤲 NGỬA  hoặc  🖐️ SẤP',
      '❌ BỊ LOẠI  Phe có ít người hơn.',
      '🤝 HÒA  2–2 hoặc tất cả cùng phía → ra lại.',
      payout,
    ].join('\n');
  };

  const showRulesIntro = async (
    baseType: MiniGameBaseRewardType,
    participantIds: readonly number[],
  ): Promise<void> => {
    // CH-14.2: CPU-only tables never stop at a rules card. If at least one
    // human seat participates, the rules remain until that player confirms.
    const hasHumanParticipant = participantIds.some((id) => !browserSession.isCpuSeat(id));
    if (!hasHumanParticipant) return;
    await showResult(
      `📘 LUẬT • ${rewardTitle(baseType)}`,
      rulesCopy(baseType),
      0,
      true,
    );
  };

  const showRoundFlowCh142 = async (
    heading: string,
    leftTitle: string,
    leftRows: readonly string[],
    rightTitle: string,
    rightCopy: string,
    ms = 2100,
  ) => {
    clearStage();
    const paper = roundedSurfaceCh141(
      scene, 0, 18, 820, 340, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setName('vf07-round-flow-paper-ch142');
    const head = scene.add.text(0, -124, heading, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '25px', fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText, align: 'center', fixedWidth: 760,
    }).setOrigin(0.5).setName('vf07-round-flow-heading-ch142');
    const stateTitle = scene.add.text(-235, -82, leftTitle, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '17px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText,
      align: 'center', fixedWidth: 320,
    }).setOrigin(0.5);
    const resultTitle = scene.add.text(225, -82, rightTitle, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '17px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText,
      align: 'center', fixedWidth: 310,
    }).setOrigin(0.5);

    const rowObjects = leftRows.slice(0, 4).map((copy, index) => {
      const y = -43 + index * 52;
      const chip = roundedSurfaceCh141(
        scene, -235, y, 320, 43,
        index % 2 === 0 ? 0xfff0bd : 0xd9f3f2, 1,
        MINI_GAME_VISUAL_VF07.chipRadius, 2.5, MINI_GAME_VISUAL_VF07.shellStroke, 0.58,
      );
      const label = scene.add.text(-235, y, copy, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '16px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.cocoaText,
        fixedWidth: 298, align: 'center',
      }).setOrigin(0.5).setName(`vf07-round-flow-left-row-${index}-ch142`);
      return [chip, label];
    }).flat();

    const arrow = scene.add.text(0, 35, '➜', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '48px', fontStyle: 'bold', color: '#8d6c58',
    }).setOrigin(0.5);
    const resultBox = roundedSurfaceCh141(
      scene, 225, 38, 310, 210, 0xffedb8, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.48,
    ).setName('vf07-round-flow-result-box-ch142');
    const resultText = scene.add.text(225, 38, rightCopy, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '16px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.cocoaText,
      fixedWidth: 276, align: 'center', lineSpacing: 4,
      wordWrap: { width: 276, useAdvancedWrap: true }, maxLines: 9,
    }).setOrigin(0.5).setName('vf07-round-flow-result-copy-ch142');

    stage.add([paper, head, stateTitle, resultTitle, ...rowObjects, arrow, resultBox, resultText]);
    scene.tweens.add({
      targets: [...rowObjects, arrow, resultBox, resultText],
      alpha: { from: 0.25, to: 1 }, duration: 190, ease: 'Back.easeOut',
    });
    await wait(ms);
  };

  const showMajorityFlow = async (
    heading: string,
    ids: readonly number[],
    choices: Record<number, PalmChoice>,
    tied: boolean,
    survivingPlayerIds: readonly number[],
    eliminatedPlayerIds: readonly number[],
    ms = 2100,
  ) => {
    clearStage();
    const paper = roundedSurfaceCh141(
      scene, 0, 18, 820, 330, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setName('vf07-majority-paper-ch141');
    const head = scene.add.text(0, -118, heading, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '25px', fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText, align: 'center', fixedWidth: 760,
    }).setOrigin(0.5).setName('vf07-majority-flow-heading');
    const stateTitle = scene.add.text(-235, -78, 'TRẠNG THÁI', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '17px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText,
      align: 'center', fixedWidth: 300,
    }).setOrigin(0.5);
    const resultTitle = scene.add.text(225, -78, 'KẾT QUẢ', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '17px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.mutedText,
      align: 'center', fixedWidth: 310,
    }).setOrigin(0.5);
    const rows = ids.map((id, index) => {
      const up = choices[id] === 'up';
      const y = -42 + index * 51;
      const chip = roundedSurfaceCh141(
        scene, -235, y, 300, 42, up ? 0x9eddf0 : 0xffd983, 1,
        MINI_GAME_VISUAL_VF07.chipRadius, 2.5, MINI_GAME_VISUAL_VF07.shellStroke, 0.68,
      );
      const label = scene.add.text(-235, y,
        `${playerById(id)?.name ?? `P${id + 1}`}   ${up ? '🤲 NGỬA' : '🖐️ SẤP'}`, {
          fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
          fontSize: '17px', fontStyle: 'bold', color: MINI_GAME_VISUAL_VF07.cocoaText,
          fixedWidth: 278, align: 'center',
        }).setOrigin(0.5);
      return [chip, label];
    }).flat();
    const arrow = scene.add.text(0, 35, '➜', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '48px', fontStyle: 'bold', color: '#8d6c58',
    }).setOrigin(0.5);
    const resultBox = roundedSurfaceCh141(
      scene, 225, 38, 310, 188, tied ? 0xffe1dc : 0xffedb8, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.48,
    ).setName('vf07-majority-result-box-ch141');
    const losers = eliminatedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ');
    const survivors = survivingPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ');
    const resultCopy = tied
      ? 'KHÔNG CÓ PHE THIỂU SỐ\n\nRA LẠI!'
      : `❌ BỊ LOẠI\n${losers || '—'}\n\n✅ CÒN LẠI\n${survivors || '—'}`;
    const resultText = scene.add.text(225, 38, resultCopy, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: tied ? '20px' : '18px', fontStyle: 'bold',
      color: MINI_GAME_VISUAL_VF07.cocoaText, fixedWidth: 274, align: 'center',
      lineSpacing: 5, wordWrap: { width: 274, useAdvancedWrap: true },
    }).setOrigin(0.5).setName('vf07-majority-result-copy');
    stage.add([paper, head, stateTitle, resultTitle, ...rows, arrow, resultBox, resultText]);
    scene.tweens.add({
      targets: [...rows, arrow, resultBox, resultText],
      alpha: { from: 0.25, to: 1 }, duration: 190, ease: 'Back.easeOut',
    });
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
    const leftCard = roundedSurfaceCh141(
      scene, -l.cardCenterX, l.cardCenterY, l.cardWidth, l.cardHeight, 0xffe09a, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, 0x4b332b, 1,
    ).setName('vf07-rps-card-left-ch141');
    const rightCard = roundedSurfaceCh141(
      scene, l.cardCenterX, l.cardCenterY, l.cardWidth, l.cardHeight, 0xd1b0f0, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, 0x4b332b, 1,
    ).setName('vf07-rps-card-right-ch141');
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
      if (winnerId === a.id) paintRoundedSurfaceCh141(
        leftCard, l.cardWidth, l.cardHeight, 0xffe09a, 1,
        MINI_GAME_VISUAL_VF07.surfaceRadius, 5, 0xe7ae35, 1,
      );
      if (winnerId === b.id) paintRoundedSurfaceCh141(
        rightCard, l.cardWidth, l.cardHeight, 0xd1b0f0, 1,
        MINI_GAME_VISUAL_VF07.surfaceRadius, 5, 0xe7ae35, 1,
      );
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
    const podiumPaper = roundedSurfaceCh141(
      scene, 0, 12, 780, 380, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setName('vf07-minigame-podium-paper-ch141');
    const podiumRibbon = roundedSurfaceCh141(
      scene, 0, -136, 470, 66, MINI_GAME_VISUAL_VF07.headerFill, 1,
      MINI_GAME_VISUAL_VF07.chipRadius, 3, MINI_GAME_VISUAL_VF07.shellStroke, 0.45,
    ).setName('vf07-minigame-podium-ribbon-ch141');
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
    paintRoundedSurfaceCh141(
      podiumPaper, 780, rankingBottom + 168, MINI_GAME_VISUAL_VF07.resultFill, 1,
      MINI_GAME_VISUAL_VF07.surfaceRadius, 4, MINI_GAME_VISUAL_VF07.shellStroke, 0.35,
    ).setY((rankingBottom - 168) / 2);
    paintRoundedSurfaceCh141(
      panel, 900, rankingBottom + 210, MINI_GAME_VISUAL_VF07.shellFill, 1,
      MINI_GAME_VISUAL_VF07.shellRadius, MINI_GAME_VISUAL_VF07.shellStrokeWidth,
      MINI_GAME_VISUAL_VF07.shellStroke, 1,
    ).setY(22 + (rankingBottom - 190) / 2);
    stage.add([winnerVoiceText, rewardHint]);
    scene.tweens.add({
      targets: [podiumPaper, podiumRibbon, heading, rowsViewport.root, winnerVoiceText, rewardHint],
      alpha: { from: 0.25, to: 1 },
      duration: 210,
      ease: 'Sine.easeOut',
    });
    await wait(rowsViewport.isScrollable ? 10000 : 5200);
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


  const rankSimultaneousThreeDoorLosers = async (
    ids: readonly number[],
    roundOffset: number,
  ): Promise<number[]> => {
    if (ids.length <= 1) return [...ids];

    const seeded = [...ids];
    for (let index = seeded.length - 1; index > 0; index -= 1) {
      const swapIndex = deterministicBit(eventSeq, 733 + roundOffset + index, 911 + index) % (index + 1);
      [seeded[index], seeded[swapIndex]] = [seeded[swapIndex]!, seeded[index]!];
    }

    let champion = seeded[0]!;
    const lowToHigh: number[] = [];
    for (let index = 1; index < seeded.length; index += 1) {
      const challenger = seeded[index]!;
      const duel = await runRpsFinal([champion, challenger], roundOffset + index * 20);
      if (duel) {
        lowToHigh.push(duel.loserId);
        champion = duel.winnerId;
        continue;
      }

      const fallbackBit = deterministicBit(eventSeq, 977 + roundOffset + index, 1201 + index) % 2;
      const winner = fallbackBit === 0 ? champion : challenger;
      const loser = fallbackBit === 0 ? challenger : champion;
      lowToHigh.push(loser);
      champion = winner;
    }
    lowToHigh.push(champion);
    return lowToHigh;
  };

  const runTournament = async (): Promise<MiniGameOutcome> => {
    let activeIds = players.map((player) => player.id);
    const eliminationOrder: number[] = [];
    const baseType: MiniGameBaseRewardType = minigameModeForActivePlayers(activeIds, slot.mode3Plus);
    const payoutType = miniGameRewardType059(baseType, slot.contentId);
    stake
      .setText(`${rewardTitle(baseType)} • ${miniGameRewardCopy059(slot.contentId, baseType)}`)
      .setVisible(false);
    await showRulesIntro(baseType, activeIds);

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
        const door = threeDoorLabel(result.winningDoor);

        if (result.tied) {
          const reason = result.survivingPlayerIds.length === activeIds.length
            && activeIds.every((id) => choices[id] === result.winningDoor)
            ? 'Tất cả cùng trúng cửa, chưa ai bị loại.'
            : 'Không ai chọn đúng cửa, ra lại!';
          await showRoundFlowCh142(
            `🎲 VÒNG ${round} • BA CỬA`,
            'NGƯỜI CHƠI • LỰA CHỌN',
            activeIds.map((id) => `${playerById(id)?.name ?? `P${id + 1}`}  •  🚪 CỬA ${threeDoorLabel(choices[id] ?? 'a')}`),
            'KẾT QUẢ',
            `🎲 ${roll} • CỬA ${door}\n\n🤝 ${reason}`,
          );
          continue;
        }

        const eliminatedThisRound = [...result.eliminatedPlayerIds];
        const losers = eliminatedThisRound
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        activeIds = result.survivingPlayerIds;
        const survivors = activeIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        await showRoundFlowCh142(
          `🎲 VÒNG ${round} • BA CỬA`,
          'NGƯỜI CHƠI • LỰA CHỌN',
          [...result.survivingPlayerIds, ...eliminatedThisRound].map((id) =>
            `${playerById(id)?.name ?? `P${id + 1}`}  •  🚪 CỬA ${threeDoorLabel(choices[id] ?? 'a')}`,
          ),
          'KẾT QUẢ',
          `🎲 ${roll} • CỬA ${door} TRÚNG!\n\n✅ Đi tiếp\n${survivors || '—'}\n\n❌ Bị loại\n${losers || '—'}`,
        );
        const rankedLosers = eliminatedThisRound.length > 1
          ? await rankSimultaneousThreeDoorLosers(eliminatedThisRound, round * 100)
          : eliminatedThisRound;
        eliminationOrder.push(...rankedLosers);
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
        const countCopy = `Phao 1: ${result.counts['1']} • Phao 2: ${result.counts['2']} • Phao 3: ${result.counts['3']}`;

        if (result.tied) {
          const everyoneUnique = activeIds.every((id) => {
            const choice = choices[id];
            return choice ? result.counts[choice] === 1 : false;
          });
          const reason = everyoneUnique
            ? 'Ai cũng đứng một mình, chưa ai chìm.'
            : 'Không có phao đơn nào nổi, chọn lại!';
          await showRoundFlowCh142(
            `🛟 VÒNG ${round} • PHAO ĐƠN`,
            'NGƯỜI CHƠI • LỰA CHỌN',
            activeIds.map((id) => `${playerById(id)?.name ?? `P${id + 1}`}  •  🛟 PHAO ${choices[id] ?? '1'}`),
            'KẾT QUẢ',
            `${countCopy}\n\n🤝 ${reason}`,
          );
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
        await showRoundFlowCh142(
          `🛟 VÒNG ${round} • PHAO ĐƠN`,
          'NGƯỜI CHƠI • LỰA CHỌN',
          [...result.survivorPlayerIds, ...result.eliminatedPlayerIds].map((id) =>
            `${playerById(id)?.name ?? `P${id + 1}`}  •  🛟 PHAO ${choices[id] ?? '1'}`,
          ),
          'KẾT QUẢ',
          `${countCopy}\n\n✅ Nổi\n${survivors || '—'}\n\n❌ Chìm\n${losers || '—'}`,
        );
      }
    } else if (baseType === 'final_sprint') {
      subtitle.setText(`${slot.title} • ĐUA 3 CHẶNG • cộng tổng D6 rồi lấy Top 2`);
      const legRolls: Record<number, number[]> = {};
      for (const id of activeIds) legRolls[id] = [];
      for (let leg = 1; leg <= 3; leg += 1) {
        round = leg;
        for (const id of activeIds) legRolls[id]!.push(finalSprintRoll(eventSeq, id, leg));
        const standings = activeIds.map((id) => ({ id, total: legRolls[id]!.reduce((sum, roll) => sum + roll, 0) })).sort((a, b) => b.total - a.total);
        const sprintRows = standings.map(({ id, total }) =>
          `${playerById(id)?.name ?? `P${id + 1}`} • ${legRolls[id]!.map((roll) => `🎲${roll}`).join(' ')} • Σ${total}`,
        );
        const leader = standings[0];
        await showRoundFlowCh142(
          `🏁 CHẶNG ${leg}/3`,
          'NGƯỜI CHƠI • THÀNH TÍCH',
          sprintRows,
          'KẾT QUẢ',
          leader ? `🏁 ĐANG DẪN\n${playerById(leader.id)?.name ?? `P${leader.id + 1}`}\n\nTỔNG ${leader.total}` : '—',
          leg === 3 ? 1900 : 1350,
        );
      }
      const sprint = resolveFinalSprint(activeIds, legRolls, 2);
      const finalists = [...sprint.lockedPlayerIds];
      eliminationOrder.push(...sprint.lowerPlayerIds);
      let overtime = [...sprint.overtimePlayerIds];
      let slotsOpen = sprint.slotsOpen;
      if (sprint.complete) {
        activeIds = finalists.slice(0, 2);
        await showResult('🏁 CẮT TOP SAU 3 CHẶNG', `✅ Vào chung kết: ${activeIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ')}`);
      } else {
        let overtimeRound = 0;
        while (overtime.length > slotsOpen && safety < 16) {
          safety += 1; overtimeRound += 1;
          const rolls: Record<number, number> = {};
          for (const id of overtime) rolls[id] = finalSprintRoll(eventSeq, id, 20 + overtimeRound);
          const cut = resolveCutTopDiceRound(overtime, rolls, slotsOpen);
          finalists.push(...cut.lockedPlayerIds); eliminationOrder.push(...cut.eliminatedPlayerIds);
          const overtimeRows = overtime.map((id) => `${playerById(id)?.name ?? `P${id + 1}`} • 🎲 ${rolls[id]}`);
          if (cut.complete) {
            await showRoundFlowCh142(
              '⚡ HIỆP PHỤ CHỐT TOP', 'NGƯỜI CHƠI • D6', overtimeRows, 'KẾT QUẢ',
              `✅ Chốt ghế: ${cut.lockedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ') || '—'}`,
            );
            overtime = []; slotsOpen = 0; break;
          }
          await showRoundFlowCh142(
            '⚡ HÒA RANH TOP • CHẠY TIẾP', 'NGƯỜI CHƠI • D6', overtimeRows, 'KẾT QUẢ',
            `🔁 ${cut.rerollPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ')}\n\nTranh ${cut.slotsOpen} ghế còn lại.`,
          );
          overtime = cut.rerollPlayerIds; slotsOpen = cut.slotsOpen;
        }
        if (overtime.length === slotsOpen && slotsOpen > 0) finalists.push(...overtime);
        activeIds = finalists.slice(0, 2);
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

        const cutRows = contenders.map((id) => `${playerById(id)?.name ?? `P${id + 1}`} • 🎲 ${rolls[id]}`);
        if (result.complete) {
          await showRoundFlowCh142(
            `🎲 CẮT TOP • VÒNG ${round}`,
            'NGƯỜI CHƠI • D6',
            cutRows,
            'KẾT QUẢ',
            [lockedCopy, eliminatedCopy].filter(Boolean).join('\n\n') || 'ĐÃ CHỐT TOP',
          );
          contenders = [];
          slotsOpen = 0;
          break;
        }

        const tieCopy = result.rerollPlayerIds
          .map((id) => playerById(id)?.name ?? `P${id + 1}`)
          .join(', ');
        await showRoundFlowCh142(
          '🎲 HÒA Ở RANH TOP • ĐỔ LẠI',
          'NGƯỜI CHƠI • D6',
          cutRows,
          'KẾT QUẢ',
          [
            lockedCopy,
            eliminatedCopy,
            `🔁 ${tieCopy}\nĐổ lại để tranh ${result.slotsOpen} ghế.`,
          ].filter(Boolean).join('\n\n'),
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
      if (result.tied) {
        await showMajorityFlow(
          `VÒNG ${round} • 🤝 HÒA, RA LẠI!`,
          activeIds,
          choices,
          true,
          activeIds,
          [],
        );
        continue;
      }

      eliminationOrder.push(...result.eliminatedPlayerIds);
      const previousIds = [...activeIds];
      activeIds = result.survivingPlayerIds;
      await showMajorityFlow(
        `VÒNG ${round} • 😵 ÍT BỊ!`,
        previousIds,
        choices,
        false,
        activeIds,
        result.eliminatedPlayerIds,
      );
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
