# MeMeMe — Canonical UI / UX Rules

Status: **MANDATORY DESIGN CONTRACT**

These rules apply to every current and future MeMeMe screen, HUD, modal, popup, card and mobile layout unless Ron explicitly approves an exception. Controller support is deferred until it receives its own runtime acceptance pass.

The purpose is to prevent the recurring loop of adding too much information, shrinking text to make it fit, then rebuilding the UI later.

## 1. Mobile readability is the baseline
Design for a real phone in landscape first. A UI is not accepted merely because it fits at 1280×720. Critical information must never depend on tiny copy.

## 2. Summary first, detail on demand
Default surfaces show only what is needed for the current decision. Long explanations belong behind focus, touch/click, keyboard confirm or a dedicated detail panel.

## 3. Maximum three persistent information lines
A normal persistent HUD/card should target at most three readable lines. Player HUD default: identity, money, job name when applicable. Do not permanently show zero-value counters or explanatory prose.

## 4. Idle player HUD is compact; active player HUD expands
Idle cards stay compact. The active player's card scales up moderately, strengthens focus without relying on colour alone, and may reveal one extra context line such as salary/status. The expanded card must stay inside its HUD safe area.

## 5. Focus must communicate interaction
Selectable cards need a clear focus state for touch/click and keyboard. Never require hover for a core action. Do not advertise controller input until the controller runtime is accepted.

## 6. Job Hub uses compact cards plus optional details
Default Job cards show only slot/D6 range, art/icon, job name and compact salary. Long prose and percentage breakdowns stay out of the default surface. A concise preview opens with touch/click or keyboard and closes with Esc, outside tap/click or explicit close.

## 7. Contextual information beats permanent information
If information matters only during one action, reveal it only during that action. The board HUD must not become a permanent database dump.

## 8. Modal priority is absolute
A blocking modal owns attention. Hide unrelated top HUD, narration, legacy result text and competing bubbles. No text may leak through, behind, outside or across a blocking modal.

## 9. Text must stay inside its owner
Every text object needs an owner and layout boundary. Use concise copy, wrap, max width, clamp or detail view. Never solve overflow by shrinking critical text until it is hard to read.

## 10. Floating bubbles must respect viewport edges
Reaction bubbles/tooltips choose a safe direction, stay inside the 1280×720 logical viewport and fixed mobile controls, and use bounded wrapped/clamped copy.

## 11. One action, one dominant message
At any moment the screen should have one dominant action/message: roll, choose, read, resolve, branch or podium. Secondary copy must not compete.

## 12. Reduce copy before reducing font size
When crowded: remove duplicate information → shorten copy → move detail behind interaction → reorganize layout → only then adjust typography modestly.

## 13. Touch and keyboard are the supported input surface
Core actions and details reachable by touch/click need understandable keyboard routes where supported. Controller helpers may remain in source, but must not be wired into runtime or advertised until a dedicated controller milestone is accepted.

## 14. Do not encode meaning only by colour
Active turn, selected option, danger, disabled and success/failure states need another cue such as scale, icon, border, label, motion or shape.

## 15. Soft rounded surfaces are the default shape language
Ordinary MeMeMe cards, panels, modals, buttons, inputs, badges and interactive rectangles use **soft rounded corners by default**.

Do not ship harsh square-corner UI simply because a primitive rectangle is easier to create. Square corners are allowed only when the visual meaning intentionally requires them and the exception is explicit.

Use a consistent family of corner radii instead of random rounding. Full-screen dimmers/background fills are not considered cards and may remain edge-to-edge.

## 16. UI changes must preserve gameplay authority
Presentation work must not introduce client RNG, alternate MatchState mutation paths, extra submitIntent paths or duplicated gameplay state solely to drive visuals.

## 17. Required review questions for every new screen
Before a UI is done: Is it comfortably readable on phone landscape? Is the current action obvious within one second? Can default text be removed? Can detail open deliberately? Does every text stay inside its owner? Do modals suppress unrelated UI? Do touch/click and keyboard reach the supported core actions? Is focus obvious without colour alone? Are ordinary surfaces softly rounded? Does gameplay authority remain unchanged?

## 18. Implementation history and forward rule
0.1.68.2 is the first implementation pass required to follow this contract end-to-end: compact idle HUD, expanded active HUD, compact Job cards, on-demand Job details, modal ownership and safe bubbles.

0.1.69 **First Impression Polish** extends the permanent contract with owned/bounded player career labels, simplified first-run screens, compact Job results, the official logo splash, larger default copy and the soft-rounded shape language.

0.1.70.4.6 **UI Interaction Pass** adds one-entry avatar selection with four large choices, clamped active-player HUD expansion, concise Job selection with on-demand preview, and explicitly keeps controller runtime disabled until a future acceptance pass.

Future content/art passes must preserve these rules instead of reintroducing dense tiny-text HUDs or harsh square UI.

## 19. Official brand assets are committed binary masters
The canonical splash logo is `public/assets/mememe-logo-main.png`, a 1024×1024 transparent PNG committed directly to the repository.

Runtime splash/menu branding must reference that binary master directly. Do not regenerate the official logo from text, base64 fragments, temporary vector placeholders, downscaled WebP exports or synthetic substitutes.

If the repository connector cannot safely write a binary replacement, ask for a manual GitHub upload instead of spending build time reconstructing the asset through text. After replacement, CI must verify the PNG signature, 1024×1024 dimensions and transparency before publication.
