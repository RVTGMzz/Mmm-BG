# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.11 — Lockstep Peer Simulator + Command Validation**

Mục tiêu milestone: biến command log thành deterministic lockstep contract có state envelope, mô phỏng 2 peer độc lập, reject command sai state trước khi gameplay command đó mutate state, và sửa `ACT_001 — Trượt Tay` về đúng source: target ngẫu nhiên.

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
Runtime deck vẫn chỉ dùng đúng 4 Lá Bài có dữ liệu đầy đủ trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự điền Card_ID còn trống.

### ACT_001 random target đã sửa đúng source
`ACT_001` giờ dùng:

`targetMode: random_other`

Flow browser:
1. người chơi chọn `Trượt Tay` trong hand;
2. **không mở TargetPicker**;
3. command `play_card` được đóng dấu bằng pre-action envelope;
4. seeded RNG chọn đều một người chơi khác;
5. resolved `targetId` được ghi lại vào command để replay có thể kiểm tra outcome;
6. replay tự chạy cùng RNG stream và reject nếu target ghi trong command không khớp target deterministic.

Vì target random dùng cùng RNG stream với D6/Card/News/spectator nên cùng seed + cùng command stream vẫn reproducible.

### Card Inventory + Use Timing
Giữ nguyên:

`Đáp ô Lá Bài → weighted draw → card vào hand → pre-roll chọn card → target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction non-blocking.`

PoC rule constants:
- hand limit `3` card;
- tối đa `1` card/lượt.

Đây chưa phải luật final.

### Branching Board Graph
Giữ nguyên:
- board dùng `nodes + edges`;
- player lưu `nodeId`;
- graph validate trước khi scene chạy;
- ngã rẽ node 4:
  - `PHỐ CHÍNH`: 4 → 5 → 6 → 7
  - `HẺM TẮT`: 4 → 18 → 19 → 7
- mặc định `manual` với BranchPicker;
- `odd_even` chỉ là config test legacy, chưa phải luật final.

### Turn Phase State Machine
Giữ nguyên:

`TURN_START → PRE_ROLL_ACTION → ROLLING → MOVING → RESOLVING_TILE → TURN_END → TURN_START`

Phase tương tác:
- `PRE_ROLL_ACTION ↔ CARD_ACTION`
- `MOVING ↔ BRANCH_CHOICE`

Phase + revision nằm trong MatchState.

### MatchState schema v3
`src/core/matchState.ts` nâng schema từ v2 lên v3.

Gameplay source-of-truth vẫn gồm:
- board id;
- seed + serializable RNG state/call count;
- current player / turn / last roll;
- phase + revision;
- toàn bộ PlayerState;
- gameplay command log;
- event log presentation/debug.

Mỗi command mới giờ có deterministic envelope:
- `turnNumber`;
- `playerIndex`;
- `actorId`;
- `phase`;
- `revision`;
- `preChecksum`;
- command-specific payload.

`captureMatchCommandEnvelope()` cho phép chụp safe pre-action state trước khi mở UI. Card picker/target picker có thể chạy sau đó, nhưng command vẫn được validate theo state trước hành động thay vì state presentation giữa chừng.

Migration cơ bản từ schema v1/v2 vẫn còn. Command legacy không có checksum/revision dùng sentinel để tiếp tục replay, nhưng không được xem là strong lockstep envelope.

### Command validation 0.1.11
File mới: `src/core/commandValidation.ts`.

Trước khi replay command, validator kiểm tra:
- đúng turn;
- đúng current player index;
- đúng actor;
- đúng phase;
- đúng phase revision nếu command mới có revision;
- đúng gameplay checksum ngay trước command nếu command mới có `preChecksum`.

Nếu lệch, replay dừng và trả `failedCommandSeq` thay vì cố đoán/repair.

Command `play_card` mới được validate ở `PRE_ROLL_ACTION` trước khi replay chuyển vào `CARD_ACTION`, nên stale/wrong actor/checksum bị reject trước khi card effect mutate gameplay state.

Branch command được validate tại deterministic `BRANCH_CHOICE` state do roll đã tạo ra.

### Replay command checkpoints
`src/core/replay.ts` giờ trả thêm `checkpoints[]`.

Mỗi accepted command checkpoint gồm:
- command seq/type;
- turn/player index;
- phase/revision;
- checksum state ngay trước command.

Replay cũng trả `failedCommandSeq` khi một command bị reject.

### Lockstep peer simulator 0.1.11
File mới: `src/core/lockstep.ts`.

`simulateLockstepPeers()`:
- tạo 2 replay peer độc lập;
- chạy cùng deterministic command stream;
- so checkpoint theo command sequence;
- so final checksum;
- chạy field-level `diffMatchStates()`;
- trả `firstDesyncCommandSeq` khi một peer reject envelope hoặc checkpoint đầu tiên không khớp.

`stampCommandEnvelopes()` dùng replay checkpoints để nâng fixture/command stream cũ lên envelope đầy đủ. Live runtime không cần bước này vì command mới được stamp ngay khi tạo.

Giới hạn hiện tại: pre-command checkpoints xác định command boundary đầu tiên **nhìn thấy** state lệch. Với command có sub-step nội bộ như roll + branch, đây chưa phải packet-level causal trace tuyệt đối; transport/atomic command executor vẫn là milestone sau.

### Browser QA 0.1.11
Hotkeys ở safe `PRE_ROLL_ACTION`:
- `S` — save MatchState JSON vào localStorage;
- `L` — restore snapshot + rebind phase/RNG + snap token;
- `V` — replay command stream và so live/replay checksum;
- `P` — chạy 2 lockstep peer độc lập và so checkpoint/final state.

Nếu peer sync:
`🔐 PEERS SYNC <checksum>`

Nếu lệch:
- hiển thị `firstDesyncCommandSeq` nếu có;
- log replay validation error hoặc field-level diff.

### Deterministic CI 0.1.11
Workflow `.github/workflows/ci.yml` hiện chạy:
1. `npm run build`;
2. `npm run test:replay`;
3. `npm run test:lockstep`.

Replay fixture hiện:
- seed `123456789`;
- 24 gameplay commands;
- 20 roll;
- 4 branch choice;
- golden checksum mới `0e7e9947`.

Golden đổi từ `9eabc37c` sang `0e7e9947` vì gameplay checksum contract giờ mang schema v3. Đây là update có chủ đích.

CI output đã xác nhận:

`[replay-ci] PASS seed=123456789 commands=24 checksum=0e7e9947 rngCalls=29`

`[lockstep-ci] PASS commands=24 checkpoints=24 checksum=0e7e9947 randomTarget=P2`

`[lockstep-ci] rejection probes: checksum@#8 PASS • actor@#6 PASS`

Lockstep fixture còn chủ động tạo 2 peer lỗi:
- command #8 có `preChecksum` sai → bị reject đúng tại #8;
- command #6 có actor sai → bị reject đúng tại #6.

`random_other` helper cũng được chạy 2 RNG state cùng seed trong CI và phải chọn cùng target, không được chọn caster.

## File chính

- `src/core/matchState.ts` — MatchState schema v3 + command envelope capture/stamp.
- `src/core/commandValidation.ts` — turn/player/actor/phase/revision/checksum guard.
- `src/core/replay.ts` — deterministic replay + checkpoints + failed command seq + random target validation.
- `src/core/lockstep.ts` — 2-peer simulator + envelope stamping.
- `src/core/checksum.ts` — FNV-1a gameplay checksum.
- `src/core/desync.ts` — field-level gameplay state diff.
- `src/core/cards.ts` — `random_other` + seeded target helper.
- `src/content/core/cards_mvp.json` — ACT_001 switched to `random_other`.
- `src/scenes/BoardScene.ts` — browser command envelopes, ACT_001 runtime, `P` peer verify.
- `tests/replay-determinism.ts` — replay golden fixture.
- `tests/lockstep-peer.ts` — lockstep envelope/rejection/random-target fixture.
- `.github/workflows/ci.yml` — build + replay + lockstep gate.

## Chưa triển khai

- network/socket transport thật;
- host/client authority model thật;
- packet latency/reorder/duplicate simulation;
- snapshot resync khi peer lệch;
- command acknowledgement/retry;
- post-command atomic checkpoint cho mọi nested sub-step;
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

GitHub Actions cho code 0.1.11 đã xác nhận:
- TypeScript + Vite production build: **PASS**;
- deterministic replay fixture: **PASS**;
- replay golden checksum: **`0e7e9947`**;
- lockstep 2-peer fixture: **PASS**;
- 24/24 pre-command checkpoints: **PASS**;
- wrong checksum rejection @ command #8: **PASS**;
- wrong actor rejection @ command #6: **PASS**;
- seeded random-other target reproducibility: **PASS**.

## Milestone kế tiếp đề xuất

**MVP 0.1.12 — Host/Client Command Queue + Snapshot Resync PoC**

Mục tiêu:
1. dựng transport simulator in-memory, chưa cần socket thật;
2. tách host authority và client peer;
3. mô phỏng latency, duplicate và out-of-order command;
4. host dùng command envelope để accept/reject stale command;
5. client ACK command theo sequence;
6. khi checksum lệch, host gửi snapshot resync và client dựng lại state;
7. CI chứng minh peer lệch có thể recover về cùng checksum;
8. vẫn chưa cần backend/server thật.

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
12. Lockstep command envelope + 2-peer simulator + source-faithful ACT_001 random target. ✅ PoC.
