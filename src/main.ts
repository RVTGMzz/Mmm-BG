import Phaser from 'phaser';
import './styles.css';
import './settings.css';
import './mobileViewport066.css';
import './ruleSelect067.css';
import { bgmController } from './audio/bgmController';
import { sfxController } from './audio/sfxController';
import { installSettingsPanel } from './ui/SettingsPanel';
import { installGlobalGamepadUiNavigation0651 } from './ui/gamepadUiNavigation0651';
import { LocalLobbyScene } from './scenes/LocalLobbyScene';
import { SetupScene } from './scenes/SetupScene';
import { TurnOrderScene048 as TurnOrderScene } from './scenes/TurnOrderScene048';
import { BoardScene } from './scenes/BoardScene';
import { NetworkBoardScene } from './scenes/NetworkBoardScene';
import { CareerMinigameBoardScene0682 as ActiveBoardScene } from './scenes/CareerMinigameBoardScene0682';
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
// CareerMinigameBoardScene066 as ActiveBoardScene unifies the shipped flow, adds selected match length, mobile viewport handling, and release-resume protection.
// CareerMinigameBoardScene067 as ActiveBoardScene adds the dedicated pregame rule step and canonical Job-card overlap guard.
// CareerMinigameBoardScene068 as ActiveBoardScene closes the vertical slice, centralizes visible build identity, and hardens modal/UI isolation.
// CareerMinigameBoardScene0681 as ActiveBoardScene simplifies the always-on HUD and gives blocking modals clean mobile ownership.
// CareerMinigameBoardScene0682 as ActiveBoardScene implements the permanent canonical mobile UI contract: compact idle HUD, expanded active HUD and strict modal ownership.

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

// Mobile browser chrome and orientation changes can resize the visual viewport
// without immediately changing the old layout viewport. Refresh FIT sizing against
// the new #app bounds so 1280x720 fills the actually visible area as much as possible.
let viewportRefreshFrame = 0;
const refreshMobileViewport066 = () => {
  if (viewportRefreshFrame) cancelAnimationFrame(viewportRefreshFrame);
  viewportRefreshFrame = requestAnimationFrame(() => {
    viewportRefreshFrame = 0;
    game.scale.refresh();
  });
};

window.addEventListener('resize', refreshMobileViewport066, { passive: true });
window.addEventListener('orientationchange', refreshMobileViewport066, { passive: true });
window.visualViewport?.addEventListener('resize', refreshMobileViewport066, { passive: true });
window.visualViewport?.addEventListener('scroll', refreshMobileViewport066, { passive: true });
document.addEventListener('fullscreenchange', refreshMobileViewport066);
