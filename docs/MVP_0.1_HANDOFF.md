# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.4 — Tin Tức + Reaction Sequencer**

Mục tiêu milestone: hoàn thiện nốt 2 phần còn thiếu trong vertical slice đầu tiên: `Tin Tức` data-driven và auto-reaction có delay/overlap nhưng không block turn.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City test board data-driven 18 node.
- 4 player + TurnManager + D6 + tween movement.
- READY lap reward + money tiles.
- Ô Lá Bài và Tin Tức đều đã có runtime effect.

### Face runtime
- Setup 4 người chơi.
- Nhập tên riêng từng player.
- 3 expression slots: `neutral`, `happy`, `angry`.
- Neutral bắt buộc; expression thiếu fallback về neutral.
- Ảnh center-crop 256×256 thành sticker ngay trong browser.
- Ảnh chỉ giữ trong memory phiên chơi, chưa upload server.
- Face token và expression runtime đã hoạt động.

### Personality PoC
`GameSession` hiện gắn tạm 4 personality cho 4 ghế để chứng minh reaction text có thể đổi theo người chơi:

- P1: `mean`
- P2: `whiny`
- P3: `gossip`
- P4: `chill`

Đây chỉ là **PoC assignment**, chưa phải UX/final personality system. Có API `setPersonality()` để thay đổi sau này mà không sửa reaction renderer.

### Lá Bài 0.1.3
Runtime deck tại `src/content/core/cards_mvp.json` vẫn chỉ dùng đúng 4 card có dữ liệu thật trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự fill các Card_ID còn trống.

Target Picker, weighted draw, `cardBlockTurns`, swap money và effect resolver giữ nguyên từ 0.1.3.

**Lưu ý `Triệu Hồi Hắc Ín`:** source ghi “30% tổng tài sản”; MVP chưa có property/job/pet asset layer nên runtime tạm áp 30% lên B$, không sửa text source.

### Tin Tức 0.1.4
Có runtime schema mới tại `src/core/news.ts` và demo data tại `src/content/core/news_mvp_demo.json`.

Hiện có 3 entry **DEMO** để test engine:

- `NEWS_DEMO_001 — Hoàn Tiền Bất Ngờ`: +60B$ cho người đáp ô.
- `NEWS_DEMO_002 — Ví Bay Màu`: -80B$ cho người đáp ô.
- `NEWS_DEMO_003 — Hóa Đơn Cả Nhóm`: -40B$ cho mọi người.

**Quan trọng:** source gốc hiện chỉ có `news_template.csv`, chưa có nội dung Tin Tức đã được duyệt. Vì vậy 3 entry trên là nội dung PoC do dev tạo để test schema/runtime, **không được coi là content final/approved**.

Tin Tức dùng weighted draw giống deck Lá Bài, apply state ngay, đổi face expression của người bị ảnh hưởng và mở overlay có mặt thật của subject.

### Reaction Sequencer 0.1.4
Reaction data nằm tại `src/content/core/reactions_mvp_demo.json`.

Sequencer đọc:
- `sequence`
- `delayMs`
- `speakerRole`
- `expression`
- personality variants
- `sfxId`
- `durationMs`
- `canOverlap`
- `blocking`

`CARD_ATTACK_DEMO` giữ timing từ template đã có trong repo:
- caster: 0ms
- target: 700ms
- spectator: 1400ms

Reaction bubble lấy đúng face expression + tên người chơi runtime. Text được chọn theo personality tag của speaker.

Reaction **không return Promise và không được await**, nên gameplay state/turn tiếp tục trong lúc bubble còn đang chạy. Đây là behavior cố ý để chứng minh `presentation != gameplay state`.

Hiện SFX mới tồn tại dưới dạng `sfxId` trong data; chưa có audio asset/playback.

**Quan trọng:** câu reaction trong JSON hiện là text PoC để test personality/timing, chưa phải writing final.

### Dynamic presentation
- `CardOverlay`: ghép Caster/Target runtime.
- `NewsOverlay`: ghép subject + expression runtime.
- `ReactionSequencer`: bubble caster/target/subject/spectator có thể overlap.
- HUD tạm hiện personality tag để dễ QA 0.1.4.

## File chính

- `src/core/cards.ts` — Lá Bài weighted draw + effect resolver.
- `src/core/news.ts` — Tin Tức weighted draw + effect resolver.
- `src/core/reactions.ts` — reaction schema, speaker resolution, personality variant, variable interpolation.
- `src/core/session.ts` — face + personality PoC.
- `src/content/core/cards_mvp.json` — 4 Lá Bài source-backed.
- `src/content/core/news_mvp_demo.json` — Tin Tức demo, không phải content final.
- `src/content/core/reactions_mvp_demo.json` — reaction demo, không phải writing final.
- `src/ui/CardOverlay.ts` — dynamic card presentation.
- `src/ui/NewsOverlay.ts` — Tin Tức presentation.
- `src/ui/ReactionSequencer.ts` — non-blocking reaction bubbles.
- `src/ui/TargetPicker.ts` — chọn mục tiêu.
- `src/scenes/BoardScene.ts` — nối board/card/news/reaction vào turn flow.

## Chưa triển khai

- inventory/giữ Lá Bài để dùng sau;
- rarity-first pool khi mỗi rarity có nhiều card;
- Tin Tức content final;
- personality setup UX/final taxonomy;
- audio asset + SFX playback;
- camera capture;
- face detection / background removal;
- ngã rẽ chẵn-lẻ;
- Job / Pet / Minigame;
- multiplayer online;
- town-building.

## Milestone kế tiếp đề xuất

**MVP 0.1.5 — Card Inventory + Use Timing**

Hiện ô Lá Bài đang `draw → cast` ngay để test effect pipeline. Bước kế nên tách thành:

1. đáp ô Lá Bài → rút vào hand;
2. hand có giới hạn nhỏ;
3. người chơi tự chọn thời điểm dùng card;
4. card bị Khóa Mõm thì không thể dùng;
5. Target Picker chỉ bật khi thật sự play card;
6. giữ presentation/reaction non-blocking sau khi state resolve.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction không block turn. ✅ PoC đầu.
