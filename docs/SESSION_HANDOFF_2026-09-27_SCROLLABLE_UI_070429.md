# MMM — SESSION HANDOFF 2026-09-27 — 0.1.70.4.29 FIXED TYPE + SCROLL CONTAINMENT

## Authority
- source repo: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-core`
- main/source GitHub account: `lengochung28191@gmail.com`
- compiled public mirror: `ronvotri/MeMeMe-Web-Playtest`

## Latest validated source
- source head: `d13beed6cbb880487c50cd239359d4a4d91311fc`
- CI #3304: **SUCCESS**
- public mirror: `6c31a5af7d3c20ffb1b604590a8e9c6b244b5a96`
- Pages #55: **SUCCESS**
- public URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## UI rule changed by Ron
Long modal copy must no longer be rescued by shrinking the font.

Canonical rule:
1. keep one readable font scale per surface;
2. keep content inside a hard clipped viewport;
3. if content is longer than the viewport, drag/scroll vertically to read all of it;
4. text must never render outside its modal/paper;
5. touch/drag inside scroll content must not dismiss the modal.

## Implemented 0.1.70.4.29
Shared helper:
- `src/ui/scrollableTextViewport070429.ts`
- geometry mask is the hard containment boundary;
- scroll moves only Text Y;
- no content-length `setScale()`;
- touch/pointer drag + mouse wheel;
- scroll rail/thumb appears only when needed;
- pointerdown stops propagation so scrolling cannot trigger presentation skip.

Card / News:
- canonical title fixed at 28px;
- canonical body fixed at 21px;
- body uses clipped scroll viewport;
- old adaptive `fitWrappedText070418` is no longer used by the canonical Card/News rebuild;
- scrollable Card/News gets a longer auto-close floor but can still be skipped.

Job result:
- fixed 19px result / 18px offer body;
- body uses clipped 560x86 scroll viewport;
- scrollable Job card stays readable longer;
- no `fixedHeight + maxLines` truncation contract.

Mini Game:
- result body fixed at 20px and scrollable;
- ranking rows fixed at 20px and scrollable;
- subtitle fixed at 15px;
- scroll hints appear only when overflow exists;
- CH-04D winner voice remains inside the ranking owner.

## Root cause removed
Two legacy wrappers were still rewriting current Mini Game layout every frame:
- `CareerMinigameBoardScene066.ts`
- `CareerMinigameBoardScene0701.ts`

Canonical VF-07 objects are now named `vf07-minigame-*` and both legacy wrappers explicitly ignore them.

## Validation
New gate:
- `tests/scrollable-modal-text-070429.ts`

Updated historical layout gates now enforce the current contract rather than the retired shrink/truncate implementation.

CI #3304 is fully green, including:
- Card/News direct canonical producer;
- fixed-type scroll containment;
- News VF-05;
- Card VF-05.1;
- Mini Game VF-07;
- Job flow consolidation;
- CH-04D winner voice.

## Runtime acceptance
Source/CI/Pages are green.
Real visual acceptance on Ron's device is still pending. Do not claim the text-flight bug is visually proven fixed until Ron tests the public build.

## Next
When Ron tests:
- specifically test a long News;
- a long Card;
- a long Job result;
- dense Mini Game result/ranking;
- drag upward/downward inside copy and verify the modal does not dismiss;
- verify nothing appears beyond paper borders.
