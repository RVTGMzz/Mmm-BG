import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { decorateVisualFoundationButtonsV01 } from '../ui/visualFoundationV01';
import { paintToyTownBackdropCh17 } from '../ui/paintToyTownBackdropCh17';

export class GameModeMenuScene extends Phaser.Scene {
  constructor() { super('GameModeMenuScene'); }

  create(): void {
    bgmController.playMenu();
    paintToyTownBackdropCh17(this, 'peach', { x: 150, y: 90, width: 980, height: 540, radius: 34 });

    const root = document.createElement('div');
    root.className = 'mememe-mode-menu';
    root.innerHTML = `
      <header class="mode-menu-head">
        <div>
          <div class="mode-menu-kicker">MMM • ${MEMEME_BUILD.version}</div>
          <h1>CHƠI GÌ NÈ?</h1>
        </div>
        <span>Board dài hơi hay Mini Game vào kèo liền.</span>
      </header>
      <div class="mode-menu-grid">
        <section class="mode-menu-card board">
          <div class="mode-menu-icon">🎲</div>
          <h2>BOARD GAME</h2>
          <p>Vào thành phố, đổ xúc xắc, kiếm B$, nghề nghiệp, lá bài và đủ trò trời ơi đất hỡi.</p>
          <button id="mode-board" type="button">VÀO BOARD GAME →</button>
        </section>
        <section class="mode-menu-card mini">
          <div class="mode-menu-icon">🕹️</div>
          <h2>MINI GAME</h2>
          <p>Chọn 1 trong 5 Mini Game rồi chơi ngay. Hợp để quẩy nhanh hoặc test từng game riêng.</p>
          <button id="mode-mini" type="button">CHƠI MINI GAME →</button>
        </section>
      </div>`;

    const dom = this.add.dom(640, 360, root).setOrigin(0.5);
    const node = dom.node as HTMLDivElement;
    decorateVisualFoundationButtonsV01(node, [
      { selector: '#mode-board', variant: 'primary', size: 'lg' },
      { selector: '#mode-mini', variant: 'success', size: 'lg' },
    ]);

    node.querySelector<HTMLButtonElement>('#mode-board')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      this.scene.start('LocalLobbyScene');
    });
    node.querySelector<HTMLButtonElement>('#mode-mini')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      this.scene.start('MiniGameQuickScene');
    });
  }
}
