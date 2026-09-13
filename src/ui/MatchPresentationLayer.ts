import Phaser from 'phaser';
import type { MatchEvent } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';
import {
  buildPresentationModel,
  type PresentationEventModel,
  type PresentationReactionLine,
} from './presentationModel';

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];

const KIND_PALETTE: Record<PresentationEventModel['kind'], { panel: number; accent: number; label: string }> = {
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

export class MatchPresentationLayer {
  private readonly queue: PresentationEventModel[] = [];
  private active?: Phaser.GameObjects.Container;
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly reactionObjects = new Set<Phaser.GameObjects.Container>();
  private destroyed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getPlayers: () => PlayerState[],
  ) {}

  enqueue(events: MatchEvent[]): void {
    if (this.destroyed) return;

    const players = this.getPlayers();
    for (const event of events) {
      const model = buildPresentationModel(event, players);
      if (model) this.queue.push(model);
    }
    this.pump();
  }

  destroy(): void {
    this.destroyed = true;
    this.queue.length = 0;
    for (const timer of this.timers) timer.remove(false);
    this.timers.clear();
    for (const object of this.reactionObjects) object.destroy();
    this.reactionObjects.clear();
    this.active?.destroy();
    this.active = undefined;
  }

  private pump(): void {
    if (this.destroyed || this.active || this.queue.length === 0) return;
    const model = this.queue.shift();
    if (!model) return;
    this.showModel(model);
  }

  private showModel(model: PresentationEventModel): void {
    const palette = KIND_PALETTE[model.kind];
    const container = this.scene.add.container(640, 236).setDepth(900).setAlpha(0).setScale(0.94);
    this.active = container;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.26);
    shadow.fillRoundedRect(-378, -116, 756, 250, 22);
    shadow.setPosition(0, 8);

    const panel = this.scene.add.graphics();
    panel.fillStyle(palette.panel, 0.98);
    panel.fillRoundedRect(-370, -118, 740, 246, 20);
    panel.lineStyle(2, palette.accent, 0.9);
    panel.strokeRoundedRect(-370, -118, 740, 246, 20);
    panel.fillStyle(palette.accent, 1);
    panel.fillRoundedRect(-370, -118, 9, 246, { tl: 20, bl: 20, tr: 0, br: 0 });

    const kicker = this.scene.add.text(-334, -93, model.eyebrow, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8f4ec',
      letterSpacing: 1.2,
    });

    const title = this.scene.add.text(-334, -68, model.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#ffffff',
      wordWrap: { width: 560 },
    });

    const impact = this.scene.add.text(330, -76, model.impact || '•', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    const description = this.scene.add.text(-334, -20, model.description || model.summary, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#f4ede4',
      wordWrap: { width: 628 },
      lineSpacing: 3,
    });

    const summary = model.summary && model.summary !== model.description
      ? this.scene.add.text(-334, 35, `→ ${model.summary}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffffff',
          wordWrap: { width: 628 },
        })
      : undefined;

    const source = this.scene.add.text(332, 101, `${palette.label}  •  EVENT #${model.eventSeq}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#d8d0c6',
    }).setOrigin(1, 0.5);

    container.add([shadow, panel, kicker, title, impact, description, source]);
    if (summary) container.add(summary);

    this.addPlayerChip(container, -334, 91, model.actorId, model.actorName, 'ACTOR');
    if (model.targetId !== undefined && model.targetName) {
      this.addPlayerChip(container, -86, 91, model.targetId, model.targetName, 'TARGET');
    }
    if (model.rarity) this.addRarityBadge(container, 250, -93, model.rarity);

    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: 224,
      duration: 240,
      ease: 'Back.easeOut',
    });

    let reactionEnd = 0;
    model.reactions.forEach((line, index) => {
      reactionEnd = Math.max(reactionEnd, line.delayMs + line.durationMs);
      this.schedule(260 + line.delayMs, () => this.showReaction(line, index));
    });

    const visibleMs = Math.max(model.holdMs, reactionEnd + 560);
    this.schedule(visibleMs, () => this.dismissActive());
  }

  private addPlayerChip(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    playerId: number | undefined,
    name: string,
    role: string,
  ): void {
    const color = playerId === undefined ? 0x746b61 : PLAYER_COLORS[playerId % PLAYER_COLORS.length];
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 0.95);
    bg.fillRoundedRect(x, y - 14, 222, 28, 14);
    const text = this.scene.add.text(x + 12, y, `${role}  ${name}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add([bg, text]);
  }

  private addRarityBadge(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    rarity: string,
  ): void {
    const color = RARITY_COLORS[rarity] ?? 0xe4ded2;
    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x, y - 11, 78, 22, 11);
    const text = this.scene.add.text(x + 39, y, rarity, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#24211d',
    }).setOrigin(0.5);
    container.add([bg, text]);
  }

  private showReaction(line: PresentationReactionLine, index: number): void {
    if (this.destroyed) return;

    const x = 640;
    const y = 405 + Math.min(2, index) * 78;
    const color = line.speakerId === undefined
      ? 0x746b61
      : PLAYER_COLORS[line.speakerId % PLAYER_COLORS.length];
    const bubble = this.scene.add.container(x, y).setDepth(910).setAlpha(0);
    this.reactionObjects.add(bubble);

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-310, -30, 620, 64, 16);
    shadow.setPosition(0, 5);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xfffbf3, 0.98);
    bg.fillRoundedRect(-310, -34, 620, 64, 16);
    bg.lineStyle(2, color, 0.85);
    bg.strokeRoundedRect(-310, -34, 620, 64, 16);

    const avatar = this.buildAvatar(line.speakerId, line.expression, color);
    avatar.setPosition(-274, -2);

    const speaker = this.scene.add.text(-238, -22, `${line.speakerName}  ${EXPRESSION_ICON[line.expression]}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#4b4239',
    });

    const text = this.scene.add.text(-238, -3, line.text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#201d1a',
      wordWrap: { width: 520 },
    }).setOrigin(0, 0.5);

    bubble.add([shadow, bg, avatar, speaker, text]);
    const slide = line.speakerId !== undefined && line.speakerId % 2 === 0 ? -22 : 22;
    bubble.x += slide;

    this.scene.tweens.add({
      targets: bubble,
      x,
      alpha: 1,
      duration: 180,
      ease: 'Sine.easeOut',
    });

    this.schedule(Math.max(650, line.durationMs), () => {
      if (!bubble.active) return;
      this.scene.tweens.add({
        targets: bubble,
        alpha: 0,
        y: y - 10,
        duration: 260,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.reactionObjects.delete(bubble);
          bubble.destroy();
        },
      });
    });
  }

  private buildAvatar(
    playerId: number | undefined,
    expression: FaceExpression,
    color: number,
  ): Phaser.GameObjects.Container {
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
        const image = this.scene.add.image(0, 0, face.textureKey).setDisplaySize(38, 38);
        avatar.add(image);
        return avatar;
      }
    }

    const name = playerId === undefined
      ? '?'
      : this.getPlayers().find((player) => player.id === playerId)?.name ?? `P${playerId + 1}`;
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    avatar.add(this.scene.add.text(0, 0, initial, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#332f2b',
    }).setOrigin(0.5));
    return avatar;
  }

  private dismissActive(): void {
    const current = this.active;
    if (!current || !current.active) {
      this.active = undefined;
      this.pump();
      return;
    }

    this.scene.tweens.add({
      targets: current,
      alpha: 0,
      y: current.y - 18,
      scaleX: 0.98,
      scaleY: 0.98,
      duration: 260,
      ease: 'Sine.easeIn',
      onComplete: () => {
        current.destroy();
        if (this.active === current) this.active = undefined;
        this.pump();
      },
    });
  }

  private schedule(delay: number, callback: () => void): void {
    const timer = this.scene.time.delayedCall(delay, () => {
      this.timers.delete(timer);
      callback();
    });
    this.timers.add(timer);
  }
}
