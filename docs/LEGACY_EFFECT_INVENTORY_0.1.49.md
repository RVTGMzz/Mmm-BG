# MeMeMe — Legacy Effect Inventory 0.1.49

Status: **ACTIVE AUDIT / DESIGN ONLY / NOT RUNTIME CONTENT**

Source basis:
- `docs/LEGACY_RULES_REFERENCE.md`
- current MeMeMe Draft B map direction

Current system names remain locked: **TIN TỨC** and **LÁ BÀI**.

## Decision legend

- **KEEP**: compatible with current direction.
- **ADAPT**: useful concept that needs current data/timing vocabulary.
- **DEFER**: potentially useful but depends on an undefined system.
- **OUTSIDE 0.1.49**: belongs to another system or map milestone.

## Inventory

### LFX-01 — Player relocation
- Destination: **LÁ BÀI** and selected **TIN TỨC** effects
- Scope: self / one player / movement-location state
- Current template: `Di chuyển {Player} đến {ValidDestination} theo effect data.`
- Valid destination family may include main-board nodes and approved singleton locations such as `HOSPITAL` / `JAIL`.
- Direction: R–SR depending on distance/control
- Needs: destination validation and movement/location presentation
- Authority: HOST resolves destination and serializes authoritative movement/location events
- Decision: **ADAPT**

### LFX-02 — Hold card until legal use
- Destination: **LÁ BÀI** delivery model
- Scope: hand / self
- Current template: card remains in hand until a legal timing window
- Needs: hand limit and timing metadata
- Authority: hand state must be authoritative
- Decision: **KEEP** as a card model, not a standalone effect

### LFX-03 — Jail release card
- Destination: **LÁ BÀI** candidate
- Scope: self / special-location status
- Base release rule is now defined: D6 `1 / 3 / 5` releases, failure retries next turn.
- Alternate release-card semantics are not defined yet.
- Decision: **DEFER alternate card**, not because Jail release is unknown, but because bypass/interaction semantics remain TBD.

### LFX-04 — Hospital release card
- Destination: **LÁ BÀI** candidate
- Scope: self / special-location status
- Base release rule is now defined: D6 exactly `2 / 4 / 5` releases, failure retries next turn.
- Alternate release-card semantics are not defined yet.
- Decision: **DEFER alternate card**, not because Hospital release is unknown, but because bypass/interaction semantics remain TBD.

### LFX-05 — Timed global event / weather / curse
- Destination: **TIN TỨC**
- Scope: all players / board / timed status
- Current template: `Trong {Duration} lượt, {GlobalModifier} áp dụng cho toàn bàn.`
- Direction: SR–SSR depending on swing
- Needs: timed global-status system and duration clock
- Authority: HOST owns start/end counters; remaining duration must be replay/checksum visible
- Decision: **ADAPT**

### LFX-06 — Before-roll timing
- Destination: **LÁ BÀI** timing metadata
- Scope: self / one player
- Current template: `Chỉ dùng trước khi tung xúc xắc.`
- Needs: explicit timing-window enum
- Authority: HOST validates phase before accepting card intent
- Decision: **KEEP** as timing metadata

### LFX-07 — Off-turn reaction/passive
- Destination: **LÁ BÀI**
- Scope: self / one player / reaction
- Current template: `Có thể phản ứng khi {Trigger} xảy ra.`
- Needs: reaction window and deterministic ordering
- Authority: HOST validates trigger and ordering
- Decision: **DEFER**

### LFX-08 — Place a status on a board node
- Destination: **LÁ BÀI** candidate
- Scope: board / node status
- Current template: `Đặt {BoardStatus} lên một ô hợp lệ.`
- Needs: board-status layer and legal-space rules
- Authority: HOST validates target node and persistence
- Decision: **DEFER**

### LFX-09 — Pet placed on board with economy interaction
- Destination: future companion/pet system
- Scope: board / economy
- Needs: ownership, placement, collision and economy rules
- Decision: **OUTSIDE 0.1.49**

### LFX-10 — Magic shop draw/select/trade flow
- Destination: future shop/distribution system
- Scope: hand / economy
- Needs: shop feature, hidden information and trading protocol
- Decision: **OUTSIDE 0.1.49**

### LFX-11 — Special timing windows for strong attacks/effects
- Destination: **LÁ BÀI** timing metadata
- Scope: varies
- Current template: effect data declares its legal timing window
- Authority: HOST validates exact window
- Decision: **ADAPT** as metadata

### LFX-12 — Generic skip-next-roll penalty
- Destination: not approved as a generic card/news family
- Scope: player / turn flow
- Note: failed Jail/Hospital release attempts naturally consume that attempt and retry next turn; this does not automatically approve a generic skip-turn card family.
- Decision: **DEFER** generic skip-turn effects

### LFX-13 — Odd/even branch routing
- Destination: historical map mechanic only
- Scope: movement / board
- Current Draft B main map does not use Hospital/Jail as dice branches.
- Decision: **OUTSIDE 0.1.49 / NOT PART OF HOSPITAL-JAIL FLOW**

### LFX-14 — Send another player to Hospital / Jail
- Destination: **TIN TỨC** and/or **LÁ BÀI**
- Scope: one player / special-location state
- Core idea: an effect directly sends the target to the singleton `HOSPITAL` or `JAIL` location.
- Current template: `Đưa {TargetPlayer} đến {HOSPITAL|JAIL}.`
- Map behavior: this is not normal dice movement and does not traverse H1..H4/J1..J4.
- Authority: HOST validates target and destination, updates authoritative location state, then emits presentation events.
- Replay: destination and affected player must be serialized deterministically.
- Base release rules are now defined; post-release same-turn movement remains TBD.
- Decision: **ADAPT**

### LFX-15 — Lottery corner
- Destination: map-special effect, not a card family
- Scope: self / economy
- Trigger: land on `M23 LOTTERY`
- Resolution: HOST rolls D6 and awards `D6 × 20 B$`
- Payout range: `20..120 B$`, expected value `70 B$`
- Decision: **KEEP IN MAP TRACK / NOT A TIN TỨC OR LÁ BÀI EFFECT**

## First-pass conclusions

Safe to carry forward conceptually:
1. Authoritative movement/location effects.
2. Held cards in the current LÁ BÀI hand model.
3. Timing metadata represented in data rather than hard-coded per card.
4. Timed global events as a TIN TỨC family once an authoritative duration/status layer exists.
5. Effect-driven send-to-Hospital/Jail using stable singleton destinations.

Now defined:
- Jail base release: `1 / 3 / 5`.
- Hospital base release: exactly `2 / 4 / 5`.
- Failure retries on the player's next turn.

Still deferred:
- alternate release cards/effects;
- post-release same-turn movement semantics;
- board-node status placement;
- off-turn reaction/passive cards.

Belongs outside 0.1.49:
- Pet mechanics.
- Shop draw/trade flow.
- Historical odd/even branch routing.
- Lottery as a map-special rule rather than card/news content.

## Map correction note

Current map authority is Draft B:
- 44 main-loop spaces;
- `M01 READY`;
- `M12 JAIL_GATE`;
- `M23 LOTTERY`;
- `M34 HOSPITAL_GATE`;
- one `HOSPITAL` location;
- one `JAIL` location.

The old multi-node H1..H4 / J1..J4 interpretation is superseded.

## Missing source material

The repo does not currently contain a card-by-card transcription of all old Tiên Tri / Phép Thuật screenshots. This inventory is therefore an **effect-family audit**, not a claim that every old card has been individually recovered.
