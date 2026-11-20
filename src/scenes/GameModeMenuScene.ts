import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { decorateVisualFoundationButtonsV01 } from '../ui/visualFoundationV01';
import {
  paintPartyBackdropCh19, partyBoxCh19, partyCardCh19, partyBustKeyCh19, partyPillButtonCh19, partyTextCh19,
  preloadPartyKitCh19, pressDomCh19, veilDomCh19, PARTY_CHARACTER_COLOUR_CH19,
} from '../ui/partyKitCh19';

export class GameModeMenuScene extends Phaser.Scene {
  constructor() { super('GameModeMenuScene'); }

  preload(): void {
    preloadPartyKitCh19(this);
  }

  create(): void {
    bgmController.playMenu();
    paintPartyBackdropCh19(this, 'sun');

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
        <section class="mode-menu-card board" data-mode-entry="board">
          <div class="mode-menu-icon">🎲</div>
          <h2>BOARD GAME</h2>
          <p>Vào thành phố, đổ xúc xắc, kiếm B$, nghề nghiệp, lá bài và đủ trò trời ơi đất hỡi.</p>
          <button id="mode-board" type="button">VÀO BOARD GAME →</button>
        </section>
        <section class="mode-menu-card mini" data-mode-entry="mini">
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

    const bindModeEntry = (
      cardSelector: string,
      buttonSelector: string,
      nextScene: 'LocalLobbyScene' | 'MiniGameQuickScene',
    ) => {
      const card = node.querySelector<HTMLElement>(cardSelector);
      const button = node.querySelector<HTMLButtonElement>(buttonSelector);
      if (!card || !button) return;

      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      let transitioning = false;
      const enter = () => {
        if (transitioning || !this.scene.isActive()) return;
        transitioning = true;
        sfxController.play('ui_confirm');
        if (nextScene === 'LocalLobbyScene') this.scene.start('LocalLobbyScene');
        else this.scene.start('MiniGameQuickScene');
      };

      button.addEventListener('click', (event) => {
        event.stopPropagation();
        enter();
      });
      card.addEventListener('click', (event) => {
        if ((event.target as Element | null)?.closest('button')) return;
        enter();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        enter();
      });
    };

    bindModeEntry('.mode-menu-card.board', '#mode-board', 'LocalLobbyScene');
    bindModeEntry('.mode-menu-card.mini', '#mode-mini', 'MiniGameQuickScene');
    this.paintPartyMenuCh19(dom);
  }

  /** CH-19 party skin: two big chunky choices drawn in Phaser over the (veiled) DOM menu. */
  private paintPartyMenuCh19(dom: Phaser.GameObjects.DOMElement): void {
    const node = veilDomCh19(dom);
    partyTextCh19(this, 92, 92, 'Chơi gì nè?', { size: 64, gradient: ['#ffffff', '#ffe3f0'], stroke: '#e0337a', strokeWidth: 13, align: 'left' })
      .setShadow(0, 7, 'rgba(110,20,60,.55)', 0, true, true);
    partyTextCh19(this, 96, 152, `MMM • ${MEMEME_BUILD.version}`, { size: 16, fill: '#ffffff', stroke: '#e0337a', strokeWidth: 4, align: 'left', shadow: false });

    const choice = (x: number, colour: number, title: string, desc: string, button: string, buttonColour: number, selector: string, art: (c: Phaser.GameObjects.Container) => void) => {
      const c = this.add.container(x, 405).setSize(500, 440).setName('party-mode-choice-ch19');
      c.add(partyBoxCh19(this, 0, 0, 500, 440, colour, { radius: 34, ring: 8 }));
      art(c);
      c.add(partyTextCh19(this, 0, 52, title, { size: 44, gradient: ['#ffffff', '#ffe9a8'], strokeWidth: 9 }));
      c.add(partyTextCh19(this, 0, 104, desc, { size: 18, fill: '#ffffff', strokeWidth: 4, wrap: 430, shadow: false }));
      const press = () => { pressDomCh19(node, selector); };
      c.add(partyPillButtonCh19(this, 0, 168, 300, 64, buttonColour, button, press, 26));
      c.setInteractive({ useHandCursor: true }).on('pointerdown', press);
      c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.03, duration: 120 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 120 }));
      c.setScale(0.85).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 420, ease: 'Back.easeOut', delay: x < 640 ? 60 : 180 });
    };
    choice(375, 0x3f8cf0, 'BOARD GAME', 'Đổ xúc xắc quanh đảo, kiếm B$, nghề nghiệp, lá bài và đủ trò trời ơi đất hỡi.', 'VÀO CHƠI →', 0xf0524a, '#mode-board', (c) => {
      const ids = ['starter-crybaby', 'starter-grumpy', 'starter-anxious', 'starter-hyper'];
      ids.forEach((id, i) => {
        const card = partyCardCh19(this, -159 + i * 106, -88, { w: 100, h: 150, colour: PARTY_CHARACTER_COLOUR_CH19[id], bust: partyBustKeyCh19(id) });
        card.setAngle((i - 1.5) * 4);
        c.add(card);
      });
    });
    choice(905, 0xf2549c, 'MINI GAME', 'Chọn 1 trong 5 Mini Game rồi quẩy liền. Hợp để chơi nhanh cùng bạn bè.', 'CHƠI NGAY →', 0x3cbf6b, '#mode-mini', (c) => {
      c.add(partyCardCh19(this, -64, -92, { w: 120, h: 160, colour: PARTY_CHARACTER_COLOUR_CH19['secret-baby'], bust: partyBustKeyCh19('secret-baby') }).setAngle(-7));
      c.add(partyCardCh19(this, 66, -92, { w: 120, h: 160, colour: 0x7a6cf0, mystery: true }).setAngle(6));
    });
  }
}
