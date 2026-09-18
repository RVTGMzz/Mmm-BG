import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { requireMobileLandscapeAfterIntro07034 } from '../ui/mobileLandscape07031';

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
  }

  create(): void {
    document.body.classList.add('mememe-splash-active');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => document.body.classList.remove('mememe-splash-active'));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => document.body.classList.remove('mememe-splash-active'));

    this.cameras.main.setBackgroundColor('#f4ead7');
    const logo = this.add.image(640, 292, LOGO_KEY_069).setAlpha(0).setScale(0.48);
    const prompt = this.add.text(640, 590, 'CHẠM ĐỂ BẮT ĐẦU', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: logo, alpha: 1, scale: 0.56, duration: 760, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: prompt, alpha: 0.86, duration: 420, delay: 520, yoyo: true, repeat: -1, hold: 700 });

    const start = () => {
      if (this.started069) return;
      this.started069 = true;
      sfxController.play('ui_confirm');

      void requireMobileLandscapeAfterIntro07034().then(() => {
        bgmController.playMenu();
        this.cameras.main.fadeOut(220, 244, 234, 215);
        this.time.delayedCall(230, () => this.scene.start('LocalLobbyScene'));
      });
    };

    this.add.zone(640, 360, 1280, 720).setInteractive({ useHandCursor: true }).once('pointerdown', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.gamepad?.once('down', start);
  }
}
