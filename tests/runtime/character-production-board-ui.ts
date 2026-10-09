import Phaser from 'phaser';
import { browserSession } from '../../src/core/browserSession';
import { gameSession } from '../../src/core/session';
import { CareerMinigameBoardSceneCh173 } from '../../src/scenes/CareerMinigameBoardSceneCh173';

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

function inspectRig(scene: Phaser.Scene, playerId: number) {
  const rigName = 'character-rig-cau-co-ch1822-p' + (playerId + 1);
  const find = (name: string) => {
    for(const root of scene.children.list) {
      const part = findByName(root, name);
      if (part) return part;
    }
    return undefined;
  };
  const rig = find(rigName);
  if (!(rig instanceof Phaser.GameObjects.Container)) return undefined;
  const hip = find('character-rig-hip-ch1822-left-p' + (playerId + 1));
  const knee = find('character-rig-knee-ch1822-left-p' + (playerId + 1));
  const shoulder = find('character-rig-shoulder-ch1822-left-p' + (playerId + 1));
  const elbow = find('character-rig-elbow-ch1822-left-p' + (playerId + 1));
  const head = find('character-rig-head-ch1822-p' + (playerId + 1));
  return {
    visible: rig.visible,
    scaleX: rig.scaleX,
    scaleY: rig.scaleY,
    imageParts: rig.getAll('type', 'Image').length,
    hipAngle: hip instanceof Phaser.GameObjects.Container ? hip.angle : null,
    kneeAngle: knee instanceof Phaser.GameObjects.Container ? knee.angle : null,
    shoulderAngle: shoulder instanceof Phaser.GameObjects.Container ? shoulder.angle : null,
    elbowAngle: elbow instanceof Phaser.GameObjects.Container ? elbow.angle : null,
    headAngle: head instanceof Phaser.GameObjects.Container ? head.angle : null,
  };
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

class CharacterProductionBoardQaScene extends CareerMinigameBoardSceneCh173 {
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
        activePlayerId: runtime.currentPlayer()?.id,
        players: runtime.match.players.map((player: any) => ({
          id: player.id,
          characterId: player.characterId,
          sprite: inspectSprite(this, player.id),
          ring: inspectRing(this, player.id),
        })),
        rig: inspectRig(this, 1),
      };

      const babyVisual = runtime.visuals.get(0);
      if (!babyVisual) throw new Error('SECRET BABY visual missing');

      const grumpyVisual = runtime.visuals.get(1);
      if (grumpyVisual && inspectRig(this, 1)) {
        this.tweens.add({
          targets: grumpyVisual.token,
          x: grumpyVisual.token.x + 70,
          duration: 620,
          ease: 'Linear',
          onComplete: () => {
            this.tweens.add({
              targets: grumpyVisual.token,
              x: grumpyVisual.token.x - 140,
              duration: 620,
              ease: 'Linear',
            });
          },
        });
      }

      const startX = babyVisual.token.x;
      this.tweens.add({
        targets: babyVisual.token,
        x: startX + 84,
        duration: 620,
        ease: 'Linear',
        onComplete: () => {
          this.tweens.add({
            targets: babyVisual.token,
            x: startX - 84,
            duration: 620,
            ease: 'Linear',
          });
        },
      });

      this.time.delayedCall(240, () => {
        (window as any).characterProductionQaRight = {
          sprite: inspectSprite(this, 0),
          ring: inspectRing(this, 0),
          rig: inspectRig(this, 1),
        };
      });

      this.time.delayedCall(870, () => {
        (window as any).characterProductionQaLeft = {
          sprite: inspectSprite(this, 0),
          ring: inspectRing(this, 0),
          rig: inspectRig(this, 1),
        };
        (window as any).characterProductionQaReady = true;
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
