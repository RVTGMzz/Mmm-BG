import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import { jobById, jobSalary, type JobDefinition } from '../core/jobs';
import type { MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene068 } from './CareerMinigameBoardScene068';

const JOBS_0681 = jobsJson as JobDefinition[];

type HudHandle0681 = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

type SceneRuntime0681 = {
  match: MatchState;
  hud: Map<number, HudHandle0681>;
  currentPlayer(): PlayerState | undefined;
};

type PresentationRuntime0681 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

/**
 * 0.1.68.1 is a presentation-only mobile readability pass.
 *
 * Goals:
 * - player cards are readable in one glance instead of carrying every counter;
 * - large blocking modals own the screen and temporarily hide redundant top HUD;
 * - Job result copy is compact and legacy narrative cannot bleed behind it.
 *
 * No gameplay, RNG, authority, economy, camera or match-length rule changes.
 */
export class CareerMinigameBoardScene0681 extends CareerMinigameBoardScene068 {
  private readonly hiddenTopHud0681 = new Map<Phaser.GameObjects.Text, boolean>();
  private readonly hiddenLegacyCopy0681 = new Map<Phaser.GameObjects.Text, boolean>();

  create(): void {
    super.create();
    this.syncReadableHud0681();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.restoreUi0681());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.restoreUi0681());
  }

  update(): void {
    super.update();
    // Always run after inherited HUD/presentation writers so the readability rules
    // remain authoritative for the final visible frame.
    this.syncReadableHud0681();
    this.syncModalDeclutter0681();
  }

  private runtime0681(): SceneRuntime0681 {
    return this as unknown as SceneRuntime0681;
  }

  private presentation0681(): PresentationRuntime0681 | undefined {
    return (this as unknown as { presentation?: PresentationRuntime0681 }).presentation;
  }

  private syncReadableHud0681(): void {
    const runtime = this.runtime0681();
    const currentId = runtime.currentPlayer()?.id;

    for (const player of runtime.match.players) {
      const ui = runtime.hud.get(player.id);
      if (!ui) continue;

      // Primary information gets the pixels. Secondary counters move out of the
      // always-on card and remain available from the overview / dedicated flows.
      ui.name
        .setFontSize(16)
        .setFontStyle(player.id === currentId ? 'bold' : 'normal');
      ui.money
        .setFontSize(18)
        .setFontStyle('bold');

      const job = player.jobStatus === 'employed' ? jobById(JOBS_0681, player.jobId) : undefined;
      const lock = player.cardBlockTurns > 0 ? `🔒${player.cardBlockTurns}` : '';

      if (!job) {
        if (lock) {
          ui.meta
            .setText(lock)
            .setVisible(true)
            .setFontSize(12)
            .setLineSpacing(0)
            .setFixedSize(184, 20);
        } else {
          ui.meta.setText('').setVisible(false);
        }
        continue;
      }

      const level = Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1)));
      const salary = jobSalary(job, level);
      const lockSuffix = lock ? ` • ${lock}` : '';
      ui.meta
        .setText(`${job.icon} ${job.title} L${level} • ${salary}/vòng${lockSuffix}`)
        .setVisible(true)
        .setFontSize(12)
        .setLineSpacing(0)
        .setFixedSize(188, 20);
    }
  }

  private syncModalDeclutter0681(): void {
    const presentation = this.presentation0681();
    const presentationActive = Boolean(presentation?.active?.active);
    const canonicalJobPresentation = presentation?.active?.name === 'job-presentation-card';
    const jobHubActive = this.hasNamedTopLevelContainer0681('job-hub-modal');
    const jobDetailActive = this.hasNamedTopLevelContainer0681('job-detail-modal');
    const jobResultActive = this.anyVisibleText0681((copy) => copy.includes('nhận việc'));
    const largeModalActive = presentationActive || jobHubActive || jobDetailActive;

    if (largeModalActive) this.hideTopHud0681();
    else this.restoreTopHud0681();

    if (canonicalJobPresentation) {
      this.restoreLegacyCopy0681();
      return;
    }

    if (jobResultActive) {
      this.compactCanonicalJobCard0681();
      this.hideLegacyJobNarrative0681();
    } else {
      this.restoreLegacyCopy0681();
    }
  }

  private hasNamedTopLevelContainer0681(name: string): boolean {
    return this.children.list.some(
      (object) =>
        object instanceof Phaser.GameObjects.Container
        && object.active
        && object.visible
        && object.name === name,
    );
  }

  private hideTopHud0681(): void {
    this.visitTexts0681((text) => {
      if (!text.visible) return;
      const copy = this.normalize0681(text.text);
      const redundantTopHud =
        copy.startsWith('city • mvp ') ||
        copy === '🗺️ tổng quan' ||
        copy === 'tổng quan' ||
        copy.startsWith('lượt:');
      if (!redundantTopHud) return;
      if (!this.hiddenTopHud0681.has(text)) this.hiddenTopHud0681.set(text, text.visible);
      text.setVisible(false);
    });
  }

  private restoreTopHud0681(): void {
    for (const [text, wasVisible] of this.hiddenTopHud0681) {
      if (text.scene && text.active) text.setVisible(wasVisible);
    }
    this.hiddenTopHud0681.clear();
  }

  private compactCanonicalJobCard0681(): void {
    const presentation = this.presentation0681();
    const root = presentation?.active;
    const model = presentation?.currentModel;
    if (!root?.active || !model || model.kind !== 'tile_land' || model.tileType !== 'job') return;

    const runtime = this.runtime0681();
    const player = runtime.match.players.find((candidate) => candidate.id === model.actorId);
    const job = player?.jobStatus === 'employed' ? jobById(JOBS_0681, player.jobId) : undefined;
    const level = job && player ? Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1))) : 0;
    const salary = job && level > 0 ? jobSalary(job, level) : 0;
    const compact = job ? `${job.icon} ${job.title} L${level} • ${salary} B$/vòng` : 'Kết quả nghề đã được áp dụng.';

    this.visitContainerTexts0681(root, (text) => {
      // Landing body created by MatchPresentationLayer lives in the lower-left
      // content slot. Replace the long prose with one glanceable career line.
      if (text.x <= -150 && text.y >= 8) {
        text
          .setText(compact)
          .setFontSize(18)
          .setLineSpacing(2)
          .setWordWrapWidth(500, true)
          .setFixedSize(500, 46);
      }
      // Keep the result title comfortably readable on a phone.
      if (text.x <= -150 && text.y < 0 && text.style.fontSize) {
        const currentSize = Number.parseFloat(String(text.style.fontSize));
        if (Number.isFinite(currentSize) && currentSize >= 24) text.setFontSize(30);
      }
    });
  }

  private hideLegacyJobNarrative0681(): void {
    const hudObjects = this.collectHudObjects0681();
    const presentationRoot = this.presentation0681()?.active;
    const canonical = new Set<Phaser.GameObjects.GameObject>();
    if (presentationRoot?.active) this.collectObjects0681(presentationRoot, canonical);

    this.visitTexts0681((text) => {
      if (!text.visible || hudObjects.has(text) || canonical.has(text)) return;
      const copy = this.normalize0681(text.text);
      if (!copy) return;

      const legacyJobNarrative =
        copy.includes('trúng') ||
        copy.includes('b$/vòng') ||
        copy.includes('thu nhập') ||
        copy.includes('cây đơn') ||
        copy.includes('bùng nổ') ||
        copy.includes('mất việc') ||
        copy.includes('tụt') ||
        copy.includes('xác di chuyển tiếp tục');
      if (!legacyJobNarrative) return;

      if (!this.hiddenLegacyCopy0681.has(text)) this.hiddenLegacyCopy0681.set(text, text.visible);
      text.setVisible(false);
    });
  }

  private collectHudObjects0681(): Set<Phaser.GameObjects.GameObject> {
    const output = new Set<Phaser.GameObjects.GameObject>();
    for (const ui of this.runtime0681().hud.values()) this.collectObjects0681(ui.root, output);
    return output;
  }

  private collectObjects0681(
    root: Phaser.GameObjects.Container,
    output: Set<Phaser.GameObjects.GameObject>,
  ): void {
    output.add(root);
    for (const child of root.list) {
      output.add(child);
      if (child instanceof Phaser.GameObjects.Container) this.collectObjects0681(child, output);
    }
  }

  private restoreLegacyCopy0681(): void {
    for (const [text, wasVisible] of this.hiddenLegacyCopy0681) {
      if (text.scene && text.active) text.setVisible(wasVisible);
    }
    this.hiddenLegacyCopy0681.clear();
  }

  private restoreUi0681(): void {
    this.restoreTopHud0681();
    this.restoreLegacyCopy0681();
  }

  private anyVisibleText0681(predicate: (normalizedCopy: string) => boolean): boolean {
    let found = false;
    this.visitTexts0681((text) => {
      if (!found && text.visible && predicate(this.normalize0681(text.text))) found = true;
    });
    return found;
  }

  private visitTexts0681(visitor: (text: Phaser.GameObjects.Text) => void): void {
    const walk = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) visitor(object);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) walk(child);
      }
    };
    for (const object of this.children.list) walk(object);
  }

  private visitContainerTexts0681(
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

  private normalize0681(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  }
}
