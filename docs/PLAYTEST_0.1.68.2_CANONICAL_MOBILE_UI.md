# MeMeMe MVP 0.1.68.2 — Canonical Mobile UI Playtest

This build is a presentation/readability pass above the validated gameplay-authority chain. It adds no new gameplay RNG, economy rule, match-state mutation path or match-length rule.

Canonical design rules: `docs/CANONICAL_UI_UX_RULES.md`.

## Recommended test setup

Test mobile in landscape fullscreen first. Also do one desktop or Steam Deck/controller pass.

Run a 1-LƯỢT match first for fast feedback, then confirm 2/3 LƯỢT still reach the correct Podium condition.

## Acceptance checklist

### Player HUD

- All four corner cards stay compact while idle.
- Idle card shows readable player identity + B$ + Job name/level only when employed.
- The current-turn player card visibly expands and strengthens focus without relying only on colour.
- Active card reveals one useful extra context line such as Job salary/status.
- Previous active card returns to compact state when the turn changes.
- No corner card covers central board interaction or mobile Settings/fullscreen controls.

### Job Hub

- Default A/B/C Job cards are readable at phone scale.
- Default Job card shows only D6 range, icon/art, Job name, Lv1/Lv2/Lv3 salary summary and one risk/identity tag.
- Long odds/progression/flavour paragraphs are NOT permanently crammed into the card face.
- Touch/clicking a Job card opens its detail view.
- Keyboard A/B/C or 1/2/3 opens the corresponding Job detail.
- Steam Deck/controller D-pad can focus a Job card and A opens its detail.
- Detail view shows salary levels, identity/risk, odds and short Job explanation without text leaving the panel.
- Close detail using the close button, outside touch/click, Esc, or controller B.
- Opening/closing Job detail does not roll D6 or mutate the authoritative Job choice.

### Modal ownership / overflow

- While Job Hub or another blocking presentation is open, unrelated board narration does not leak behind/across it.
- Job result popup has no old white `trúng...`, salary, movement or descriptive text escaping behind the canonical popup.
- News/Card/Job presentation remains the one dominant message while open.
- Text never escapes its owning panel; if copy is long it wraps/clamps instead of becoming tiny.

### Reaction bubbles

- Reaction bubbles stay inside the 1280×720 logical viewport.
- Right-side bubbles do not run under the mobile Settings/fullscreen rail.
- Left/right/top/bottom bubbles remain readable and limited to two quote lines.
- Reaction bubbles do not obscure the central blocking modal as in the previous overflow screenshots.

### Retained vertical slice

- Menu → Setup → CHỌN LUẬT → Roll For Order → Trận → Podium → Rematch remains intact.
- 1 / 2 / 3 LƯỢT still means 1 / 2 / 3 authoritative target laps.
- CPU turns continue without stalls.
- Jail/Hospital release continues without double-roll/freeze.
- `CHƠI LẠI` starts a clean match and `VỀ LOBBY` returns correctly.
- Keep watching for the historical long-run token snap-back issue.

## Acceptance rule

Do not call 0.1.68.2 user-accepted from CI alone. Pixel layout, touch focus and controller focus require human runtime confirmation on the shipped build/web mirror.
