# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.13 — Client Intent → Host Authority Protocol + Local Transport Adapter**

Mục tiêu milestone: client không còn cần tự tạo authoritative `MatchCommand`. Client chỉ gửi ý định gameplay (`roll`, `choose_branch`, `play_card`), host kiểm tra state hiện tại rồi mới đóng dấu command envelope + deterministic outcome. Đồng thời thêm local transport abstraction để tiến tới test 2 tab/browser thật mà chưa cần backend.

## Nền tảng đã có

- Vite + TypeScript + Phaser, landscape 1280×720.
- City board graph data-driven 20 node + 1 branch thật.
- 4 player, D6, movement, money tile, READY reward PoC.
- Face Setup + 3 expression slots, xử lý local browser.
- 4 Lá Bài source-backed từ spreadsheet, không tự điền Card_ID trống.
- `ACT_001 — Trượt Tay` dùng `random_other` đúng source và seeded RNG.
- Tin Tức + Reaction Sequencer demo data-driven/non-blocking.
- Card Inventory + Use Timing PoC.
- Turn Phase State Machine + safe action windows.
- MatchState schema v3, seeded RNG, command log/event log.
- Snapshot serialize/restore + deterministic replay + FNV-1a checksum.
- Command envelope: turn/player/actor/phase/revision/preChecksum.
- Replay checkpoints + failedCommandSeq.
- 2-peer lockstep simulator + field-level desync diagnostics.
- Host/client queue với latency/duplicate/out-of-order + snapshot resync.

## Client Intent → Host Authority 0.1.13

File mới: `src/core/authority.ts`.

### ClientIntent
Client gửi payload tối thiểu:
- `intentId`;
- `clientId`;
- `actorId`;
- `type`: `roll | choose_branch | play_card`;
- `observedCommandSeq`;
- data riêng của intent.

Client **không được tự quyết định**:
- command sequence;
- turn number/player index;
- phase/revision;
- pre-command checksum;
- random target outcome.

### Host validation
`submitClientIntent()` reject trước khi tạo command nếu:
- client đang nhìn command sequence cũ/stale;
- actor không phải current player;
- intent không hợp lệ ở phase hiện tại;
- branch target không hợp lệ;
- card không có trong hand;
- card đang bị lock;
- target manual không hợp lệ.

Intent trùng `intentId` trả `duplicate` và không tạo command mới.

### Host stamping
Khi intent hợp lệ, host:
1. capture deterministic envelope từ authoritative state;
2. cấp command `seq`;
3. tự ghi turn/player/phase/revision/preChecksum;
4. replay candidate command stream để xác nhận command hợp lệ;
5. commit authority state nếu deterministic replay chấp nhận.

Roll có thể được accept ở boundary trước branch. Nếu deterministic execution dừng ở `BRANCH_CHOICE` do còn thiếu branch intent, host giữ partial authority state đó để nhận `choose_branch` kế tiếp.

### Random outcome thuộc host
Với `ACT_001 — Trượt Tay`, client chỉ gửi `cardId`.

Host clone RNG state và tự resolve `random_other` target. `targetId` resolved được ghi vào authoritative command. Client không thể tự chọn người bị Trượt Tay rồi giả thành random.

Manual target card vẫn nhận `targetId` từ intent nhưng host validate target trước khi stamp command.

## Local Transport Adapter 0.1.13

File mới: `src/core/localTransport.ts`.

Có interface chung:
- `send(payload, to?)`;
- `subscribe(handler)`;
- `close()`;
- `endpointId`.

Hai adapter hiện có:

### InMemoryTransportHub
Dùng cho CI/headless regression. Nhiều endpoint trao đổi intent/receipt mà không cần browser/network.

### BroadcastChannelTransport
Dùng browser-local `BroadcastChannel` để milestone sau có thể chạy host/client ở **2 tab hoặc 2 browser context cùng origin**.

Adapter này chưa phải internet networking và chưa có auth/reconnect.

## Authority protocol fixture

File mới: `tests/authority-protocol.ts`.

Fixture xác nhận:
- 24 client intents tạo lại đúng authoritative stream nền;
- final checksum vẫn `0e7e9947`;
- duplicate intent không tăng command seq;
- wrong actor bị reject;
- stale `observedCommandSeq` bị reject;
- `play_card` intent chạy qua host authority;
- random target do host resolve;
- local in-memory client → host → receipt roundtrip hoạt động.

Verified output:

`[authority-ci] PASS commands=24 checksum=0e7e9947 duplicate=PASS wrongActor=PASS stale=PASS cardIntent=PASS`

`[authority-ci] local transport roundtrip PASS • host stamps authority envelope/outcomes`

## CI gate hiện tại

`.github/workflows/ci.yml` chạy 5 tầng:
1. `npm run build` — TypeScript + Vite production build;
2. `npm run test:replay` — deterministic replay golden fixture;
3. `npm run test:lockstep` — 2-peer command envelope/lockstep fixture;
4. `npm run test:host-client` — latency/reorder/duplicate/snapshot resync fixture;
5. `npm run test:authority` — client-intent → host-authority + local transport fixture.

Current golden gameplay checksum vẫn: `0e7e9947`.

## File chính

- `src/core/matchState.ts` — MatchState schema v3 + command envelope.
- `src/core/commandValidation.ts` — deterministic command guard.
- `src/core/replay.ts` — deterministic replay + checkpoints.
- `src/core/lockstep.ts` — 2-peer lockstep simulator.
- `src/core/hostClient.ts` — noisy authoritative command delivery + snapshot resync.
- `src/core/authority.ts` — ClientIntent validation + host command stamping/outcome authority.
- `src/core/localTransport.ts` — in-memory + browser BroadcastChannel adapters.
- `src/core/checksum.ts` — gameplay checksum.
- `src/core/desync.ts` — field-level diff.
- `tests/replay-determinism.ts` — replay regression fixture.
- `tests/lockstep-peer.ts` — lockstep validation fixture.
- `tests/host-client-queue.ts` — latency/reorder/duplicate/resync fixture.
- `tests/authority-protocol.ts` — intent/authority/local-transport fixture.
- `.github/workflows/ci.yml` — 5-layer CI gate.

## Browser QA hiện tại

Single-device BoardScene vẫn chơi được theo vertical slice hiện có.

Hotkeys ở `PRE_ROLL_ACTION`:
- `S` — save MatchState JSON;
- `L` — restore snapshot;
- `V` — deterministic replay verify;
- `P` — 2-peer lockstep verify.

0.1.13 đã có `BroadcastChannelTransport`, nhưng **chưa wire BoardScene thành host tab/client tab thật**. Đó là milestone kế tiếp.

## Known limitations

- Chưa có UI chọn Host/Join Room.
- Chưa có 2-tab BoardScene synchronization thật.
- Chưa có WebSocket/backend/internet transport.
- Chưa có retry timeout/packet-loss policy final.
- Client apply accepted prefix vẫn dựa deterministic replay, chưa có incremental atomic executor tối ưu.
- Full snapshot resync, chưa có delta/compression/version negotiation.
- Chưa có reconnect/host migration/session auth/anti-cheat production model.
- Chưa khóa luật hand limit/card-per-turn/win condition/board topology final.
- Tin Tức/reaction vẫn là demo engine content, chưa phải content final/approved.
- Chưa có đủ content/art/audio/UX để gọi là public demo polished.

## Validation

GitHub Actions cho code 0.1.13 đã xác nhận:
- TypeScript + Vite build: **PASS**;
- deterministic replay: **PASS**;
- lockstep simulator: **PASS**;
- host/client noisy transport + snapshot resync: **PASS**;
- client intent → host authority: **PASS**;
- duplicate intent handling: **PASS**;
- wrong actor reject: **PASS**;
- stale client view reject: **PASS**;
- play-card host authority: **PASS**;
- local transport roundtrip: **PASS**;
- golden checksum: **`0e7e9947`**.

## Milestone kế tiếp đề xuất

**MVP 0.1.14 — Two-Tab Browser Session PoC**

Mục tiêu:
1. thêm Host/Join local session mode;
2. wire `BroadcastChannelTransport` vào browser runtime;
3. host tab giữ authority state;
4. client tab chỉ phát `ClientIntent`;
5. host broadcast authoritative command/receipt/snapshot;
6. hai tab hiển thị cùng board/player state;
7. test roll + branch + card giữa hai tab cùng origin;
8. thêm reconnect/resync đơn giản khi client tab reload;
9. vẫn chưa cần backend thật.

Sau 0.1.14, ưu tiên 0.1.15 cho **Demo Match Shell + win condition tạm + start/end flow** và 0.1.16 cho **demo packaging/polish** nếu mục tiêu là đưa bản thử cho người ngoài chơi.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction non-blocking. ✅ PoC.
6. Card inventory + use timing. ✅ PoC.
7. Board graph + branch choice. ✅ PoC.
8. Turn phase state machine. ✅ PoC.
9. Serializable MatchState + seeded RNG. ✅ PoC.
10. Snapshot restore + replay + checksum. ✅ PoC.
11. Replay CI + desync diagnostics. ✅ PoC.
12. Lockstep envelope + 2-peer simulator. ✅ PoC.
13. Host/client queue + noisy transport + snapshot resync. ✅ PoC.
14. ClientIntent → HostAuthority + local transport abstraction. ✅ PoC.
