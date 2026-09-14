import Phaser from 'phaser';
import { demoMatchResult } from '../core/demoMatch';
import type { MatchState } from '../core/matchState';
import { gameSession } from '../core/session';
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

type RankedEntry = {
  playerId: number;
  money: number;
  rank: number;
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

    const ranking = this.withCompetitionRanks(result.ranking);
    const root = this.buildPodium(internals.match, ranking, result.winnerIds.length > 1);
    root.setAlpha(inheritedAlpha);
    internals.shellOverlay.push(root);
  }

  private withCompetitionRanks(
    ranking: Array<{ playerId: number; money: number }>,
  ): RankedEntry[] {
    const ranked: RankedEntry[] = [];
    ranking.forEach((entry, index) => {
      const previous = ranked[index - 1];
      const rank = previous && previous.money === entry.money ? previous.rank : index + 1;
      ranked.push({ ...entry, rank });
    });
    return ranked;
  }

  private buildPodium(
    match: MatchState,
    ranking: RankedEntry[],
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

      const shadow = this.add.rectangle(x + 4, baselineY - height / 2 + 5, 142, height, 0x000000, 0.24);
      const pedestal = this.add.rectangle(x, baselineY - height / 2, 142, height, accent, 0.94)
        .setStrokeStyle(rank === 1 ? 4 : 3, rank === 1 ? 0xffd34d : 0xfffaf0, 1);
      const rankText = this.add.text(x, top + 20, medal, {
        fontSize: rank === 1 ? '28px' : '24px',
      }).setOrigin(0.5);
      const nameText = this.add.text(x, top + 50, this.shortPodiumName(name), {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
      const moneyText = this.add.text(x, top + 76, `${entry.money} B$`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: rank === 1 ? '18px' : '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);

      root.add([shadow, pedestal, rankText, nameText, moneyText]);

      const faceAsset = gameSession.getFace(entry.playerId, 'neutral');
      if (faceAsset && this.textures.exists(faceAsset.textureKey)) {
        root.add(
          this.add.rectangle(x, faceY, 62, 62, 0xfffbf3, 1).setStrokeStyle(4, accent, 1),
          this.add.image(x, faceY, faceAsset.textureKey).setDisplaySize(54, 54),
        );
      } else {
        root.add(
          this.add.circle(x, faceY, 29, 0xfffbf3, 1).setStrokeStyle(4, accent, 1),
          this.add.text(x, faceY, `P${entry.playerId + 1}`, {
            fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#202020',
          }).setOrigin(0.5),
        );
      }
    });

    return root;
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
