import Phaser from 'phaser';
import { browserSession } from '../../src/core/browserSession';
import { gameSession } from '../../src/core/session';
import { CareerMinigameBoardScene07044 } from '../../src/scenes/CareerMinigameBoardScene07044';
import { startMiniGameOverlay } from '../../src/ui/MiniGameOverlay';

const mode = new URLSearchParams(location.search).get('surface') ?? 'card';
browserSession.configureSolo([]);
gameSession.reset();
gameSession.players.forEach((player) => gameSession.setCharacter(player.id, 'starter-crybaby'));

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

class FullSceneUiFixture extends CareerMinigameBoardScene07044 {
  create(): void {
    super.create();

    const scene = this;
    const runtime = this as any;
    (window as any).fullSceneUi = {
      scene,
      inspect(name: string) {
        for (const object of scene.children.list) {
          const found = findByName(object, name);
          if (!found) continue;
          const text = found instanceof Phaser.GameObjects.Text ? found : undefined;
          return {
            active: found.active,
            visible: found.visible,
            x: (found as any).x,
            y: (found as any).y,
            alpha: (found as any).alpha,
            text: text?.text ?? '',
            fontSize: text ? Number.parseFloat(String(text.style.fontSize)) : undefined,
            bounds: text ? text.getBounds() : undefined,
          };
        }
        return undefined;
      },
      canonical: (this as any).canonicalUiOwner071 === true,
    };

    this.time.delayedCall(250, () => {
      const presentation = runtime.presentation as any;
      if (mode === 'ranking') {
        this.time.timeScale = 25;
        const run = startMiniGameOverlay(this, runtime.match.players, 8701);
        this.events.on('postupdate', () => {
          const stage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          if (!stage) return;
          if (stage.getByName('vf07-minigame-ranking-scroll')) {
            this.time.timeScale = 0;
            (window as any).surfaceReady = true;
          }
        });
        return;
      }

      if (!presentation) throw new Error('presentation missing from full live scene');
      const base = {
        eventSeq: 8701,
        holdMs: 60000,
        actorId: 0,
        actorName: 'Player 1',
        targetId: 1,
        targetName: 'CPU 2',
        amount: 20,
        reactions: [],
      };
      const model: any = mode === 'job'
        ? {
            ...base,
            kind: 'tile_land',
            tileType: 'job',
            title: 'ĐÃ NHẬN VIỆC',
            description: 'Ca sĩ • Lương mỗi vòng: 70 B$',
            summary: 'Đã nhận nghề Ca sĩ.',
            impact: '🎤',
            eyebrow: 'PLAYER 1 • JOB',
          }
        : mode === 'news'
          ? {
              ...base,
              kind: 'news',
              title: 'Phí Thành Phố Đồng Loạt',
              description: 'Thành phố thu phí bảo trì. Mỗi người đóng 20 B$ để sửa những con đường vừa đi qua.',
              summary: 'Tất cả người chơi mất 20 B$.',
              impact: '📰',
              eyebrow: 'TIN TỨC • BREAKING',
            }
          : {
              ...base,
              kind: 'card_play',
              cardEffectType: 'steal_money',
              title: 'Ví Ai Nấy Lo',
              description: 'Mỗi người tự giữ tiền của mình. Chặn tác động chuyển tiền trong lượt này.',
              summary: 'CPU 4 giữ lại 20 B$.',
              impact: '👛',
              eyebrow: 'LÁ BÀI • KÍCH HOẠT',
            };

      presentation.currentModel = model;
      presentation.blocking = true;
      if (mode === 'job') presentation.showLanding(model);
      else presentation.showCinematic(model);
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
  scene: FullSceneUiFixture,
});
