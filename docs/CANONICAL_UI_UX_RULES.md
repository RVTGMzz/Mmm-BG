# MeMeMe — Canonical UI / UX Rules

Status: **MANDATORY DESIGN CONTRACT**

These rules apply to every current and future MeMeMe board-game screen, HUD, modal, popup, card, controller flow and mobile layout unless Ron explicitly approves an exception.

The purpose is to prevent a recurring pattern of adding too much information, shrinking text to make it fit, then rebuilding the UI later.

## 1. Mobile readability is the baseline

Design for a real phone in landscape first, then let desktop and Steam Deck benefit from the extra room.

A UI is not accepted merely because it fits at 1280×720. It must remain comfortably readable after Phaser FIT scaling on a typical phone.

Critical information must never depend on tiny copy.

## 2. Summary first, detail on demand

Default surfaces show only the information needed for the current decision.

Detailed explanations belong behind focus, touch/click, controller confirm, keyboard confirm, a dedicated detail panel, or a contextual modal.

Do not permanently display information only because it exists in the data model.

## 3. Maximum three persistent information lines

A normal persistent HUD/card should target at most three readable information lines.

For player HUD cards the canonical default is:

1. player identity;
2. money;
3. current job name/level when a job exists.

Do not permanently show zero-value counters, unused card counts, empty job salary, lap/debug markers, lock state, or explanatory prose unless the current interaction requires them.

## 4. Idle player HUD is compact; active player HUD expands

The four corner player cards use two visual states.

### Idle state

Keep the card compact and quiet. Show only:
- player name / seat;
- current B$;
- job name/level when applicable.

### Active-turn state

The current player's card must become visibly more prominent without relying on colour alone.

It may:
- scale up moderately;
- strengthen border/contrast;
- show one extra context line such as salary, status, or the information needed for the current action.

When the turn changes, the previous card returns to compact state and the new active card expands.

The active-turn presentation must remain inside its safe HUD area and must not cover central gameplay or modal content.

## 5. Focus must communicate interaction

Any selectable card or option must have a clear focus state usable with:
- touch/click;
- keyboard;
- controller / Steam Deck.

Do not design an interaction that only works with hover.

Focused content may reveal more information, but focus must not permanently make all cards verbose.

## 6. Job Hub uses compact cards plus optional details

The default Job Hub card shows only:
- A / B / C slot identity;
- D6 range;
- job icon/art;
- job name;
- compact Lv1 / Lv2 / Lv3 salary line;
- one short identity/risk tag.

Long prose, percentage/risk breakdowns, progression explanations and flavour text do **not** belong on the default card face.

Detailed Job information opens on deliberate input:
- touch/click the Job card;
- controller confirm;
- Enter/Space while focused.

Close detail with controller back, Esc, outside tap/click, or the explicit close action.

This rule is intentionally future-proof for illustrated Job cards: art gets room first; prose moves to details.

## 7. Contextual information beats permanent information

If information matters only during one action, reveal it only during that action.

Examples:
- salary details while inspecting a Job;
- card inventory while choosing a card;
- lap progress when approaching/end-of-lap state needs it;
- status explanation while affected by that status.

Do not make the main board HUD a permanent database dump.

## 8. Modal priority is absolute

A blocking modal owns the player's attention.

While a blocking modal is open:
- hide or suppress unrelated top HUD controls;
- hide unrelated floating narration;
- hide legacy result text behind it;
- prevent reaction bubbles or secondary overlays from competing with it unless explicitly part of the modal flow.

No text may visibly leak through, behind, outside, or across a blocking modal.

Dimmed background is visual context, not a second information layer.

## 9. Text must stay inside its owner

Every text object must have an explicit owner surface and layout boundary.

Long text must use one or more of:
- concise copy;
- word wrap;
- max width;
- line clamp;
- scroll/detail view when truly necessary.

Never solve overflow by shrinking critical text until it becomes difficult to read.

If content cannot fit comfortably, remove it from the default surface and move it to contextual detail.

## 10. Floating bubbles must respect viewport edges

Reaction bubbles, tooltips and transient callouts must choose a safe direction based on screen position.

Near the right edge they open left; near the left edge they open right. Near top/bottom edges they reposition as needed.

Every bubble needs a maximum width and wrapped/clamped copy.

No floating UI may run outside the 1280×720 logical viewport or underneath fixed mobile controls.

## 11. One action, one dominant message

At any moment the screen should have one dominant action/message.

Examples:
- rolling dice;
- choosing a Job;
- reading a News event;
- resolving a result;
- selecting a branch;
- viewing Podium.

Secondary text should not compete with the dominant action.

## 12. Reduce copy before reducing font size

When a layout becomes crowded, use this order:

1. remove duplicate information;
2. shorten copy;
3. move detail behind interaction;
4. reorganize layout;
5. only then adjust typography modestly.

Shrinking text is the last resort, not the first response.

## 13. Touch, controller and keyboard have feature parity

Any core action available by touch/click must also have an understandable controller/keyboard route when the platform supports those inputs.

Cards/options require deterministic focus order and visible focus.

Controller users must be able to open and close the same detail views as touch users.

## 14. Do not encode meaning only by colour

Active turn, selected option, danger, disabled state and success/failure need at least one additional cue such as scale, icon, border, label, motion or shape.

This also improves readability on dim mobile displays and Steam Deck.

## 15. UI changes must preserve gameplay authority

Presentation work must not introduce:
- client RNG;
- alternate MatchState mutation paths;
- extra submitIntent paths;
- duplicated gameplay state solely to drive visuals.

UI derives from authoritative state and presentation state only.

## 16. Required review questions for every new screen

Before a new UI is considered done, answer yes to all of these:

- Can it be read comfortably on a phone in landscape fullscreen?
- Is the current action obvious within one second?
- Is there any text that can be removed from the default view?
- Can details be opened deliberately instead of shown permanently?
- Does every text block stay inside its owner?
- Do blocking modals suppress unrelated UI?
- Can touch and controller users reach the same core information/actions?
- Does focus remain obvious without relying only on colour?
- Does the screen still work without changing authoritative gameplay logic?

If any answer is no, the UI is not finished.

## 17. Canonical implementation direction from 0.1.68.2

0.1.68.2 is the first implementation pass required to follow this contract end-to-end:
- compact idle player HUD;
- expanded active-turn HUD;
- compact Job Hub cards;
- on-demand Job detail interaction;
- modal ownership cleanup;
- floating text/bubble viewport containment.

Future content-depth and visual-art passes must preserve these rules instead of reintroducing dense permanent copy.
