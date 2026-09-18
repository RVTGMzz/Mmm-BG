# MVP 0.1.25 — Economy Pressure & Recovery

Status: **ACTIVE / PLAYTEST PACKAGED**

## Goal

Rebase the old 1000 B$ economy around the new 200 B$ starting wallet without adding RNG, new command types or new presentation flow.

## Starting wallet

New matches default to **200 B$** for every player.

Legacy/deserialized matches retain the money already stored in their state. This change only affects new match creation unless a caller explicitly supplies `startingMoney`.

## Fixed-value economy rescale

Money tiles now use:
- +25 B$
- -20 B$
- +50 B$
- +15 B$

News fixed deltas now use:
- positive self News: +30 B$
- negative self News: -40 B$
- group-loss News: -20 B$ each

`NEWS_DEMO_009 / Cân Bằng B$` remains relative and still normalizes the landing player to the floored current table average.

## Card tuning

`ACT_016 / Phao Cứu Sinh`:
- tied for lowest B$: +60 B$
- otherwise: +15 B$

Existing relative/strategic mechanics remain unchanged:
- 10 B$ steal Cards stay 10 B$;
- `Thuế Top 1` stays 18%;
- SR all-opponent loss stays 30%;
- money swap stays full swap.

## READY as recovery anchor

Passing READY intentionally remains **+100 B$**.

With a 200 B$ opening wallet, this is a large but predictable recovery/reward for completing a lap. Random tile/News swings were reduced instead of flattening READY as well.

## Probability invariants

Card weights remain total 1000:
- N 600
- R 300
- SR 90
- SSR 10

News weights remain total 1000:
- positive self 600
- negative self 300
- group loss 50
- normalize-to-average 50

No new gameplay RNG calls were added.

## Regression

New command:

`npm run test:economy`

Locks:
- default starting wallet = 200 B$;
- all four money-tile values;
- +30 / -40 self News scale;
- -20 all-player News scale;
- Phao Cứu Sinh +60/+15 split;
- 10 B$ steal Cards remain unchanged;
- 18% rich tax and 30% group-loss percentages remain unchanged.

Golden deterministic checksum promoted deliberately:

`5ed7922e` → `46bb4e20`

Replay and authority both agree on the promoted checksum.

## CI

Validated gameplay/artifact run before handoff-doc commits:
- workflow run: `34763514820`
- run number: `#623`
- head SHA: `304ce3511fe37b33f45c0b656419679f32dd8e45`
- artifact: `mememe-playtest-0.1.25`
- artifact digest: `sha256:7580c4f7c10a764d8463eed41b508799a20710e3626a2bcc043fcfddc08f3ad4`

Full suite passed through artifact upload, including CPU stress, replay/authority and `200B economy scale`.

## Existing behavior retained

- Party Mechanics from 0.1.24;
- effect-specific Card reactions and odd/even route feedback;
- node-by-node movement and graphical dice;
- presentation timing/gating and final-result deferral;
- compact board-first HUD;
- Settings shell + early Menu BGM preload;
- approved BGM audio unchanged;
- face crop/zoom/rotate + runtime compression;
- CPU remains QA-only.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not re-encode or substitute approved BGM.
- Do not add gameplay RNG for UI/presentation.
- Do not put local Settings/audio/image preferences into gameplay-critical state.
- Snapshot resync must not replay stale presentation events.
- Result overlay waits for final presentation.
- Automatic Card mechanics remain host/replay authoritative.
