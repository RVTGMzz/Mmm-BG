# MeMeMe — CH-02B Random Character + Secret Baby

Status: **RANDOM CONTRACT LOCKED / SECRET BABY DATA LOCKED / RUNTIME UI REVEAL NOT YET WIRED**

## 1. Goal

The RANDOM (?) option must create real anticipation, not just save a click.

Normal starter Characters remain visible/selectable. The Secret Baby is **never** shown as a normal roster option and can only enter a match through RANDOM.

## 2. Secret Character

Working archetype label: **EM BÉ BÁ ĐẠO** 👶🍼

Visual direction:
- infant/baby presentation;
- crawling body language;
- pacifier as a signature prop;
- tiny body, absurdly confident/bossy attitude;
- reaction language should feel unexpectedly dominant and self-assured;
- must still belong to the same chibi/cozy/rounded/toy-like MeMeMe world.

Canonical data:
`src/content/core/character_secret_baby_v01.ts`

The Secret Baby has:
- `secret: true`
- `randomOnly: true`
- `directSelectable: false`
- `randomChance: 0.05`

It must not be added to `STARTER_CHARACTERS_V01`.

## 3. 5% rule

Each player who chooses RANDOM contributes one independent **5% Secret Baby eligibility roll**.

For N RANDOM players, chance that the batch contains the Secret Baby is:

- 1 RANDOM player: 5%
- 2 RANDOM players: 9.75%
- 3 RANDOM players: ~14.26%
- 4 RANDOM players: ~18.55%

The match may contain **at most one Secret Baby**.

Multiple successful eligibility rolls still create only one Secret Baby token.

## 4. Concealed batch assignment

If two to four players choose RANDOM together:

1. HOST gathers the RANDOM seats;
2. HOST performs all 5% eligibility rolls using the serializable authoritative RNG;
3. HOST prepares one Character token per RANDOM seat;
4. if eligible, exactly one of those tokens is Secret Baby;
5. normal tokens are drawn from the starter roster;
6. starter duplicates are avoided whenever capacity allows;
7. the token set is shuffled;
8. tokens are assigned to RANDOM seats;
9. identity stays concealed until the match-start reveal.

This deliberately detaches the successful Secret roll from the final recipient.

The player should experience:
**chose RANDOM → got a face-down ? → match begins → cards spread/shuffle → assignment reveal**.

## 5. Direct selection rule

Secret Baby:
- is absent from normal Character Select;
- cannot be selected by ID through ordinary UI;
- cannot be selected by CPU fixed-choice configuration;
- may only come from the authoritative RANDOM batch.

A future collection/lore page may record that the player has encountered it, but encounter history must not unlock direct selection unless Ron explicitly changes this rule.

## 6. Starter roster gender lock

The approved starter presentation is now:

- KHÓC NHÈ: female, 55–65
- CAU CÓ: male, 40–50
- LO LẮNG: male, 28–35
- TĂNG ĐỘNG: female, 18–24

Gender/age remain presentation data. They do not mechanically generate passives.

## 7. Secret passive direction

Working passive concept: **BÉ CƯNG CỦA VŨ TRỤ**

The Secret Character should feel meaningfully stronger/special, but not guarantee a win.

Current direction:
- limited protection/mitigation from a meaningful negative event;
- noticeably better than a starter passive in perceived value;
- still bounded by a cadence such as once per lap/round/event class;
- exact numbers and authoritative effect are intentionally **not implemented in CH-02B**.

Canonical flag remains `live: false`.

## 8. Authority + determinism

Canonical resolver:
`src/core/characterRandomSelectionCh02b.ts`

Rules:
- HOST authority only;
- consumes `SerializableRngState` through `nextRandom()`;
- no `Math.random()`;
- same RNG state + same RANDOM seats + same occupied starter IDs => same batch;
- this milestone resolves pre-match Character IDs only;
- no passive gameplay mutation;
- no MatchState schema migration yet.

When wired to online runtime later, the host must not leak concealed assignments to ordinary lobby presentation before reveal.

## 9. Reveal direction

Normal RANDOM reveal:
- face-down ? card;
- spread;
- shuffle;
- assign;
- flip at match start.

Secret reveal should have a stronger beat than normal Character reveals, for example:
- brief hold;
- unusual pacifier/baby cue;
- Secret Baby crawls/appears;
- special stinger;
- reveal badge.

Exact animation/SFX is a later visual/runtime milestone.

## 10. CH-02B acceptance

Source acceptance:
- 5% constant is locked;
- RANDOM-only Secret data exists outside starter roster;
- resolver is deterministic;
- max one Secret Baby per batch;
- 2–4 RANDOM players can be shuffled/assigned as one batch;
- starter duplicates are avoided when possible;
- Secret Baby is rejected by direct-select helper;
- no passive is activated;
- CI regression passes.

Runtime acceptance remains pending until Character Select / Start flow actually wires RANDOM and the reveal.
