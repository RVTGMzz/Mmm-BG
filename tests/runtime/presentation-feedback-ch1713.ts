import Phaser from 'phaser';
import { gameSession } from '../../src/core/session';
import { MatchPresentationLayer } from '../../src/ui/MatchPresentationLayer';

const mode = new URLSearchParams(location.search).get('surface') ?? 'dice';
gameSession.reset();

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

function allText(root: Phaser.GameObjects.GameObject): string[] {
  const copies: string[] = [];
  const visit = (node: Phaser.GameObjects.GameObject) => {
    if (node instanceof Phaser.GameObjects.Text && node.active && node.visible) copies.push(node.text);
    if (node instanceof Phaser.GameObjects.Container) node.list.forEach(visit);
  };
  visit(root);
  return copies;
}

class PresentationFeedbackFixtureCh1713 extends Phaser.Scene {
  create(): void {
    this.cameras.main.setBackgroundColor('#8cac97');

    const layer = new MatchPresentationLayer(this, () => gameSession.players as any, {
      timingForModel: () => ({ mode: 'manual', skipAfterMs: 60000 }),
    });
    const internal = layer as any;

    const base = {
      eventSeq: 1713,
      holdMs: 60000,
      actorId: 0,
      actorName: 'Player 1',
      affectedPlayerIds: [0],
      reactions: [],
      rarity: '',
      targetId: 1,
      targetName: 'CPU 2',
    };

    let model: any;
    if (mode === 'dice') {
      model = {
        ...base,
        kind: 'dice_roll',
        eyebrow: 'PLAYER 1 • XÚC XẮC',
        title: '6',
        impact: '🎲',
        description: '',
        summary: '',
        roll: 6,
      };
      internal.currentModel = model;
      internal.blocking = true;
      internal.showDiceRoll(model);
    } else if (mode === 'landing') {
      model = {
        ...base,
        kind: 'tile_land',
        tileType: 'money',
        eyebrow: 'PLAYER 1 • ĐÁP Ô',
        title: 'LỘC VỈA HÈ +35 B$',
        impact: '💰',
        description: 'Nhặt được chút lộc giữa phố.',
        summary: '',
        amount: 35,
      };
      internal.currentModel = model;
      internal.blocking = true;
      internal.showLanding(model);
    } else if (mode === 'ready') {
      model = {
        ...base,
        kind: 'ready_bonus',
        tileType: 'ready',
        eyebrow: 'PLAYER 1 • LƯƠNG QUA CỔNG',
        title: '+70 B$',
        impact: '💼💰',
        description: 'Ca sĩ Lv.2 trả lương khi qua cổng.',
        summary: '',
        amount: 70,
      };
      internal.currentModel = model;
      internal.blocking = true;
      internal.showLanding(model);
    } else if (mode === 'cinematic') {
      model = {
        ...base,
        kind: 'board_shuffle',
        eyebrow: 'PLAYER 1 • DẪN ĐẦU VÒNG 2',
        title: 'BÀN CỜ ĐÃ BIẾN ĐỔI!',
        impact: '🔀',
        description: 'Thành phố vừa đổi nhịp.',
        summary: '8 ô đã đổi nội dung.',
      };
      internal.currentModel = model;
      internal.blocking = true;
      internal.showCinematic(model);
    } else if (mode === 'continue') {
      internal.showContinueHint(true);
    } else {
      throw new Error(`Unknown presentation feedback fixture: ${mode}`);
    }

    const scene = this;
    (window as any).feedbackCh1713 = {
      inspect(name: string) {
        for (const object of scene.children.list) {
          const found = findByName(object, name);
          if (!found) continue;
          const text = found instanceof Phaser.GameObjects.Text ? found : undefined;
          const bounds = typeof (found as any).getBounds === 'function' ? (found as any).getBounds() : undefined;
          return {
            active: found.active,
            visible: found.visible,
            type: found.type,
            name: found.name,
            alpha: (found as any).alpha,
            text: text?.text ?? '',
            fontSize: text ? Number.parseFloat(String(text.style.fontSize)) : undefined,
            bounds: bounds ? {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              right: bounds.right,
              bottom: bounds.bottom,
            } : undefined,
          };
        }
        return undefined;
      },
      texts(name: string) {
        for (const object of scene.children.list) {
          const found = findByName(object, name);
          if (found) return allText(found);
        }
        return [];
      },
    };

    this.time.delayedCall(220, () => {
      (window as any).surfaceReady = true;
    });
  }
}

new Phaser.Game({
  type: Phaser.WEBGL,
  width: 1280,
  height: 720,
  render: { preserveDrawingBuffer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: PresentationFeedbackFixtureCh1713,
});
