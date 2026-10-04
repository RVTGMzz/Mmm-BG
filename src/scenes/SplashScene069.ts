import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { paintToyTownBackdropCh17 } from '../ui/paintToyTownBackdropCh17';

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

    paintToyTownBackdropCh17(this, 'peach', {
      x: 250,
      y: 84,
      width: 780,
      height: 552,
      radius: 38,
    }).setName('splash-toy-town-backdrop-ch178');

    const brandGlow = this.add.graphics().setName('splash-brand-glow-ch178');
    brandGlow.fillStyle(0xffffff, 0.76);
    brandGlow.fillCircle(640, 292, 185);
    brandGlow.fillStyle(0xffd76a, 0.20);
    brandGlow.fillCircle(640, 292, 205);

    const logo = this.add.image(640, 292, LOGO_KEY_069).setAlpha(0).setScale(0.48);

    const promptShadow = this.add.graphics().setName('splash-start-shadow-ch178');
    promptShadow.fillStyle(0xd99b38, 1);
    promptShadow.fillRoundedRect(442, 558, 396, 68, 23);

    const promptFace = this.add.graphics().setName('splash-start-face-ch178');
    promptFace.fillStyle(0xffd76a, 1);
    promptFace.fillRoundedRect(442, 551, 396, 68, 23);
    promptFace.fillStyle(0xffffff, 0.58);
    promptFace.fillRoundedRect(454, 559, 372, 12, 6);
    promptFace.lineStyle(4, 0x4b302a, 1);
    promptFace.strokeRoundedRect(442, 551, 396, 68, 23);

    const prompt = this.add.text(640, 585, '🎮 A / ENTER / CHẠM ĐỂ BẮT ĐẦU', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#4b302a',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: logo, alpha: 1, scale: 0.56, duration: 760, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: prompt, alpha: 0.86, duration: 420, delay: 520, yoyo: true, repeat: -1, hold: 700 });

    const start = () => {
      if (this.started069) return;
      this.started069 = true;
      sfxController.play('ui_confirm');
      bgmController.playMenu();
      this.cameras.main.fadeOut(220, 244, 234, 215);
      const inviteRoom = new URLSearchParams(window.location.search).get('room');
      this.time.delayedCall(230, () => this.scene.start(inviteRoom ? 'LocalLobbyScene' : 'GameModeMenuScene'));
    };

    this.add.zone(640, 360, 1280, 720).setInteractive({ useHandCursor: true }).once('pointerdown', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.gamepad?.once('down', start);
  }
}
