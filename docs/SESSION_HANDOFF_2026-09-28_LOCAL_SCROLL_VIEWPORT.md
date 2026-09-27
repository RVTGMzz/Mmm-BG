# MMM — local scroll viewport repair and density pass

## Authority
- Source: `RVTGMzz/Mmm-BG`, branch `mmm-mvp-0.1-core`.
- Source account: `lengochung28191@gmail.com` / RVTGMzz.
- Follow-up to `SESSION_HANDOFF_2026-09-27_RUNTIME_UI_REGRESSION.md`.
- User acceptance remains pending. CI success alone is not visual acceptance.
- Do not merge PR #1, start 0.1.71, alter Worker/Host RNG/reconnect, or activate Character passives.

## Evidence reviewed
All nine original JPEGs were retrieved and visually inspected:
- `167345.jpg`: Roll For Order helper/status readability and empty lower area.
- `167346.jpg`: retained board/HUD/token context.
- `167348.jpg`, `167354.jpg`: blank Card bodies (Ví Ai Nấy Lo, Trượt Tay).
- `167349.jpg`, `167350.jpg`: blank Job result bodies.
- `167351.jpg`, `167353.jpg`: ranking left-edge cropping, tiny helper copy, empty header/paper.
- `167352.jpg`: News body reduced to a small trailing fragment.

## Architectural correction
`scrollableTextViewport070429.ts` no longer accepts caller-supplied worldX/worldY or creates a GeometryMask. It crops the Text's own texture in local coordinates, using resolution 1 so texture crop units equal layout units. Text position, clip, hit rectangle, rail, thumb and height all derive from the same owner. Parent movement, scale, rotation and camera rendering transform the cropped text as one object.

Scrolling changes local text Y and local texture crop Y together. Dragging inverts the complete owner transform instead of subtracting screen-space pointer Y. Input listeners are removed on destruction. Fixed font sizes are retained; long copy scrolls, short copy can choose a measured minimum height.

## Density/readability
- Card/News paper now derives its lower edge and body inset from measured content height, within existing modal/reaction bounds. Transfer footer moves with body height. Decorative tabs stay inside compact paper.
- Job body is 21px; eyebrow/die/hint enlarged; paper and hit area derive from measured body height.
- Mini Game result/ranking body is 23px; winner voice 19px; footer 17px. Ranking removes the unused header band and compacts both inner and outer paper. Result paper compacts around short copy.
- Roll For Order applies its readable type pass on desktop and Deck, not only compact-landscape detection. Owner/rank/status/helper copy is enlarged.
- No gameplay, event model, deterministic RNG, payout or network authority changes.

## Validation
Implementation commit: `0294a946b27df09cc285cdbe8cfd4f41aea83ab6`.
Local typecheck/build/package verification passed.
Local source gates were run through `node --import tsx` because the tsx CLI IPC socket is blocked in this environment. Old non-CI replay snapshots 0612/062/0634 still have checksum drift; they were not changed. The live Worker test failed locally at ready.canStart; retain remote CI as the network test result.

New real-render gate: `node tests/runtime/scroll-viewport.mjs` against Vite. Uses Playwright and Phaser WebGL + Canvas, checks actual pixels for visible text, intact left glyphs and zero out-of-viewport white pixels, then nested movement/nonuniform scale/rotation, bottom scroll, scaled drag, wheel and listener cleanup. It also captures actual production UI producers (Card, News, Job, long Card, Mini Game ranking, Roll For Order) at 1280×800 and 960×540. Fixture pages are test-only and are not included in the Vite production entry.

CI uploads `runtime-ui-evidence` before publishing the compiled mirror. CI #3307 / run 36335066770: SUCCESS, including the live Worker test and new real-render gate. Pixel checks passed in WebGL and Canvas for nested/moved/scaled/rotated/bottom-scrolled text: outside pixels = 0; left glyph pixels > 200. Twelve production-producer screenshots were retrieved and visually inspected.

That visual review found the enlarged Roll For Order helper overlapped its status. Follow-up sets an explicit top origin and separated Y positions, compacts the outer frame when the roll button is hidden, and adds a bounding-box gap assertion. The follow-up also compacts Mini Game result outer paper, restores shell geometry on stage transitions, tests camera scroll/zoom, and covers pointer release outside the canvas. Ranking evidence now includes a real Character winner voice.

Initial mirror: ba3727b (compiled 0294a94).

## Final automated/browser checkpoint
- Runtime source: `f0f1814b736da53fac95e78b6161a899a452d998`.
- MMM MVP CI #3308 / run `36335397011`: **SUCCESS**, including all retained workflow gates, live online smoke, package validation, and the new browser gate.
- Public mirror: `bcfc11f6d1e08959ff6b035aada45dcebb217d9c`.
- Publish playtest Pages #57 / run `36335598563`: **SUCCESS**.
- Playtest: https://ronvotri.github.io/MeMeMe-Web-Playtest/
- Runtime screenshot artifact: `10937167012`, `runtime-ui-evidence`, attached to CI #3308.
- WebGL and Canvas nested/moved/scaled/rotated/bottom/camera-scroll-zoom fixtures all passed actual-pixel clipping checks (outside = 0). Scaled pointer dragging, wheel scrolling and listener cleanup passed.
- All six production-producer fixtures rendered at 1280×800 and 960×540. Images were downloaded and visually inspected. Job/Card/News bodies are visible, ranking starts with medal + Hạng, Character winner voice is visible, and Roll For Order status/helper no longer overlap. The new gap assertion also passed.
- These are isolated real Phaser production-producer fixtures, not a complete human-played online match or an actual Steam Deck test. Do not mark device acceptance PASS until Ron confirms.
- No additional gameplay feature work was started.

## Device acceptance still required
On the updated public playtest, check the same nine screenshot situations. All body copy must be visible, ranking starts with medal/Hạng, long copy scrolls without leaking or dismissing on pointer-down, short panels are compact, and secondary text is legible. Verify on the actual Steam Deck; headless screenshots cannot substitute for that acceptance.
