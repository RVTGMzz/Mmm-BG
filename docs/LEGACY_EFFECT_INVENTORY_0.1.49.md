# MeMeMe — Legacy Effect Inventory 0.1.49

Status: **ACTIVE AUDIT / DESIGN ONLY / NOT RUNTIME CONTENT**

Source basis:
- `docs/LEGACY_RULES_REFERENCE.md`
- historical Tiên Tri / Phép Thuật references already discussed with Ron

This file audits only effect families actually evidenced by the retained legacy reference. It does not invent missing cards or reconstruct text from screenshots that are not stored in the repo.

Current system names remain locked: **TIN TỨC** and **LÁ BÀI**.

## Decision legend

- **KEEP**: compatible with current direction.
- **ADAPT**: useful concept that needs current data/timing vocabulary.
- **DEFER**: potentially useful but depends on an undefined system.
- **OUTSIDE 0.1.49**: belongs to another system or map milestone.

## Inventory

### LFX-01 — Player relocation
- Destination: **LÁ BÀI**
- Scope: self / one player / movement
- Current template: `Di chuyển {Player} đến {ValidDestination} theo effect data.`
- Direction: R–SR depending on distance/control
- Needs: destination validation and movement presentation
- Authority: host resolves destination and serializes authoritative movement events
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
- Scope: self / location status
- Current template: TBD
- Needs: Jail rules, which are currently undefined
- Decision: **DEFER**

### LFX-04 — Hospital release card
- Destination: **LÁ BÀI** candidate
- Scope: self / location status
- Current template: TBD
- Needs: Hospital rules, which are currently undefined
- Decision: **DEFER**

### LFX-05 — Timed global event / weather / curse
- Destination: **TIN TỨC**
- Scope: all players / board / timed status
- Current template: `Trong {Duration} lượt, {GlobalModifier} áp dụng cho toàn bàn.`
- Direction: SR–SSR depending on swing
- Needs: timed global-status system and duration clock
- Authority: host owns start/end counters; remaining duration must be replay/checksum visible
- Decision: **ADAPT**

### LFX-06 — Before-roll timing
- Destination: **LÁ BÀI** timing metadata
- Scope: self / one player
- Current template: `Chỉ dùng trước khi tung xúc xắc.`
- Needs: explicit timing-window enum
- Authority: host validates phase before accepting card intent
- Decision: **KEEP** as timing metadata

### LFX-07 — Off-turn reaction/passive
- Destination: **LÁ BÀI**
- Scope: self / one player / reaction
- Current template: `Có thể phản ứng khi {Trigger} xảy ra.`
- Needs: reaction window and deterministic ordering
- Authority: host validates trigger and ordering
- Decision: **DEFER**

### LFX-08 — Place a status on a board node
- Destination: **LÁ BÀI** candidate
- Scope: board / node status
- Current template: `Đặt {BoardStatus} lên một ô hợp lệ.`
- Needs: board-status layer and legal-space rules
- Authority: host validates target node and persistence
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
- Authority: host validates exact window
- Decision: **ADAPT** as metadata

### LFX-12 — Skip-next-roll style penalty
- Destination: not approved for current card/news set
- Scope: player / turn flow
- Needs: explicit skip-turn rules
- Decision: **DEFER**; do not implement implicitly

### LFX-13 — Odd/even branch routing
- Destination: final map architecture, not card/news
- Scope: movement / board
- Needs: final graph and route-selection rule
- Authority: host must own route outcome
- Decision: **OUTSIDE 0.1.49 / MOVE TO MAP TRACK**

## First-pass conclusions

Safe to carry forward conceptually:
1. Movement effects, but only through authoritative node movement.
2. Held cards in the current LÁ BÀI hand model.
3. Timing metadata represented in data rather than hard-coded per card.
4. Timed global events as a strong TIN TỨC family once an authoritative duration/status layer exists.

Blocked for now:
- Jail-release effects.
- Hospital-release effects.
- Skip-turn effects.
- Board-node status placement.
- Off-turn reaction/passive cards.

Belongs outside 0.1.49:
- Pet mechanics.
- Shop draw/trade flow.
- Odd/even branch routing.

## Missing source material

The repo does not currently contain a card-by-card transcription of the old Tiên Tri / Phép Thuật screenshots. This inventory is therefore an **effect-family audit**, not a claim that every old card has been individually recovered.

If the old card screenshots/text are later supplied or added to the repo, extend this file with one row per real legacy card and map each card to one of the effect families above.
