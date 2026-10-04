import Phaser from 'phaser';
import { demoMatchResult } from '../core/demoMatch';
import type { MatchState } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import { withCompetitionRanks, type RankedPodiumEntry } from '../ui/podiumRanking';
import { CareerMinigameBoardScene040 } from './CareerMinigameBoardScene040';

const PLAYER_ACCENTS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];

const MEDAL_BY_RANK: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '4️⃣',
};

const PODIUM_HEIGHT_BY_RANK: Record<number, number> = {
  1: 106,
  2: 84,
  3: 64,
  4: 48,
};

type PodiumInternals = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  renderShellOverlay(): void;
};

/**
 * 0.1.41 presentation-only final podium.
 *
 * The existing shell/result state remains authoritative. This scene only replaces the
 * old text ranking with a four-seat podium after the real result overlay is eligible.
 * 0.1.39 still owns the final-result gate/lock animation, so queued presentation and
 * a pending Mini Game payout must finish before this podium can be revealed.
 */
export class CareerMinigameBoardScene041 extends CareerMinigameBoardScene040 {
  create(): void {
    super.create();
    this.installAuthoritativePodium();
    this.updateBuildLabels041();
  }

  private installAuthoritativePodium(): void {
    const internals = this as unknown as PodiumInternals;
    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);

    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();
      if (internals.shell.status !== 'ended' || internals.shellOverlay.length === 0) return;
      this.replaceLegacyResultWithPodium(internals);
    };
  }

  private replaceLegacyResultWithPodium(internals: PodiumInternals): void {
    const result = demoMatchResult(internals.match);
    if (result.ranking.length === 0) return;

    // 0.1.39 may already have hidden the real result overlay for its short lock beat.
    // Match that alpha so the podium joins the same reveal instead of popping in early.
    const inheritedAlpha = this.overlayAlpha(internals.shellOverlay);

    const retained: Phaser.GameObjects.GameObject[] = [];
    for (const object of internals.shellOverlay) {
      if (object instanceof Phaser.GameObjects.Text && object.y < 420) {
        object.destroy();
        continue;
      }
      retained.push(object);
    }
    internals.shellOverlay.splice(0, internals.shellOverlay.length, ...retained);

    const ranking = withCompetitionRanks(result.ranking);
    const root = this.buildPodium(internals.match, ranking, result.winnerIds.length > 1);
    root.setAlpha(inheritedAlpha);
    internals.shellOverlay.push(root);
  }

  private buildPodium(
    match: MatchState,
    ranking: RankedPodiumEntry[],
    hasFirstPlaceTie: boolean,
  ): Phaser.GameObjects.Container {
    const root = this.add.container(0, 0).setDepth(701).setName('final-podium-ch176');

    const paperShadow = this.add.graphics().setName('final-podium-paper-shadow-ch176');
    paperShadow.fillStyle(0x4b302a, 0.24);
    paperShadow.fillRoundedRect(278, 132, 724, 340, 34);

    const paper = this.add.graphics().setName('final-podium-paper-ch176');
    paper.fillStyle(0xfff7e8, 0.995);
    paper.fillRoundedRect(282, 124, 716, 340, 32);
    paper.lineStyle(5, 0x4b302a, 0.96);
    paper.strokeRoundedRect(282, 124, 716, 340, 32);

    const headerBand = this.add.graphics().setName('final-podium-header-ch176');
    headerBand.fillStyle(0xffd76a, 1);
    headerBand.fillRoundedRect(302, 142, 676, 78, { tl: 22, tr: 22, bl: 12, br: 12 });
    headerBand.fillStyle(0xffffff, 0.48);
    headerBand.fillRoundedRect(318, 150, 644, 10, 5);
    headerBand.lineStyle(2, 0x4b302a, 0.24);
    headerBand.strokeRoundedRect(302, 142, 676, 78, { tl: 22, tr: 22, bl: 12, br: 12 });

    root.add([paperShadow, paper, headerBand]);

    root.add(
      this.add.text(640, 171, hasFirstPlaceTie ? '🏆 ĐỒNG HẠNG ĐẦU BẢNG' : '🏆 BẢNG XẾP HẠNG', {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#4b302a',
        align: 'center',
      }).setOrigin(0.5).setName('final-podium-title-ch176'),
    );

    root.add(
      this.add.text(640, 202, 'XẾP THEO B$ • BẰNG TIỀN = CÙNG HẠNG', {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#6c5146',
      }).setOrigin(0.5).setName('final-podium-subtitle-ch176'),
    );

    const slotXs = [370, 550, 730, 910];
    const baselineY = 402;

    ranking.slice(0, 4).forEach((entry, index) => {
      const x = slotXs[index];
      const rank = Math.min(4, Math.max(1, entry.rank));
      const height = PODIUM_HEIGHT_BY_RANK[rank] ?? PODIUM_HEIGHT_BY_RANK[4];
      const accent = PLAYER_ACCENTS[entry.playerId] ?? 0xb8ada1;
      const top = baselineY - height;
      const faceY = top - 37;
      const medal = MEDAL_BY_RANK[rank] ?? `#${rank}`;
      const player = match.players.find((candidate) => candidate.id === entry.playerId);
      const name = player?.name ?? `P${entry.playerId + 1}`;
      const slot = this.add.container(x, 0);

      const pedestalShadow = this.add.graphics().setName(`final-podium-slot-shadow-${entry.playerId}-ch176`);
      pedestalShadow.fillStyle(0x4b302a, 0.24);
      pedestalShadow.fillRoundedRect(-73, baselineY - height + 6, 146, height + 2, 18);

      const pedestal = this.add.graphics().setName(`final-podium-slot-${entry.playerId}-ch176`);
      pedestal.fillStyle(accent, 0.96);
      pedestal.fillRoundedRect(-71, baselineY - height, 142, height, 17);
      pedestal.fillStyle(0xffffff, rank === 1 ? 0.34 : 0.24);
      pedestal.fillRoundedRect(-61, baselineY - height + 7, 122, 9, 5);
      pedestal.lineStyle(rank === 1 ? 4 : 3, rank === 1 ? 0xd99b38 : 0x4b302a, rank === 1 ? 1 : 0.72);
      pedestal.strokeRoundedRect(-71, baselineY - height, 142, height, 17);

      const rankPill = this.add.graphics().setName(`final-podium-rank-pill-${entry.playerId}-ch176`);
      rankPill.fillStyle(0xfff7e8, 0.98);
      rankPill.fillCircle(0, top + 19, rank === 1 ? 25 : 22);
      rankPill.lineStyle(3, rank === 1 ? 0xd99b38 : accent, 0.92);
      rankPill.strokeCircle(0, top + 19, rank === 1 ? 25 : 22);

      const rankText = this.add.text(0, top + 19, medal, {
        fontSize: rank === 1 ? '28px' : '23px',
      }).setOrigin(0.5);
      const nameText = this.add.text(0, top + 51, this.shortPodiumName(name), {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fffaf3',
        align: 'center',
      }).setOrigin(0.5);
      const moneyText = this.add.text(0, top + 76, `${entry.money} B$`, {
        fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
        fontSize: rank === 1 ? '18px' : '16px',
        fontStyle: 'bold',
        color: '#fff7de',
      }).setOrigin(0.5);

      slot.add([pedestalShadow, pedestal, rankPill, rankText, nameText, moneyText]);

      const faceExpression = this.podiumFaceExpression(entry);
      const faceAsset = gameSession.getFace(entry.playerId, faceExpression);
      const faceShadow = this.add.graphics().setName(`final-podium-face-shadow-${entry.playerId}-ch176`);
      faceShadow.fillStyle(0x4b302a, 0.22);
      faceShadow.fillRoundedRect(-36, faceY - 31, 72, 72, 22);

      const faceFrame = this.add.graphics().setName(`final-podium-face-frame-${entry.playerId}-ch176`);
      faceFrame.fillStyle(0xfffdf8, 1);
      faceFrame.fillRoundedRect(-36, faceY - 36, 72, 72, 22);
      faceFrame.lineStyle(rank === 1 ? 4 : 3, rank === 1 ? 0xd99b38 : accent, 1);
      faceFrame.strokeRoundedRect(-36, faceY - 36, 72, 72, 22);
      faceFrame.fillStyle(0xffffff, 0.52);
      faceFrame.fillRoundedRect(-27, faceY - 28, 54, 8, 4);

      if (faceAsset && this.textures.exists(faceAsset.textureKey)) {
        slot.add([
          faceShadow,
          faceFrame,
          this.add.image(0, faceY, faceAsset.textureKey).setDisplaySize(58, 58),
        ]);
      } else {
        slot.add([
          faceShadow,
          faceFrame,
          this.add.text(0, faceY, `P${entry.playerId + 1}`, {
            fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#4b302a',
          }).setOrigin(0.5),
        ]);
      }

      this.decoratePodiumSlot(slot, entry, 0, faceY);
      root.add(slot);
    });

    return root;
  }

  protected podiumFaceExpression(_entry: RankedPodiumEntry): FaceExpression {
    return 'neutral';
  }

  protected decoratePodiumSlot(
    _slot: Phaser.GameObjects.Container,
    _entry: RankedPodiumEntry,
    _x: number,
    _faceY: number,
  ): void {
    // Extension hook for later presentation-only podium polish.
  }

  private overlayAlpha(objects: Phaser.GameObjects.GameObject[]): number {
    for (const object of objects) {
      if ('alpha' in object && typeof object.alpha === 'number') return object.alpha;
    }
    return 1;
  }

  private shortPodiumName(name: string): string {
    return name.length <= 13 ? name : `${name.slice(0, 12)}…`;
  }

  private updateBuildLabels041(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      if (object.text.includes('CITY • MVP 0.1.40 LAP-NATIVE SHELL CLEANUP')) {
        object.setText('CITY • MVP 0.1.41 AUTHORITATIVE FINAL PODIUM');
      } else if (object.text.includes('PLAYTEST 0.1.40 • NO LEGACY ROUND COPY')) {
        object.setText('PLAYTEST 0.1.41 • PODIUM + TIE CLARITY');
      }
    }
  }
}
