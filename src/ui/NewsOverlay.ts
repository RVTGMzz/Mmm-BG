import Phaser from 'phaser';
import type { NewsDefinition } from '../core/news';
import { gameSession, type FaceExpression } from '../core/session';
import type { PlayerState } from '../core/types';

const RARITY_COLORS: Record<NewsDefinition['rarity'], number> = {
  N: 0xd8d2c7,
  R: 0x8ec7ff,
  SR: 0xcf9cff,
  SSR: 0xffd35a,
};

export function showDynamicNews(
  scene: Phaser.Scene,
  news: NewsDefinition,
  subject: PlayerState,
  summary: string,
  expression: FaceExpression,
): void {
  const container = scene.add
    .container(640, 300)
    .setDepth(380)
    .setAlpha(0)
    .setScale(0.9);

  const shadow = scene.add.rectangle(8, 10, 610, 286, 0x000000, 0.16);
  const panel = scene.add
    .rectangle(0, 0, 610, 286, 0xfffbf3, 1)
    .setStrokeStyle(5, 0x242424, 1);
  const rarityStrip = scene.add.rectangle(0, -119, 610, 48, RARITY_COLORS[news.rarity], 1);

  const badge = scene.add
    .text(-270, -119, `📰 TIN TỨC • ${news.rarity} • ${news.impact}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#202020',
    })
    .setOrigin(0, 0.5);

  const title = scene.add
    .text(38, -62, news.title, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#4f8f48',
      stroke: '#202020',
      strokeThickness: 2,
      fixedWidth: 360,
      align: 'left',
    })
    .setOrigin(0, 0.5);

  const description = scene.add
    .text(38, -9, news.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#5a5148',
      fixedWidth: 360,
      wordWrap: { width: 360 },
      maxLines: 2,
    })
    .setOrigin(0, 0.5);

  const result = scene.add
    .text(38, 66, summary, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 360,
      wordWrap: { width: 360 },
      maxLines: 2,
    })
    .setOrigin(0, 0.5);

  const objects: Phaser.GameObjects.GameObject[] = [shadow, panel, rarityStrip, badge, title, description, result];
  const faceAsset = gameSession.getFace(subject.id, expression);

  const ring = scene.add.circle(-205, 22, 72, 0xfff4de, 1).setStrokeStyle(6, 0x6aa84f, 1);
  objects.push(ring);

  if (faceAsset && scene.textures.exists(faceAsset.textureKey)) {
    objects.push(scene.add.image(-205, 22, faceAsset.textureKey).setDisplaySize(128, 128));
  } else {
    objects.push(
      scene.add
        .text(-205, 22, expression === 'happy' ? '😆' : expression === 'angry' ? '😡' : '😐', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '82px',
        })
        .setOrigin(0.5),
    );
  }

  const name = scene.add
    .text(-205, 109, subject.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 170,
      align: 'center',
    })
    .setOrigin(0.5);
  objects.push(name);

  container.add(objects);

  scene.tweens.add({
    targets: container,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 160,
    ease: 'Back.Out',
  });

  scene.time.delayedCall(1550, () => {
    if (!container.active) return;
    scene.tweens.add({
      targets: container,
      alpha: 0,
      y: 282,
      duration: 220,
      ease: 'Sine.easeIn',
      onComplete: () => container.destroy(true),
    });
  });
}
