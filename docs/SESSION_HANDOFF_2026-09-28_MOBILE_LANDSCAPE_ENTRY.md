# MMM — 2026-09-28 — MOBILE LANDSCAPE ENTRY NO-DEADLOCK

## User-reported failure
On mobile portrait, tapping the visible **XOAY NGANG** button depressed the button but did not rotate the hardware and did not enter the game.

## Root cause
`requireMobileLandscapeBeforeGame07035()` waited until `innerWidth > innerHeight` before resolving. On browsers where a normal web tab cannot use `screen.orientation.lock('landscape')`, the hardware never rotates and the boot Promise can wait forever. Phaser is created only after that Promise resolves, so the app appears frozen at the rotate gate.

## Fix
Runtime implementation started at:
- `3d22ab9339c328eaaa3a5630f2bf2ccd25f5822a`

Validated source head:
- `1e40fb0c64b0f6a1b5563e403c4ec16e4c91193c`

Behavior now:
1. tap **XOAY NGANG**;
2. best-effort fullscreen;
3. best-effort `screen.orientation.lock('landscape')`;
4. both browser API promises are bounded and cannot hang boot;
5. allow a short orientation-settle window;
6. if the phone is still portrait, release the blocking gate as `manual-fallback`;
7. boot continues and the user can rotate the phone manually afterwards;
8. normal resize/orientation listeners refresh Phaser.Scale.FIT.

The button now states that if the browser does not auto-rotate, rotate the phone manually.

## Regression coverage
Static mobile gate:
- PASS

Playwright runtime:
- portrait Android-like viewport
- no usable orientation lock
- physical viewport intentionally remains portrait
- rotate gate initially visible
- explicit tap resolves boot
- gate disappears
- state reports `manual-fallback`

Proof:
- `[mobile-landscape-entry] PASS unsupported orientation lock cannot trap mobile boot`

Full-scene UI regression also remains:
- `[full-scene-ui] PASS canonical bodies survive normal super.create + inherited update chain`

## Release
Source CI:
- MMM MVP CI #3317
- run `36371325357`
- SUCCESS

Public mirror:
- `59cc3fb0e93eaef45f33d08e30fefa860268395e`
- `Publish compiled playtest 1e40fb0`

Pages:
- #59
- run `36371600248`
- SUCCESS

Public:
https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Device acceptance
Ron should hard refresh on mobile and reproduce:
- open in portrait;
- tap XOAY NGANG;
- on browsers that support lock: device may rotate automatically;
- on browsers that do not: game must still enter instead of hanging;
- rotate phone manually to landscape if needed.

Do not restore an infinite landscape wait.
