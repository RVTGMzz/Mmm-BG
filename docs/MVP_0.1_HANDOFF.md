# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.9 — Snapshot Restore + Action Replay PoC**

Mục tiêu milestone: biến nền deterministic của 0.1.8 thành một proof có thể test trực tiếp: save/load `MatchState`, tách command input khỏi event presentation, replay từ seed và so checksum gameplay cuối.

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

### Card Inventory + Use Timing
Flow giữ nguyên:

`Đáp ô Lá Bài → weighted draw → card vào hand → trong cửa sổ pre-roll mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

PoC rule constants vẫn là:
- hand limit: `3` card;
- tối đa `1` card/lượt.

Đây không phải luật final.

### Branching Board Graph
Giữ nguyên:
- board dùng `nodes + edges`;
- player lưu `nodeId`;
- graph validate trước khi scene chạy;
- node 4 có `PHỐ CHÍNH` và `HẺM TẮT`;
- mode mặc định `manual`;
- `odd_even` chỉ là config test legacy, chưa phải luật final.

### Turn Phase State Machine
Giữ nguyên:

`TURN_START → PRE_ROLL_ACTION → ROLLING → MOVING → RESOLVING_TILE → TURN_END → TURN_START`

Phase chen vào:
- `PRE_ROLL_ACTION ↔ CARD_ACTION`
- `MOVING ↔ BRANCH_CHOICE`

`TurnPhaseMachine` bind trực tiếp vào `MatchState.turn`.

### MatchState schema v2
`src/core/matchState.ts` đã nâng schema lên `2`.

Ngoài state 0.1.8, MatchState hiện thêm:
- `startingMoney`;
- `commandLog`;
- `nextCommandSeq`.

Có migration cơ bản từ schema v1 sang v2. Snapshot v1 được load với command stream rỗng thay vì crash ngay.

### Command stream 0.1.9
Command input được tách khỏi event log presentation.

Hiện có 3 command gameplay:
- `roll`;
- `choose_branch` với node đích;
- `play_card` với `cardId` + `targetId`.

Mỗi command giữ:
- sequence;
- turn number;
- current player index;
- actor id;
- payload data thuần.

Cancel picker, animation, text overlay, reaction line và UI event không được ghi vào command stream vì chúng không đổi gameplay state.

### Replay engine 0.1.9
File mới: `src/core/replay.ts`.

Replay tạo match mới từ:
- board id;
- seed;
- starting money;
- player names;
- command stream.

Replay tự chạy lại:
- D6 bằng seeded RNG;
- movement từng edge;
- manual branch decision từ command;
- READY lap reward;
- money tile;
- weighted Card draw;
- weighted News draw + effect;
- card play + target;
- card lock expiry;
- turn/phase transitions.

Vì 0.1.8 dùng chung RNG stream cho spectator reaction, replay cũng tiêu thụ đúng spectator RNG call để giữ stream tương thích với live runtime hiện tại.

Nếu command sai actor, card không nằm trong tay, target không hợp lệ, branch không reachable hoặc command bị orphan, replay trả lỗi thay vì âm thầm đoán.

### Deterministic checksum
File mới: `src/core/checksum.ts`.

Dùng FNV-1a 32-bit trên gameplay-critical canonical payload gồm:
- schema/board/seed/starting money;
- RNG seed/state/call count;
- turn/current player/last roll/phase/revision;
- toàn bộ PlayerState.

Event log và command log bị loại khỏi checksum vì chúng là lịch sử/diagnostic, không phải state gameplay hiện tại.

### Snapshot Save / Restore PoC
BoardScene có hotkey QA:
- `S`: save snapshot JSON vào localStorage;
- `L`: restore snapshot;
- `V`: replay command stream từ seed rồi so checksum với live state.

Save/load chỉ được phép ở `PRE_ROLL_ACTION`, tránh restore vào giữa tween/picker đang mở.

Khi restore:
- JSON được deserialize + schema migrate;
- board id/player count/phase được kiểm tra;
- MatchState, phase machine và seeded RNG source được bind lại;
- token Phaser được snap về node tương ứng;
- dice/HUD refresh từ state restored.

LocalStorage ở milestone này chỉ là QA persistence PoC, chưa phải save-slot UX final.

### Replay verification trong browser
Nhấn `V` ở safe pre-roll window:

`live MatchState → command replay từ seed → replay MatchState → checksum live vs checksum replay`

PASS yêu cầu đồng thời:
- replay không có error;
- consume đủ toàn bộ command;
- checksum gameplay cuối giống nhau.

HUD hiện:
- phase + revision;
- RNG call count;
- số command;
- checksum hiện tại.

### Tin Tức + Reaction
Giữ nguyên:
- `news_mvp_demo.json` chỉ là demo runtime, chưa phải content Tin Tức được duyệt;
- reaction text chỉ là writing PoC;
- reaction sequence non-blocking;
- SFX hiện mới là `sfxId`, chưa có audio playback.

## File chính

- `src/core/matchState.ts` — schema v2, snapshot JSON, command/event log.
- `src/core/replay.ts` — deterministic action replay driver.
- `src/core/checksum.ts` — gameplay state checksum.
- `src/core/rng.ts` — seeded xorshift32 state + random source.
- `src/core/turnPhase.ts` — phase machine bind vào snapshot state.
- `src/core/board.ts` — graph lookup/validation.
- `src/core/cards.ts` / `src/core/news.ts` / `src/core/dice.ts` — deterministic logic khi truyền seeded random callback.
- `src/scenes/BoardScene.ts` — command capture, save/load snapshot, replay verify + Phaser presentation sync.

## Chưa triển khai

- deterministic replay fixture chạy tự động trong CI;
- replay inspector UI / scrub từng command;
- checksum/desync report chi tiết theo field;
- nhiều save slot + naming/delete UX;
- import/export snapshot file;
- networking/multiplayer sync thật;
- rollback/prediction;
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

GitHub Actions typecheck + Vite build: PASS cho code runtime 0.1.9 trước khi cập nhật handoff này.

Milestone này chứng minh được đường kỹ thuật cho snapshot restore + deterministic replay trong runtime. Chưa coi đây là save system/replay product UX hoàn chỉnh.

## Milestone kế tiếp đề xuất

**MVP 0.1.10 — Deterministic Replay CI + Desync Diagnostics**

Mục tiêu:
1. thêm fixture command stream cố định chạy không cần Phaser/browser;
2. assert checksum cuối trong CI;
3. chạy cùng fixture 2 lần để bắt nondeterminism;
4. thêm state-diff helper chỉ ra field nào lệch khi checksum mismatch;
5. tạo replay diagnostic report ngắn gồm command index, RNG calls, turn/phase và player diff;
6. giữ networking thật sang phase sau.

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
