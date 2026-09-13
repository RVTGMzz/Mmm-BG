import Phaser from 'phaser';
import './styles.css';
import { bgmController } from './audio/bgmController';
import { installSettingsPanel } from './ui/SettingsPanel';
import { LocalLobbyScene } from './scenes/LocalLobbyScene';
import { SetupScene } from './scenes/SetupScene';
import { BoardScene } from './scenes/BoardScene';
import { NetworkBoardScene } from './scenes/NetworkBoardScene';
import { PresentationParityBoardScene } from './scenes/PresentationParityBoardScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#f4ead7',
  scene: [LocalLobbyScene, SetupScene, PresentationParityBoardScene, BoardScene, NetworkBoardScene],
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};

// Audio is armed before Phaser scene creation so the Menu BGM can begin loading
// immediately. Browser autoplay rules may still require the first user gesture.
bgmController.start();
installSettingsPanel();
new Phaser.Game(config);
