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
import { CareerMinigameBoardScene0631 as ActiveBoardScene } from './scenes/CareerMinigameBoardScene0631';
import { FinalMapPreviewScene050 } from './scenes/FinalMapPreviewScene050';
import { FinalMapPreviewScene051 } from './scenes/FinalMapPreviewScene051';
import { FinalMapPreviewScene052 } from './scenes/FinalMapPreviewScene052';
import { FullMapReviewScene053 } from './scenes/FullMapReviewScene053';
import { installPreviewBranchMode054 } from './scenes/installPreviewBranchMode054';

// Legacy regression breadcrumbs:
// CareerMinigameBoardScene061 as ActiveBoardScene was the report runtime.
// CareerMinigameBoardScene062 as ActiveBoardScene added HOST odd/even routing.
// CareerMinigameBoardScene063 as ActiveBoardScene added UI/smooth-follow polish.
// 0.1.63.1 extends 0.1.63 and only fixes active-player camera centering.

const finalMapMode = new URLSearchParams(window.location.search).get('finalmap');
if (finalMapMode === '3') installPreviewBranchMode054();

const normalScenes = [
  LocalLobbyScene,
  SetupScene,
  TurnOrderScene,
  ActiveBoardScene,
  BoardScene,
  NetworkBoardScene,
  FinalMapPreviewScene050,
  FinalMapPreviewScene051,
  FinalMapPreviewScene052,
  FullMapReviewScene053,
];

const previewScenes = finalMapMode === '4'
  ? [FullMapReviewScene053, ...normalScenes.filter((scene) => scene !== FullMapReviewScene053)]
  : finalMapMode === '3'
    ? [FinalMapPreviewScene052, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene052)]
    : finalMapMode === '2'
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
