import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';

export class SplashScene069 extends Phaser.Scene {
  private started069 = false;

  constructor() {
    super('SplashScene069');
  }

  create(): void {
    document.body.classList.add('mememe-splash-active');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => document.body.classList.remove('mememe-splash-active'));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => document.body.classList.remove('mememe-splash-active'));

    this.cameras.main.setBackgroundColor('#f4ead7');

    // Deterministic vector/text lockup. The previous transferred WebP was byte-corrupted
    // and rendered as a black square on web/mobile, so the splash must never depend on it.
    const brand = this.add.container(640, 296).setAlpha(0).setScale(0.88);
    const halo = this.add.circle(0, 0, 154, 0xffffff, 0.34);
    const badge = this.add.rectangle(0, 0, 360, 248, 0xfffbf3, 0.96)
      .setStrokeStyle(5, 0x24211d, 1);
    const accentLeft = this.add.circle(-142, -94, 16, 0xec4b43, 1);
    const accentRight = this.add.circle(142, 94, 12, 0xf2c94c, 1);
    const meCube = this.add.text(0, -40, 'Me³', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '92px',
      fontStyle: 'bold',
      color: '#e94b43',
      stroke: '#24211d',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const mememe = this.add.text(0, 55, 'MeMeMe', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#24211d',
      letterSpacing: 2,
    }).setOrigin(0.5);
    const tag = this.add.text(0, 104, 'BOARD GAME', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#74695d',
      letterSpacing: 4,
    }).setOrigin(0.5);
    brand.add([halo, badge, accentLeft, accentRight, meCube, mememe, tag]);

    const prompt = this.add.text(640, 590, 'CHẠM ĐỂ BẮT ĐẦU', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: brand, alpha: 1, scaleX: 1, scaleY: 1, duration: 620, ease: 'Back.easeOut' });
    this.tweens.add({ targets: prompt, alpha: 0.86, duration: 420, delay: 460, yoyo: true, repeat: -1, hold: 700 });

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
