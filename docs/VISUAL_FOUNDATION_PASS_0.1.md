# Visual Foundation Pass 0.1

Status: **IN PROGRESS — VF-01/02/03 LIVE, VF-04.1 HUD, VF-05/05.1 EVENT SURFACES AND VF-06 JOB HUB IN SOURCE; DEVICE RETEST PENDING**

Canonical visual authority:
- `docs/VISUAL_STYLE_BIBLE_V0.1.md`
- `docs/CANONICAL_UI_UX_RULES.md`

This pass establishes the reusable visual foundation before any broad reskin of the game. The goal is to create a small set of canonical components, validate them on real mobile landscape, then propagate them safely across the runtime.

The reference moodboard defines the desired level of friendliness, readability, chibi proportion, rounded toy-like UI and casual-mobile polish. It is directional reference only. Do not reproduce another game's proprietary characters, logos, illustrations, layouts or exact UI.

---

## 1. Objective

Create the first production-ready visual system for the current runtime in this order:

1. **Button system**
2. **Panel / modal shell**
3. **Player HUD**
4. **One canonical TIN TỨC sample**
5. **One canonical Job sample**

This pass must prove that the new visual language works in the live game before it is spread to every screen.

The result should feel:
- chibi;
- cozy;
- rounded;
- toy-like;
- pastel/candy-coloured;
- touch-friendly;
- visually rich without becoming dense;
- readable on a phone without zooming.

---

## 2. Core implementation principle

**Component first, screen second.**

Do not redraw every screen independently.

Build reusable visual primitives first, then use the same primitives in the sample TIN TỨC and Job surfaces. Once those examples pass desktop + phone landscape runtime review, the same system can be propagated to the rest of the game.

---

## 3. Scope

### In scope
- design tokens;
- primary / secondary / subtle / danger / disabled buttons;
- canonical panel/modal shell;
- canonical close button;
- modal dimmer and ownership behaviour;
- player HUD idle state;
- player HUD active state;
- one TIN TỨC event treatment;
- one Job selection/preview treatment;
- mobile landscape safe-area validation;
- keyboard + touch/click presentation consistency;
- visual regression tests for the new primitives.

### Out of scope
- full board/map reskin;
- replacing every TIN TỨC / LÁ BÀI card;
- rebuilding every Job card;
- full avatar-generation art pipeline;
- full reaction-system redesign;
- controller support;
- major gameplay/economy changes;
- RNG changes;
- online authority changes;
- reconnect protocol changes;
- WebRTC architecture changes;
- broad animation/juice sweep;
- full brand/logo redesign.

---

## 4. Design tokens

Create shared tokens before styling individual screens.

Recommended token groups:

### Colour
- `--vf-bg-cream`
- `--vf-panel-cream`
- `--vf-panel-warm`
- `--vf-outline-cocoa`
- `--vf-outline-soft`
- `--vf-accent-butter`
- `--vf-accent-coral`
- `--vf-accent-mint`
- `--vf-accent-aqua`
- `--vf-accent-lavender`
- player P1/P2/P3/P4 accent tokens

### Radius
- `--vf-radius-sm`
- `--vf-radius-md`
- `--vf-radius-lg`
- `--vf-radius-pill`

Suggested family:
- small: 12–16 px
- medium: 18–22 px
- large: 24–32 px

### Border
- ordinary component: 2–3 px
- primary / modal emphasis: 3–5 px

### Shadow
- soft elevation;
- active-card elevation;
- pressed-state compression.

Avoid hard black shadow blocks.

### Typography
- hero/event title;
- modal title;
- primary CTA;
- HUD identity;
- body;
- secondary metadata.

### Spacing
Use a consistent small spacing scale rather than hand-tuned gaps on every screen.

Suggested logical spacing family:
- 4
- 8
- 12
- 16
- 24
- 32

---

## 5. Button system

The first canonical component.

### Required variants
1. Primary
2. Secondary
3. Subtle / Ghost
4. Danger
5. Disabled
6. Icon + label
7. Large mobile CTA

### Visual rules
- rounded corners;
- thick readable outline;
- soft shadow;
- light top-edge highlight;
- high-contrast label;
- clear pressed state;
- clear keyboard focus state;
- clear disabled state;
- no tiny pill buttons for primary actions.

### Suggested sizing
Primary phone-landscape action:
- height: 64–80 px logical;
- radius: 20–28 px;
- label: 22–28 px logical where space allows.

Secondary buttons may be smaller, but still comfortably tappable.

### Interaction states
- idle;
- hover where available;
- focused;
- pressed;
- disabled;
- selected where applicable.

Pressed state should feel physical:
- slight vertical compression;
- reduced shadow;
- tiny scale change only if it does not cause layout shift.

### Acceptance
- current primary action is obvious within one second;
- touch target is comfortable;
- keyboard focus is visible;
- disabled state is unmistakable;
- colour is not the only state cue;
- no button text clips or wraps unexpectedly.

---

## 6. Panel / Modal system

Build one reusable shell before reskinning individual dialogs.

### Required regions
1. Header / title
2. Body
3. Optional illustration / icon region
4. Footer / action region
5. Close control when allowed

### Required variants
- compact;
- normal;
- wide;
- event/result.

### Visual rules
- warm cream panel;
- dark cocoa outline;
- soft elevation;
- large rounded corners;
- clear internal padding;
- title has stronger hierarchy than body;
- primary action lives in a predictable footer region.

### Modal ownership rules
A blocking modal owns attention.

When a blocking modal is open:
- unrelated HUD may dim or hide;
- narration behind it must not leak through;
- reaction bubbles must not overlap it;
- duplicate legacy text must not remain visible;
- background interaction must be blocked.

### Close behaviour
When closing is allowed:
- explicit close button;
- Esc where supported;
- outside click/tap only where safe;
- no hidden hover-only dismissal.

### Acceptance
- no text escapes the panel;
- no background copy visibly competes with the modal;
- modal fits phone landscape without browser zoom;
- CTA remains visible;
- all controls remain within safe area.

---

## 7. Player HUD foundation

Player identity must become one of the strongest visual anchors.

### Idle HUD content
Show only:
- avatar;
- player name;
- money;
- job when relevant.

Do not permanently show dense secondary stats.

### Active HUD behaviour
Active player HUD should:
- scale up moderately;
- strengthen outline/elevation;
- show an additional marker or badge;
- optionally reveal one extra context line;
- remain fully inside viewport safe bounds.

Recommended active visual emphasis:
- approximately +8% to +18% scale;
- stronger border/shadow;
- optional turn badge.

### Player identity
Each player should retain:
- consistent P1–P4 colour accent;
- visible name;
- visible avatar;
- visible token/badge identity during movement.

### Safe-area rule
Active HUD may never clip against:
- left/right viewport edges;
- top/bottom browser-safe space;
- reaction lanes;
- blocking modal bounds.

### Acceptance
- current player is obvious in under one second;
- inactive HUDs remain readable but quiet;
- active card never clips;
- no HUD text overlaps;
- P1–P4 identity never disappears during movement.

---

## 8. Canonical TIN TỨC sample

Do not reskin every event yet.

Select one representative TIN TỨC item and make it the canonical event template.

### Structure
1. category badge / icon;
2. event title;
3. large illustration or icon;
4. concise body;
5. result or decision;
6. one dominant CTA.

### Visual direction
- event-like rather than debug-dialog-like;
- friendly and playful;
- clear hierarchy;
- large icon/art;
- minimal body text;
- rounded event frame;
- strong CTA.

### Copy rules
- prefer one human-readable sentence;
- remove duplicate explanatory lines;
- do not expose technical mapping;
- keep current adaptive text fitter from 0.1.70.4.18.

### Acceptance
- long title still fits;
- long body remains readable;
- no duplicate text layer;
- no footer collision;
- modal ownership remains clean;
- sample reads clearly on desktop and phone landscape.

---

## 9. Canonical Job sample

Build one representative Job card / preview flow using the new foundation.

### Default Job card shows
- D6 range / slot;
- icon or illustration;
- job name;
- compact salary;
- clear selected state.

### Default instruction
Use concise copy:

**“Đổ xúc xắc để chọn nghề”**

Do not show verbose technical D6 mapping in the main instruction.

### Detail preview
Job preview should:
- open on deliberate touch/click;
- show readable art/icon;
- show job name;
- show salary;
- show concise detail text;
- close predictably;
- never render blank.

### Acceptance
- Job preview is always visible when opened;
- salary remains visible;
- selected state is obvious;
- card does not become text-heavy;
- desktop and phone landscape both pass.

---

## 10. Motion foundation

This pass may introduce only lightweight component motion.

Suggested timing:
- button press: 80–120 ms;
- button release: 100–160 ms;
- modal/card entrance: 160–240 ms;
- active HUD emphasis: 160–220 ms.

Allowed:
- small squash;
- soft bounce;
- short fade/slide;
- subtle reward sparkle.

Not yet:
- large global transition system;
- looping decorative animation everywhere;
- animation that delays player input.

---

## 11. Mobile-first acceptance baseline

Primary target:
**real phone in landscape orientation.**

A component is not accepted merely because it fits at 1280×720 desktop simulation.

Must verify:
- text is comfortably readable;
- touch targets are comfortable;
- active HUD remains inside safe area;
- modal actions remain reachable;
- no browser zoom is required;
- no hover-only interaction;
- no tiny technical copy;
- long localized Vietnamese copy remains inside its owner.

---

## 12. Runtime safety contract

Visual work must preserve all accepted runtime authority.

Do not introduce:
- client RNG;
- duplicate MatchState mutation paths;
- alternate `submitIntent` routes;
- duplicated online ownership logic;
- reconnect shortcuts;
- presentation-owned gameplay state.

Must preserve:
- Host authority;
- deterministic RNG;
- reconnect seat ownership;
- CPU autoplay;
- WebSocket online flow;
- media signaling;
- modal ownership;
- player token badges;
- adaptive text fitting;
- HUD clamp;
- touch/click + keyboard support.

Controller remains intentionally unsupported in this pass.

---

## 12.1 Current implementation checkpoint

Implemented in source:

- `src/visualFoundationV01.css`
  - canonical VF colour tokens;
  - radius/border/spacing tokens;
  - typography tokens;
  - soft-depth tokens;
  - player accent tokens;
  - canonical button sizing tokens.
- `src/ui/visualFoundationV01.ts`
  - reusable button variant/size decorator;
  - selector-based live-surface decoration;
  - presentation-only, no gameplay authority.
- Live adoption:
  - mode-selection lobby;
  - online room lobby;
  - setup footer;
  - rule-confirm flow;
  - dynamic online kick button;
  - Ready button changes from secondary to success skin without changing ready authority.
- Regression gate:
  - `tests/visual-foundation-v01.ts`

VF-03 now has its first shared implementation: `decorateVisualFoundationPanelV01`
and `bindVisualFoundationModalV01` in `src/ui/visualFoundationV01.ts`. The
first live adoption is the setup Avatar Choice modal, with one owned header,
four large choice buttons, a footer, keyboard Tab trap, Esc dismissal,
focus return to its opener and safe scroll on phone landscape. Controller
focus now prioritizes that open dialog above background setup fields.

**Important:** VF-03 is a first reference implementation, not a claim that
every Phaser event/Card/News modal has been migrated. The recurring generic
News/Card reaction leak still needs independent runtime acceptance. VF-04 HUD,
VF-05 News/Card and VF-06 Job samples are not yet migrated to Foundation.
Desktop, real-phone-landscape and Steam Deck controller visual acceptance is
required before declaring VF-03 complete.

### VF-04.1 active-turn ring polish

Ron confirmed the gold outer HUD border is **intentional active-turn UI**, not a wrong seat colour. Keep it for whichever P1–P4 currently owns the turn. VF-04.1 distinguishes outer turn gold from the inner player-colour identity outline with a 4px cream gutter. The avatar and upper identity stripe remain the corresponding seat colour; yellow never overrides their identity. On an authoritative turn change, only the small gold turn marker briefly pops (220ms). HUD position/scale remain under the established safe-area and mobile controllers. `hudFramePaletteVf041()` and `tests/visual-foundation-hud-vf04.ts` enforce all four seats, both states and the ring gap. Physical screenshots still required to accept visual taste.

### VF-04 first live player HUD pass

- `src/ui/visualFoundationHudVf04.ts`: one warm toy-like HUD graphic for all
  four existing player seats, preserving original avatars, labels and authority.
  Shares the exact 268×104 painted bounds with layout/clamp logic, rather than
  leaving older code to assume the smaller 252×92 hitbox.
- Idle: photo/avatar, P1–P4 identity, name, money and a single compact Job line.
  Active: golden rim/turn marker, slightly stronger type, level, salary and
  contextual 🃏 / 🔒 detail on the second line.
- `CareerMinigameBoardScene065` reuses the same skin on all four HUDs.
  `CareerMinigameBoardScene07044` clamps all four panels against actual
  dimensions on both desktop and mobile, keeping the existing 1.18/0.96 mobile
  scale and independent fixed screen-space HUD camera.
- `tests/visual-foundation-hud-vf04.ts` checks geometry, long labels, idle/
  active copy, the four canonical anchors and presentation-only source wiring.

VF-04 is **SOURCE + CI GATE, RUNTIME RETEST REQUIRED**. Do not accept visual
fit on Steam Deck/real phone before Ron views the four corners, longer names,
active player switch, event modal, token badge and reaction lanes. VF-05 News
and VF-06 Job are deliberately not reskinned in this pass.

### VF-05 first canonical TIN TỨC visual sample

- `src/ui/visualFoundationNewsVf05.ts`: reusable warm-cream event material with
  mint ribbon, cocoa frame, sticker icon well and a separate paper-like reading
  region. The 720x300 material is deliberately painted **inside the original
  .22 presentation root**, with the same exact event geometry.
- Active scene `CareerMinigameBoardScene07044` adopts this material only for
  `model.kind === 'news'`. Card variants retain their existing dark visual
  until News is reviewed by Ron; no global style swap.
- VF-05 sample uses 30px dark cocoa headlines, 18px body where copy fits,
  reducing to 14px only for long content, and removes unnecessary technical
  footer text from News. It does **not** introduce a new owner, independent
  toast, reaction position or input handler.
- `tests/visual-foundation-news-vf05.ts` checks the painted bounds against the
  existing .22 reaction/HUD safe lanes and verifies use of the established
  `fitWrappedText070418` and canonical-only News sample. All old .22 owner
  regressions must still pass.

**Device acceptance pending:** Ron to inspect short/long News, all P1-P4
reactions, repeated skip and phone landscape. This does not claim the previous
floating-reaction issue is resolved in a real browser, nor does it migrate
the entire Card catalogue. Next, only after visual feedback, adapt the
shared News material into the other event families and VF-06 Job.

### VF-06 first canonical Job Hub visual sample

- `src/ui/visualFoundationJobVf06.ts` defines the warm cream/cocoa shell,
  butter CTA/header family, three soft slot palettes and logical viewport bounds.
- `src/ui/JobChoicePicker.ts` keeps the existing 950×516 blocking owner,
  exact A/B/C D6 mapping and all pointer/keyboard/Steam Deck authority, while
  replacing the flatter Job cards with larger icon wells, cleaner one-line
  salary hierarchy and a large-icon detail sheet.
- Risky/crime jobs use coral emphasis without changing their mechanics.
- The detail title no longer repeats the Job emoji beside the name after the
  large icon is already present.
- `tests/visual-foundation-job-vf06.ts` gates geometry, palette variation,
  large-icon hierarchy and preservation of the existing focus/roll owner.

**Device acceptance pending:** inspect all three cards, risky Job, detail sheet,
waiting/spectator state, keyboard focus and Steam Deck 1280×800. Do not spread
the treatment to unrelated Mini Game/result modals until this sample is accepted.


## 13. Implementation order

### Phase VF-01 — Tokens
Create canonical colour/radius/shadow/type/spacing tokens.

**Exit condition:** all later components consume shared tokens rather than hard-coded visual values where practical.

### Phase VF-02 — Buttons
Build the full button variant set.

**Exit condition:** launcher/lobby can use the new button family without behaviour regressions.

### Phase VF-03 — Panel / Modal
Build the shared shell and ownership behaviour.

**Exit condition:** one existing modal can be migrated cleanly.

### Phase VF-04 — Player HUD
Re-skin idle and active states.

**Exit condition:** all four corners pass mobile safe-area checks.

### Phase VF-05 — TIN TỨC sample
Migrate one representative event.

**Exit condition:** event hierarchy, text fit and CTA pass on desktop + phone landscape.

### Phase VF-06 — Job sample
Migrate one Job card/preview.

**Exit condition:** selection + preview + salary + mobile readability pass.

### Phase VF-07 — Foundation review
Compare all five foundations together.

**Exit condition:** visual language feels coherent enough to propagate to the rest of the runtime.

---

## 14. Suggested reusable implementation surfaces

Exact filenames may change after code inspection, but implementation should converge toward shared primitives rather than per-screen skins.

Suggested responsibility split:

- visual tokens;
- button skin/helper;
- panel/modal skin/helper;
- HUD skin/helper;
- shared icon frame;
- focus/pressed animation helper;
- mobile safe-area helper.

Do not create one-off component forks for every screen.

---

## 15. Regression tests

Add source/runtime guards that verify:
- canonical token file exists;
- canonical button component is used by at least one live screen;
- modal shell owns its content;
- active HUD clamp remains active;
- TIN TỨC sample uses adaptive text fitting;
- Job sample preview cannot render as an empty shell;
- controller navigation is still not wired into runtime;
- no new client RNG / duplicate submit path is introduced.

Visual snapshot tests may be added later, but source/runtime contract tests remain required.

---

## 16. Review checklist

Before accepting each component:

### Visual
- Does it match the Visual Style Bible?
- Does it feel rounded, friendly and tactile?
- Is the primary action visually dominant?
- Is the layout still distinct from the reference game's proprietary UI?

### Readability
- Is it readable on real phone landscape?
- Is any important copy too small?
- Is Vietnamese text allowed enough width?

### Interaction
- Can touch/click use it comfortably?
- Is keyboard focus clear where supported?
- Is disabled/selected state clear without colour alone?

### Safety
- Does it preserve gameplay authority?
- Does it preserve reconnect/online ownership?
- Does it preserve modal ownership?
- Does it preserve existing accepted regression guards?

---

## 17. Definition of Done

Visual Foundation Pass 0.1 is complete only when all of these are true:

- design tokens are live;
- canonical button family is live;
- canonical modal/panel shell is live;
- player HUD idle + active states are live;
- one canonical TIN TỨC sample is live;
- one canonical Job sample is live;
- all five share the same visual grammar;
- desktop validation passes;
- phone-landscape validation passes;
- no gameplay authority regression;
- no reconnect regression;
- no text-overflow regression;
- no active-HUD clipping regression;
- no blank Job-preview regression.

Only after this pass is accepted should the new style be propagated broadly across the full board and remaining screens.

---

## 18. Rollout rule after acceptance

After the foundation is accepted, propagate in this order:

1. remaining TIN TỨC / LÁ BÀI;
2. remaining Job surfaces;
3. launcher/lobby/avatar setup;
4. reaction bubbles;
5. board landmarks and tile presentation;
6. mini-game entry/result surfaces;
7. full animation/juice pass.

Do not change all areas simultaneously.

The foundation components remain canonical unless intentionally superseded by a later approved visual-system revision.
