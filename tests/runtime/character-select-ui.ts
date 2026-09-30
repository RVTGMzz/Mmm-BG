import Phaser from 'phaser';
import '../../src/styles.css';
import '../../src/mobileViewport066.css';
import '../../src/ruleSelect067.css';
import '../../src/firstImpression069.css';
import '../../src/mobileReadability07044.css';
import '../../src/uiInteraction07046.css';
import '../../src/visualFoundationV01.css';
import '../../src/characterSelectCh02c.css';
import { browserSession } from '../../src/core/browserSession';
import { SetupScene } from '../../src/scenes/SetupScene';

browserSession.configureSolo([1, 2, 3]);

new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#f4ead7',
  scene: SetupScene,
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, pixelArt: false, preserveDrawingBuffer: true },
});
