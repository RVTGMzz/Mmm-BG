# MeMeMe Web Playtest on Steam Deck (Gamepad 0.1.70.4.25)

Scope: **web playtest** in a Steam Deck browser, not a downloadable/native Linux game.
No new gameplay or authority paths: the controller invokes existing mouse/keyboard UI handlers.

## Starting the browser build
1. On Steam Deck, switch to Desktop Mode and open Chromium or another Gamepad API-capable browser.
2. Visit the public MeMeMe Web Playtest from the repo README, then press any gamepad button to register the controller. A advances the splash; a temporary "TAY CẦM" badge confirms recognition.
3. For launching in Gaming Mode, use Steam **Add a Non-Steam Game** to add the browser as a shortcut and point its launch arguments to the playtest URL. Set the shortcut's Steam Input layout to **Gamepad with Joystick Trackpad**, or another layout that exposes an actual browser Gamepad. If Steam Input is configured as Keyboard/Mouse-only, Chromium will not expose Gamepad API buttons.
4. Fullscreen can be toggled from Settings (☰ / Start). Phaser fits the 1280×720 game inside Steam Deck's 1280×800 display.

## Deck controls
- **A:** Confirm / roll the active D6 / advance TIN TỨC or LÁ BÀI.
- **B:** Close a details sheet or cancel a cancelable card; B does not silently choose mandatory branches or targets.
- **D-pad or left stick:** Spatially navigate cards, buttons and menus.
- **X:** Toggle the board overview.
- **Y:** Open your LÁ BÀI when the authoritative game phase and seat permit it.
- **☰ / Start:** Open Settings; scroll to STEAM DECK / TAY CẦM for the in-game controls.
- **Steam + X:** Open the Deck's on-screen keyboard for entering names or room codes.

On the CHỌN CÁCH CHƠI screen, navigate to CHẾ ĐỘ, press A to begin editing the selection, press ↑/↓ to change, A to save, or B to cancel. Left/right also provide direct one-step adjustments when it is focused but not in edit mode. B never starts or skips a match.

On the Job Hub, A is initially focused on ĐỔ XÚC XẮC, so the first A rolls. Press ↑ to select the centre Job, ←/→ to inspect A/B/C, A to open details and A/B to close them; ↓ always returns to ĐỔ XÚC XẮC. An observer's dice is disabled.

Mini Game has its own exclusive controller input; the global dispatcher does not synthesize extra clicks while it is visible. Final-result inputs remain blocked until the Podium reveal finishes.

## Runtime acceptance checklist
- Start from splash and reach CHƠI NHANH with no trackpad/mouse input.
- Choose 1 human + 3 CPU using A on CHẾ ĐỘ and ↑/↓.
- Complete Roll for Order with A.
- Roll a movement D6 with A; use Y and then B to inspect/cancel a LÁ BÀI.
- In Job Hub, A rolls immediately from the default focus; in a second Job visit, browse all 3 careers and return to dice using only pad.
- In branch and target dialogs, navigate with D-pad and confirm A; B must not manufacture a game decision.
- In Mini Game, play multiple rounds with D-pad and A, verifying only one answer per A press.
- Verify X overview, ☰ Settings, and final podium controls after reveal, including an online spectator that cannot roll another seat's dice.
- Disconnect/reconnect a controller during a menu selection: no stuck focus or unconfirmed mode changes.

**Automation status is not physical-device acceptance.** CI tests policy and integration guards but Steam Deck Chromium/Steam Input must be verified by a person on device.
