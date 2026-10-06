import Phaser from 'phaser';
import { browserSession } from '../../src/core/browserSession';
import { gameSession } from '../../src/core/session';
import { CareerMinigameBoardScene07044 } from '../../src/scenes/CareerMinigameBoardScene07044';

browserSession.configureSolo([1, 2, 3]);
gameSession.reset();
gameSession.setCharacter(0, 'secret-baby');
gameSession.setCharacter(1, 'starter-grumpy');
gameSession.setCharacter(2, 'starter-anxious');
gameSession.setCharacter(3, 'starter-hyper');

function findByName(root: Phaser.GameObjects.GameObject, name: string): Phaser.GameObjects.GameObject | undefined {
  if (root.name === name) return root;
  if (root instanceof Phaser.GameObjects.Container) {
    for (const child of root.list) {
      const found = findByName(child, name);
      if (found) return found;
    }
  }
  return undefined;
}

function inspectSprite(scene: Phaser.Scene, playerId: number) {
  const name = `character-walk-token-ch186-p${playerId + 1}`;
  for (const root of scene.children.list) {
    const found = findByName(root, name);
    if (!(found instanceof Phaser.GameObjects.Sprite)) continue;
    return {
      name: found.name,
      textureKey: found.texture.key,
      frame: found.frame.name,
      x: found.x,
      y: found.y,
      displayWidth: found.displayWidth,
      displayHeight: found.displayHeight,
      scaleX: found.scaleX,
      scaleY: found.scaleY,
      flipX: found.flipX,
      visible: found.visible,
      originX: found.originX,
      originY: found.originY,
    };
  }
  return undefined;
}

function inspectRing(scene: Phaser.Scene, playerId: number) {
  const name = `character-foot-ring-ch189-p${playerId + 1}`;
  for (const root of scene.children.list) {
    const found = findByName(root, name);
    if (!(found instanceof Phaser.GameObjects.Ellipse)) continue;
    return {
      name: found.name,
      x: found.x,
      y: found.y,
      width: found.displayWidth,
      height: found.displayHeight,
      visible: found.visible,
      alpha: found.alpha,
    };
  }
  return undefined;
}

class CharacterProductionBoardQaScene extends CareerMinigameBoardScene07044 {
  create(): void {
    this.time.timeScale = 0;
    super.create();
    const runtime = this as any;
    runtime.queueCpuActionIfNeeded = () => undefined;
    this.time.timeScale = 1;

    const qaPositions = [
      { x: 260, y: 430 },
      { x: 470, y: 430 },
      { x: 680, y: 430 },
      { x: 890, y: 430 },
    ];
    runtime.match.players.forEach((player: any, index: number) => {
      const visual = runtime.visuals.get(player.id);
      const pos = qaPositions[index];
      if (visual && pos) visual.token.setPosition(pos.x, pos.y);
    });

    this.time.delayedCall(220, () => {
      (window as any).characterProductionQaIdle = {
        players: runtime.match.players.map((player: any) => ({
          id: player.id,
          characterId: player.characterId,
          sprite: inspectSprite(this, player.id),
          ring: inspectRing(this, player.id),
        })),
      };

      const babyVisual = runtime.visuals.get(0);
      if (!babyVisual) throw new Error('SECRET BABY visual missing');
      babyVisual.token.x += 18;

      this.time.delayedCall(130, () => {
        (window as any).characterProductionQaRight = {
          sprite: inspectSprite(this, 0),
          ring: inspectRing(this, 0),
        };

        babyVisual.token.x -= 36;
        this.time.delayedCall(130, () => {
          (window as any).characterProductionQaLeft = {
            sprite: inspectSprite(this, 0),
            ring: inspectRing(this, 0),
          };
          (window as any).characterProductionQaReady = true;
        });
      });
    });
  }
}

new Phaser.Game({
  type: Phaser.WEBGL,
  width: 1280,
  height: 720,
  render: { preserveDrawingBuffer: true, antialias: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: CharacterProductionBoardQaScene,
});
