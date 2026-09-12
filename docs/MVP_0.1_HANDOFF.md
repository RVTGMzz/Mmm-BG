# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.8 — Serializable Match State + Seeded RNG**

Mục tiêu milestone: gom gameplay source-of-truth vào data thuần có thể JSON serialize, tách Phaser object ra khỏi state, và thay randomness trực tiếp bằng RNG có seed để chuẩn bị cho save/replay/multiplayer sync.

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
- Face texture/Phaser object **không nằm trong MatchState**.

### Lá Bài source-backed
Runtime deck vẫn chỉ dùng đúng 4 Lá Bài hiện có dữ liệu thật trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự điền Card_ID còn trống.

### Card Inventory + Use Timing
Giữ nguyên:

`Đáp ô Lá Bài → weighted draw → card vào hand → trong cửa sổ pre-roll mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

PoC rule constants vẫn là:
- hand limit: `3` card;
- tối đa `1` card/lượt.

Đây **không phải luật final**.

### Branching Board Graph
Giữ nguyên:

- board dùng `nodes + edges`;
- player lưu `nodeId`;
- graph được validate trước khi scene chạy;
- ngã rẽ node 4:
  - `PHỐ CHÍNH`: 4 → 5 → 6 → 7
  - `HẺM TẮT`: 4 → 18 → 19 → 7
- mode mặc định `manual` bật `BranchPicker`;
- mode `odd_even` chỉ là config test legacy, chưa phải luật final.

### Turn Phase State Machine
Giữ nguyên 0.1.7:

`TURN_START → PRE_ROLL_ACTION → ROLLING → MOVING → RESOLVING_TILE → TURN_END → TURN_START`

Phase tương tác chen vào:
- `PRE_ROLL_ACTION ↔ CARD_ACTION`
- `MOVING ↔ BRANCH_CHOICE`

`TurnPhaseMachine` giờ có thể bind trực tiếp vào `MatchState.turn`, vì vậy `phase + revision` cũng thuộc snapshot data thay vì nằm riêng trong Phaser scene.

### Serializable MatchState 0.1.8
File mới: `src/core/matchState.ts`.

`MatchState` hiện chứa data thuần:
- `schemaVersion`;
- `boardId`;
- `seed`;
- RNG state + số lần RNG đã được gọi;
- `turn.currentPlayerIndex`;
- `turn.turnNumber`;
- `turn.lastRoll`;
- `turn.phase` + `turn.revision`;
- toàn bộ `PlayerState[]` gồm node, B$, khóa card, hand và card-per-turn counter;
- event log tuần tự;
- next event sequence.

`serializeMatchState()` dùng JSON trực tiếp. `deserializeMatchState()` đã có schema version guard cơ bản.

Phaser token, image, tween và texture không nằm trong MatchState. `BoardScene` giữ chúng trong map `playerId → PlayerVisual` chỉ để render.

### Seeded RNG 0.1.8
File mới: `src/core/rng.ts`.

RNG dùng xorshift32 với state có thể serialize:
- `seed`;
- `state`;
- `calls`.

Các nguồn random gameplay đã đi qua cùng RNG stream:
- D6;
- weighted Card draw;
- weighted News draw;
- spectator selection cho reaction.

Có thể ép seed qua query string để test reproducibility:

`?seed=123`

Nếu không truyền seed, MVP tạo seed ban đầu từ thời gian hiện tại rồi normalize vào uint32 và lưu ngay trong MatchState.

Điều kiện deterministic hiện tại là: **cùng seed + cùng thứ tự action/route/target lựa chọn → cùng random stream và cùng random outcomes**. Manual choice vẫn là input của người chơi, không tự replay ở milestone này.

### Event Log 0.1.8
Match log hiện ghi tối thiểu:
- match start;
- phase transition;
- dice roll;
- movement từng edge;
- branch choice;
- tile resolve;
- money delta/lap reward;
- card draw / card play / cancel / blocked;
- news resolve;
- card lock expiry;
- turn end.

Mỗi event mang:
- sequence number;
- turn number;
- current player index;
- phase;
- phase revision;
- RNG call count;
- actor id nếu có;
- payload data thuần.

HUD QA hiện thêm `seed`, `rng calls` và số event để dễ đối chiếu khi test hai phiên cùng seed.

### Tin Tức + Reaction
Giữ nguyên:
- `news_mvp_demo.json` chỉ là demo runtime, chưa phải content Tin Tức được duyệt;
- reaction text chỉ là writing PoC;
- reaction sequence dùng delay/overlap và không block turn;
- SFX hiện mới là `sfxId`, chưa có audio playback.

## File chính

- `src/core/matchState.ts` — serializable gameplay source-of-truth + event log + JSON helpers.
- `src/core/rng.ts` — seeded xorshift32 state + random source.
- `src/core/turnPhase.ts` — phase machine bind được vào snapshot state.
- `src/core/board.ts` — graph lookup/validation/parity helper.
- `src/core/types.ts` — board graph + PlayerState data.
- `src/core/cards.ts` / `src/core/news.ts` / `src/core/dice.ts` — nhận random callback nên dùng được seeded stream.
- `src/core/rules.ts` — PoC branch/card constants.
- `src/ui/BranchPicker.ts` — manual route choice.
- `src/ui/CardHandPicker.ts` — chọn Lá Bài đang giữ.
- `src/ui/TargetPicker.ts` — chọn target khi play card.
- `src/scenes/BoardScene.ts` — render/orchestration trên MatchState, không còn giữ Phaser object trong gameplay state.

`src/core/turn.ts` còn trong repo như helper cũ nhưng BoardScene 0.1.8 không còn dùng nó làm source-of-truth.

## Chưa triển khai

- load một snapshot JSON trở lại scene đang chạy;
- replay driver tự phát lại action log;
- state hash/checksum để so 2 peer;
- save slot/persistence thật;
- networking/multiplayer sync;
- deterministic automation test trong CI ngoài typecheck/build;
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

GitHub Actions typecheck + Vite build: **PASS** cho code 0.1.8 trước khi cập nhật handoff này.

Chưa tuyên bố browser replay proof hoàn chỉnh vì milestone hiện chưa có replay driver/load snapshot tự động. Seed/query + event log đã tạo nền để test bước đó ở milestone kế tiếp.

## Milestone kế tiếp đề xuất

**MVP 0.1.9 — Snapshot Restore + Action Replay PoC**

Mục tiêu:
1. load `MatchState` JSON và dựng lại board/player presentation;
2. tạo action command schema tách khỏi presentation event log;
3. replay một chuỗi roll/route/target decision từ seed;
4. thêm state checksum/hash đơn giản để so kết quả cuối;
5. chứng minh 2 run cùng snapshot/action stream đi tới cùng state;
6. vẫn chưa cần networking thật.

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
