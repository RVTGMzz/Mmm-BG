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
    const root = this.add.container(0, 0).setDepth(701);

    root.add(
      this.add.text(640, 171, hasFirstPlaceTie ? '🏆 ĐỒNG HẠNG ĐẦU BẢNG' : '🏆 BẢNG XẾP HẠNG', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '27px',
        fontStyle: 'bold',
        color: '#ffd34d',
        align: 'center',
      }).setOrigin(0.5),
    );

    root.add(
      this.add.text(640, 202, 'B$ AUTHORITATIVE • CÙNG B$ = CÙNG HẠNG', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f4ead7',
      }).setOrigin(0.5),
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

      const shadow = this.add.rectangle(4, baselineY - height / 2 + 5, 142, height, 0x000000, 0.24);
      const pedestal = this.add.rectangle(0, baselineY - height / 2, 142, height, accent, 0.94)
        .setStrokeStyle(rank === 1 ? 4 : 3, rank === 1 ? 0xffd34d : 0xfffaf0, 1);
      const rankText = this.add.text(0, top + 20, medal, {
        fontSize: rank === 1 ? '28px' : '24px',
      }).setOrigin(0.5);
      const nameText = this.add.text(0, top + 50, this.shortPodiumName(name), {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
      const moneyText = this.add.text(0, top + 76, `${entry.money} B$`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: rank === 1 ? '18px' : '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);

      slot.add([shadow, pedestal, rankText, nameText, moneyText]);

      const faceExpression = this.podiumFaceExpression(entry);
      const faceAsset = gameSession.getFace(entry.playerId, faceExpression);
      if (faceAsset && this.textures.exists(faceAsset.textureKey)) {
        slot.add([
          this.add.rectangle(0, faceY, 62, 62, 0xfffbf3, 1).setStrokeStyle(4, accent, 1),
          this.add.image(0, faceY, faceAsset.textureKey).setDisplaySize(54, 54),
        ]);
      } else {
        slot.add([
          this.add.circle(0, faceY, 29, 0xfffbf3, 1).setStrokeStyle(4, accent, 1),
          this.add.text(0, faceY, `P${entry.playerId + 1}`, {
            fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#202020',
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
