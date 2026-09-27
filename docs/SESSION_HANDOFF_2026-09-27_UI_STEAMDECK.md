# MMM — SESSION HANDOFF 2026-09-27 — UI containment + Steam Deck fullscreen next

## Authority / accounts
- Main source repo: `RVTGMzz/Mmm-BG`
- Branch: `mmm-mvp-0.1-core`
- Main/source GitHub account: `lengochung28191@gmail.com`
- `roneditor08@gmail.com` is ONLY for the public test mirror/site.
- Do not merge PR #1 unless Ron explicitly asks.
- Public playtest: https://ronvotri.github.io/MeMeMe-Web-Playtest/

## Latest validated source/public build
- Source HEAD: `d3f3c4f0ca04df03dc92ab5b222690e3568a96a8`
- MMM MVP CI #3278 / run `36309795629`: SUCCESS
- Compiled public mirror: `0fb399d83e52230fc9eadb960c62b0ac9c737987`
- GitHub Pages #45 / run `36309849515`: SUCCESS
- Runtime visual acceptance is still required. CI/Pages green is not visual PASS.

## What was fixed in the latest batch

### Mini Game / VF-07
Ron reported the first two Mini Game result/reveal screens still looked wrong.
Current changes include:
- result typography enlarged: dense 17px, normal 20px;
- result body narrowed to a safer 620px fixed width / 600px wrap;
- line spacing increased;
- ranking ribbon widened and heading anchored to the same ribbon y;
- ranking body typography enlarged.

Relevant source:
- `src/ui/MiniGameOverlay.ts`
- `src/ui/miniGameLayout070423.ts`
- `tests/visual-foundation-minigame-vf07.ts`

Latest commits in this chain:
- `964fc93a52401478f76cc628f334563dc27b2187` UI result/ranking containment
- `b62c79203e3f23ab621fb1fd02210b47c252c91d` readable VF-07 regression lock

Do not alter HOST RNG / reconnect / authoritative payout. Mini Game resolution remains through the authoritative system intent.

### Card / News containment
Ron supplied another real runtime screenshot where a News modal was empty while:
- `+25B$.`
- `→ CPU 4 nhận 25B$.`
were still rendered loose on the left.

This proves the long-running Card/News bug is NOT visually accepted yet.

Latest mitigation:
- kill all active legacy presentation child tweens immediately after legacy cinematic creation and before canonical rebuild, preventing an inherited typewriter reveal from continuing after children are replaced.
- regression locks this retirement.

Commits:
- `72a92ba51f8b0da2efbacd67cd836b83a4cebdef`
- `198ab38b987a0d3f6ccc6da64ed1ddc1eb8c5c54`

Important: if the loose text still reproduces, DO NOT add another title-specific hide rule. The architectural next move is a direct canonical Card/News visual producer that bypasses legacy visual body creation while preserving lifecycle/SFX/reactions/timing/continue semantics. Production logic must remain generic, never special-case reported card/news titles.

Visible labels remain exactly `TIN TỨC` / `LÁ BÀI`.

### Job result
Ron reported the Job result layout looked unbalanced, with content crowded left and excessive empty space.

Latest canonical Job landing changes:
- icon moved/rebalanced and enlarged to 54px;
- result title moved to `(44,-18)`, 29px;
- body moved to `(44,50)`;
- body is 18px normally / 19px for result;
- body box is 560×86, max 3 lines;
- retained one canonical Job owner and `presentation.finishCurrent(false)` lifecycle.

Source commit:
- `00b8b9c5b2a97288c6063921b4ec23af75e7b08e`

Regression updates:
- `78bae844cc9b986db226d504a3d126197ecda09a`
- `d3f3c4f0ca04df03dc92ab5b222690e3568a96a8`

CI #3276 and #3277 failed only because old tests locked the previous Job geometry. The tests were updated to the intentional new layout. CI #3278 is the final validated green run.

## Public deployment
The final validated Job/UI batch was published automatically:
- mirror commit `0fb399d83e52230fc9eadb960c62b0ac9c737987`
- message: `Publish compiled playtest d3f3c4f`
- Pages #45 SUCCESS.

## NEW runtime issue queued next: Steam Deck fullscreen
Ron supplied a Steam Deck runtime photo on 2026-09-27. The game fills width but leaves large light/white letterbox bars at the top and bottom.

Current root config:
`src/main.ts`
- logical game size: 1280×720
- Phaser scale: `FIT`
- autoCenter: `CENTER_BOTH`

`src/styles.css`
- `html, body, #app` are width/height 100%, overflow hidden, background `#f4ead7`.

Likely cause: preserving 16:9 with FIT inside Steam Deck's taller viewport. The next pass must make the Steam Deck presentation feel genuinely fullscreen without distorting the 1280×720 game or clipping important HUD/modal content.

Requirements for fullscreen pass:
1. no stretched/misshapen game;
2. remove the conspicuous top/bottom bars on Steam Deck;
3. preserve safe-area for HUD, Job/Card/News/Mini Game modals and controller focus;
4. do not regress mobile landscape;
5. do not change gameplay authority, Host/RNG/reconnect;
6. add a regression gate for Steam Deck-like viewport/aspect behavior;
7. run full CI, publish compiled mirror, verify Pages;
8. runtime/device screenshot still required before declaring visual PASS.

Runtime reference image existed in the chat as `167316.jpg`; do not assume it is stored in the repo.

## Workflow preference
Ron explicitly does not want tiny stop/start handoffs after every commit. In each active turn, do as much of the chain as possible:
inspect → implement → tests → CI → diagnose/fix failures → rerun → publish → verify.
Only stop for a real user decision/blocker or because an external CI run is still pending. Never claim background work continues after the response.

## Visual rules that remain locked
Read before UI work:
- `docs/VISUAL_STYLE_BIBLE_V0.1.md`
- `docs/VISUAL_FOUNDATION_PASS_0.1.md`

Mood: Chibi · Cozy · Rounded · Toy-like · Juicy · Playful · Readable.
Keep P1–P4 identity separate from gold active-turn treatment.
Steam Deck/controller focus must remain usable.
Fix shared/root systems, not individual screenshot content.

## New-chat first action
1. Read this handoff plus `HANDOFF_CURRENT.md` and `docs/LATEST_HANDOFF.md`.
2. Verify source branch is still at/after `d3f3c4f0...`.
3. Start the Steam Deck fullscreen/viewport pass.
4. After that, ask Ron to retest the same UI states and Steam Deck fullscreen. Card/News remains runtime-pending even though CI is green.
