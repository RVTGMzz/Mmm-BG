# MeMeMe — Starter Character Roster v0.1

Status: **CH-02A ROSTER DIRECTION LOCKED / ART + FINAL NAMES PENDING / PASSIVES CONCEPT-ONLY**

The first MeMeMe starter roster contains exactly four foundational personalities:

1. **KHÓC NHÈ**
2. **CAU CÓ**
3. **LO LẮNG**
4. **TĂNG ĐỘNG**

They intentionally span four different age bands and four strongly different visual rhythms. The goal is that a player can identify the Character from silhouette/body language before reading text.

Personal character names are **not locked yet**. Gender presentation is now locked for the four starter archetypes: KHÓC NHÈ female, CAU CÓ male, LO LẮNG male, TĂNG ĐỘNG female. The archetype is not required to become the final character name.

## 1. KHÓC NHÈ

- gender presentation: **female**
- age direction: **55–65**
- style: expressive, fashionable, slightly theatrical, accessory-rich
- silhouette: soft/theatrical
- movement language: clutches chest/wallet, dabs tears, dramatic head tilt, oversized relief/joy
- emotional center: feels losses very loudly, recovers just as loudly
- reaction profile ID: `reaction.starter.crybaby.v01`
- pose set ID: `pose.starter.crybaby.v01`

Passive concept: **ĐƯỢC DỖ**
- design intent only;
- after a meaningful setback, may receive a small consolation-style benefit;
- threshold/value are not balanced or implemented.

## 2. CAU CÓ

- gender presentation: **male**
- age direction: **40–50**
- style: sharp, tidy, controlled
- silhouette: upright/angular
- movement language: folded arms, hands on hips, side-eye, quick pointing turn
- emotional center: irritation and push-back instead of whining
- reaction profile ID: `reaction.starter.grumpy.v01`
- pose set ID: `pose.starter.grumpy.v01`

Passive concept: **ĐỪNG CHỌC TUI**
- design intent only;
- gains a reaction/counter-style advantage when another player directly targets them;
- exact counter rule is not implemented.

## 3. LO LẮNG

- gender presentation: **male**
- age direction: **28–35**
- style: neat/planner-core, prepared, many small useful items
- silhouette: compact/prepared
- movement language: checks surroundings/items, shoulders pull inward, visible sigh of relief
- emotional center: anticipatory panic, cautious relief
- reaction profile ID: `reaction.starter.anxious.v01`
- pose set ID: `pose.starter.anxious.v01`

Passive concept: **LO XA**
- design intent only;
- receives a small advantage from preparation or limited risk awareness;
- exact reveal/avoidance mechanic is not implemented.

## 4. TĂNG ĐỘNG

- gender presentation: **female**
- age direction: **18–24**
- style: bright streetwear/sporty, stickers and moving accessories
- silhouette: dynamic/leaning
- movement language: jumps, leans, wide limbs, rapid pose changes
- emotional center: high-energy play, quick emotional recovery
- reaction profile ID: `reaction.starter.hyper.v01`
- pose set ID: `pose.starter.hyper.v01`

Passive concept: **KHÔNG NGỒI YÊN**
- design intent only;
- advantage may connect to movement, Mini Game or action streaks;
- exact gameplay effect is not implemented.

## Cast rules

- Age/style/gender presentation never automatically determines gameplay strength.
- Each passive belongs to the individual Character design, not to a demographic category.
- All four must support the same face-composite contract.
- All four should eventually support the same base emotion coverage:
  - neutral
  - happy
  - angry
  - panic
  - smug
  - cry
  - shocked
- Current player capture remains neutral/happy/angry with deterministic emotion fallback.
- The first art proof should start with **KHÓC NHÈ**, because its silhouette and reaction range make face-composite problems easy to spot.
- Character Select should show archetype + art + one-line passive summary without becoming text-heavy.

## Source data

Canonical starter data:
`src/content/core/characters_starter_v01.ts`

CH-02A is deliberately **not** a passive implementation. All passive concepts carry `live: false`.
