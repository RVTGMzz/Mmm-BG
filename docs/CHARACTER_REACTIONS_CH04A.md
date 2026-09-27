# MMM — CH-04A Character Reaction Profiles

Status: **SOURCE IMPLEMENTED / RUNTIME ACCEPTANCE PENDING**

CH-04A makes the selected Character visible in moment-to-moment banter without activating any gameplay passive.

## Scope

Character identity now changes Card/News reaction copy and expression through the Character's existing `reactionProfileId`.

Profiles:
- KHÓC NHÈ — dramatic, emotional, consolation-seeking;
- CAU CÓ — terse, confrontational, push-back;
- LO LẮNG — anticipatory, calculating, risk-aware;
- TĂNG ĐỘNG — fast, playful, high-energy recovery;
- EM BÉ BÁ ĐẠO — tiny boss / cosmic entitlement.

Contexts are intentionally small and reusable:
- attack;
- targeted;
- gain;
- loss;
- spectate;
- chaos.

Each context has a deterministic mini-pool. Selection uses event/step/speaker IDs only. There is no random call.

## Compatibility

If a player has no resolved Character ID, the existing legacy reaction JSON remains the fallback. This preserves old saves and transitional flows.

CPU legacy quirk lines also remain only for Character-less CPU seats. Once a CPU owns a Character, its Character profile owns its reaction personality.

## Authority safety

CH-04A is presentation-only:
- no MatchState mutation;
- no wallet/position/card changes;
- no passive resolution;
- no new HOST RNG consumption;
- no client RNG;
- no checksum/replay change;
- no reconnect authority change.

Random/Secret Character concealment is still respected because a profile is used only after a concrete `characterId` exists in session state.

## Canonical files

- `src/core/characterReactionProfilesCh04.ts`
- `src/ui/presentationModel.ts`
- `tests/character-reactions-ch04.ts`

## Next Character milestones

- CH-04B can expand contextual reaction pools to Job, Jail/Hospital, Mini Game and lap shuffle presentation.
- CH-05 remains the separate HOST-authoritative passive milestone and stays blocked on explicit balance rules.
