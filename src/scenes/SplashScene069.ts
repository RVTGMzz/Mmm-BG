import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { paintToyTownBackdropCh17 } from '../ui/paintToyTownBackdropCh17';
import { partyPillButtonCh19, partyTextCh19, preloadPartyKitCh19, PARTY_FONT_CH19 } from '../ui/partyKitCh19';

const LOGO_KEY_069 = 'mememe-official-logo-069';
const LOGO_URL_069 = 'assets/mememe-logo-main.png?v=official-png-1024-0694';

export class SplashScene069 extends Phaser.Scene {
  private started069 = false;

  constructor() {
    super('SplashScene069');
  }

  preload(): void {
    // Canonical brand asset is the manually committed 1024x1024 transparent PNG.
    // Do not regenerate the splash logo from WebP/base64 or temporary vector text.
    this.load.image(LOGO_KEY_069, LOGO_URL_069);
    preloadPartyKitCh19(this);
  }

  create(): void {
    document.body.classList.add('mememe-splash-active');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => document.body.classList.remove('mememe-splash-active'));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => document.body.classList.remove('mememe-splash-active'));

    // peach maps to the starry 'sun' party backdrop; the splash needs no paper panel
    paintToyTownBackdropCh17(this, 'peach', { x: 250, y: 84, width: 780, height: 552, radius: 38 })
      .setName('splash-toy-town-backdrop-ch178').setVisible(false);

    const brandGlow = this.add.graphics().setName('splash-brand-glow-ch178');
    for (let i = 6; i >= 1; i--) brandGlow.fillStyle(0xffffff, 0.1).fillCircle(640, 280, 120 + i * 30);

    const logo = this.add.image(640, 272, LOGO_KEY_069).setAlpha(0).setScale(0.48);

    // CH-19: studio credit under the title
    const credit = partyTextCh19(this, 640, 530, 'Một tựa game của Votri Valley', {
      size: 26, gradient: ['#ffffff', '#fff1c4'], stroke: '#7a3b12', strokeWidth: 6,
    }).setName('splash-credit-ch19').setAlpha(0);
    this.tweens.add({ targets: credit, alpha: 1, y: 522, duration: 520, delay: 420, ease: 'Cubic.easeOut' });

    const startButton = partyPillButtonCh19(this, 640, 612, 400, 74, 0xf0524a, 'BẮT ĐẦU!', undefined, 32)
      .setName('splash-start-face-ch178').setAlpha(0);
    this.tweens.add({ targets: startButton, alpha: 1, duration: 360, delay: 640 });
    this.tweens.add({ targets: startButton, scale: 1.05, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1000 });
    const prompt = this.add.text(640, 668, '🎮 A / ENTER / CHẠM ĐỂ BẮT ĐẦU', {
      fontFamily: PARTY_FONT_CH19, fontSize: '16px', fontStyle: 'bold', color: '#7a3b12',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: logo, alpha: 1, scale: 0.6, duration: 760, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: prompt, alpha: 0.8, duration: 420, delay: 900 });

    const start = () => {
      if (this.started069) return;
      this.started069 = true;
      sfxController.play('ui_confirm');
      bgmController.playMenu();
      this.cameras.main.fadeOut(220, 244, 234, 215);
      const inviteRoom = new URLSearchParams(window.location.search).get('room');
      this.time.delayedCall(230, () => this.scene.start(inviteRoom ? 'LocalLobbyScene' : 'GameModeMenuScene'));
    };

    this.add.zone(640, 360, 2400, 1400).setInteractive({ useHandCursor: true }).once('pointerdown', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.gamepad?.once('down', start);
  }
}
