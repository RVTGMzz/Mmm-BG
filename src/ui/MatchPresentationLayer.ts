import Phaser from 'phaser';
import { sfxController, type SfxCue } from '../audio/sfxController';
import type { MatchEvent } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';
import type { PresentationTimingPolicy } from './presentationFlowPolicy';
import { diceSettleFeedbackCh09, landingFeedbackCh09 } from './presentationFeedbackCh09';
import { reactionPlacement070422 } from './presentationLanes070422';
import {
  buildPresentationModel,
  type PresentationEventModel,
  type PresentationReactionLine,
} from './presentationModel';

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const COCOA_CH1713 = 0x4b302a;
const CREAM_CH1713 = 0xfff7e8;
const PAPER_CH1713 = 0xfffcf6;
const BUTTER_CH1713 = 0xffd76a;
const MINT_CH1713 = 0xa9e0b1;
const PEACH_CH1713 = 0xffb69f;
const TEXT_CH1713 = '#4b302a';
const BODY_CH1713 = '#66534b';

// 0.1.70.4.22: reaction geometry is owned by presentationLanes070422.
// Do not put a 328px bubble in the ~240px side rail again.

const KIND_PALETTE: Record<PresentationEventModel['kind'], { panel: number; accent: number; label: string }> = {
  dice_roll: { panel: 0x24211d, accent: 0xffd34d, label: 'DICE' },
  move_step: { panel: 0x24211d, accent: 0xffd34d, label: 'MOVE' },
  tile_land: { panel: 0x312d28, accent: 0xffd34d, label: 'LANDING' },
  ready_bonus: { panel: 0x173c31, accent: 0xffd34d, label: 'READY BONUS' },
  board_shuffle: { panel: 0x28485a, accent: 0x77d9e7, label: 'BOARD SHIFT' },
  card_draw: { panel: 0x332543, accent: 0xb997d6, label: 'CARD DROP' },
  card_blocked: { panel: 0x473b2c, accent: 0xffd34d, label: 'HAND LIMIT' },
  card_play: { panel: 0x2d203f, accent: 0xd4a8ff, label: 'CARD ACTION' },
  news: { panel: 0x173c31, accent: 0x9bcf74, label: 'CITY NEWS' },
};

const RARITY_COLORS: Record<string, number> = {
  N: 0xe4ded2,
  R: 0x8fc2ff,
  SR: 0xd7a6ff,
  SSR: 0xffd34d,
};

const EXPRESSION_ICON: Record<FaceExpression, string> = {
  neutral: '😐',
  happy: '😄',
  angry: '😤',
};

export interface MatchPresentationLayerOptions {
  onBlockingChange?: (blocking: boolean) => void;
  timingForModel?: (model: PresentationEventModel, textRevealMs: number) => PresentationTimingPolicy;
  onMoveStep?: (model: PresentationEventModel) => Promise<void> | void;
  onPresentationStart?: (model: PresentationEventModel) => void;
  onPresentationEnd?: (model: PresentationEventModel) => void;
}

export interface PresentationCinematicRender070427 {
  container: Phaser.GameObjects.Container;
  revealTarget?: Phaser.GameObjects.Text;
  revealText?: string;
  minAutoCloseMs?: number;
}

export type PresentationCinematicRenderer070427 = (
  model: PresentationEventModel,
) => PresentationCinematicRender070427 | undefined;

export class MatchPresentationLayer {
  private readonly queue: PresentationEventModel[] = [];
  private active?: Phaser.GameObjects.Container;
  private currentModel?: PresentationEventModel;
  private continueHint?: Phaser.GameObjects.Container;
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly reactionObjects = new Set<Phaser.GameObjects.Container>();
  private destroyed = false;
  private blocking = false;
  private canAcknowledge = false;
  private cinematicRenderer070427?: PresentationCinematicRenderer070427;

  private readonly acknowledgeKey = () => this.requestAdvance();
  private readonly acknowledgePointer = () => this.requestAdvance();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getPlayers: () => PlayerState[],
    private readonly options: MatchPresentationLayerOptions = {},
  ) {
    this.scene.input.keyboard?.on('keydown-SPACE', this.acknowledgeKey);
    this.scene.input.keyboard?.on('keydown-ENTER', this.acknowledgeKey);
    this.scene.input.on('pointerdown', this.acknowledgePointer);
  }

  isBlocking(): boolean {
    return this.blocking;
  }

  setCinematicRenderer070427(renderer: PresentationCinematicRenderer070427 | undefined): void {
    this.cinematicRenderer070427 = renderer;
  }

  enqueue(events: MatchEvent[]): void {
    if (this.destroyed) return;
    const players = this.getPlayers();
    let added = false;
    for (const event of events) {
      const model = buildPresentationModel(event, players);
      if (!model) continue;
      this.queue.push(model);
      added = true;
    }
    if (!added) return;
    this.setBlocking(true);
    this.pump();
  }

  destroy(): void {
    this.destroyed = true;
    this.queue.length = 0;
    this.scene.input.keyboard?.off('keydown-SPACE', this.acknowledgeKey);
    this.scene.input.keyboard?.off('keydown-ENTER', this.acknowledgeKey);
    this.scene.input.off('pointerdown', this.acknowledgePointer);
    for (const timer of this.timers) timer.remove(false);
    this.timers.clear();
    this.clearReactionObjects();
    this.clearContinueHint();
    this.active?.destroy();
    this.active = undefined;
    this.currentModel = undefined;
    this.setBlocking(false);
  }

  private setBlocking(blocking: boolean): void {
    if (this.blocking === blocking) return;
    this.blocking = blocking;
    this.options.onBlockingChange?.(blocking);
  }

  private pump(): void {
    if (this.destroyed || this.active) return;
    if (this.queue.length === 0) {
      this.schedule(90, () => {
        if (!this.active && this.queue.length === 0) this.setBlocking(false);
      });
      return;
    }

    const model = this.queue.shift();
    if (!model) return;
    this.currentModel = model;
    this.canAcknowledge = false;
    this.clearContinueHint();
    this.options.onPresentationStart?.(model);

    if (model.kind === 'move_step') {
      this.runMoveStep(model);
      return;
    }
    if (model.kind === 'dice_roll') {
      this.showDiceRoll(model);
      return;
    }
    if (model.kind === 'tile_land' || model.kind === 'ready_bonus') {
      this.showLanding(model);
      return;
    }
    this.showCinematic(model);
  }

  private runMoveStep(model: PresentationEventModel): void {
    const blocker = this.scene.add.container(-100, -100).setVisible(false);
    this.active = blocker;
    Promise.resolve(this.options.onMoveStep?.(model))
      .catch(() => undefined)
      .finally(() => {
        if (this.destroyed || this.currentModel !== model) return;
        this.finishCurrent(false);
      });
  }

  private showDiceRoll(model: PresentationEventModel): void {
    const result = Math.max(1, Math.min(6, model.roll ?? 1));
    const container = this.scene.add.container(640, 344)
      .setName('presentation-dice-card-ch1713')
      .setDepth(920)
      .setAlpha(0)
      .setScale(0.72);
    this.active = container;

    const shadow = this.scene.add.graphics().setName('presentation-dice-shadow-ch1713');
    shadow.fillStyle(COCOA_CH1713, 0.20);
    shadow.fillRoundedRect(-112, -103, 224, 214, 34);
    shadow.setPosition(0, 8);

    const panel = this.scene.add.graphics().setName('presentation-dice-panel-ch1713');
    panel.fillStyle(CREAM_CH1713, 0.995);
    panel.fillRoundedRect(-108, -106, 216, 208, 32);
    panel.fillStyle(0xffffff, 0.50);
    panel.fillRoundedRect(-94, -92, 188, 13, 7);
    panel.lineStyle(4, COCOA_CH1713, 0.96);
    panel.strokeRoundedRect(-108, -106, 216, 208, 32);

    const ribbon = this.scene.add.graphics().setName('presentation-dice-ribbon-ch1713');
    ribbon.fillStyle(BUTTER_CH1713, 1);
    ribbon.fillRoundedRect(-78, 69, 156, 43, 17);
    ribbon.lineStyle(3, COCOA_CH1713, 0.92);
    ribbon.strokeRoundedRect(-78, 69, 156, 43, 17);

    const dieWell = this.scene.add.graphics().setName('presentation-dice-well-ch1713');
    dieWell.fillStyle(PAPER_CH1713, 1);
    dieWell.fillRoundedRect(-67, -70, 134, 134, 30);
    dieWell.fillStyle(0xffffff, 0.58);
    dieWell.fillRoundedRect(-54, -57, 108, 13, 7);
    dieWell.lineStyle(4, COCOA_CH1713, 0.88);
    dieWell.strokeRoundedRect(-67, -70, 134, 134, 30);

    const die = this.scene.add.text(0, -3, DICE_FACES[(result + 1) % 6], {
      fontFamily: 'Arial, sans-serif',
      fontSize: '84px',
      color: TEXT_CH1713,
    }).setOrigin(0.5);

    const label = this.scene.add.text(0, 90, `${model.actorName} đổ xúc xắc`, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
    }).setOrigin(0.5);

    container.add([shadow, panel, dieWell, ribbon, die, label]);

    sfxController.play('dice_roll');
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 140,
      ease: 'Back.easeOut',
    });

    for (let index = 0; index < 6; index += 1) {
      this.schedule(80 + index * 72, () => {
        if (!die.active) return;
        die.setText(DICE_FACES[(result + index * 3 + 2) % 6]);
        die.setAngle(index % 2 === 0 ? -9 : 9);
      });
    }
    this.schedule(560, () => {
      if (!die.active) return;
      die.setText(DICE_FACES[result - 1]).setAngle(0).setScale(1.12);
      const settle = diceSettleFeedbackCh09(result);
      this.spawnBurst(BUTTER_CH1713, settle.burstCount, 640, 344);
      this.scene.cameras.main.shake(settle.cameraShake.durationMs, settle.cameraShake.intensity);
      this.scene.tweens.add({ targets: die, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.easeOut' });
    });
    this.schedule(model.holdMs, () => this.finishCurrent(false));
  }

  private showLanding(model: PresentationEventModel): void {
    const palette = KIND_PALETTE[model.kind];
    const isJobCard = model.tileType === 'job';
    if (isJobCard) {
      for (const object of [...this.scene.children.list]) {
        if (
          object instanceof Phaser.GameObjects.Container
          && object.active
          && object.name === 'job-presentation-card'
        ) object.destroy(true);
      }
    }

    const panelWidth = isJobCard ? 700 : 560;
    const bodyWidth = isJobCard ? 500 : 410;
    const contentX = isJobCard ? -218 : -178;
    const iconX = isJobCard ? -286 : -226;
    const container = this.scene.add.container(640, 350)
      .setDepth(900)
      .setAlpha(0)
      .setScale(0.9);
    if (isJobCard) container.setName('job-presentation-card');
    else container.setName('presentation-landing-card-ch1713');
    this.active = container;

    const shadow = this.scene.add.graphics().setName('presentation-landing-shadow-ch1713');
    shadow.fillStyle(COCOA_CH1713, 0.20);
    shadow.fillRoundedRect(-(panelWidth / 2), -78, panelWidth, 174, 24);
    shadow.setPosition(4, 7);

    const panel = this.scene.add.graphics().setName('presentation-landing-panel-ch1713');
    panel.fillStyle(CREAM_CH1713, 0.995);
    panel.fillRoundedRect(-panelWidth / 2, -84, panelWidth, 168, 22);
    panel.fillStyle(0xffffff, 0.44);
    panel.fillRoundedRect(-panelWidth / 2 + 14, -72, panelWidth - 28, 10, 5);
    panel.fillStyle(palette.accent, 0.98);
    panel.fillRoundedRect(-panelWidth / 2, -84, 14, 168, { tl: 22, tr: 6, bl: 22, br: 6 });
    panel.lineStyle(4, COCOA_CH1713, 0.92);
    panel.strokeRoundedRect(-panelWidth / 2, -84, panelWidth, 168, 22);

    const iconWell = this.scene.add.graphics().setName('presentation-landing-icon-well-ch1713');
    iconWell.fillStyle(PAPER_CH1713, 1);
    iconWell.fillRoundedRect(iconX - 42, -44, 84, 84, 23);
    iconWell.lineStyle(3, palette.accent, 0.88);
    iconWell.strokeRoundedRect(iconX - 42, -44, 84, 84, 23);

    const icon = this.scene.add.text(iconX, -2, model.impact || '•', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
    }).setOrigin(0.5);

    const eyebrow = this.scene.add.text(contentX, -54, model.eyebrow, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#816c61',
    });
    const title = this.scene.add.text(contentX, -26, model.title, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
      fixedWidth: bodyWidth,
      wordWrap: { width: bodyWidth },
    });
    const description = this.scene.add.text(contentX, 19, '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '14px',
      color: BODY_CH1713,
      wordWrap: { width: bodyWidth },
      fixedWidth: bodyWidth,
      fixedHeight: 58,
      lineSpacing: 3,
    });

    if (model.tileType === 'character_passive') {
      container.setName('character-passive-presentation-ch05');
      title.setName('character-passive-title-ch05');
      description.setName('character-passive-body-ch05');
    }

    container.add([shadow, panel, iconWell, icon, eyebrow, title, description]);
    const revealMs = this.revealText(description, model.description);
    const landingFeedback = landingFeedbackCh09(model);
    sfxController.play(landingFeedback.cue);
    this.spawnBurst(palette.accent, landingFeedback.burstCount, 640, 350);
    if (landingFeedback.cameraShake) {
      this.scene.cameras.main.shake(landingFeedback.cameraShake.durationMs, landingFeedback.cameraShake.intensity);
    }
    if (model.kind === 'ready_bonus') this.spawnConfetti();
    if (landingFeedback.floatingMoney) this.showFloatingMoney(model.amount ?? 0, model.actorId);

    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 190,
      ease: 'Back.easeOut',
    });

    // CH-04B authority/timing remains unchanged; CH-17.13 only refreshes the surface.
    let landingReactionEnd0704 = 0;
    model.reactions.forEach((line, index) => {
      const reactionReveal = Math.min(2200, Math.max(500, line.text.length * 24));
      landingReactionEnd0704 = Math.max(
        landingReactionEnd0704,
        220 + line.delayMs + Math.max(line.durationMs, reactionReveal),
      );
      this.schedule(220 + line.delayMs, () => {
        if (this.destroyed || this.currentModel !== model || !this.active?.active) return;
        this.showReaction(model, line, index);
      });
    });

    this.armTiming(model, Math.max(revealMs, landingReactionEnd0704));
  }

  private showCinematic(model: PresentationEventModel): void {
    const palette = KIND_PALETTE[model.kind];
    const owned = this.cinematicRenderer070427?.(model);
    let container: Phaser.GameObjects.Container;
    let revealMs: number;
    let minAutoCloseMs = 0;

    if (owned) {
      // Card/News can supply their final canonical visual directly. No legacy
      // body object or typewriter tween is ever created, so there is nothing
      // detached that can wake up later and leak outside the modal.
      container = owned.container;
      this.active = container;
      const fullRevealText = owned.revealText ?? owned.revealTarget?.text ?? '';
      revealMs = owned.revealTarget
        ? this.revealText(owned.revealTarget, fullRevealText)
        : 450;
      minAutoCloseMs = Math.max(0, owned.minAutoCloseMs ?? 0);
    } else {
      container = this.scene.add.container(640, 330)
        .setName('presentation-cinematic-card-ch1713')
        .setDepth(900)
        .setAlpha(0)
        .setScale(0.94);
      this.active = container;

      const shadow = this.scene.add.graphics().setName('presentation-cinematic-shadow-ch1713');
      shadow.fillStyle(COCOA_CH1713, 0.22);
      shadow.fillRoundedRect(-360, -143, 720, 300, 26);
      shadow.setPosition(5, 9);

      const panel = this.scene.add.graphics().setName('presentation-cinematic-panel-ch1713');
      panel.fillStyle(CREAM_CH1713, 0.995);
      panel.fillRoundedRect(-360, -150, 720, 300, 24);
      panel.fillStyle(0xffffff, 0.46);
      panel.fillRoundedRect(-340, -133, 680, 11, 6);
      panel.fillStyle(palette.accent, 0.98);
      panel.fillRoundedRect(-360, -150, 720, 48, { tl: 24, tr: 24, bl: 8, br: 8 });
      panel.lineStyle(4, COCOA_CH1713, 0.92);
      panel.strokeRoundedRect(-360, -150, 720, 300, 24);

      const kicker = this.scene.add.text(-322, -126, model.eyebrow, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: TEXT_CH1713,
        letterSpacing: 1.1,
      }).setOrigin(0, 0.5);

      const title = this.scene.add.text(-322, -82, model.title, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: TEXT_CH1713,
        wordWrap: { width: 540 },
      });

      const impactWell = this.scene.add.graphics().setName('presentation-cinematic-impact-ch1713');
      impactWell.fillStyle(PAPER_CH1713, 0.92);
      impactWell.fillRoundedRect(244, -139, 84, 28, 14);
      impactWell.lineStyle(2, COCOA_CH1713, 0.72);
      impactWell.strokeRoundedRect(244, -139, 84, 28, 14);

      const impact = this.scene.add.text(286, -125, model.impact || '•', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: TEXT_CH1713,
      }).setOrigin(0.5);

      const bodyText = [model.description, model.summary && model.summary !== model.description ? `→ ${model.summary}` : '']
        .filter(Boolean)
        .join('\n\n');
      const body = this.scene.add.text(-322, -28, '', {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: BODY_CH1713,
        wordWrap: { width: 628 },
        lineSpacing: 5,
        fixedWidth: 628,
        fixedHeight: 128,
      });
      const source = this.scene.add.text(316, 126, `${palette.label} • #${model.eventSeq}`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '9px',
        color: '#8c776b',
      }).setOrigin(1, 0.5);

      container.add([shadow, panel, kicker, title, impactWell, impact, body, source]);
      this.addNaturalActionLine(container, model);
      if (model.rarity) this.addRarityBadge(container, 238, -82, model.rarity);
      revealMs = this.revealText(body, bodyText);
    }

    this.playModelSfx(model);
    this.spawnBurst(palette.accent, model.rarity === 'SSR' ? 18 : 10, 640, 330);
    if (model.kind === 'card_draw' || model.kind === 'card_play') this.spawnCardFlip(palette.accent);
    if (model.kind === 'board_shuffle') {
      this.spawnBurst(palette.accent, 22, 640, 330);
      this.scene.cameras.main.shake(180, 0.0012);
    }
    if (model.rarity === 'SSR') this.scene.cameras.main.shake(120, 0.0016);

    this.scene.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 230, ease: 'Back.easeOut',
    });

    let reactionEnd = 0;
    model.reactions.forEach((line, index) => {
      const reactionReveal = Math.min(2200, Math.max(500, line.text.length * 24));
      reactionEnd = Math.max(reactionEnd, 320 + line.delayMs + Math.max(line.durationMs, reactionReveal));
      // An earlier card may have been skipped before this delayed callback runs.
      // Old reactions must never appear over the next card/news event.
      this.schedule(320 + line.delayMs, () => {
        if (this.destroyed || this.currentModel !== model || !this.active?.active) return;
        this.showReaction(model, line, index);
      });
    });

    this.armTiming(model, Math.max(revealMs, reactionEnd), minAutoCloseMs);
  }


  private revealText(target: Phaser.GameObjects.Text, fullText: string): number {
    if (!fullText) {
      target.setText('');
      return 450;
    }
    const duration = Math.min(2600, Math.max(500, fullText.length * 22));
    const progress = { value: 0 };
    target.setText('');
    this.scene.tweens.add({
      targets: progress,
      value: fullText.length,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        if (target.active) target.setText(fullText.slice(0, Math.floor(progress.value)));
      },
      onComplete: () => {
        if (target.active) target.setText(fullText);
      },
    });
    return duration;
  }

  private armTiming(model: PresentationEventModel, revealMs: number, minAutoCloseMs = 0): void {
    const policy = this.options.timingForModel?.(model, revealMs) ?? {
      mode: 'auto' as const,
      skipAfterMs: Math.max(700, revealMs),
      autoCloseMs: Math.max(model.holdMs, revealMs + 600, minAutoCloseMs),
    };

    if (Number.isFinite(policy.skipAfterMs)) {
      this.schedule(policy.skipAfterMs, () => {
        if (this.destroyed || !this.active || this.currentModel !== model) return;
        this.canAcknowledge = true;
        this.showContinueHint(policy.mode === 'manual');
      });
    }
    if (policy.mode === 'auto' && policy.autoCloseMs !== undefined) {
      this.schedule(policy.autoCloseMs, () => {
        if (this.currentModel === model) this.finishCurrent(false);
      });
    }
  }

  private requestAdvance(): void {
    if (this.destroyed || !this.active || !this.canAcknowledge) return;
    this.canAcknowledge = false;
    sfxController.play('ui_confirm');
    this.finishCurrent(true);
  }

  private showContinueHint(manual: boolean): void {
    this.clearContinueHint();

    const container = this.scene.add.container(640, 526)
      .setName('presentation-continue-chip-ch1713')
      .setDepth(940)
      .setAlpha(0.1);
    const copy = manual
      ? 'TIẾP TỤC  •  SPACE / ENTER / CLICK'
      : 'BỎ QUA  •  SPACE / ENTER / CLICK';

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(COCOA_CH1713, 0.22);
    shadow.fillRoundedRect(-151, -17, 302, 40, 17);

    const bg = this.scene.add.graphics();
    bg.fillStyle(BUTTER_CH1713, 1);
    bg.fillRoundedRect(-151, -21, 302, 40, 17);
    bg.fillStyle(0xffffff, 0.46);
    bg.fillRoundedRect(-140, -15, 280, 7, 4);
    bg.lineStyle(3, COCOA_CH1713, 0.94);
    bg.strokeRoundedRect(-151, -21, 302, 40, 17);

    const label = this.scene.add.text(0, -1, copy, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    this.continueHint = container;
    this.scene.tweens.add({ targets: container, alpha: 1, duration: 160, ease: 'Sine.easeOut' });
  }

  private clearContinueHint(): void {
    if (!this.continueHint) return;
    this.scene.tweens.killTweensOf(this.continueHint);
    this.continueHint.destroy();
    this.continueHint = undefined;
  }

  private finishCurrent(animate = true): void {
    const current = this.active;
    const model = this.currentModel;
    if (!current || !model) return;
    this.canAcknowledge = false;
    this.clearContinueHint();
    this.clearReactionObjects();

    const done = () => {
      if (current.active) current.destroy();
      if (this.active === current) this.active = undefined;
      if (this.currentModel === model) this.currentModel = undefined;
      this.options.onPresentationEnd?.(model);
      this.pump();
    };

    if (!animate || !current.visible) {
      done();
      return;
    }
    this.scene.tweens.add({
      targets: current,
      alpha: 0,
      scaleX: 0.97,
      scaleY: 0.97,
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: done,
    });
  }

  private playModelSfx(model: PresentationEventModel): void {
    let cue: SfxCue = 'land';
    if (model.kind === 'ready_bonus' || model.kind === 'board_shuffle') cue = 'ready';
    else if (model.kind === 'card_draw') cue = 'card_draw';
    else if (model.kind === 'card_play' || model.kind === 'card_blocked') cue = 'card_play';
    else if (model.kind === 'news') cue = 'news';
    else if (model.kind === 'tile_land' && model.tileType === 'money') cue = (model.amount ?? 0) >= 0 ? 'coin_gain' : 'coin_loss';
    sfxController.play(cue);
  }

  private showFloatingMoney(amount: number, playerId?: number): void {
    if (amount === 0) return;
    const positive = amount > 0;
    const sign = positive ? '+' : '';
    const x = 640 + (playerId === undefined ? 0 : (playerId - 1.5) * 34);

    const container = this.scene.add.container(x, 438)
      .setName('presentation-money-chip-ch1713')
      .setDepth(925)
      .setScale(0.72);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(COCOA_CH1713, 0.18);
    shadow.fillRoundedRect(-70, -19, 140, 44, 18);

    const bg = this.scene.add.graphics();
    bg.fillStyle(positive ? MINT_CH1713 : PEACH_CH1713, 1);
    bg.fillRoundedRect(-70, -23, 140, 44, 18);
    bg.fillStyle(0xffffff, 0.50);
    bg.fillRoundedRect(-59, -17, 118, 8, 4);
    bg.lineStyle(3, COCOA_CH1713, 0.90);
    bg.strokeRoundedRect(-70, -23, 140, 44, 18);

    const text = this.scene.add.text(0, -1, `${sign}${amount} B$`, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
    }).setOrigin(0.5);

    container.add([shadow, bg, text]);
    this.scene.tweens.add({
      targets: container,
      y: 390,
      scaleX: 1.06,
      scaleY: 1.06,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => container.destroy(true),
    });
  }

  private spawnBurst(color: number, count: number, x: number, y: number): void {
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const distance = 50 + (index % 3) * 18;
      const dot = this.scene.add.circle(x, y, 3 + (index % 2), color, 0.9).setDepth(890).setScale(0.5);
      this.scene.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 430 + (index % 4) * 45,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  private spawnConfetti(): void {
    const colors = [0xef4545, 0x5b8def, 0xffd34d, 0x61b37b, 0xb997d6];
    for (let index = 0; index < 18; index += 1) {
      const x = 430 + (index * 53) % 420;
      const piece = this.scene.add.rectangle(x, 260, 7, 13, colors[index % colors.length], 1)
        .setDepth(892).setAngle((index * 37) % 180);
      this.scene.tweens.add({
        targets: piece,
        y: 470 + (index % 4) * 18,
        x: x + ((index % 2 === 0 ? 1 : -1) * (18 + (index % 5) * 6)),
        angle: piece.angle + 220,
        alpha: 0,
        duration: 720 + (index % 5) * 70,
        ease: 'Quad.easeIn',
        onComplete: () => piece.destroy(),
      });
    }
  }

  private spawnCardFlip(color: number): void {
    const card = this.scene.add.rectangle(640, 515, 54, 76, 0xfffbf3, 1)
      .setStrokeStyle(4, color, 1).setDepth(896).setScale(0.4).setAngle(-24);
    this.scene.tweens.add({
      targets: card, y: 448, scaleX: 1, scaleY: 1, angle: 6, alpha: 0, duration: 420, ease: 'Back.easeOut',
      onComplete: () => card.destroy(),
    });
  }

  private addNaturalActionLine(
    container: Phaser.GameObjects.Container,
    model: PresentationEventModel,
  ): void {
    if (model.kind !== 'card_play' || model.targetId === undefined || !model.targetName) return;

    const amount = Math.abs(model.amount ?? 0);
    const directMoneyTransfer =
      model.cardEffectType === 'steal_money'
      || model.cardEffectType === 'rich_tax'
      || model.cardEffectType === 'tactical_choice';
    if (!directMoneyTransfer || amount <= 0) return;

    const copy = `${model.targetName} đưa ${amount} B$ cho ${model.actorName}`;

    const bg = this.scene.add.graphics().setName('presentation-action-line-ch1713');
    bg.fillStyle(MINT_CH1713, 0.96);
    bg.fillRoundedRect(-322, 104, 628, 31, 15);
    bg.lineStyle(2, COCOA_CH1713, 0.72);
    bg.strokeRoundedRect(-322, 104, 628, 31, 15);

    const text = this.scene.add.text(-306, 120, copy, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
      fixedWidth: 596,
      align: 'center',
    }).setOrigin(0, 0.5);
    container.add([bg, text]);
  }

  private addRarityBadge(container: Phaser.GameObjects.Container, x: number, y: number, rarity: string): void {
    const color = RARITY_COLORS[rarity] ?? 0xe4ded2;
    const bg = this.scene.add.graphics().setName('presentation-rarity-badge-ch1713');
    bg.fillStyle(COCOA_CH1713, 0.18);
    bg.fillRoundedRect(x + 2, y - 8, 74, 22, 11);
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x, y - 11, 74, 22, 11);
    bg.lineStyle(2, COCOA_CH1713, 0.82);
    bg.strokeRoundedRect(x, y - 11, 74, 22, 11);
    const text = this.scene.add.text(x + 37, y, rarity, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: TEXT_CH1713,
    }).setOrigin(0.5);
    container.add([bg, text]);
  }

  /**
   * Only the current model may own reaction balloons. Reaction placement is
   * centrally tested against the largest modal and active corner HUD bounds.
   * If there is no safe rail, hide the balloon instead of floating over copy.
   */
  private showReaction(
    model: PresentationEventModel,
    line: PresentationReactionLine,
    index: number,
  ): void {
    if (this.destroyed || this.currentModel !== model || !this.active?.active) return;
    const placement = reactionPlacement070422(
      line.speakerId,
      index,
      Number(this.scene.scale.gameSize.width) || 1280,
      Number(this.scene.scale.gameSize.height) || 720,
    );
    if (!placement) return;
    sfxController.play('reaction');

    const { x, y, side } = placement;
    const left = side === 'left';
    const color = line.speakerId === undefined
      ? 0x746b61
      : PLAYER_COLORS[line.speakerId % PLAYER_COLORS.length];
    const bubble = this.scene.add.container(x, y)
      .setName('presentation-reaction-bubble-070422')
      .setDepth(910)
      .setAlpha(0);
    this.reactionObjects.add(bubble);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.17);
    shadow.fillRoundedRect(-106, -54, 212, 116, 18);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xfffbf3, 0.99);
    bg.fillRoundedRect(-106, -58, 212, 116, 18);
    bg.lineStyle(3, color, 0.88);
    bg.strokeRoundedRect(-106, -58, 212, 116, 18);

    const avatar = this.buildAvatar(line.speakerId, line.expression, color);
    avatar.setPosition(left ? -82 : 82, -2).setScale(0.78);
    const textX = left ? -56 : -98;
    const speaker = this.scene.add.text(
      textX, -43, `${line.speakerName}  ${EXPRESSION_ICON[line.expression]}`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#4b4239',
        fixedWidth: 144,
      },
    );
    const quote = this.scene.add.text(textX, -13, '', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#201d1a',
      wordWrap: { width: 144, useAdvancedWrap: true },
      fixedWidth: 144,
      fixedHeight: 62,
      lineSpacing: 2,
      maxLines: 3,
    });
    bubble.add([shadow, bg, avatar, speaker, quote]);
    bubble.y += y < 360 ? -8 : 8;
    this.revealText(quote, line.text);
    this.scene.tweens.add({
      targets: bubble, y, alpha: 1, duration: 180, ease: 'Sine.easeOut',
    });

    this.schedule(Math.max(850, line.durationMs), () => {
      if (this.destroyed || !bubble.active || this.currentModel !== model) return;
      this.scene.tweens.add({
        targets: bubble, alpha: 0, y: y - 8, duration: 240,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.reactionObjects.delete(bubble);
          bubble.destroy();
        },
      });
    });
  }

  private buildAvatar(playerId: number | undefined, expression: FaceExpression, color: number): Phaser.GameObjects.Container {
    const avatar = this.scene.add.container(0, 0);
    const frame = this.scene.add.graphics();
    frame.fillStyle(color, 1);
    frame.fillCircle(0, 0, 24);
    frame.fillStyle(0xfffbf3, 1);
    frame.fillCircle(0, 0, 20);
    avatar.add(frame);

    if (playerId !== undefined) {
      const face = gameSession.getFace(playerId, expression);
      if (face && this.scene.textures.exists(face.textureKey)) {
        avatar.add(this.scene.add.image(0, 0, face.textureKey).setDisplaySize(38, 38));
        return avatar;
      }
    }

    const name = playerId === undefined
      ? '?'
      : this.getPlayers().find((player) => player.id === playerId)?.name ?? `P${playerId + 1}`;
    avatar.add(this.scene.add.text(0, 0, name.trim().charAt(0).toUpperCase() || '?', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#332f2b',
    }).setOrigin(0.5));
    return avatar;
  }

  private clearReactionObjects(): void {
    for (const object of this.reactionObjects) {
      this.scene.tweens.killTweensOf(object);
      object.destroy();
    }
    this.reactionObjects.clear();
  }

  private schedule(delay: number, callback: () => void): void {
    const timer = this.scene.time.delayedCall(Math.max(0, delay), () => {
      this.timers.delete(timer);
      callback();
    });
    this.timers.add(timer);
  }
}
