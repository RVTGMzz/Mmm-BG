Current presentation containment checkpoint:
**Card/News container-owned content hotfix**

Validated source:
`8a1ca0b37c10c44d9cfb8b92607233728408761a`
- CI #3239 / run `36030534270`: SUCCESS
- mirror `e95b7caf9d190387d3327ebf66a6971499390974`
- Pages #31 / run `36030638473`: SUCCESS
- screenshot regressions Kéo Hai Cửa + Hoàn Tiền Bất Ngờ are now test fixtures
- do not reintroduce modal children via loose `this.add.text` in canonical Card/News rebuild
- keep semantic line-level detached-copy suppression generic, never card-title-specific

# NEXT CHAT PROMPT — Mmm-BG

Continue the board game from `HANDOFF_CURRENT.md` in repo `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-core`.

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/PRESENTATION_OWNERSHIP_AUDIT_070422.md`
4. `src/ui/presentationLanes070422.ts`
5. `src/ui/MatchPresentationLayer.ts`
6. `src/scenes/PresentationParityBoardScene.ts`
7. `src/scenes/CareerMinigameBoardScene07044.ts`
8. `tests/presentation-owner-rootfix-070422.ts`
9. `src/ui/JobChoicePicker.ts` and `src/ui/jobHubFocus070423.ts`
10. `tests/job-minigame-input-070410.ts`
11. `src/ui/MiniGameOverlay.ts` and `src/ui/miniGameLayout070423.ts`
12. `tests/job-minigame-depth-059.ts` and `tests/roguelike-lap-shuffle-071.ts`
13. `src/ui/steamDeckController070424.ts` and `src/ui/steamDeckPadPolicy070424.ts`
14. `tests/steam-deck-controller-070424.ts` and `docs/STEAM_DECK_WEB_070425.md`
15. `src/ui/visualFoundationV01.ts` and `src/visualFoundationV01.css` (VF-03)
16. `src/ui/visualFoundationHudVf04.ts` and `src/scenes/CareerMinigameBoardScene065.ts` (VF-04)
17. `tests/visual-foundation-hud-vf04.ts` and `docs/VISUAL_FOUNDATION_PASS_0.1.md`
18. `src/ui/visualFoundationNewsVf05.ts` and `tests/visual-foundation-news-vf05.ts` (VF-05)
19. `docs/CHARACTER_SYSTEM_SPEC_V0.1.md`, `src/core/characterSystem.ts` and `src/core/session.ts` (CH-01)
20. `docs/VISUAL_STYLE_BIBLE_V0.1.md` compact reference lock (September 24)
21. Ron's newest runtime screenshots/feedback

Current Character checkpoint:
**CH-02G — KHÓC NHÈ neutral layered runtime proof**

Validated latest Character source:
`0983a95fdf328e7ef68376226457c9fb63b5ef5c`
- CI #3236 / run `35978534196`: SUCCESS
- public mirror `c40aea0cd65af24ff18d3bfe90a459d80e8a0166`
- Pages #30 / run `35978666671`: SUCCESS
- KHÓC NHÈ / neutral now has real WebP body/mask/foreground runtime proof assets
- captured non-circular face source is rendered through the Character mask in Character Select
- asset is preview-sized 128×192; final 1024×1536 production socket is NOT yet authoritative
- other 3 starters remain on CH-02D fallback
- RANDOM remains concealed; normal Character Select must never preload Secret Baby art
- passives remain concept-only / live=false
- next: real-photo + Steam Deck/mobile fit acceptance; fix crop/socket before full neutral export and before generating the other six emotions

Historical checkpoint:
**CH-02A — Four-character starter roster locked**

Validated latest Character source:
`797c965e2cdfc97b282ca15c4d01460247a1426f`
- CI #3227 / run `35939124535`: SUCCESS
- starter archetypes: KHÓC NHÈ / CAU CÓ / LO LẮNG / TĂNG ĐỘNG
- canonical data: `src/content/core/characters_starter_v01.ts`
- canonical design sheet: `docs/CHARACTER_STARTER_ROSTER_V0.1.md`
- passives remain concept-only and `live: false`
- final names, gender presentation and art are not locked
- next: KHÓC NHÈ art proof + Character Select visual proof + face-on-Character preview
- before generating/designing Character art, obey the compact reference lock in `docs/VISUAL_STYLE_BIBLE_V0.1.md`: same chibi/cozy/rounded/toy-like world, warm cream/cocoa materials, logo-expression DNA, no photorealistic-body style drift

Historical foundation:
**CH-01.1 — Character System + non-circular face-source foundation**

Validated latest Character source:
`bfa7c9cb28688928c3d4d56c32c41ee60e837d05`
- CI #3226 / run `35938294090`: SUCCESS
- compiled mirror `b660aa8324a26f41c2a99907555484e767568b1e`
- Pages #27 / run `35938377240`: SUCCESS
- current circular avatar stays unchanged;
- face editor also stores a 512×512 non-circular transformed source for future Character sockets;
- no passive gameplay is live;
- next Character implementation: first real starter Character + Character Select proof, then face-on-Character preview.

Historical foundation immediately before it:
**CH-01 — Character System + face-composite foundation**

Validated Character source:
`6fb9b7129512439ec32909726da7e5a3197c1fe2`
- CI #3225 / run `35937980934`: SUCCESS
- compiled mirror `5e23515240745c7b84301277fe82669ab2729074`
- Pages #26 / run `35938077099`: SUCCESS
- final direction: Character required before match once CH-02 UI exists; Character owns body/poses/reaction profile/passive IDs; human player owns face/name/seat;
- do not make circular crop the future Character default;
- no passive gameplay is live yet;
- do not invent the final roster without Ron's art/design review;
- next technical Character step: retain non-circular face source for compositing, then first real Character + Character Select proof.

Current checkpoint:
**0.1.70.4.22 — Presentation Single Owner + Safe Reactions**

Current validated source HEAD:
`b86d9b5283658953b2b17fee52173acae858e21f`

Important:
- recurring overlay bug was traced to duplicate visual producers + horizontally unsafe reaction geometry + stale reaction timers + permissive final whitelisting;
- both legacy toast producers are now disabled;
- reactions use tested 212px side rails and exact event ownership;
- final modal guard runs again in POST_UPDATE;
- do not add another content-specific hide rule unless new evidence proves a separate producer;
- do not touch Host authority/RNG/reconnect/WebRTC for this presentation bug;
- do not call Runtime PASS before real browser retest.

Also retain:
- Visual Foundation VF-01/02 live; VF-03 shared shell with Avatar Choice modal CI #3220/PAGES #23 PASS; VF-04 four-corner HUD source with exact bounds CI #3222/PAGES #24 PASS but device review still required; next VF-05 first canonical TIN TỨC / LÁ BÀI after runtime feedback;
- Roguelike Lap Shuffle implemented, circular tile hotfix landed, runtime retest still pending;
- PR #1 stays Draft/Open;
- never merge PR #1 unless Ron explicitly asks;
- keep visible labels TIN TỨC / LÁ BÀI.

Newest follow-up:
- source `f1b94158ed273d7347795a72c29e9af0bd8fbc63` adds Enter/Space to authoritative Job Hub dice;
- CI #3213 PASS; mirror `05dc1532f7ef9dda39392f0ca9a44dc3204b1f21` and Pages #17 SUCCESS;
- test mouse/Enter/Space parity, spectator/waiting lock and A/B/C/ESC detail controls in browser;
- visual acceptance remains open for the broader Job layout and border-naturalness feedback.

Latest CI #3214 SUCCESS, mirror `a24b90417b018198651f61bb0e1e8d75fb36412b`, Pages #18 SUCCESS. Four runtime screenshot issues to verify in next session: (1) RPS duel labels/result and HUD layer, (2) Job Hub Enter/Space dice (already shipped with CI #3213), (3) arbitrary News/Card detached text/reactions (source .22, browser proof still required), (4) post-Lap Shuffle double rings (new .23 in-place canonical circle update). Never confuse CI PASS with runtime acceptance.

Latest Job Hub keyboard-only milestone: `a91fbb10ffaaa9710393f541e6b1017b0459ec01`, CI #3215 SUCCESS, compiled mirror `636c4662b72c8adecae7f5d26f7b0421fe99a7a2`, Pages #19 SUCCESS. Visible keyboard focus starts on the dice, arrow keys/Tab move between offered jobs and dice, Enter/Space opens detail or rolls according to focus, detail can be closed without mouse. Runtime acceptance still required for complete mouse-free flow.

Newest Steam Deck .25 source `6f9507e1cff75914b56bf0f4a75ac6e7de27abb8`, CI #3219 SUCCESS, mirror `473fcf21a0a7797d7525309eac00a210e061c281`, Pages #22 SUCCESS. Mouse-free browser Gamepad play from Splash, CHỌN CÁCH CHƠI mode A-edit/↑↓/A-save/B-cancel, Setup, Roll For Order, authoritative board D6, Job Hub default dice, branch/target cards, Mini Game, and final result input is source-implemented and automatically gated, but requires a real Steam Deck/Steam Input/Chromium retest before any Runtime PASS statement. Current latest docs in `docs/STEAM_DECK_WEB_070425.md`.

Current latest visual milestone is `b86d9b5`, CI #3224 SUCCESS, compiled mirror `7e1ad18f1c1d593f595a26da2d7e0c896043ecdd`, Pages #25 SUCCESS. VF-04.1 keeps active outer GOLD turn signal and INNER P1-P4 seat-colour identity separated by a 4px gutter; 220ms marker animation. VF-05 samples only TIN TỨC with warm paper inside the original .22 owner, preserving News/Card reaction lanes. Read updated `docs/VISUAL_FOUNDATION_PASS_0.1.md` before next style changes, and do not reskin all cards at once. Device and overlay-leak acceptance remain pending.

At session start, first verify the latest GitHub Actions result for the current branch HEAD, then continue from Ron's newest runtime feedback.
