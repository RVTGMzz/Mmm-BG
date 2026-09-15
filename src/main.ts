import Phaser from 'phaser';
import './styles.css';
import './settings.css';
import { bgmController } from './audio/bgmController';
import { sfxController } from './audio/sfxController';
import { installSettingsPanel } from './ui/SettingsPanel';
import { installGlobalGamepadUiNavigation0651 } from './ui/gamepadUiNavigation0651';
import { LocalLobbyScene } from './scenes/LocalLobbyScene';
import { SetupScene } from './scenes/SetupScene';
import { TurnOrderScene048 as TurnOrderScene } from './scenes/TurnOrderScene048';
import { BoardScene } from './scenes/BoardScene';
import { NetworkBoardScene } from './scenes/NetworkBoardScene';
import { CareerMinigameBoardScene0651 as ActiveBoardScene } from './scenes/CareerMinigameBoardScene0651';
import { FinalMapPreviewScene050 } from './scenes/FinalMapPreviewScene050';
import { FinalMapPreviewScene051 } from './scenes/FinalMapPreviewScene051';
import { FinalMapPreviewScene052 } from './scenes/FinalMapPreviewScene052';
import { FullMapReviewScene053 } from './scenes/FullMapReviewScene053';
import { installPreviewBranchMode054 } from './scenes/installPreviewBranchMode054';

// Legacy regression breadcrumbs:
// CareerMinigameBoardScene061 as ActiveBoardScene was the report runtime.
// CareerMinigameBoardScene062 as ActiveBoardScene added HOST odd/even routing.
// CareerMinigameBoardScene063 as ActiveBoardScene added UI/smooth-follow polish.
// CareerMinigameBoardScene0631 as ActiveBoardScene was the first center-lock attempt.
// CareerMinigameBoardScene0632 as ActiveBoardScene prioritizes the actor still animating.
// CareerMinigameBoardScene0633 aligned visible landing effects and special-release/fresh-D6 presentation.
// CareerMinigameBoardScene0634 as ActiveBoardScene resumes unspent movement after Job Hub and commits visible B$ only at its presented effect.
// CareerMinigameBoardScene064 expands board spacing, makes J/H corridors real -20 B$ movement, and rebalances Card/Step SFX.
// CareerMinigameBoardScene065 as ActiveBoardScene showed real Job/salary HUD data, rounded UI and hid the debug footer.
// CareerMinigameBoardScene0651 as ActiveBoardScene fixes rounded-proxy ghosts and adds browser/Steam Deck gamepad UI control.

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
const game = new Phaser.Game(config);
installGlobalGamepadUiNavigation0651(game);
