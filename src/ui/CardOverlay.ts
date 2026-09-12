import Phaser from 'phaser';
import type { CardDefinition, CardFaceSlot } from '../core/cards';
import { gameSession } from '../core/session';
import type { PlayerState } from '../core/types';

const RARITY_COLORS: Record<CardDefinition['rarity'], number> = {
  N: 0xd8d2c7,
  R: 0x8ec7ff,
  SR: 0xcf9cff,
  SSR: 0xffd35a,
};

function faceTextureFor(slot: CardFaceSlot, caster: PlayerState, target: PlayerState): string | undefined {
  const player = slot.role === 'caster' ? caster : target;
  return gameSession.getFace(player.id, slot.expression)?.textureKey;
}

export function showDynamicCard(
  scene: Phaser.Scene,
  card: CardDefinition,
  caster: PlayerState,
  target: PlayerState,
): void {
  const container = scene.add.container(640, 340).setDepth(300).setAlpha(0).setScale(0.86);

  const shadow = scene.add.rectangle(10, 12, 650, 430, 0x000000, 0.18);
  const panel = scene.add
    .rectangle(0, 0, 650, 430, 0xfffbf3, 1)
    .setStrokeStyle(6, 0x222222, 1);
  const rarityStrip = scene.add.rectangle(0, -191, 650, 48, RARITY_COLORS[card.rarity], 1);

  const rarity = scene.add
    .text(-286, -191, `${card.rarity}  •  ${card.impact}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#202020',
    })
    .setOrigin(0, 0.5);

  const title = scene.add
    .text(0, -132, card.title, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#ef4545',
      stroke: '#202020',
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  const subtitle = scene.add
    .text(0, -92, card.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#5a5148',
      align: 'center',
      fixedWidth: 540,
    })
    .setOrigin(0.5);

  const versus = scene.add
    .text(0, 30, 'VS', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#202020',
    })
    .setOrigin(0.5);

  const objects: Phaser.GameObjects.GameObject[] = [shadow, panel, rarityStrip, rarity, title, subtitle, versus];

  for (const slot of card.faceSlots) {
    const player = slot.role === 'caster' ? caster : target;
    const label = slot.role === 'caster' ? 'NGƯỜI DÙNG' : 'MỤC TIÊU';
    const ringColor = slot.role === 'caster' ? 0xef4545 : 0x5b8def;

    const ring = scene.add.circle(slot.x, slot.y, slot.size * 0.53, 0xfff4de, 1).setStrokeStyle(6, ringColor, 1);
    objects.push(ring);

    const textureKey = faceTextureFor(slot, caster, target);
    if (textureKey && scene.textures.exists(textureKey)) {
      const image = scene.add
        .image(slot.x, slot.y, textureKey)
        .setDisplaySize(slot.size, slot.size)
        .setAngle(slot.rotation ?? 0);
      objects.push(image);
    } else {
      const fallback = scene.add
        .text(slot.x, slot.y, slot.role === 'caster' ? '😆' : '😡', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '74px',
        })
        .setOrigin(0.5);
      objects.push(fallback);
    }

    const name = scene.add
      .text(slot.x, 108, player.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#202020',
        align: 'center',
        fixedWidth: 220,
      })
      .setOrigin(0.5);

    const roleText = scene.add
      .text(slot.x, 138, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#7b7064',
      })
      .setOrigin(0.5);

    objects.push(name, roleText);
  }

  const footer = scene.add
    .text(0, 184, 'Hiệu ứng áp dụng ngay • Card overlay không khóa lượt kế tiếp', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#7b7064',
    })
    .setOrigin(0.5);
  objects.push(footer);

  container.add(objects);

  scene.tweens.add({
    targets: container,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 180,
    ease: 'Back.Out',
  });

  scene.time.delayedCall(1550, () => {
    if (!container.active) return;
    scene.tweens.add({
      targets: container,
      alpha: 0,
      y: 318,
      duration: 220,
      ease: 'Sine.easeIn',
      onComplete: () => container.destroy(true),
    });
  });
}
