# MMM — SESSION HANDOFF 2026-09-27 — CH-04 Character reactions

## Authority
- source repo: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-core`
- main/source GitHub account: `lengochung28191@gmail.com`
- public compiled mirror remains `ronvotri/MeMeMe-Web-Playtest`
- PR #1 stays Draft/Open; do not merge unless Ron explicitly asks.

## Latest validated gameplay build
- source: `0ec100f50c12e5e60f13ffa7ff74756fa71bc88b`
- MMM MVP CI #3292: **SUCCESS**
- public mirror: `19a7e87d79e5343fc45137704e1bee65d13b17a6`
- Pages #51: **SUCCESS**
- public URL: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## CH-04A Character Reaction Profiles
Selected Character now owns Card/News reaction personality through its canonical `reactionProfileId`.

Profiles implemented:
- KHÓC NHÈ
- CAU CÓ
- LO LẮNG
- TĂNG ĐỘNG
- EM BÉ BÁ ĐẠO

Contexts:
- attack
- targeted
- gain
- loss
- spectate
- chaos

Rules:
- deterministic variant choice only;
- no `Math.random()`;
- Character-less/pre-Character sessions retain the exact legacy reaction system;
- legacy CPU quirk is fallback-only once a CPU has a resolved Character.

Canonical:
- `src/core/characterReactionProfilesCh04.ts`
- `src/ui/presentationModel.ts`
- `tests/character-reactions-ch04.ts`
- `docs/CHARACTER_REACTIONS_CH04A.md`

## CH-04B board moments
Character reaction identity also reaches:
- Job presentation;
- Mini Game entry;
- salary through Start/Ready;
- global Lap Shuffle.

Landing surfaces now schedule model-owned Character reactions through the existing safe presentation side rails. No second toast/modal producer was introduced.

CH-04B gate:
- `tests/character-reaction-moments-ch04b.ts`
- **PASS** in CI #3292.

## Safety
CH-04A/B remain presentation-only.
They do NOT:
- mutate MatchState;
- alter money, position, cards, Job outcomes or Mini Game payout;
- consume HOST RNG;
- change replay/checksum/reconnect;
- activate Character passives.

All starter and Secret Baby passives remain concept-only / `live:false`.

## Other active runtime-pending items
- Steam Deck CSS-only 16:10 bleed is source/CI PASS but device screenshot acceptance is still pending.
- Card/News direct canonical producer is source/CI PASS but Ron still needs real runtime acceptance.
- KHÓC NHÈ layered face proof still needs real-photo/device acceptance.
- Lap Shuffle still needs real full-lap device acceptance.

Ron explicitly asked to continue building instead of stopping for those tests right now.

## Next safe build direction
Continue Character gameplay without activating balance-sensitive passives.

Preferred next milestone:
**CH-04C Character-aware reactions for Jail/Hospital and end-of-Mini-Game result moments**, keeping presentation-only authority.

Do not start CH-05 passives until Ron explicitly approves concrete passive numbers/cadence.
