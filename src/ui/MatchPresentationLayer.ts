import Phaser from 'phaser';
import { sfxController, type SfxCue } from '../audio/sfxController';
import type { MatchEvent } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';
import type { PresentationTimingPolicy } from './presentationFlowPolicy';
import {
  buildPresentationModel,
  type PresentationEventModel,
  type PresentationReactionLine,
} from './presentationModel';

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const KIND_PALETTE: Record<PresentationEventModel['kind'], { panel: number; accent: number; label: string }> = {
  dice_roll: { panel: 0x24211d, accent: 0xffd34d, label: 'DICE' },
  move_step: { panel: 0x24211d, accent: 0xffd34d, label: 'MOVE' },
  tile_land: { panel: 0x312d28, accent: 0xffd34d, label: 'LANDING' },
  ready_bonus: { panel: 0x173c31, accent: 0xffd34d, label: 'READY BONUS' },
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

export class MatchPresentationLayer {
  private readonly queue: PresentationEventModel[] = [];
  private active?: Phaser.GameObjects.Container;
  private currentModel?: PresentationEventModel;
  private continueHint?: Phaser.GameObjects.Text;
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly reactionObjects = new Set<Phaser.GameObjects.Container>();
  private destroyed = false;
  private blocking = false;
  private canAcknowledge = false;

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
    const container = this.scene.add.container(640, 344).setDepth(920).setAlpha(0).setScale(0.72);
    this.active = container;

    const glow = this.scene.add.circle(0, 0, 72, 0xfffbf3, 0.96).setStrokeStyle(5, 0x24211d, 1);
    const die = this.scene.add.text(0, -4, DICE_FACES[(result + 1) % 6], {
      fontFamily: 'Arial, sans-serif',
      fontSize: '86px',
      color: '#202020',
    }).setOrigin(0.5);
    const label = this.scene.add.text(0, 86, `${model.actorName} đổ xúc xắc`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#202020',
      backgroundColor: '#fffaf0',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    container.add([glow, die, label]);

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
    const container = this.scene.add.container(640, 350).setDepth(900).setAlpha(0).setScale(0.9);
    if (isJobCard) container.setName('job-presentation-card');
    this.active = container;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-(panelWidth / 2 + 6), -80, panelWidth + 12, 170, 22);
    shadow.setPosition(0, 8);
    const panel = this.scene.add.graphics();
    panel.fillStyle(palette.panel, 0.98);
    panel.fillRoundedRect(-panelWidth / 2, -84, panelWidth, 168, 20);
    panel.lineStyle(3, palette.accent, 0.95);
    panel.strokeRoundedRect(-panelWidth / 2, -84, panelWidth, 168, 20);

    const icon = this.scene.add.text(iconX, -4, model.impact || '•', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '44px',
    }).setOrigin(0.5);
    const eyebrow = this.scene.add.text(contentX, -52, model.eyebrow, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#d9d1c7',
    });
    const title = this.scene.add.text(contentX, -24, model.title, {
      fontFamily: 'Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      fixedWidth: bodyWidth, wordWrap: { width: bodyWidth },
    });
    const description = this.scene.add.text(contentX, 20, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#f4ede4',
      wordWrap: { width: bodyWidth }, fixedWidth: bodyWidth, fixedHeight: 58, lineSpacing: 3,
    });

    container.add([shadow, panel, icon, eyebrow, title, description]);
    const revealMs = this.revealText(description, model.description);
    this.playModelSfx(model);
    this.spawnBurst(palette.accent, model.kind === 'ready_bonus' ? 14 : 8, 640, 350);
    if (model.kind === 'ready_bonus') this.spawnConfetti();
    if (model.tileType === 'money' || model.kind === 'ready_bonus') this.showFloatingMoney(model.amount ?? 0, model.actorId);

    this.scene.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 190, ease: 'Back.easeOut',
    });
    this.armTiming(model, revealMs);
  }

  private showCinematic(model: PresentationEventModel): void {
    const palette = KIND_PALETTE[model.kind];
    const container = this.scene.add.container(640, 330).setDepth(900).setAlpha(0).setScale(0.94);
    this.active = container;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.28);
    shadow.fillRoundedRect(-366, -145, 732, 306, 24);
    shadow.setPosition(0, 9);
    const panel = this.scene.add.graphics();
    panel.fillStyle(palette.panel, 0.985);
    panel.fillRoundedRect(-360, -150, 720, 300, 22);
    panel.lineStyle(3, palette.accent, 0.92);
    panel.strokeRoundedRect(-360, -150, 720, 300, 22);
    panel.fillStyle(palette.accent, 1);
    panel.fillRoundedRect(-360, -150, 10, 300, { tl: 22, bl: 22, tr: 0, br: 0 });

    const kicker = this.scene.add.text(-322, -118, model.eyebrow, {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#f8f4ec', letterSpacing: 1.1,
    });
    const title = this.scene.add.text(-322, -88, model.title, {
      fontFamily: 'Arial, sans-serif', fontSize: '31px', fontStyle: 'bold', color: '#ffffff', wordWrap: { width: 540 },
    });
    const impact = this.scene.add.text(314, -108, model.impact || '•', {
      fontFamily: 'Arial, sans-serif', fontSize: '19px', color: '#ffffff',
    }).setOrigin(1, 0);
    const bodyText = [model.description, model.summary && model.summary !== model.description ? `→ ${model.summary}` : '']
      .filter(Boolean)
      .join('\n\n');
    const body = this.scene.add.text(-322, -28, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#f4ede4', wordWrap: { width: 628 }, lineSpacing: 5,
      fixedWidth: 628, fixedHeight: 128,
    });
    const source = this.scene.add.text(316, 126, `${palette.label} • #${model.eventSeq}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#d8d0c6',
    }).setOrigin(1, 0.5);

    container.add([shadow, panel, kicker, title, impact, body, source]);
    this.addNaturalActionLine(container, model);
    if (model.rarity) this.addRarityBadge(container, 238, -118, model.rarity);

    const revealMs = this.revealText(body, bodyText);
    this.playModelSfx(model);
    this.spawnBurst(palette.accent, model.rarity === 'SSR' ? 18 : 10, 640, 330);
    if (model.kind === 'card_draw' || model.kind === 'card_play') this.spawnCardFlip(palette.accent);
    if (model.rarity === 'SSR') this.scene.cameras.main.shake(120, 0.0016);

    this.scene.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 230, ease: 'Back.easeOut',
    });

    let reactionEnd = 0;
    model.reactions.forEach((line, index) => {
      const reactionReveal = Math.min(2200, Math.max(500, line.text.length * 24));
      reactionEnd = Math.max(reactionEnd, 320 + line.delayMs + Math.max(line.durationMs, reactionReveal));
      this.schedule(320 + line.delayMs, () => this.showReaction(line, index));
    });

    this.armTiming(model, Math.max(revealMs, reactionEnd));
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

  private armTiming(model: PresentationEventModel, revealMs: number): void {
    const policy = this.options.timingForModel?.(model, revealMs) ?? {
      mode: 'auto' as const,
      skipAfterMs: Math.max(700, revealMs),
      autoCloseMs: Math.max(model.holdMs, revealMs + 600),
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
    this.continueHint = this.scene.add.text(
      640,
      526,
      manual ? 'SPACE / ENTER / CLICK • TIẾP TỤC' : 'SPACE / ENTER / CLICK • BỎ QUA',
      {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#202020',
        backgroundColor: '#ffd34d', padding: { x: 13, y: 6 },
      },
    ).setOrigin(0.5).setDepth(940).setAlpha(0.1);
    this.scene.tweens.add({ targets: this.continueHint, alpha: 1, duration: 160, ease: 'Sine.easeOut' });
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
    if (model.kind === 'ready_bonus') cue = 'ready';
    else if (model.kind === 'card_draw') cue = 'card_draw';
    else if (model.kind === 'card_play' || model.kind === 'card_blocked') cue = 'card_play';
    else if (model.kind === 'news') cue = 'news';
    else if (model.kind === 'tile_land' && model.tileType === 'money') cue = (model.amount ?? 0) >= 0 ? 'coin_gain' : 'coin_loss';
    sfxController.play(cue);
  }

  private showFloatingMoney(amount: number, playerId?: number): void {
    if (amount === 0) return;
    const positive = amount > 0;
    const color = positive ? '#1d7b46' : '#c83434';
    const sign = positive ? '+' : '';
    const x = 640 + (playerId === undefined ? 0 : (playerId - 1.5) * 34);
    const text = this.scene.add.text(x, 438, `${sign}${amount} B$`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '27px', fontStyle: 'bold', color,
      stroke: '#fffaf0', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(925).setScale(0.72);
    this.scene.tweens.add({
      targets: text, y: 390, scaleX: 1.08, scaleY: 1.08, alpha: 0, duration: 900, ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
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
    if (model.targetId === undefined || !model.targetName) return;

    const amount = Math.abs(model.amount ?? 0);
    const copy = model.kind === 'card_play' && amount > 0
      ? `${model.targetName} đưa ${amount} B$ cho ${model.actorName}`
      : (model.summary || `${model.actorName} → ${model.targetName}`);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x4a433c, 0.94);
    bg.fillRoundedRect(-322, 104, 628, 30, 15);
    const text = this.scene.add.text(-306, 119, copy, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      fixedWidth: 596,
      align: 'center',
    }).setOrigin(0, 0.5);
    container.add([bg, text]);
  }

  private addRarityBadge(container: Phaser.GameObjects.Container, x: number, y: number, rarity: string): void {
    const color = RARITY_COLORS[rarity] ?? 0xe4ded2;
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x, y - 11, 74, 22, 11);
    const text = this.scene.add.text(x + 37, y, rarity, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#24211d',
    }).setOrigin(0.5);
    container.add([bg, text]);
  }

  private showReaction(line: PresentationReactionLine, index: number): void {
    if (this.destroyed || this.currentModel === undefined) return;
    sfxController.play('reaction');

    const left = index % 2 === 0;
    const x = left ? 212 : 1068;
    const y = 195 + (index % 3) * 112;
    const color = line.speakerId === undefined ? 0x746b61 : PLAYER_COLORS[line.speakerId % PLAYER_COLORS.length];
    const bubble = this.scene.add.container(x, y).setDepth(910).setAlpha(0);
    this.reactionObjects.add(bubble);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-176, -42, 352, 88, 18);
    shadow.setPosition(0, 5);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xfffbf3, 0.985);
    bg.fillRoundedRect(-176, -46, 352, 88, 18);
    bg.lineStyle(3, color, 0.88);
    bg.strokeRoundedRect(-176, -46, 352, 88, 18);

    const avatar = this.buildAvatar(line.speakerId, line.expression, color);
    avatar.setPosition(left ? -140 : 140, -4);
    const textX = left ? -105 : -160;
    const speaker = this.scene.add.text(textX, -31, `${line.speakerName}  ${EXPRESSION_ICON[line.expression]}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#4b4239',
    });
    const text = this.scene.add.text(textX, -8, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#201d1a',
      wordWrap: { width: 270 },
    }).setOrigin(0, 0.5);

    bubble.add([shadow, bg, avatar, speaker, text]);
    bubble.x += left ? -22 : 22;
    this.revealText(text, line.text);
    this.scene.tweens.add({ targets: bubble, x, alpha: 1, duration: 180, ease: 'Sine.easeOut' });

    this.schedule(Math.max(850, line.durationMs), () => {
      if (!bubble.active) return;
      this.scene.tweens.add({
        targets: bubble, alpha: 0, y: y - 8, duration: 240, ease: 'Sine.easeIn',
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
