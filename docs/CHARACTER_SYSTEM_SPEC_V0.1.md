# MeMeMe — Character System Spec v0.1

Status: **DIRECTION LOCKED / CH-01 FOUNDATION STARTED / ROSTER + PASSIVES NOT YET FINAL**

This document turns the earlier face/personality prototype into a real character system.

## 1. Locked vision

A MeMeMe player is not just a coloured seat or a circular avatar.

Final flow:
1. occupy a player seat;
2. choose a **Character**;
3. provide player name / optional real-face input;
4. the selected Character supplies body art, poses, personality/reaction profile and passive identity;
5. the human face is composited into that Character for HUD, TIN TỨC, LÁ BÀI and situation art.

The final game should contain a varied cast across age presentation, gender presentation, fashion, silhouette and personality. Diversity is visual/narrative variety, **not a mechanical stereotype**: a character's age/gender/demographic presentation never automatically determines their passive.

## 2. Four layers that must stay separate

### Human player
Owns:
- seat / online ownership;
- display name;
- captured face assets;
- input device / local ownership.

### Character
Owns:
- character ID;
- body/silhouette/costume;
- pose set;
- reaction profile;
- passive IDs;
- character-specific presentation.

### Match state
Owns authoritative gameplay:
- money;
- position;
- Job;
- cards;
- Jail/Hospital;
- future authoritative passive state.

### Presentation
Combines the above but never becomes a second gameplay authority.

This separation is critical for reconnect, CPU replacement, deterministic replay and future character additions.

## 3. Character selection rule

**Final design:** every human/CPU participant must have a Character before the match starts.

Transitional rule:
- current Setup runtime is not broken immediately;
- `characterId` remains optional during CH-01 while the Character Select UI and starter roster are built;
- when CH-02 Character Select ships, Ready/Start will require a valid selection;
- online clients may select only their own seat;
- CPU characters must be assigned deterministically by HOST authority.

Whether duplicate Characters are allowed in one match is still open and must be decided with the first real roster.

## 4. Character data model

Canonical source foundation: `src/core/characterSystem.ts`.

A Character Definition contains:
- `id`
- `displayNameKey`
- `presentationTags[]`
- `reactionProfileId`
- `passiveIds[]`
- `poseSetId`

A Character Definition does **not** contain live wallet/position/turn data.

## 5. Passive system direction

Every Character can have signature passive behavior, but CH-01 does not activate passives yet.

Passive definitions are data-driven:
- passive ID;
- localized name/description;
- trigger;
- effect key;
- parameters.

Candidate triggers already represented by the schema include:
- turn start;
- money gain/loss;
- card played;
- News resolved;
- Job assigned;
- Jail/Hospital entry;
- Mini Game start;
- lap complete.

Rules when passives become live:
- resolve on HOST only;
- no client RNG;
- any RNG uses the serializable authoritative RNG;
- resulting state must serialize/reconnect/checksum/replay;
- passive presentation may animate later, but presentation never owns the mutation.

Initial balance target should prefer **one easy-to-understand signature passive per Character**. Multiple passives can be explored later after real playtests.

## 6. Reaction identity

Current prototype reactions use four legacy `PersonalityTag` values. Keep them during migration so existing content stays valid.

Long-term:
- Character points to `reactionProfileId`;
- reaction profile can vary copy, intensity, pose/emotion and SFX preference;
- event context still matters, so one Character can react differently to money, attack, Jail, Job or another Character;
- reaction profile may fall back to legacy personality variants while content is migrated.

No hard-coded dialogue should live in the turn controller.

## 7. Face system: no circular crop as the default

The player's real face is **not** the Character itself. It is a composited layer.

Default art direction:
- preserve head/hair shape;
- use freeform head/upper-neck crop where possible;
- do not force a universal circular face mask;
- Character artwork provides a head/face socket;
- runtime scales/rotates the captured face to that socket.

This automatically supports round, long, angular and narrow faces without designing a different hole shape for each person.

### Current capture set

Keep the practical current capture flow:
- neutral;
- happy;
- angry.

Character art may expose richer pose emotions:
- neutral;
- happy;
- angry;
- panic;
- smug;
- cry;
- shocked.

Until the capture flow expands, richer emotions map deterministically to one of the three captured expressions through `captureExpressionForCharacterEmotion()`.

## 8. Face socket contract

Face sockets use normalized coordinates so the same art works at multiple resolutions.

Example:

```json
{
  "x": 0.52,
  "y": 0.28,
  "scale": 0.84,
  "rotationDeg": -3,
  "padding": 0.08
}
```

Artwork should be authored with enough empty head room so different human face shapes still fit.

Future compositor may add:
- hair/hat foreground occlusion mask;
- neck/body mask;
- per-pose face clipping silhouette;
- soft edge treatment;
- sticker outline for LÁ BÀI;
- paper/photo treatment for TIN TỨC.

Those are presentation features, not identity data.

## 9. Pose pipeline

Canonical composition chain:

**Player → Character → Event context → Emotion pose → Face expression fallback → Composite → Surface**

Examples:
- money loss → Character panic pose → player's angry face;
- reward → Character happy/smug pose → player's happy face;
- neutral News → Character neutral pose → player's neutral face.

This allows two players to encounter the same card but still feel visually different.

## 10. TIN TỨC / LÁ BÀI integration

The earlier portrait-card idea now becomes Character-aware.

### TIN TỨC
Usually:
- Character body/pose inside a soft portrait/editorial frame;
- player's face composited into the pose;
- more controlled layout, like a newspaper/photo story.

### LÁ BÀI
Usually:
- Character pose used as a freeform sticker/cutout;
- player's face composited into that pose;
- stronger emoji/reaction accents;
- rare cards may use a large hero cutout.

For caster/target events, the art may expose two role slots. Avoid automatically filling a card with all four faces.

The existing .22 single-owner presentation root and reaction-safe lanes stay authoritative. Character art must be inserted **inside** that owner, never as a new parallel toast/modal.

## 11. Character Select UX direction

Target flow:
1. Player identity / seat;
2. Character carousel/grid;
3. Character detail: art, short personality line, passive summary;
4. Select;
5. face capture/import;
6. preview the player's face on the selected Character;
7. Ready.

Character Select must work on:
- touch;
- keyboard;
- Steam Deck gamepad;
- online seat ownership.

Do not build tiny text-heavy character cards. Character art and passive summary should do most of the communicating.

## 12. CPU behavior

CPU uses the same Character system as humans.

HOST should:
- choose/assign CPU Character deterministically;
- attach the same reaction profile/passive IDs;
- use Character-specific reactions;
- never require the human Host to manually act for CPU because of Character presentation.

## 13. Save / reconnect / online contract

When authoritative Character selection lands:
- selected Character ID must be represented in reconnect/snapshot state;
- all clients render the same Character for each seat;
- Character selection ownership follows seat ownership;
- reconnect restores the same Character;
- no client may silently replace another player's Character.

Do not add Character art blobs or face image data to deterministic gameplay checksums unless explicitly designed. Store stable IDs in gameplay state; presentation assets resolve locally.

## 14. Asset direction

Suggested layout:

```text
assets/characters/<character-id>/
  portrait/
  poses/
    neutral
    happy
    angry
    panic
    smug
    cry
    shocked
  masks/
  ui/
```

Final naming may change with the art pipeline.

Character body/pose artwork should not bake:
- player name;
- live B$;
- card/news copy;
- translated text;
- player's real face.

## 15. Implementation roadmap

### CH-01 — Foundation
- Character schema/types;
- optional `characterId` in pre-match player profile;
- face socket helpers;
- richer emotion → three-capture deterministic fallback;
- this spec;
- **no passive gameplay mutation yet**.

### CH-02 — Starter roster + Character Select
- design starter cast;
- author first Character art;
- make Character selection mandatory at Ready/Start;
- keyboard/touch/Steam Deck navigation;
- online seat ownership;
- deterministic CPU assignment.

### CH-03 — Face compositor
- head/hair-aware crop;
- normalized pose sockets;
- preview in Setup;
- fallback when camera/image is skipped.

### CH-04 — Reaction profiles
- migrate reaction personality from seat defaults to Character profiles;
- contextual reaction pools;
- retain legacy fallback while migrating.

### CH-05 — HOST-authoritative passives
- implement a small balanced passive set;
- checksum/replay/reconnect coverage;
- no presentation-owned effects.

### CH-06 — Character-aware TIN TỨC / LÁ BÀI
- one News proof;
- one Card proof;
- caster/target slots;
- then expand templates after real-device visual acceptance.

## 16. CH-01 non-goals

Do not, in this milestone:
- invent the final roster without art/design review;
- enforce Character selection before the UI exists;
- activate passive gameplay;
- rewrite current reaction content wholesale;
- replace the existing three-face capture flow;
- reskin the full TIN TỨC/LÁ BÀI catalogue;
- modify Host authority, RNG, reconnect or WebRTC.

## 17. Acceptance for the foundation

CH-01 is accepted at source level when:
- project typechecks/builds;
- existing runtime tests stay green;
- current Setup still works unchanged;
- `PlayerProfile` can store/clear a Character ID without making old flows invalid;
- face socket helpers reject invalid normalized positions;
- richer emotion mapping has deterministic fallback;
- no passive resolver or new gameplay mutation path exists.

Real visual/runtime acceptance begins with CH-02/CH-03 after the first actual Character and face composite are visible.
