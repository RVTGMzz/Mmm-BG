# MeMeMe 0.1.69 — First Impression Polish

Manual status: **PENDING RON ACCEPTANCE**.

## What changed
- official MeMeMe logo splash: fade in, then tap/click/Enter/Space/controller to enter Lobby;
- Lobby, Face Setup and match-length screen use fewer words and larger default type;
- ordinary UI surfaces use the permanent soft-rounded shape language;
- inherited HUD career meta is suppressed; 0.1.69 owns one bounded career line inside each player card;
- idle player cards stay compact; active card expands more clearly;
- Job result headline is reduced to `🎲 n → NHẬN VIỆC` with one bounded job/salary line;
- legacy Job narration behind the canonical result is suppressed;
- Job Hub redundant microcopy is hidden while existing touch/controller/keyboard detail interaction remains.

## Must test on mobile landscape fullscreen
1. Splash logo appears cleanly with Settings hidden; tap enters Lobby.
2. Lobby has three clear choices and no tiny technical paragraphs.
3. Face Setup and Chọn độ dài are readable without zooming.
4. Player job name stays inside its own corner card and never appears above/outside the player name.
5. Active player card is visibly larger; idle cards remain compact.
6. Trigger several Jobs across different players. Result uses one job icon/body line and no background narrative leaks.
7. Open Job details by touch and controller/keyboard; close correctly.
8. Complete a 1-lap match to Podium and Rematch.

## Regression safety
0.1.69 is presentation-only. It must not add RNG, submitIntent or an alternate authority state path. Do not merge PR #1.
