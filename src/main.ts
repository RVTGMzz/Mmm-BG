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
import { FinalMapPreviewScene051 } from './scenes/FinalMapPreviewScene051';

const finalMapMode = new URLSearchParams(window.location.search).get('finalmap');
const normalScenes = [
  LocalLobbyScene,
  SetupScene,
  TurnOrderScene,
  ActiveBoardScene,
  BoardScene,
  NetworkBoardScene,
  FinalMapPreviewScene050,
  FinalMapPreviewScene051,
];

const previewScenes = finalMapMode === '2'
  ? [FinalMapPreviewScene051, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene051)]
  : finalMapMode === '1'
    ? [FinalMapPreviewScene050, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene050)]
    : normalScenes;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#f4ead7',
  scene: previewScenes,
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
