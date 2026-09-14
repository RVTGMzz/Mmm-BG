import Phaser from 'phaser';
import './styles.css';
import './settings.css';
import { bgmController } from './audio/bgmController';
import { sfxController } from './audio/sfxController';
import { installSettingsPanel } from './ui/SettingsPanel';
import { LocalLobbyScene } from './scenes/LocalLobbyScene';
import { SetupScene } from './scenes/SetupScene';
import { TurnOrderScene048 as TurnOrderScene } from './scenes/TurnOrderScene048';
import { BoardScene } from './scenes/BoardScene';
import { NetworkBoardScene } from './scenes/NetworkBoardScene';
import { CareerMinigameBoardScene048 as ActiveBoardScene } from './scenes/CareerMinigameBoardScene048';
import { FinalMapPreviewScene050 } from './scenes/FinalMapPreviewScene050';

const finalMapPreview = new URLSearchParams(window.location.search).get('finalmap') === '1';
const normalScenes = [LocalLobbyScene, SetupScene, TurnOrderScene, ActiveBoardScene, BoardScene, NetworkBoardScene, FinalMapPreviewScene050];

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#f4ead7',
  scene: finalMapPreview
    ? [FinalMapPreviewScene050, LocalLobbyScene, SetupScene, TurnOrderScene, ActiveBoardScene, BoardScene, NetworkBoardScene]
    : normalScenes,
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

bgmController.start();
sfxController.start();
installSettingsPanel();
new Phaser.Game(config);
