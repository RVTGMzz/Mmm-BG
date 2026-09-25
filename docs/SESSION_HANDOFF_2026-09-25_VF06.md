# Mmm-BG — Session Handoff 2026-09-25

Status: **READY FOR NEW CHAT**

Repo: `RVTGMzz/Mmm-BG`  
Branch: `mmm-mvp-0.1-core`

## Start here

Validated runtime source:

`e9a1fb44c8b628e93c91b824f7c31ed0cbb11f6f`

Validation:
- MMM MVP CI #3244 / run `36096638993`: **SUCCESS**
- compiled public mirror: `731a97eca5a89e40844d02623cd9936aad4c4862`
- GitHub Pages #33 / run `36096743757`: **SUCCESS**
- public playtest: `https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Current branch also contains docs-only handoff commits after that validated source. Do not confuse a docs-only HEAD with a newer runtime build.

## Latest completed visual milestone

**VF-06 canonical JOB HUB visual proof**

Canonical:
- `src/ui/visualFoundationJobVf06.ts`
- `src/ui/JobChoicePicker.ts`
- `tests/visual-foundation-job-vf06.ts`

Locked direction:
- warm cream/cocoa toy-box shell;
- butter header;
- large Job icon wells;
- distinct A/B/C card accents;
- concise Lv1/Lv2/Lv3 salary row;
- detail view has one large icon above the Job name;
- no duplicate small Job icon beside the title;
- risky/crime jobs may use coral/red presentation without changing mechanics;
- authoritative D6, mouse/keyboard/Steam Deck focus, spectator lock and Job ownership remain unchanged.

**Runtime/device visual acceptance is still pending.**

## Card / News status

Long-running detached text bug has a root-level fix.

Validated root-fix source:

`8a1ca0b37c10c44d9cfb8b92607233728408761a`

Regression fixtures include:
- **Kéo Hai Cửa**
- **Hoàn Tiền Bất Ngờ**

Do not undo these invariants:
- canonical Card/News Text/Graphics are container-owned, not loose scene children;
- semantic line-level duplicate suppression stays generic;
- owner root stays `scrollFactor(0)`;
- title/body remain bounded with adaptive fitting + max lines;
- never add title-specific hide rules for individual cards/news.

VF-05 News and VF-05.1 Card visual samples are live on top of that containment fix.

## Character status

Current Character runtime milestone remains:

**CH-02G — KHÓC NHÈ neutral layered runtime proof**

Validated source:

`0983a95fdf328e7ef68376226457c9fb63b5ef5c`

Important:
- 4 starter Characters + RANDOM (?) are wired;
- Secret Baby remains RANDOM-only and concealed until reveal;
- Secret Baby eligibility remains 5% per RANDOM seat, max one Secret per RANDOM batch;
- passives remain concept-only / `live: false`;
- KHÓC NHÈ neutral has a 128×192 layered runtime proof;
- non-circular captured face source is used;
- final 1024×1536 production socket is **not authoritative yet**;
- do not generate the remaining six KHÓC NHÈ poses until real-photo/device fit is accepted.

Approved Character concept art remains in the canonical Drive folder referenced by:
`docs/art/character-concepts/README.md`

## Visual authority

Read before new UI/art:
- `docs/VISUAL_STYLE_BIBLE_V0.1.md`
- `docs/VISUAL_FOUNDATION_PASS_0.1.md`

Locked mood:
**Chibi · Cozy · Rounded · Toy-like · Juicy · Playful · Readable**

Do not drift back to flat generic web panels.

## Next chat priority

1. Read `HANDOFF_CURRENT.md`, `docs/LATEST_HANDOFF.md`, this file, then Ron's newest runtime feedback/screenshots.
2. First verify branch/runtime CI state.
3. **VF-06 Job Hub needs real runtime visual acceptance.**
4. If Ron reports a visual defect, fix the shared/root system, not one Job/Card/News instance.
5. If VF-06 is accepted, continue the Visual Foundation to the next representative surface, preferably Mini Game/result presentation, without broad-reskinning everything at once.
6. CH-02G remains a parallel acceptance item if Ron provides face-fit screenshots.

## Do not break

- Host authority / deterministic RNG / reconnect ownership.
- Current public compiled-playtest deployment flow.
- Card/News single-owner containment.
- P1–P4 identity and gold active-turn separation.
- Steam Deck/controller focus paths already covered by regression tests.
- RANDOM Secret Baby concealment.
- PR #1 stays Draft/Open. **Do not merge PR #1 unless Ron explicitly asks.**
- Use visible labels **TIN TỨC / LÁ BÀI**.
- Source repository work stays on Ron's main/source GitHub account convention; keep public-test account/workflow separate unless Ron explicitly requests migration.

