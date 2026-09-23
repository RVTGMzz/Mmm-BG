# Visual Style Bible v0.1

Status: **CANONICAL VISUAL DIRECTION**

Project codebase: `RVTGMzz/Mmm-BG`  
Primary target: phone landscape first, then desktop/web.

This document defines the visual direction for future UI, board, HUD, modal, icon, avatar, card and presentation work. It is intentionally independent from the project name so the visual system survives future branding/renaming.

The supplied reference set establishes the desired **visual language**, not assets to copy. Do not reproduce another game's characters, logos, layouts, illustrations or proprietary UI one-for-one.

---

## 1. North-star direction

Target feeling:

**Cute casual mobile party board game + chibi characters + rounded toy-like UI + pastel candy colour + soft depth + oversized readable interaction.**

The product should feel:
- friendly before it feels technical;
- polished before it feels dense;
- tactile before it feels flat;
- playful without becoming childish;
- colourful without becoming noisy;
- readable on a phone without zooming.

Five core art-direction words:

**Chibi · Cozy · Rounded · Toy-like · Juicy**

---

## 2. What to learn from the reference set

### 2.1 Character language
- Chibi proportions: large head, compact body, clear silhouette.
- Expressions read instantly at small sizes.
- Soft contour and rounded anatomy.
- Distinct hair/clothing silhouettes rather than detail-heavy rendering.
- Strong emotional poses for reactions, wins, losses and events.

### 2.2 UI language
- Large rounded buttons.
- Thick but soft borders.
- Warm light panel fills.
- Soft drop shadows and subtle highlights.
- Big icon-first decisions.
- One dominant action per screen.
- Minimal instructional copy on the default surface.

### 2.3 World language
- Toy-diorama feeling.
- 2.5D/top-down/isometric-friendly composition.
- Props are chunky and readable.
- Decorative clutter is controlled.
- Environment tells the category of a space before text does.

### 2.4 Presentation language
- Strong headline hierarchy.
- Sticker-like iconography.
- Soft gradients and sparkles used as accents, not wallpaper.
- Clear tutorial framing.
- Character/emotion illustration can carry a screen instead of more text.

---

## 3. Visual hierarchy contract

Every screen should answer these in under one second:

1. **Whose turn / whose decision is this?**
2. **What is the one main action?**
3. **What changed?**
4. **What can I ignore right now?**

Default hierarchy:

1. Primary action / event title
2. Player identity or target
3. Large visual/icon
4. One concise result/instruction
5. Secondary metadata

Avoid equal visual weight across everything.

---

## 4. Colour system

The palette should feel creamy, sunny and toy-like rather than neon-tech.

### Base neutrals
| Token | Suggested value | Use |
|---|---:|---|
| Cream 00 | `#FFF8EA` | page/panel light background |
| Cream 10 | `#F8EBD2` | secondary panel |
| Cocoa 90 | `#4A302A` | primary outline/text |
| Cocoa 70 | `#765047` | secondary outline |
| Warm Shadow | `rgba(74,48,42,.18)` | soft elevation |

### Accent family
| Token | Suggested value | Use |
|---|---:|---|
| Butter | `#FFD86B` | primary CTA / reward |
| Coral | `#FF8F86` | warning / playful emphasis |
| Mint | `#84D5A1` | success / safe |
| Aqua | `#77D9E7` | info / movement / water |
| Sky | `#A8E7FF` | passive surfaces |
| Lavender | `#B9A6E8` | special / magic / card |
| Peach | `#F4B38D` | warm panel variation |

Rules:
- Player colours may use stronger accents, but text contrast stays high.
- Never communicate state by colour alone.
- Avoid pure black for ordinary UI; prefer dark cocoa.
- Avoid fluorescent saturation across large areas.

---

## 5. Typography

Typography should feel soft, bold and highly legible.

### Headline
- Rounded extra-bold / display face.
- Thick outer stroke or controlled shadow is allowed.
- Use for event titles, victory, major result and section identity.

### UI label
- Rounded bold sans.
- Compact but not condensed.
- Use for buttons, HUD labels, tabs and numeric state.

### Body
- Clean rounded sans.
- Minimal outline.
- High contrast against warm panel backgrounds.

### Logical 1280×720 target ranges
| Role | Target size |
|---|---:|
| Hero/event headline | 42–56 px |
| Modal title | 28–36 px |
| Primary button | 22–28 px |
| HUD identity | 18–24 px |
| Body / result | 18–22 px |
| Secondary metadata | 14–16 px |

Do not use micro text to save a crowded layout. Remove copy before shrinking font.

---

## 6. Shape language

Ordinary UI should look touchable.

### Buttons
- Height: **64–80 px** for primary mobile actions.
- Corner radius: **20–28 px**.
- Thick outer border: **3–5 px**.
- Soft highlight at top edge.
- Soft shadow beneath.
- Primary CTA should have visibly more volume than secondary actions.

### Cards/panels
- Radius: **20–32 px**.
- Warm cream fill.
- Dark cocoa outline.
- Light inset highlight optional.
- Avoid razor-thin grey rectangles.

### Badges/chips
- Pill or rounded-square shape.
- Icon first, short label second.
- Avoid long pills full of prose.

### Close buttons
- Large enough for touch.
- Strong silhouette.
- Consistent placement across modals.

---

## 7. Depth and material

Target material feeling: **soft plastic + sticker + painted toy board**.

Use:
- 1 soft cast shadow;
- 1 subtle inner/highlight edge;
- mild gradient only where it creates volume;
- restrained gloss for rewards or premium events.

Avoid:
- glassmorphism as a default;
- tiny 1px borders;
- heavy blur everywhere;
- metallic/sci-fi material unless context requires it.

---

## 8. Icon system

Icons should:
- have chunky silhouettes;
- read at 32–48 px;
- use soft outlines;
- carry one idea per icon;
- feel like collectible stickers.

Priority icon families:
- money;
- dice;
- job;
- news;
- card;
- jail;
- hospital;
- mini-game;
- reaction;
- camera/mic;
- ready/reconnect;
- salary/reward;
- status effects.

Do not mix flat monochrome symbols with glossy illustrated icons on the same default surface unless there is a clear hierarchy reason.

---

## 9. Character/avatar direction

Player identity should become a visual anchor.

Target:
- chibi bust/headshot avatar;
- large face readability;
- simple background blob/ring;
- clear player colour frame;
- 3 expression states where available.

Recommended emotional set:
- neutral/confident;
- happy/win;
- shocked/lose/reaction.

Photo-derived avatars may be stylised later, but all outputs should land in one coherent chibi language rather than looking like four unrelated filters.

---

## 10. Player HUD

### Idle HUD
Show only:
- avatar;
- player name;
- money;
- job when relevant.

### Active HUD
- scale up moderately;
- stronger border/glow/marker;
- reveal one contextual line if required;
- stay fully inside safe area;
- never cover reaction bubbles or modal content.

Target active emphasis: roughly **+8% to +18%** visual scale, not giant zoom.

P1–P4 token/badge identity must remain visible during movement.

---

## 11. Board/world direction

The board should move away from “spreadsheet of tiles” and toward **toy-town diorama**.

Principles:
- path remains mechanically readable;
- important spaces become small landmarks;
- tiles blend into the world while retaining gameplay clarity;
- props are chunky and sparse;
- each district gets a recognisable colour/material family.

Suggested landmark treatment:
- **TIN TỨC**: kiosk/newsstand/broadcast icon;
- **LÁ BÀI**: card booth/fortune kiosk;
- **JOB**: office/job counter;
- **Hospital**: cute clinic;
- **Jail**: playful holding booth;
- **Mini-game**: festival/arcade landmark.

The world may be cute, but movement routes must remain unmistakable.

---

## 12. TIN TỨC / LÁ BÀI presentation

These should feel like events, not debug dialogs.

Default composition:
1. category badge/icon;
2. strong title;
3. event illustration or oversized icon;
4. concise body/result;
5. one dominant continue/choice action.

Keep the adaptive text fitter from 0.1.70.4.18.

Never:
- duplicate text layers;
- leak narration behind a blocking modal;
- shrink body copy into unreadable micro text;
- show technical mapping/explanation when a human-readable sentence works.

---

## 13. Job Hub

Visual direction:
- large friendly job icon/art;
- compact salary;
- short job name;
- clear selection state;
- optional detail view.

The default card should not become a résumé.

Primary instruction stays concise:
**“Đổ xúc xắc để chọn nghề”**

Preview must remain visible and readable on desktop and phone landscape.

---

## 14. Reaction system

Reactions should feel like **speech stickers**, not system notifications.

- rounded speech bubble;
- expressive icon/face;
- short copy;
- small pop/bounce animation;
- safe-lane placement;
- never cover the active HUD.

Current safe lanes from 0.1.70.4.18 remain the baseline until intentionally redesigned.

---

## 15. Modal and tutorial pattern

Tutorials should resemble visual recipe cards:

1. **BƯỚC 1 / STEP 1**
2. large screenshot/illustration;
3. one sentence;
4. visible hand/pointer only when necessary;
5. one primary action.

A blocking modal owns the screen. Background HUD and unrelated narration must visually recede.

---

## 16. Motion language

Motion should be short, soft and juicy.

Recommended timing:
- tap squash: **80–120 ms**;
- button release: **100–160 ms**;
- card/modal entrance: **160–240 ms**;
- reward pop: **220–360 ms**;
- active HUD emphasis: **160–220 ms**.

Use:
- small scale overshoot;
- soft bounce;
- sparkle burst for rewards;
- directional slide for cards.

Avoid constant looping animation on every UI element.

---

## 17. Mobile-first layout rules

Phone landscape is the acceptance baseline.

Requirements:
- primary buttons comfortably tappable;
- no critical copy below 14 px logical size;
- default body copy targets 18 px+ where space allows;
- safe-area margin is respected;
- active player card cannot clip at any corner;
- popups fit without browser zoom;
- no hover-only interaction;
- touch/click + keyboard remain the supported runtime inputs;
- browser Gamepad/Steam Deck controller routes are implemented and pass CI, but real-device acceptance is pending; every focused control must remain visible without a pointer.

---

## 18. Screen-by-screen priority

### P0 — Visual foundation
1. button component;
2. panel/modal component;
3. type scale;
4. colour tokens;
5. icon frame;
6. player HUD shell.

### P1 — Highest visibility
1. launcher / mode select;
2. lobby / ready;
3. avatar flow;
4. active-turn HUD;
5. TIN TỨC / LÁ BÀI;
6. Job Hub.

### P2 — Board identity
1. tile/landmark reskin;
2. token/marker polish;
3. reaction bubbles;
4. movement highlights;
5. mini-game entrance cards.

### P3 — Juice
1. transitions;
2. reward bursts;
3. micro-animations;
4. sound-reactive UI accents;
5. celebratory result screens.

---

## 19. What must NOT regress

Visual redesign must preserve:
- Host authority;
- deterministic RNG;
- reconnect ownership;
- CPU autoplay;
- WebSocket/media signaling;
- P1–P4 token badges;
- modal ownership;
- adaptive Card/News text fitting;
- HUD safe-area clamp;
- mobile landscape readability;
- current supported input contract.

Presentation may change heavily. Gameplay authority may not silently move.

---

## 20. Reference discipline

The supplied reference images are a **directional moodboard**.

Allowed inspiration:
- rounded proportions;
- colour warmth;
- chibi scale;
- toy-like depth;
- oversized readable CTA;
- tutorial hierarchy;
- sticker icon language.

Do not reproduce:
- logos;
- named characters;
- exact layouts;
- exact illustrations;
- proprietary iconography;
- game-specific copy.

Goal: **same level of friendliness and polish, distinct project identity.**

---

## 21. Acceptance checklist

A visual pass is accepted only when:
- current action is obvious within one second;
- mobile text is comfortably readable;
- primary button looks tappable;
- visual hierarchy survives without colour;
- no HUD/card clips;
- no text escapes its owner;
- modal ownership is clean;
- avatar/player identity is obvious;
- screen feels like one coherent toy-like product;
- it does not resemble a copied screen from another game;
- runtime authority remains unchanged.

---

## 22. First implementation recommendation

Do not reskin the whole game in one giant pass.

Recommended first milestone:

**Visual Foundation Pass**
1. define design tokens;
2. rebuild primary/secondary button skins;
3. rebuild common panel/modal shell;
4. reskin player HUD;
5. reskin one TIN TỨC card and one Job card as canonical examples;
6. validate desktop + phone landscape;
7. then propagate to the rest of the runtime.

This gives the project a reusable visual grammar before touching the full board.


---

## 23. Active implementation plan

The first implementation pass for this visual direction is:

`docs/VISUAL_FOUNDATION_PASS_0.1.md`

Implementation order:
1. button system;
2. panel/modal shell;
3. player HUD;
4. one canonical TIN TỨC sample;
5. one canonical Job sample.

Do not broadly reskin the game before this foundation passes desktop + real phone landscape validation.
