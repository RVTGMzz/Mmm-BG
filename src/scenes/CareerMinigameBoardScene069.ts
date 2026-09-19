import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import { browserSession } from '../core/browserSession';
import { jobById, jobSalary, type JobDefinition } from '../core/jobs';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { resolveCameraActor0632 } from '../ui/cameraTarget0632';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0682 } from './CareerMinigameBoardScene0682';

const JOBS_069 = jobsJson as JobDefinition[];
const IDLE_SCALE_069 = 0.9;
const ACTIVE_SCALE_069 = 1.14;
const JOB_LABEL_WIDTH_069 = 184;

type HudHandle069 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type Runtime069 = {
  match: MatchState;
  hud: Map<number, HudHandle069>;
  handButton?: Phaser.GameObjects.Rectangle;
  handButtonText?: Phaser.GameObjects.Text;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
};

type Presentation069 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
  isBlocking?(): boolean;
};

/**
 * 0.1.69 First Impression Polish.
 * Presentation only: owned HUD job labels, compact Job result copy and strict leak suppression.
 */
export class CareerMinigameBoardScene069 extends CareerMinigameBoardScene0682 {
  private readonly ownedJobLabels069 = new Map<number, Phaser.GameObjects.Text>();
  private readonly hiddenLeakText069 = new Map<Phaser.GameObjects.Text, boolean>();

  create(): void {
    super.create();
    this.installOwnedHudLabels069();
    this.syncHud069();
    this.syncCardHandVisibility069();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.restore069());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.restore069());
  }

  update(): void {
    super.update();
    this.syncHud069();
    this.syncCardHandVisibility069();
    this.polishJobHub069();
    this.polishJobResult069();
  }

  private runtime069(): Runtime069 {
    return this as unknown as Runtime069;
  }

  private presentation069(): Presentation069 | undefined {
    return (this as unknown as { presentation?: Presentation069 }).presentation;
  }

  private installOwnedHudLabels069(): void {
    for (const [playerId, ui] of this.runtime069().hud) {
      ui.meta.setVisible(false);
      const label = this.add.text(-58, 14, '', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#5a5148',
        fixedWidth: JOB_LABEL_WIDTH_069,
        fixedHeight: 18,
        maxLines: 1,
      }).setOrigin(0, 0);
      ui.root.add(label);
      this.ownedJobLabels069.set(playerId, label);
    }
  }

  private fitJobLabel069(label: Phaser.GameObjects.Text, copy: string, active: boolean): void {
    const length = [...copy].length;
    const fontSize = length >= 31 ? 9 : length >= 27 ? 10 : length >= 23 ? 11 : active ? 12 : 12;
    label
      .setText(copy)
      .setFontSize(fontSize)
      .setFixedSize(JOB_LABEL_WIDTH_069, 18)
      .setMaxLines(1)
      .setVisible(true);
  }

  private syncHud069(): void {
    const runtime = this.runtime069();
    const activeId = resolveCameraActor0632(
      runtime.currentPlayer()?.id,
      this.presentation069()?.currentModel,
    );

    for (const player of runtime.match.players) {
      const ui = runtime.hud.get(player.id);
      const label = this.ownedJobLabels069.get(player.id);
      if (!ui || !label) continue;

      ui.meta.setText('').setVisible(false);
      const active = player.id === activeId;
      ui.root.setScale(active ? ACTIVE_SCALE_069 : IDLE_SCALE_069).setAlpha(active ? 1 : 0.94);
      ui.name.setFontSize(active ? 18 : 15).setFontStyle(active ? 'bold' : 'normal');
      ui.money.setFontSize(active ? 20 : 17).setFontStyle('bold');

      const job = player.jobStatus === 'employed' ? jobById(JOBS_069, player.jobId) : undefined;
      if (!job) {
        label.setText(active ? 'Chưa có nghề' : '').setVisible(active).setFontSize(12);
        continue;
      }
      const level = Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1)));
      const salary = jobSalary(job, level);
      const copy = active ? `${job.title} L${level} • ${salary}/v` : job.title;
      this.fitJobLabel069(label, copy, active);
    }
  }

  private syncCardHandVisibility069(): void {
    const runtime = this.runtime069();
    const player = runtime.currentPlayer();
    const blocking = this.presentation069()?.isBlocking?.() ?? false;
    const humanTurn = Boolean(
      player &&
      runtime.canControlCurrentPlayer() &&
      !browserSession.isCpuSeat(player.id),
    );
    const visible = humanTurn && !blocking;

    if (runtime.handButton) {
      runtime.handButton.setVisible(visible);
      if (visible) {
        if (!runtime.handButton.input?.enabled) runtime.handButton.setInteractive({ useHandCursor: true });
      } else if (runtime.handButton.input?.enabled) {
        runtime.handButton.disableInteractive();
      }
    }
    runtime.handButtonText?.setVisible(visible);
  }

  private polishJobHub069(): void {
    const root = this.findContainer069((copy) => copy.includes('job hub'));
    if (!root?.active) return;
    this.visitContainerTexts069(root, (text) => {
      const copy = this.normalize069(text.text);
      if (
        copy.includes('xúc xắc chọn a / b / c') ||
        copy.includes('chạm / a: chi tiết') ||
        copy.includes('a / enter: mở chi tiết') ||
        copy.startsWith('1–2 → a') ||
        copy.includes('host quyết định kết quả d6')
      ) text.setVisible(false);
    });
  }

  private polishJobResult069(): void {
    if (this.findNamedContainer069('job-detail-modal')?.active) {
      this.restoreLeaks069();
      return;
    }

    const presentation = this.presentation069();
    const root = presentation?.active;
    const model = presentation?.currentModel;
    const activeJobResult = Boolean(root?.active && model?.kind === 'tile_land' && model.tileType === 'job');
    if (!activeJobResult || !root || !model) {
      this.restoreLeaks069();
      return;
    }

    // 0.1.70.4.10: MatchPresentationLayer owns the canonical Job card.
    // This wrapper only suppresses stale Job copy outside that card. It must never
    // rewrite title/body positions every frame because that can visually duplicate
    // text while adjacent Job events transition.
    const canonical = new Set<Phaser.GameObjects.GameObject>();
    this.collectObjects069(root, canonical);
    const hud = new Set<Phaser.GameObjects.GameObject>();
    for (const ui of this.runtime069().hud.values()) this.collectObjects069(ui.root, hud);

    this.visitTexts069((text) => {
      if (!text.visible || canonical.has(text) || hud.has(text)) return;
      const copy = this.normalize069(text.text);
      const leak =
        copy.includes('job xuất hiện') ||
        copy === 'đổ xúc xắc để nhận việc.' ||
        copy.includes('trúng') ||
        (copy.includes('đổ') && copy.includes('lương')) ||
        copy.includes('b$/công') ||
        copy.includes('thu nhập') ||
        copy.includes('cây đơn') ||
        copy.includes('xác di chuyển') ||
        /còn \d+ bước/.test(copy);
      if (leak) this.hideLeakText069(text);
    });
  }

  private findNamedContainer069(name: string): Phaser.GameObjects.Container | undefined {
    for (const object of this.children.list) {
      if (
        object instanceof Phaser.GameObjects.Container
        && object.active
        && object.visible
        && object.name === name
      ) return object;
    }
    return undefined;
  }

  private hideLeakText069(text: Phaser.GameObjects.Text): void {
    if (!this.hiddenLeakText069.has(text)) this.hiddenLeakText069.set(text, text.visible);
    text.setVisible(false);
  }

  private findContainer069(predicate: (copy: string) => boolean): Phaser.GameObjects.Container | undefined {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Container) || !object.active || !object.visible) continue;
      let matched = false;
      this.visitContainerTexts069(object, (text) => {
        if (!matched && text.visible && predicate(this.normalize069(text.text))) matched = true;
      });
      if (matched) return object;
    }
    return undefined;
  }

  private collectObjects069(root: Phaser.GameObjects.Container, output: Set<Phaser.GameObjects.GameObject>): void {
    output.add(root);
    for (const child of root.list) {
      output.add(child);
      if (child instanceof Phaser.GameObjects.Container) this.collectObjects069(child, output);
    }
  }

  private restoreLeaks069(): void {
    for (const [text, wasVisible] of this.hiddenLeakText069) if (text.scene && text.active) text.setVisible(wasVisible);
    this.hiddenLeakText069.clear();
  }

  private restore069(): void {
    this.restoreLeaks069();
    for (const ui of this.runtime069().hud.values()) if (ui.root.active) ui.root.setScale(1).setAlpha(1);
  }

  private visitTexts069(visitor: (text: Phaser.GameObjects.Text) => void): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) for (const child of object.list) walk(child);
    };
    for (const object of this.children.list) walk(object);
  }

  private visitContainerTexts069(root: Phaser.GameObjects.Container, visitor: (text: Phaser.GameObjects.Text) => void): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) for (const child of object.list) walk(child);
    };
    walk(root);
  }

  private normalize069(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  }
}
