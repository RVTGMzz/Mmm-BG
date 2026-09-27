# MMM 0.1.70.5 — Steam Deck fullscreen / 16:10 viewport pass

## Problem
Steam Deck's 1280×800 display is 16:10 while MMM's authored gameplay surface is 1280×720 (16:9). Phaser `FIT` correctly preserves the game, but the unused vertical space appeared as conspicuous light bars above and below the game.

## Decision
Keep Phaser `FIT`. Do **not** switch to `ENVELOP` / CSS cover.

At 1280×800, cover would need to scale the 1280×720 game to about 1422×800 and crop roughly 71px from both logical sides. Those edges contain the P1–P4 HUD and presentation safe lanes, so cropping them is not acceptable.

Instead:
- the complete authored 1280×720 game remains visible and undistorted;
- Steam Deck / 16:10-like desktop viewports receive a branded ambient MMM shell behind the canvas;
- the 40px top + 40px bottom excess at native Deck resolution becomes intentional visual bleed rather than blank web-page bars;
- existing phone-landscape behavior stays on the normal FIT path;
- resize, orientation, visualViewport and fullscreen refreshes re-evaluate the shell.

## Canonical files
- `src/ui/steamDeckFullscreen0705.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/steam-deck-fullscreen-0705.ts`

## Safety contract
- logical game: 1280×720;
- crop: 0px;
- stretch: none;
- P1–P4 HUD and modal safe-area remain fully inside the logical game;
- gameplay authority, HOST RNG, reconnect, Worker and input ownership are unchanged.

## Runtime acceptance
Automated geometry can verify the no-crop policy, but physical Steam Deck visual acceptance is still required. Test board, Job Hub, TIN TỨC/LÁ BÀI, Mini Game ranking, settings/controller focus and fullscreen/browser transitions before calling Runtime PASS.
