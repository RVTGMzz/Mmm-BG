import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';

const LOGO_KEY_069 = 'mememe-official-logo-069';
const LOGO_URL_069 = 'assets/mememe-logo-official.webp?v=canonical-1024-0693';

export class SplashScene069 extends Phaser.Scene {
  private started069 = false;

  constructor() {
    super('SplashScene069');
  }

  preload(): void {
    // Build materializes the canonical 1024x1024 logo from the preserved
    // brand-src payload. Do not point this scene back at the broken 500x500
    // export in public/assets/mememe-logo.webp.
    this.load.image(LOGO_KEY_069, LOGO_URL_069);
  }

  create(): void {
    document.body.classList.add('mememe-splash-active');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => document.body.classList.remove('mememe-splash-active'));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => document.body.classList.remove('mememe-splash-active'));

    this.cameras.main.setBackgroundColor('#f4ead7');
    const logo = this.add.image(640, 300, LOGO_KEY_069).setAlpha(0).setScale(0.54);
    const prompt = this.add.text(640, 590, 'CHẠM ĐỂ BẮT ĐẦU', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: logo, alpha: 1, scale: 0.62, duration: 760, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: prompt, alpha: 0.86, duration: 420, delay: 520, yoyo: true, repeat: -1, hold: 700 });

    const start = () => {
      if (this.started069) return;
      this.started069 = true;
      sfxController.play('ui_confirm');
      bgmController.playMenu();
      this.cameras.main.fadeOut(220, 244, 234, 215);
      this.time.delayedCall(230, () => this.scene.start('LocalLobbyScene'));
    };

    this.add.zone(640, 360, 1280, 720).setInteractive({ useHandCursor: true }).once('pointerdown', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.gamepad?.once('down', start);
  }
}
