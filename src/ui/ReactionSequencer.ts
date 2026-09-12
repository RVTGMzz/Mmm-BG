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

function roleLabel(role: ReactionSpeakerRole): string {
  switch (role) {
    case 'caster':
      return 'NGƯỜI DÙNG';
    case 'target':
      return 'MỤC TIÊU';
    case 'subject':
      return 'NHÂN VẬT CHÍNH';
    case 'spectator':
      return 'HÓNG CHUYỆN';
  }
}

function bubblePosition(role: ReactionSpeakerRole, sequence: number): { x: number; y: number } {
  switch (role) {
    case 'caster':
      return { x: 250, y: 165 };
    case 'target':
      return { x: 1015, y: 165 };
    case 'subject':
      return { x: 250, y: 520 };
    case 'spectator':
      return { x: 1015, y: 520 - Math.min(sequence - 1, 2) * 16 };
  }
}

function showReactionBubble(
  scene: Phaser.Scene,
  speaker: PlayerState,
  personality: PersonalityTag,
  step: ReactionStep,
  text: string,
): void {
  const position = bubblePosition(step.speakerRole, step.sequence);
  const accent = ROLE_ACCENTS[step.speakerRole];
  const container = scene.add
    .container(position.x, position.y)
    .setDepth(520 + step.sequence)
    .setAlpha(0)
    .setScale(0.9);

  const shadow = scene.add.rectangle(6, 7, 315, 96, 0x000000, 0.18);
  const panel = scene.add
    .rectangle(0, 0, 315, 96, 0xfffbf3, 0.98)
    .setStrokeStyle(4, 0x242424, 1);
  const accentBar = scene.add.rectangle(-153, 0, 9, 90, accent, 1);

  const objects: Phaser.GameObjects.GameObject[] = [shadow, panel, accentBar];
  const face = gameSession.getFace(speaker.id, step.expression);

  if (face && scene.textures.exists(face.textureKey)) {
    objects.push(scene.add.image(-111, 0, face.textureKey).setDisplaySize(66, 66));
  } else {
    objects.push(
      scene.add
        .text(-111, 0, step.expression === 'happy' ? '😆' : step.expression === 'angry' ? '😡' : '😐', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '48px',
        })
        .setOrigin(0.5),
    );
  }

  const name = scene.add
    .text(-66, -31, speaker.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 198,
    })
    .setOrigin(0, 0.5);

  const meta = scene.add
    .text(-66, -12, `${roleLabel(step.speakerRole)} • ${personality}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#7b7064',
    })
    .setOrigin(0, 0.5);

  const quote = scene.add
    .text(-66, 18, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#36312c',
      fixedWidth: 198,
      wordWrap: { width: 198 },
      maxLines: 2,
    })
    .setOrigin(0, 0.5);

  objects.push(name, meta, quote);
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
      y: position.y - 12,
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
