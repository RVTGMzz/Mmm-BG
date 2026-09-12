# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.10 — Deterministic Replay CI + Desync Diagnostics**

Mục tiêu milestone: biến deterministic replay từ QA thủ công trong browser thành regression gate chạy headless trên GitHub Actions, có golden checksum cố định và báo chi tiết state nào bị lệch thay vì chỉ báo `MISMATCH`.

## Đã triển khai

### Core board
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City graph data-driven 20 node.
- 4 player + D6 + tween movement.
- 1 ngã rẽ thật tại node 4.
- READY lap reward + money tiles.
- Lá Bài + Tin Tức đều có runtime flow.

### Face runtime + personality PoC
- Setup 4 người, tên riêng + 3 expression: `neutral`, `happy`, `angry`.
- Face xử lý local trong browser, chưa upload server.
- Reaction personality vẫn là assignment PoC theo ghế để test engine, chưa phải taxonomy/UX final.
- Face texture/Phaser object không nằm trong MatchState.

### Lá Bài source-backed
Runtime deck vẫn chỉ dùng đúng 4 Lá Bài hiện có dữ liệu thật trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự điền Card_ID còn trống.

**Known source/runtime mismatch cần xử lý ở milestone sau:** text nguồn của `ACT_001` nói target ngẫu nhiên, nhưng data runtime hiện vẫn dùng `single_other` + TargetPicker. Core 0.1.10 đã có scaffold `random_other` + seeded target helper/replay validation, nhưng chưa bật cho ACT_001 để tránh đổi hành vi giữa milestone CI này mà chưa update BoardScene/UI đầy đủ.

### Card Inventory + Use Timing
Giữ nguyên:

`Đáp ô Lá Bài → weighted draw → card vào hand → trong cửa sổ pre-roll mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

PoC rule constants vẫn là:
- hand limit: `3` card;
- tối đa `1` card/lượt.

Đây không phải luật final.

### Branching Board Graph
Giữ nguyên:
- board dùng `nodes + edges`;
- player lưu `nodeId`;
- graph được validate trước khi scene chạy;
- ngã rẽ node 4:
  - `PHỐ CHÍNH`: 4 → 5 → 6 → 7
  - `HẺM TẮT`: 4 → 18 → 19 → 7
- mode mặc định `manual` bật BranchPicker;
- mode `odd_even` chỉ là config test legacy, chưa phải luật final.

### Turn Phase State Machine
Giữ nguyên:

`TURN_START → PRE_ROLL_ACTION → ROLLING → MOVING → RESOLVING_TILE → TURN_END → TURN_START`

Phase tương tác chen vào:
- `PRE_ROLL_ACTION ↔ CARD_ACTION`
- `MOVING ↔ BRANCH_CHOICE`

Phase + revision nằm trong MatchState.

### Serializable MatchState + Seeded RNG
Giữ nguyên 0.1.8/0.1.9:
- MatchState schema v2;
- seed + serializable xorshift32 state + RNG call count;
- current player / turn / phase / revision / last roll;
- toàn bộ PlayerState;
- command log gameplay;
- event log presentation/debug;
- snapshot JSON restore ở safe pre-roll point;
- replay driver rebuild gameplay từ seed + command stream;
- checksum FNV-1a trên gameplay-critical state.

Gameplay randomness đi qua seeded stream cho:
- D6;
- weighted Card draw;
- weighted News draw;
- spectator selection;
- scaffold random-other card target nếu mode đó được bật sau này.

### Deterministic Replay CI 0.1.10
File mới: `tests/replay-determinism.ts`.

Fixture headless dùng:
- seed cố định: `123456789`;
- 24 gameplay commands;
- 20 lượt roll;
- 4 branch choices đi `PHỐ CHÍNH`;
- runtime City board/Card/News JSON thật của repo.

Fixture chạy replay **hai lần độc lập** và assert:
1. không có replay error;
2. consume đủ command stream;
3. hai run có checksum giống nhau;
4. gameplay state diff giữa hai run bằng 0;
5. checksum phải đúng golden value: `9eabc37c`.

Kết quả CI hiện tại:

`[replay-ci] PASS seed=123456789 commands=24 checksum=9eabc37c rngCalls=29`

Golden checksum là regression lock. Nếu gameplay deterministic cố ý thay đổi, checksum phải được xem xét và update có chủ đích, không tự động nuốt thay đổi.

### Desync Diagnostics 0.1.10
File mới: `src/core/desync.ts`.

`diffMatchStates(left, right)` so gameplay-critical state theo path cụ thể, bao gồm:
- schema/board/seed/starting money;
- RNG seed/state/call count;
- turn/current player/last roll/phase/revision;
- từng player: name, node, money, card lock, hand, per-turn card counter.

Event log và command history không được dùng để kết luận gameplay checksum, đúng với contract của `computeMatchChecksum()`.

Fixture CI tự tạo một peer giả bị lệch để kiểm tra diagnostics. Sample output đã xác nhận được:

`rng.calls: 29 → 30 | players.1.nodeId: 16 → 18 | players.1.money: 900 → 920`

### GitHub Actions 0.1.10
Workflow `.github/workflows/ci.yml` hiện chạy:
1. install dependencies;
2. `npm run build` — TypeScript + Vite production build;
3. `npm run test:replay` — deterministic replay fixture + desync diagnostic assertions.

`tsx` được thêm như dev dependency để chạy fixture TypeScript headless trên Node 22.

## File chính

- `src/core/matchState.ts` — serializable gameplay source-of-truth + command/event log.
- `src/core/rng.ts` — seeded xorshift32.
- `src/core/replay.ts` — deterministic command replay.
- `src/core/checksum.ts` — gameplay checksum.
- `src/core/desync.ts` — field-level state diff diagnostics.
- `src/core/turnPhase.ts` — phase machine bind vào snapshot state.
- `src/core/board.ts` — graph lookup/validation.
- `src/core/cards.ts` / `src/core/news.ts` / `src/core/dice.ts` — deterministic-runtime helpers.
- `tests/replay-determinism.ts` — golden replay fixture.
- `.github/workflows/ci.yml` — build + replay regression gate.
- `src/scenes/BoardScene.ts` — browser runtime + save/load/verify hotkeys.

## Browser QA hotkeys
Ở `PRE_ROLL_ACTION`:
- `S` — save MatchState JSON vào localStorage;
- `L` — restore snapshot + rebind phase/RNG + snap token về node;
- `V` — replay command stream từ seed và so checksum live/replay.

## Chưa triển khai

- bật ACT_001 thành random-target đúng text nguồn trong BoardScene/UI;
- browser UI hiển thị full field-level desync report;
- multiplayer/network transport thật;
- lockstep peer simulator;
- command envelope có expected turn/revision/checksum;
- save slot/persistence UI final;
- luật hand limit/card-per-turn final;
- discard/replace UX khi tay đầy;
- rarity-first pool khi mỗi rarity có nhiều card;
- Tin Tức content final;
- personality setup UX/final taxonomy;
- audio asset + SFX playback;
- camera capture;
- face detection/background removal;
- nhiều branch / board topology final;
- Job / Pet / Minigame;
- town-building;
- win condition final.

## Validation

GitHub Actions cho code 0.1.10 đã xác nhận:
- TypeScript + Vite production build: **PASS**;
- deterministic replay fixture: **PASS**;
- golden checksum: **`9eabc37c`**;
- repeated replay state diff: **0**;
- synthetic desync detector: **PASS**.

## Milestone kế tiếp đề xuất

**MVP 0.1.11 — Lockstep Peer Simulator + Command Validation**

Mục tiêu:
1. mô phỏng 2 peer độc lập chạy cùng command stream;
2. attach expected `turn + revision + pre-command checksum` vào command envelope;
3. reject command cũ/sai lượt/sai actor trước khi mutate state;
4. checkpoint checksum sau mỗi command hoặc turn;
5. báo command đầu tiên gây desync + field-level diff;
6. đồng thời hoàn tất `ACT_001 random_other` để random target cũng nằm trọn trong deterministic contract;
7. vẫn chưa cần mở socket/network thật.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction không block turn. ✅ PoC.
6. Card inventory + chủ động use timing. ✅ PoC.
7. Board graph + branch choice. ✅ PoC.
8. Turn phase state machine + safe action windows. ✅ PoC.
9. Serializable MatchState + seeded RNG + event log. ✅ PoC.
10. Snapshot restore + command replay + checksum. ✅ PoC.
11. Deterministic replay regression gate + desync diagnostics. ✅ PoC.
