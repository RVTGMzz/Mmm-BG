import Phaser from 'phaser';
import { browserSession } from '../../src/core/browserSession';
import { gameSession } from '../../src/core/session';
import { CareerMinigameBoardScene07044 } from '../../src/scenes/CareerMinigameBoardScene07044';
import { startMiniGameOverlay } from '../../src/ui/MiniGameOverlay';
import { createJobRollPicker } from '../../src/ui/JobChoicePicker';
import jobsJson from '../../src/content/core/jobs_mvp.json';
import type { JobDefinition } from '../../src/core/jobs';

const mode = new URLSearchParams(location.search).get('surface') ?? 'card';
browserSession.configureSolo(
  mode === 'ranking' || mode === 'majority' || mode === 'rulescpu'
    ? [0, 1, 2, 3]
    : mode === 'rules' || mode === 'rulesplay'
      ? [1, 2, 3]
      : [],
);
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
    // Freeze ranking-mode timers during inherited create so an all-CPU browser
    // fixture cannot start an unrelated board turn before we install the no-op.
    if (mode === 'ranking' || mode === 'majority' || mode === 'rules' || mode === 'rulesplay' || mode === 'rulescpu') this.time.timeScale = 0;
    super.create();

    const scene = this;
    const runtime = this as any;
    if (mode === 'ranking' || mode === 'majority' || mode === 'rules' || mode === 'rulesplay' || mode === 'rulescpu') {
      runtime.queueCpuActionIfNeeded = () => undefined;
      this.time.timeScale = 1;
    }
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
            type: found.type,
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
      visibleTexts(name: string) {
        for (const object of scene.children.list) {
          const found = findByName(object, name);
          if (!found) continue;
          const copies: string[] = [];
          const collect = (node: Phaser.GameObjects.GameObject) => {
            if (node instanceof Phaser.GameObjects.Text && node.visible && node.active) copies.push(node.text);
            if (node instanceof Phaser.GameObjects.Container) node.list.forEach(collect);
          };
          collect(found);
          return copies;
        }
        return [];
      },
      canonical: (this as any).canonicalUiOwner071 === true,
    };

    this.time.delayedCall(250, () => {
      const presentation = runtime.presentation as any;
      if (mode === 'ranking') {
        this.time.timeScale = 25;
        // Two deterministic CPU finalists reach the same canonical ranking owner
        // without making the visual fixture wait through a full four-seat tournament.
        const run = startMiniGameOverlay(this, runtime.match.players.slice(0, 2), 8701);
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


      if (mode === 'rules') {
        this.time.timeScale = 8;
        this.tweens.timeScale = 8;
        const run = startMiniGameOverlay(this, runtime.match.players.slice(0, 4), 8713, 'MINIGAME_SLOT_02');
        let rulesSettleQueued = false;
        this.events.on('postupdate', () => {
          const stage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          const scrollRoot = stage?.getByName('vf07-minigame-result-scroll') as Phaser.GameObjects.Container | null;
          const body = scrollRoot?.getByName('vf07-minigame-result-body') as Phaser.GameObjects.Text | null;
          if (!body?.text.includes('🎯 MỤC TIÊU') || rulesSettleQueued) return;
          rulesSettleQueued = true;
          this.time.delayedCall(240, () => {
            const liveStage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
            const liveScrollRoot = liveStage?.getByName('vf07-minigame-result-scroll') as Phaser.GameObjects.Container | null;
            const liveBody = liveScrollRoot?.getByName('vf07-minigame-result-body') as Phaser.GameObjects.Text | null;
            if (!liveBody?.text.includes('🎯 MỤC TIÊU')) return;
            this.time.timeScale = 0;
            this.tweens.timeScale = 0;
            (window as any).surfaceReady = true;
          });
        });
        return;
      }

      if (mode === 'rulesplay') {
        this.time.timeScale = 8;
        this.tweens.timeScale = 8;
        const run = startMiniGameOverlay(this, runtime.match.players.slice(0, 4), 8714, 'MINIGAME_SLOT_02');
        let rulesSeen = false;
        this.events.on('postupdate', () => {
          const currentStage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          const rulesScroll = currentStage?.getByName('vf07-minigame-result-scroll') as Phaser.GameObjects.Container | null;
          const rulesBody = rulesScroll?.getByName('vf07-minigame-result-body') as Phaser.GameObjects.Text | null;
          if (rulesBody?.text.includes('🎯 MỤC TIÊU') && !rulesSeen) {
            rulesSeen = true;
            (window as any).rulesReadyToAdvance = true;
          }
          const stage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          const prompt = stage?.getByName('vf07-minigame-choice-prompt') as Phaser.GameObjects.Text | null;
          const choiceBoxes = stage?.list.filter((entry: Phaser.GameObjects.GameObject) =>
            entry.name?.startsWith('vf07-minigame-choice-box-'),
          ) ?? [];
          if (!stage || !prompt || choiceBoxes.length !== 2) return;
          const subtitle = run.root.getByName('vf07-minigame-subtitle') as Phaser.GameObjects.Text | null;
          const staleRules = findByName(stage, 'vf07-minigame-result-body');
          const choiceLabels = [0, 1].map((index) =>
            (stage.getByName(`vf07-minigame-choice-label-${index}`) as Phaser.GameObjects.Text | null)?.text ?? '',
          );
          (window as any).rulesPlayState = {
            choiceCount: choiceBoxes.length,
            choiceTypes: choiceBoxes.map((entry) => entry.type),
            choiceVisible: choiceBoxes.map((entry) => entry.visible && entry.active),
            choiceAlpha: choiceBoxes.map((entry) => entry.alpha),
            choiceInteractive: choiceBoxes.map((entry) => Boolean((entry as any).input?.enabled)),
            choiceLabels,
            promptText: prompt.text,
            staleRules: Boolean(staleRules),
            subtitleVisible: Boolean(subtitle?.visible),
          };
          this.time.timeScale = 0;
          this.tweens.timeScale = 0;
          (window as any).surfaceReady = true;
        });
        return;
      }

      if (mode === 'rulescpu') {
        this.time.timeScale = 8;
        this.tweens.timeScale = 8;
        const run = startMiniGameOverlay(this, runtime.match.players.slice(0, 4), 8715, 'MINIGAME_SLOT_02');
        let sawRules = false;
        this.events.on('postupdate', () => {
          const currentStage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          if (currentStage?.getByName('vf07-minigame-result-body')) sawRules = true;
          const flow = currentStage?.getByName('vf07-round-flow-result-copy-ch142') as Phaser.GameObjects.Text | null;
          if (!flow || flow.alpha < 0.95) return;
          (window as any).cpuRulesState = { sawRules, result: flow.text };
          this.time.timeScale = 0;
          this.tweens.timeScale = 0;
          (window as any).surfaceReady = true;
        });
        return;
      }

      if (mode === 'majority') {
        this.time.timeScale = 8;
        const run = startMiniGameOverlay(this, runtime.match.players.slice(0, 4), 8709, 'MINIGAME_SLOT_01');
        this.events.on('postupdate', () => {
          const stage = run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container | null;
          if (!stage?.getByName('vf07-majority-result-copy')) return;
          this.time.timeScale = 0;
          (window as any).surfaceReady = true;
        });
        return;
      }

      if (mode === 'jobdetail') {
        const allJobs = jobsJson as JobDefinition[];
        const doctor = allJobs.find((job) => job.id === 'JOB_DOCTOR');
        if (!doctor) throw new Error('Doctor fixture missing.');
        const fallback = allJobs.filter((job) => job.id !== doctor.id).slice(0, 2);
        const picker = createJobRollPicker(this, 'Player 1', [doctor, ...fallback]);
        const hit = findByName(picker.root, 'job-hub-card-hit-0') as Phaser.GameObjects.Rectangle | undefined;
        if (!hit) throw new Error('Job detail card hit missing.');
        hit.emit('pointerdown');
        (window as any).surfaceReady = true;
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
        rarity: 'N',
      };
      const model: any = mode === 'jobwait'
        ? {
            ...base,
            kind: 'tile_land',
            tileType: 'job',
            title: '3 JOB XUẤT HIỆN!',
            description: 'Đổ xúc xắc để nhận việc.\nMỗi nghề có lương riêng khi qua cổng và có đặc tính khác nhau.',
            summary: '',
            impact: '💼🎲',
            eyebrow: 'CPU 4 • JOB',
          }
        : mode === 'passive'
        ? {
            ...base,
            kind: 'tile_land',
            tileType: 'character_passive',
            title: 'ĐƯỢC DỖ',
            description: 'Cú mất 30B$ được dỗ lại +10B$.',
            summary: '',
            impact: '✨',
            eyebrow: 'PLAYER 1 • NỘI TẠI',
          }
        : mode === 'job'
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
      if (mode === 'job' || mode === 'jobwait' || mode === 'passive') presentation.showLanding(model);
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
