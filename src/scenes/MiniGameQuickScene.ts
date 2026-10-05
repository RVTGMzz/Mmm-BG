import Phaser from 'phaser';
import { bgmController, type BgmTrackId } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { createInitialMatchState } from '../core/matchState';
import { gameSession } from '../core/session';
import { MINI_GAME_SLOTS_059 } from '../core/miniGameSlots059';
import { startMiniGameOverlay, type MiniGameOutcome } from '../ui/MiniGameOverlay';
import { decorateVisualFoundationButtonsV01 } from '../ui/visualFoundationV01';
import type { PlayerState } from '../core/types';
import { paintToyTownBackdropCh17 } from '../ui/paintToyTownBackdropCh17';
import { publicAssetUrl } from '../ui/publicAssetUrl';
import {
  CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181,
  CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
  CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
} from '../ui/characterProductionArtCh181';

function cpuSeatsForQuickMode(mode: string): number[] {
  if (mode === '1p3cpu') return [1, 2, 3];
  if (mode === '2p2cpu') return [2, 3];
  if (mode === '4cpu') return [0, 1, 2, 3];
  return [];
}

export class MiniGameQuickScene extends Phaser.Scene {
  private selectedContentId = MINI_GAME_SLOTS_059[0]!.contentId;
  private selectedMode = '1p3cpu';
  private runCounter = 0;
  private selectorDom?: Phaser.GameObjects.DOMElement;
  private resultDom?: Phaser.GameObjects.DOMElement;

  constructor() { super('MiniGameQuickScene'); }

  preload(): void {
    if (!this.textures.exists(CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182)) {
      this.load.spritesheet(
        CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
        publicAssetUrl(CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181),
        {
          frameWidth: CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
          frameHeight: CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181,
        },
      );
    }
  }

  create(): void {
    bgmController.playMenu();
    this.paintBackground();
    this.showSelector();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.selectorDom?.destroy();
      this.resultDom?.destroy();
      this.selectorDom = undefined;
      this.resultDom = undefined;
    });
  }

  private paintBackground(): void {
    paintToyTownBackdropCh17(this, 'butter', { x: 70, y: 38, width: 1140, height: 644, radius: 34 })
      .setName('quick-minigame-frame');
  }

  private showSelector(): void {
    this.resultDom?.destroy();
    this.resultDom = undefined;
    this.selectorDom?.destroy();

    const root = document.createElement('div');
    root.className = 'mememe-minigame-quick';
    root.innerHTML = `
      <header class="quick-mini-head">
        <button id="quick-mini-back" type="button">← MENU</button>
        <div>
          <div class="quick-mini-kicker">🕹️ MINI GAME MODE</div>
          <h1>CHỌN KÈO</h1>
        </div>
        <label>NGƯỜI CHƠI
          <select id="quick-mini-mode">
            <option value="1p3cpu">1 người + 3 CPU</option>
            <option value="2p2cpu">2 người + 2 CPU</option>
            <option value="hotseat">4 người HOTSEAT</option>
            <option value="4cpu">4 CPU AUTOPLAY</option>
          </select>
        </label>
      </header>
      <div class="quick-mini-grid">
        ${MINI_GAME_SLOTS_059.map((slot) => `
          <button class="quick-mini-card${slot.contentId === this.selectedContentId ? ' selected' : ''}" type="button" data-content-id="${slot.contentId}">
            <span class="quick-mini-icon">${slot.icon}</span>
            <strong>${slot.boardLabel} • ${slot.title}</strong>
            <small>${slot.identity}</small>
            <p>${slot.description}</p>
          </button>`).join('')}
      </div>
      <footer class="quick-mini-footer">
        <span>Chơi trực tiếp luật Mini Game hiện tại • không cần chạy Board.</span>
        <button id="quick-mini-start" type="button">BẮT ĐẦU →</button>
      </footer>`;

    this.selectorDom = this.add.dom(640, 360, root).setOrigin(0.5);
    const node = this.selectorDom.node as HTMLDivElement;
    const mode = node.querySelector<HTMLSelectElement>('#quick-mini-mode');
    if (mode) mode.value = this.selectedMode;

    decorateVisualFoundationButtonsV01(node, [
      { selector: '#quick-mini-back', variant: 'subtle', size: 'sm' },
      { selector: '#quick-mini-start', variant: 'primary', size: 'lg' },
      { selector: '.quick-mini-card', variant: 'secondary', size: 'md' },
    ]);

    const refreshSelected = () => {
      for (const button of node.querySelectorAll<HTMLButtonElement>('.quick-mini-card')) {
        button.classList.toggle('selected', button.dataset.contentId === this.selectedContentId);
      }
    };

    node.querySelectorAll<HTMLButtonElement>('.quick-mini-card').forEach((button) => {
      button.addEventListener('click', () => {
        const contentId = button.dataset.contentId;
        if (!contentId) return;
        this.selectedContentId = contentId;
        sfxController.play('ui_confirm');
        refreshSelected();
      });
    });

    mode?.addEventListener('change', () => {
      this.selectedMode = mode.value;
    });

    node.querySelector<HTMLButtonElement>('#quick-mini-back')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      this.scene.start('GameModeMenuScene');
    });

    node.querySelector<HTMLButtonElement>('#quick-mini-start')?.addEventListener('click', () => {
      this.selectedMode = mode?.value ?? this.selectedMode;
      void this.startSelectedMiniGame();
    });
  }

  private async startSelectedMiniGame(): Promise<void> {
    sfxController.play('ui_confirm');
    this.selectorDom?.destroy();
    this.selectorDom = undefined;

    browserSession.configureSolo(cpuSeatsForQuickMode(this.selectedMode));
    gameSession.reset();

    const playerNames = gameSession.players.map((player) =>
      browserSession.isCpuSeat(player.id) ? `CPU ${player.id + 1}` : `Player ${player.id + 1}`,
    );
    const match = createInitialMatchState({
      boardId: 'MINIGAME_QUICK_PLAY',
      startNodeId: 0,
      playerNames,
      seed: 16000 + this.runCounter,
    });
    this.runCounter += 1;

    const previousTrack: BgmTrackId = bgmController.getState().currentTrackId ?? 'menu_mememe';
    bgmController.playMiniGame();
    const run = startMiniGameOverlay(
      this,
      match.players,
      16000 + this.runCounter,
      this.selectedContentId,
    );

    try {
      const outcome = await run.done;
      if (run.root.active) run.root.destroy(true);
      this.showQuickResult(outcome, match.players);
    } finally {
      bgmController.playTrack(previousTrack);
    }
  }

  private showQuickResult(outcome: MiniGameOutcome, players: readonly PlayerState[]): void {
    const slot = MINI_GAME_SLOTS_059.find((entry) => entry.contentId === this.selectedContentId)
      ?? MINI_GAME_SLOTS_059[0]!;
    const root = document.createElement('div');
    root.className = 'mememe-minigame-quick-result';
    root.innerHTML = `
      <section class="quick-result-card">
        <div class="quick-result-icon">${slot.icon}</div>
        <div class="quick-mini-kicker">KẾT QUẢ • ${slot.boardLabel}</div>
        <h1>${slot.title}</h1>
        <div class="quick-result-ranking">
          ${outcome.rankingPlayerIds.map((id, index) => {
            const player = players.find((entry) => entry.id === id);
            return `<div><strong>#${index + 1}</strong><span>${player?.name ?? `P${id + 1}`}</span></div>`;
          }).join('')}
        </div>
        <div class="quick-result-actions">
          <button id="quick-result-again" type="button">↻ CHƠI LẠI</button>
          <button id="quick-result-change" type="button">ĐỔI MINI GAME</button>
          <button id="quick-result-menu" type="button">MENU CHÍNH</button>
        </div>
      </section>`;

    this.resultDom = this.add.dom(640, 360, root).setOrigin(0.5);
    const node = this.resultDom.node as HTMLDivElement;
    decorateVisualFoundationButtonsV01(node, [
      { selector: '#quick-result-again', variant: 'primary', size: 'lg' },
      { selector: '#quick-result-change', variant: 'secondary', size: 'lg' },
      { selector: '#quick-result-menu', variant: 'subtle', size: 'md' },
    ]);

    node.querySelector<HTMLButtonElement>('#quick-result-again')?.addEventListener('click', () => {
      this.resultDom?.destroy();
      this.resultDom = undefined;
      void this.startSelectedMiniGame();
    });
    node.querySelector<HTMLButtonElement>('#quick-result-change')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      this.showSelector();
    });
    node.querySelector<HTMLButtonElement>('#quick-result-menu')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      this.scene.start('GameModeMenuScene');
    });
  }
}
