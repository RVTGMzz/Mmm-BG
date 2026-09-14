import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { demoMatchLapProgress } from '../core/demoMatch';
import type { MatchEvent, MatchState } from '../core/matchState';
import type { PlayerState } from '../core/types';
import {
  formatMoneyLeaderboardRow,
  moneyDeltas,
  moneyRankForPlayer,
  moneyRanks,
  type MoneyDeltaEntry,
} from '../ui/moneyStakes';
import { PartyMechanicsBoardScene } from './PartyMechanicsBoardScene';

type NetworkStateSource = 'host' | 'state' | 'snapshot';

type TurnStakesInternals = {
  match: MatchState;
  compactTurnText?: Phaser.GameObjects.Text;
  compactScoreText?: Phaser.GameObjects.Text;
  currentPlayer(): PlayerState | undefined;
  updateCompactHud(internals: unknown): void;
  applyNetworkState(
    state: MatchState,
    commandSeq: number,
    checksum: string,
    source: NetworkStateSource,
  ): void;
};

function presentationOwnsMoneyCue(event: MatchEvent): boolean {
  if (event.type === 'tile_land' && String(event.data.tileType ?? '') === 'money') return true;
  if (event.type === 'ready_pass') return true;
  if (event.type === 'news') return true;
  if (event.type === 'card_play') return true;
  return false;
}

export class TurnStakesBoardScene extends PartyMechanicsBoardScene {
  private previousLeaderId?: number;
  private readonly transientMoneyFx = new Set<Phaser.GameObjects.Text>();

  create(): void {
    super.create();

    const internals = this as unknown as TurnStakesInternals;
    const originalUpdateCompactHud = internals.updateCompactHud.bind(this);
    internals.updateCompactHud = (arg: unknown) => {
      originalUpdateCompactHud(arg);
      this.refreshMoneyStakes(internals);
    };

    const originalApplyNetworkState = internals.applyNetworkState.bind(this);
    internals.applyNetworkState = (
      state: MatchState,
      commandSeq: number,
      checksum: string,
      source: NetworkStateSource,
    ) => {
      const before = internals.match.players.map((player) => ({
        ...player,
        handCardIds: [...player.handCardIds],
      }));
      const beforeEventSeq = internals.match.nextEventSeq;
      const freshEvents = source === 'snapshot'
        ? []
        : state.eventLog.filter((event) => event.seq >= beforeEventSeq);
      const deltas = source === 'snapshot' ? [] : moneyDeltas(before, state.players);
      const packetMoneyCue = !freshEvents.some(presentationOwnsMoneyCue);

      originalApplyNetworkState(state, commandSeq, checksum, source);
      this.refreshMoneyStakes(internals);
      if (deltas.length > 0) this.showMoneyDeltas(deltas, internals.match.players, packetMoneyCue);
    };

    this.refreshMoneyStakes(internals);
    this.updateBuildLabels();

    this.events.once('shutdown', () => {
      for (const text of this.transientMoneyFx) text.destroy();
      this.transientMoneyFx.clear();
      this.previousLeaderId = undefined;
    });
  }

  private refreshMoneyStakes(internals: TurnStakesInternals): void {
    const players = internals.match.players;
    const current = internals.currentPlayer();
    if (!current || players.length === 0) return;

    const ordered = moneyRanks(players);
    const leader = ordered.find((entry) => entry.marker === '👑');
    const leaderChanged =
      leader?.playerId !== undefined &&
      this.previousLeaderId !== undefined &&
      leader.playerId !== this.previousLeaderId;
    this.previousLeaderId = leader?.playerId;

    const playerCount = Math.max(1, players.length);
    const lapProgress = demoMatchLapProgress(internals.match);
    const currentRank = moneyRankForPlayer(players, current.id);
    const allTied = players.every((player) => player.money === players[0]?.money);
    const rankCopy = allTied
      ? 'Đồng hạng'
      : `${currentRank?.marker ? `${currentRank.marker} ` : ''}Hạng ${currentRank?.rank ?? '-'}/${playerCount}`;
    const cpu = browserSession.isCpuSeat(current.id) ? '🤖 ' : '';

    internals.compactTurnText?.setText(
      `HOÀN THÀNH 1 VÒNG • ${lapProgress.completedPlayers}/${lapProgress.totalPlayers}\n${cpu}${current.name} • ${current.money}B$ • ${rankCopy}`,
    );

    if (internals.compactScoreText) {
      const byId = new Map(players.map((player) => [player.id, player]));
      const rows = ordered
        .map((rank) => byId.get(rank.playerId))
        .filter((player): player is PlayerState => Boolean(player))
        .map((player) => {
          const base = formatMoneyLeaderboardRow(
            player,
            players,
            current.id,
            browserSession.isCpuSeat(player.id),
          );
          const lapDone = (player.lapsCompleted ?? 0) >= lapProgress.targetLaps;
          return `${base} • ${lapDone ? '🏁✓' : `🏁${player.lapsCompleted ?? 0}/${lapProgress.targetLaps}`}`;
        });
      internals.compactScoreText.setText(['BẢNG B$ • 🏁 ĐỦ 1 VÒNG', ...rows].join('\n'));

      if (leaderChanged) {
        this.tweens.killTweensOf(internals.compactScoreText);
        internals.compactScoreText.setScale(1);
        this.tweens.add({
          targets: internals.compactScoreText,
          scaleX: 1.045,
          scaleY: 1.045,
          duration: 150,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      }
    }
  }

  private showMoneyDeltas(
    deltas: MoneyDeltaEntry[],
    players: PlayerState[],
    playPacketCue = true,
  ): void {
    const ranks = moneyRanks(players);
    const rowByPlayer = new Map(ranks.map((entry, index) => [entry.playerId, index]));

    // Tile/Card/News/READY packets already have an event-aligned presentation cue.
    // Keep packet-level coin audio only for economy changes without a presentation
    // owner, such as Mini Game payout. This prevents spoilers and double SFX.
    if (playPacketCue && deltas.some((delta) => delta.amount > 0)) sfxController.play('coin_gain');
    if (playPacketCue && deltas.some((delta) => delta.amount < 0)) sfxController.play('coin_loss');

    for (const delta of deltas) {
      const row = rowByPlayer.get(delta.playerId) ?? 0;
      const positive = delta.amount > 0;
      const text = this.add.text(
        1003,
        62 + row * 18,
        `${positive ? '+' : ''}${delta.amount} B$`,
        {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: positive ? '#1d7b46' : '#c83434',
          stroke: '#fffaf0',
          strokeThickness: 4,
        },
      ).setOrigin(1, 0.5).setDepth(938).setAlpha(0).setScale(0.82);
      this.transientMoneyFx.add(text);

      this.tweens.add({
        targets: text,
        alpha: 1,
        x: 994,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.time.delayedCall(680, () => {
            if (!text.active) return;
            this.tweens.add({
              targets: text,
              alpha: 0,
              x: 985,
              duration: 220,
              ease: 'Sine.easeIn',
              onComplete: () => {
                this.transientMoneyFx.delete(text);
                text.destroy();
              },
            });
          });
        },
      });
    }
  }

  private updateBuildLabels(): void {
    for (const object of this.children.list) {
      if (!(object instanceof Phaser.GameObjects.Text)) continue;
      const current = object.text;
      if (current.includes('CITY • MVP 0.1.24 PARTY MECHANICS')) {
        object.setText('CITY • MVP 0.1.26 TURN STAKES');
      } else if (current.includes('PLAYTEST 0.1.24 • PARTY MECHANICS')) {
        object.setText('PLAYTEST 0.1.26 • TURN STAKES');
      }
    }
  }
}
