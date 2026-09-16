import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import { jobById, jobSalary, type JobDefinition } from '../core/jobs';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene0681 } from './CareerMinigameBoardScene0681';

const JOBS_0682 = jobsJson as JobDefinition[];
const IDLE_HUD_SCALE_0682 = 0.9;
const ACTIVE_HUD_SCALE_0682 = 1.08;

type HudHandle0682 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type SceneRuntime0682 = {
  match: MatchState;
  hud: Map<number, HudHandle0682>;
  currentPlayer(): PlayerState | undefined;
};

type PresentationRuntime0682 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.68.2 is the first runtime implementation of the canonical MeMeMe UI/UX contract.
 *
 * Presentation-only rules:
 * - idle corner HUD stays compact and quiet;
 * - current-turn HUD expands and reveals one extra context line;
 * - blocking modals suppress loose board narration behind them;
 * - no RNG, gameplay state mutation or authority path is introduced here.
 */
export class CareerMinigameBoardScene0682 extends CareerMinigameBoardScene0681 {
  private previousActivePlayerId0682: number | undefined;
  private readonly hiddenLooseText0682 = new Map<Phaser.GameObjects.Text, boolean>();

  create(): void {
    super.create();
    this.syncActivePlayerHud0682(true);
    this.syncStrictModalOwnership0682();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.restoreUi0682());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.restoreUi0682());
  }

  update(): void {
    super.update();
    this.syncActivePlayerHud0682(false);
    this.syncStrictModalOwnership0682();
  }

  private runtime0682(): SceneRuntime0682 {
    return this as unknown as SceneRuntime0682;
  }

  private presentation0682(): PresentationRuntime0682 | undefined {
    return (this as unknown as { presentation?: PresentationRuntime0682 }).presentation;
  }

  private syncActivePlayerHud0682(immediate: boolean): void {
    const runtime = this.runtime0682();
    const currentId = runtime.currentPlayer()?.id;
    const turnChanged = currentId !== this.previousActivePlayerId0682;

    for (const player of runtime.match.players) {
      const ui = runtime.hud.get(player.id);
      if (!ui?.root.active) continue;

      const active = player.id === currentId;
      const targetScale = active ? ACTIVE_HUD_SCALE_0682 : IDLE_HUD_SCALE_0682;
      ui.root.setAlpha(active ? 1 : 0.93);

      if (immediate || this.previousActivePlayerId0682 === undefined) {
        ui.root.setScale(targetScale);
      } else if (turnChanged) {
        this.tweens.killTweensOf(ui.root);
        this.tweens.add({
          targets: ui.root,
          scaleX: targetScale,
          scaleY: targetScale,
          duration: 150,
          ease: active ? 'Back.easeOut' : 'Sine.easeOut',
        });
      }

      ui.name
        .setFontSize(active ? 17 : 15)
        .setFontStyle(active ? 'bold' : 'normal');
      ui.money
        .setFontSize(active ? 19 : 17)
        .setFontStyle('bold');

      const job = player.jobStatus === 'employed' ? jobById(JOBS_0682, player.jobId) : undefined;
      if (!job) {
        if (active) {
          const status = player.cardBlockTurns > 0 ? `🔒 Khóa lá ${player.cardBlockTurns} lượt` : 'Chưa có nghề';
          ui.meta
            .setText(status)
            .setVisible(true)
            .setFontSize(12)
            .setFixedSize(188, 20)
            .setLineSpacing(0);
        } else {
          ui.meta.setText('').setVisible(false);
        }
        continue;
      }

      const level = Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1)));
      const salary = jobSalary(job, level);
      const idleCopy = `${job.icon} ${job.title} L${level}`;
      const activeCopy = `${job.icon} ${job.title} L${level} • ${salary}/vòng${player.cardBlockTurns > 0 ? ` • 🔒${player.cardBlockTurns}` : ''}`;
      ui.meta
        .setText(active ? activeCopy : idleCopy)
        .setVisible(true)
        .setFontSize(active ? 13 : 11)
        .setFixedSize(188, 22)
        .setLineSpacing(0);
    }

    this.previousActivePlayerId0682 = currentId;
  }

  private syncStrictModalOwnership0682(): void {
    const presentationRoot = this.presentation0682()?.active;
    const jobHubRoot = this.findTopLevelContainer0682((copy) => copy.includes('job hub'));
    const blockingRoot = presentationRoot?.active ? presentationRoot : jobHubRoot;

    if (!blockingRoot?.active) {
      this.restoreLooseText0682();
      return;
    }

    const canonical = new Set<Phaser.GameObjects.GameObject>();
    this.collectObjects0682(blockingRoot, canonical);
    const hud = this.collectHudObjects0682();

    this.visitTexts0682((text) => {
      if (!text.visible || canonical.has(text) || hud.has(text)) return;
      // Loose board copy is the source of the visible text leaks reported on mobile.
      // Nested reaction/modal text has an owner container and is handled by its own layout.
      if (text.parentContainer) return;
      if (!this.hiddenLooseText0682.has(text)) this.hiddenLooseText0682.set(text, text.visible);
      text.setVisible(false);
    });
  }

  private findTopLevelContainer0682(
    predicate: (normalizedCopy: string) => boolean,
  ): Phaser.GameObjects.Container | undefined {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Container) || !object.active || !object.visible) continue;
      let matched = false;
      this.visitContainerTexts0682(object, (text) => {
        if (!matched && text.visible && predicate(this.normalize0682(text.text))) matched = true;
      });
      if (matched) return object;
    }
    return undefined;
  }

  private collectHudObjects0682(): Set<Phaser.GameObjects.GameObject> {
    const output = new Set<Phaser.GameObjects.GameObject>();
    for (const ui of this.runtime0682().hud.values()) this.collectObjects0682(ui.root, output);
    return output;
  }

  private collectObjects0682(
    root: Phaser.GameObjects.Container,
    output: Set<Phaser.GameObjects.GameObject>,
  ): void {
    output.add(root);
    for (const child of root.list) {
      output.add(child);
      if (child instanceof Phaser.GameObjects.Container) this.collectObjects0682(child, output);
    }
  }

  private restoreLooseText0682(): void {
    for (const [text, wasVisible] of this.hiddenLooseText0682) {
      if (text.scene && text.active) text.setVisible(wasVisible);
    }
    this.hiddenLooseText0682.clear();
  }

  private restoreUi0682(): void {
    this.restoreLooseText0682();
    for (const ui of this.runtime0682().hud.values()) {
      if (!ui.root.active) continue;
      this.tweens.killTweensOf(ui.root);
      ui.root.setScale(1).setAlpha(1);
    }
  }

  private visitTexts0682(visitor: (text: Phaser.GameObjects.Text) => void): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) walk(child);
      }
    };
    for (const object of this.children.list) walk(object);
  }

  private visitContainerTexts0682(
    root: Phaser.GameObjects.Container,
    visitor: (text: Phaser.GameObjects.Text) => void,
  ): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) walk(child);
      }
    };
    walk(root);
  }

  private normalize0682(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  }
}
