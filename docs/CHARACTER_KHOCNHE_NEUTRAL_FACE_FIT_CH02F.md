# MeMeMe — CH-02F KHÓC NHÈ Neutral Face-Fit Proof

Status: **GEOMETRY + FACE-SHAPE PROOF PASS / FINAL LAYER BINARIES NOT YET PROMOTED**

CH-02F validates the first face-socket assumption before multiplying the artwork across seven poses and five Characters.

## What was tested

Using the approved KHÓC NHÈ concept as visual authority, the neutral proof was built on the locked 1024×1536 canvas and checked against four synthetic head proportions: round, long, square, and narrow.

The proof mask is irregular/soft rather than circular. All four probes stay inside the intended head-safe region, so the system does not need one mask per human face type.

## Runtime geometry

Canonical helper: `src/core/characterFaceSocketFitCh02f.ts`.

The socket owns normalized center x/y, Character-authored scale, and optional rotation/padding. The player source keeps its natural aspect ratio, so a long face stays long and a round face stays round.

## Prototype calibration

First KHÓC NHÈ / neutral proof:

```ts
{ x: 0.5, y: 0.329, scale: 0.29, rotationDeg: 0, padding: 0.08 }
```

This value remains proof/test-only. Do not promote it into `character_art_manifest_v01.ts` until the final transparent runtime layers are committed and measured against those exact pixels.

## Composition order

**body → player head → mask/socket → foreground → FX/UI**

The next production action is to get the final transparent KHÓC NHÈ neutral layer binaries into the runtime asset tree, test with real player photos on desktop / Steam Deck / mobile landscape, then replicate the pipeline to the remaining emotions.