import Phaser from 'phaser';
import './styles.css';
import './settings.css';
import './mobileViewport066.css';
import './ruleSelect067.css';
import './firstImpression069.css';
import './mobileReadability07044.css';
import './uiInteraction07046.css';
import './visualFoundationV01.css';
import './characterSelectCh02c.css';
import { bgmController } from './audio/bgmController';
import { sfxController } from './audio/sfxController';
import { installSettingsPanel } from './ui/SettingsPanel';
import { installSteamDeckController070424 } from './ui/steamDeckController070424';
import {
  installMobileLandscapeGuard07031,
  requireMobileLandscapeBeforeGame07035,
} from './ui/mobileLandscape07031';
import { SplashScene069 } from './scenes/SplashScene069';
import { LocalLobbyScene } from './scenes/LocalLobbyScene';
import { OnlineRoomLobbyScene } from './scenes/OnlineRoomLobbyScene';
import { SetupScene } from './scenes/SetupScene';
import { TurnOrderScene07044 as TurnOrderScene } from './scenes/TurnOrderScene07044';
import { BoardScene } from './scenes/BoardScene';
import { NetworkBoardScene } from './scenes/NetworkBoardScene';
import { CareerMinigameBoardScene07044 as ActiveBoardScene } from './scenes/CareerMinigameBoardScene07044';
import { FinalMapPreviewScene050 } from './scenes/FinalMapPreviewScene050';
import { FinalMapPreviewScene051 } from './scenes/FinalMapPreviewScene051';
import { FinalMapPreviewScene052 } from './scenes/FinalMapPreviewScene052';
import { FullMapReviewScene053 } from './scenes/FullMapReviewScene053';
import { installPreviewBranchMode054 } from './scenes/installPreviewBranchMode054';

// Current presentation chain: 07044 -> 0701 -> 069 -> 0682 -> validated authority chain.
// 0.1.70.4.4 is presentation-only: mobile readability without changing HOST RNG/authority.

const finalMapMode = new URLSearchParams(window.location.search).get('finalmap');
if (finalMapMode === '3') installPreviewBranchMode054();

const normalScenes = [
  SplashScene069,
  LocalLobbyScene,
  OnlineRoomLobbyScene,
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
  ? [FullMapReviewScene053, ...normalScenes.filter((scene) => scene !== FullMapReviewScene053 && scene !== SplashScene069)]
  : finalMapMode === '3'
    ? [FinalMapPreviewScene052, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene052 && scene !== SplashScene069)]
    : finalMapMode === '2'
      ? [FinalMapPreviewScene051, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene051 && scene !== SplashScene069)]
      : finalMapMode === '1'
        ? [FinalMapPreviewScene050, ...normalScenes.filter((scene) => scene !== FinalMapPreviewScene050 && scene !== SplashScene069)]
        : normalScenes;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#f4ead7',
  scene: previewScenes,
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, pixelArt: false },
};

async function bootMeMeMe07035(): Promise<void> {
  bgmController.start();
  sfxController.start();
  installMobileLandscapeGuard07031();

  // On phones, the rotate gate owns the screen BEFORE Phaser exists.
  // This guarantees Splash/intro starts from frame zero after landscape.
  await requireMobileLandscapeBeforeGame07035();

  installSettingsPanel();
  const game = new Phaser.Game(config);
  // Single native Gamepad owner for Steam Deck; modal owners keep authority.
  const disposeSteamDeckController = installSteamDeckController070424(game);
  game.events.once(Phaser.Core.Events.DESTROY, disposeSteamDeckController);

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
}

void bootMeMeMe07035();
