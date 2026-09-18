# MeMeMe 0.1.58 — TIN TỨC / LÁ BÀI Depth

Status: **AUTOMATED CANDIDATE / MANUAL RUNTIME ACCEPTANCE REQUIRED**

Launcher: `START_PLAYTEST.bat`

0.1.58 builds on the 0.1.57 special-location authority layer. It does not replace the validated HOST/replay/checksum chain or the 0.1.56.1 camera/HUD architecture.

## What changed

### LÁ BÀI

Two legacy-inspired relocation effects are now real authoritative gameplay:

- **Mời Lên Phường** — choose one free opponent and send them directly to Jail.
- **Giường Bệnh Đã Đặt** — choose one free opponent and send them directly to Hospital.

Rules:
- these cards are held and used before the normal movement roll;
- an opponent already held in Jail/Hospital is not a valid target;
- relocation writes authoritative `nodeId + specialHold` state;
- the target then follows the normal 0.1.57 release rule on their next turn;
- no alternate release card, bail, fee or hidden shortcut is introduced.

### TIN TỨC

The News pool now has more immediate global and special-location events:

- positive whole-table B$ event;
- negative whole-table B$ event;
- weighted variants that can send a free opponent to Jail;
- a weighted variant that can send a free opponent to Hospital.

These are immediate authoritative events only. Timed global statuses, off-turn reaction/counter cards and board-node status placement remain deferred because the current HOST timing model does not yet expose those windows safely.

### Presentation

`CareerMinigameBoardScene058` extends the existing chain:

`058 -> 057 -> 0561 -> 056 -> 048`

When a Card/News effect changes another player's authoritative node into Jail/Hospital, 0.1.58 reconciles that target token visually without giving presentation ownership of the gameplay result.

## Manual acceptance checklist

1. Draw and play **Mời Lên Phường**; only free opponents should be selectable.
2. The selected target should visibly move to Jail and show Jail holding state on their turn.
3. Jail still releases only on 1 / 3 / 5 and still requires a fresh movement D6 after release.
4. Draw and play **Giường Bệnh Đã Đặt**; the target should visibly move to Hospital.
5. Hospital still releases only on 2 / 4 / 5 and still requires a fresh movement D6 after release.
6. A player already held cannot be selected by another special-location relocation card.
7. New global TIN TỨC events update B$ for the whole table exactly once.
8. Special-location TIN TỨC can relocate an eligible opponent without visually snapping unrelated tokens.
9. After many turns, normal movement must still never snap a token backward.
10. Camera, four-corner HUD, branches, Roll For Order, Job Hub, Mini Games, Lottery, READY/lap and final result remain intact.
11. Visible build reads **0.1.58** and current names remain **TIN TỨC / LÁ BÀI**.

## Explicit deferrals

Not implemented in 0.1.58:
- off-turn reaction/passive cards;
- counter windows;
- timed global statuses lasting N turns;
- alternate Jail/Hospital release cards;
- board-node traps/status placement.

Those require an explicit authoritative timing/status layer rather than presentation-only shortcuts.

A green CI run means **packaged automated candidate**, not user acceptance.
