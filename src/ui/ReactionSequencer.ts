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
import {
  CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
  characterProductionPortraitFrameCh182,
} from './characterProductionArtCh181';

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

  const shadow = scene.add.graphics().setName('reaction-bubble-shadow-ch1712');
  shadow.fillStyle(0x4b302a, 0.22);
  shadow.fillRoundedRect(
    -BUBBLE_WIDTH_0682 / 2 + 4,
    -BUBBLE_HEIGHT_0682 / 2 + 6,
    BUBBLE_WIDTH_0682,
    BUBBLE_HEIGHT_0682,
    18,
  );

  const panel = scene.add.graphics().setName('reaction-bubble-panel-ch1712');
  panel.fillStyle(0xfff7e8, 0.995);
  panel.fillRoundedRect(
    -BUBBLE_WIDTH_0682 / 2,
    -BUBBLE_HEIGHT_0682 / 2,
    BUBBLE_WIDTH_0682,
    BUBBLE_HEIGHT_0682,
    18,
  );
  panel.fillStyle(0xffffff, 0.46);
  panel.fillRoundedRect(
    -BUBBLE_WIDTH_0682 / 2 + 11,
    -BUBBLE_HEIGHT_0682 / 2 + 8,
    BUBBLE_WIDTH_0682 - 22,
    8,
    4,
  );
  panel.fillStyle(accent, 0.98);
  panel.fillRoundedRect(
    -BUBBLE_WIDTH_0682 / 2,
    -BUBBLE_HEIGHT_0682 / 2,
    12,
    BUBBLE_HEIGHT_0682,
    { tl: 18, tr: 6, bl: 18, br: 6 },
  );
  panel.lineStyle(4, 0x4b302a, 0.92);
  panel.strokeRoundedRect(
    -BUBBLE_WIDTH_0682 / 2,
    -BUBBLE_HEIGHT_0682 / 2,
    BUBBLE_WIDTH_0682,
    BUBBLE_HEIGHT_0682,
    18,
  );

  const faceWell = scene.add.graphics().setName('reaction-bubble-face-well-ch1712');
  faceWell.fillStyle(0xffffff, 0.42);
  faceWell.fillRoundedRect(-126, -33, 66, 66, 18);
  faceWell.lineStyle(3, accent, 0.86);
  faceWell.strokeRoundedRect(-126, -33, 66, 66, 18);

  const objects: Phaser.GameObjects.GameObject[] = [shadow, panel, faceWell];
  const face = gameSession.getFace(speaker.id, step.expression);

  if (face && scene.textures.exists(face.textureKey)) {
    objects.push(scene.add.image(-96, 0, face.textureKey).setDisplaySize(58, 58));
  } else {
    const characterId = gameSession.getCharacterId(speaker.id) ?? speaker.characterId;
    const productionFrame = characterProductionPortraitFrameCh182(characterId, step.expression);
    if (
      productionFrame !== undefined
      && scene.textures.exists(CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182)
    ) {
      objects.push(
        scene.add
          .image(-96, 0, CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182, productionFrame)
          .setDisplaySize(58, 58)
          .setName('character-production-reaction-avatar-ch182'),
      );
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
  }

  const name = scene.add
    .text(-58, -25, speaker.name, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#4b302a',
      fixedWidth: 174,
    })
    .setOrigin(0, 0.5);

  const quote = scene.add
    .text(-58, 10, text, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '13px',
      color: '#66534b',
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
