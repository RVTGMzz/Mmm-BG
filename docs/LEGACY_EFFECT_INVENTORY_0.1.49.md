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
- Current template: TBD
- Needs: Jail stay/release rules, which are still undefined
- Decision: **DEFER**

### LFX-04 — Hospital release card
- Destination: **LÁ BÀI** candidate
- Scope: self / special-location status
- Current template: TBD
- Needs: Hospital stay/release rules, which are still undefined
- Decision: **DEFER**

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

### LFX-12 — Skip-next-roll style penalty
- Destination: not approved for current card/news set
- Scope: player / turn flow
- Needs: explicit skip-turn rules
- Decision: **DEFER**; do not implement implicitly

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
- Map behavior: this is **not** normal dice movement and does not traverse H1..H4/J1..J4.
- Authority: HOST validates target and destination, updates authoritative location state, then emits presentation events.
- Replay: destination and affected player must be serialized deterministically.
- Needs: entry can be modeled now, but stay/release consequences remain TBD.
- Decision: **ADAPT as an effect family; DEFER detailed consequence implementation until special-location rules are approved**

## First-pass conclusions

Safe to carry forward conceptually:
1. Authoritative movement/location effects.
2. Held cards in the current LÁ BÀI hand model.
3. Timing metadata represented in data rather than hard-coded per card.
4. Timed global events as a TIN TỨC family once an authoritative duration/status layer exists.
5. Effect-driven send-to-Hospital/Jail as a destination family, with consequences still separate/TBD.

Blocked for now:
- Jail-release effects.
- Hospital-release effects.
- Skip-turn effects.
- Board-node status placement.
- Off-turn reaction/passive cards.
- Exact Hospital/Jail stay/exit consequences.

Belongs outside 0.1.49:
- Pet mechanics.
- Shop draw/trade flow.
- Historical odd/even branch routing.

## Map correction note

Current map authority is Draft B:
- 44 main-loop spaces;
- one `HOSPITAL` location;
- one `JAIL` location.

The old multi-node H1..H4 / J1..J4 interpretation is superseded.

## Missing source material

The repo does not currently contain a card-by-card transcription of all old Tiên Tri / Phép Thuật screenshots. This inventory is therefore an **effect-family audit**, not a claim that every old card has been individually recovered.
