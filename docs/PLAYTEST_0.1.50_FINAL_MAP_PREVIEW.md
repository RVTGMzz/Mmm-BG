# MeMeMe — PLAYTEST 0.1.50 Final Map Preview

Status: **PREVIEW CANDIDATE / NOT YET RUNTIME-VALIDATED**

This build adds a separate Final Map preview scene without replacing the validated 0.1.48 gameplay scene.

## Launch

Windows package:

1. Extract the artifact ZIP.
2. Double-click `START_FINAL_MAP_PREVIEW.bat`.
3. Keep the console window open while testing.

The launcher opens the local build with:

`?finalmap=1`

Normal `START_PLAYTEST.bat` still opens the existing gameplay flow.

## What this preview is for

Validate the **feel and readability** of Draft C before authoritative multiplayer integration:

- 44-space main loop;
- READY at M01;
- Jail Gate at M12;
- Lottery at M23;
- Hospital Gate at M34;
- one inner Jail / Police Station;
- exactly three Jail exit-route spaces J1/J2/J3;
- one inner Hospital;
- exactly three Hospital exit-route spaces H1/H2/H3;
- four fixed player HUDs in the screen corners;
- camera pans with the active player;
- overview button;
- Lottery D6 × 20 B$;
- Jail release faces 1/3/5;
- Hospital release faces exactly 2/4/5.

## Important preview boundary

The preview scene is intentionally **local presentation/game-feel code**, not the final HOST-authoritative map runtime yet.

The following behavior is temporary for visual testing only:

- after a successful Jail/Hospital release roll, the preview animates through all three exit-route spaces and rejoins the main loop;
- this animation does **not** decide the final same-turn movement rule.

Final post-release timing remains a design decision to lock after playtest.

## Please test these things first

1. Does the 44-space route feel too long, too short, or okay?
2. Do the four HUDs cover important route areas?
3. Is the active player easy to follow when the camera moves?
4. Are READY / Jail / Lottery / Hospital immediately recognizable?
5. Do the three exit spaces on Jail and Hospital read clearly?
6. Does Lottery x20 feel exciting enough?
7. Does the map still feel readable with all four player markers visible?

## Known intentional limitations

- The city art is a Phaser greybox/stylized preview, not the final concept illustration.
- TIN TỨC / LÁ BÀI / Job Hub / Mini Game nodes currently show preview feedback only in this scene.
- Network host authority, replay/checksum integration, final card/news effects and final art are not wired into this preview scene yet.
- The validated 0.1.48 gameplay runtime remains available through the normal launcher.

## Bug report format

Please send:

- what you clicked / rolled;
- which player was active;
- which map area you were near;
- what happened;
- what you expected;
- screenshot or short clip if visual.

Do not treat AI-rendered numbers/text in the visual reference as authoritative. Runtime node IDs and Draft C docs remain the source of truth.
