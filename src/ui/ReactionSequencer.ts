import Phaser from 'phaser';
import {
  formatReactionText,
  resolveReactionSpeaker,
  selectReactionVariant,
  type ReactionContext,
  type ReactionEventDefinition,
  type ReactionSpeakerRole,
  type ReactionStep,
} from '../core/reactions';
import { gameSession, type PersonalityTag } from '../core/session';
import type { PlayerState } from '../core/types';

const ROLE_ACCENTS: Record<ReactionSpeakerRole, number> = {
  caster: 0xef4545,
  target: 0x5b8def,
  subject: 0x6aa84f,
  spectator: 0xf2b84b,
};

const BUBBLE_WIDTH_0682 = 272;
const BUBBLE_HEIGHT_0682 = 88;
const BUBBLE_SAFE_MARGIN_0682 = 18;

/**
 * Reactions live in narrow outer lanes so they do not fight the dominant center
 * modal. Coordinates are clamped to the logical viewport as a final safety net.
 */
function bubblePosition0682(
  scene: Phaser.Scene,
  role: ReactionSpeakerRole,
  sequence: number,
): { x: number; y: number } {
  const base = role === 'caster'
    ? { x: 155, y: 155 }
    : role === 'target'
      ? { x: 1125, y: 155 }
      : role === 'subject'
        ? { x: 155, y: 545 }
        : { x: 1125, y: 545 - Math.min(sequence - 1, 2) * 14 };

  const gameWidth = Number(scene.scale.gameSize.width) || 1280;
  const gameHeight = Number(scene.scale.gameSize.height) || 720;
  const halfW = BUBBLE_WIDTH_0682 / 2;
  const halfH = BUBBLE_HEIGHT_0682 / 2;
  return {
    x: Phaser.Math.Clamp(base.x, halfW + BUBBLE_SAFE_MARGIN_0682, gameWidth - halfW - BUBBLE_SAFE_MARGIN_0682),
    y: Phaser.Math.Clamp(base.y, halfH + BUBBLE_SAFE_MARGIN_0682, gameHeight - halfH - BUBBLE_SAFE_MARGIN_0682),
  };
}

function showReactionBubble(
  scene: Phaser.Scene,
  speaker: PlayerState,
  _personality: PersonalityTag,
  step: ReactionStep,
  text: string,
): void {
  const position = bubblePosition0682(scene, step.speakerRole, step.sequence);
  const accent = ROLE_ACCENTS[step.speakerRole];
  const container = scene.add
    .container(position.x, position.y)
    .setDepth(520 + step.sequence)
    .setAlpha(0)
    .setScale(0.9);

  const shadow = scene.add.rectangle(5, 6, BUBBLE_WIDTH_0682, BUBBLE_HEIGHT_0682, 0x000000, 0.18);
  const panel = scene.add
    .rectangle(0, 0, BUBBLE_WIDTH_0682, BUBBLE_HEIGHT_0682, 0xfffbf3, 0.98)
    .setStrokeStyle(4, 0x242424, 1);
  const accentBar = scene.add.rectangle(-132, 0, 8, BUBBLE_HEIGHT_0682 - 6, accent, 1);

  const objects: Phaser.GameObjects.GameObject[] = [shadow, panel, accentBar];
  const face = gameSession.getFace(speaker.id, step.expression);

  if (face && scene.textures.exists(face.textureKey)) {
    objects.push(scene.add.image(-96, 0, face.textureKey).setDisplaySize(58, 58));
  } else {
    objects.push(
      scene.add
        .text(-96, 0, step.expression === 'happy' ? '😆' : step.expression === 'angry' ? '😡' : '😐', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '42px',
        })
        .setOrigin(0.5),
    );
  }

  const name = scene.add
    .text(-58, -25, speaker.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 174,
    })
    .setOrigin(0, 0.5);

  const quote = scene.add
    .text(-58, 10, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#36312c',
      fixedWidth: 174,
      wordWrap: { width: 174, useAdvancedWrap: true },
      maxLines: 2,
    })
    .setOrigin(0, 0.5);

  objects.push(name, quote);
  container.add(objects);

  scene.tweens.add({
    targets: container,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 130,
    ease: 'Back.Out',
  });

  scene.time.delayedCall(Math.max(700, step.durationMs), () => {
    if (!container.active) return;
    scene.tweens.add({
      targets: container,
      alpha: 0,
      y: position.y - 10,
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: () => container.destroy(true),
    });
  });
}

export function playReactionSequence(
  scene: Phaser.Scene,
  event: ReactionEventDefinition,
  context: ReactionContext,
): void {
  const ordered = [...event.steps].sort((a, b) => a.sequence - b.sequence);

  for (const step of ordered) {
    scene.time.delayedCall(Math.max(0, step.delayMs), () => {
      const speaker = resolveReactionSpeaker(step.speakerRole, context);
      if (!speaker) return;

      const personality = gameSession.getPersonality(speaker.id);
      const variant = selectReactionVariant(step, personality);
      if (!variant) return;

      const text = formatReactionText(variant.text, {
        ...context.variables,
        speaker: speaker.name,
      });
      showReactionBubble(scene, speaker, personality, step, text);
    });
  }
}
