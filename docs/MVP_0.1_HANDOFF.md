# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.12 — Host/Client Command Queue + Snapshot Resync PoC**

Mục tiêu milestone: đưa deterministic lockstep 0.1.11 lên một lớp transport in-memory gần networking hơn, trong đó host giữ authoritative command stream, client nhận command có latency/duplicate/out-of-order, ACK theo sequence, reject packet stale/conflicting và có thể recover bằng authoritative snapshot khi state lệch.

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

## Host/Client transport core 0.1.12

File mới: `src/core/hostClient.ts`.

### Host command packet
Mỗi packet mô phỏng transport có:
- `packetId`;
- `deliverAt` để mô phỏng latency/reorder;
- authoritative `MatchCommand` đã có deterministic envelope.

### Client queue state
Client giữ riêng:
- `ackSeq`: command sequence cao nhất đã nhận liên tục;
- `appliedSeq`: sequence cao nhất đã replay an toàn vào gameplay state;
- `pending`: packet đến sớm/out-of-order đang buffer;
- `accepted`: command authority đã ACK;
- counters cho duplicate/out-of-order/stale reject/resync;
- `resyncRequested` + error log.

`ACK` và `appliedSeq` cố ý tách nhau. Ví dụ roll packet có thể đã nhận liên tục nhưng gameplay chưa apply được nếu branch command phụ thuộc chưa tới. Khi branch packet tới, accepted prefix được replay lại và apply atomically ở safe deterministic boundary.

### Duplicate + out-of-order
`receiveHostCommand()`:
1. packet đến sớm được buffer theo `seq`;
2. khi gap được lấp, client drain liên tục từ `ackSeq + 1`;
3. duplicate giống hệt command đã biết bị ignore, không mutate gameplay;
4. duplicate/stale cùng seq nhưng payload/envelope khác bị reject và bật `resyncRequested`;
5. accepted prefix được deterministic replay bằng đúng board/Card/News runtime data.

### Snapshot resync
`createAuthoritativeSnapshot()` replay authority stream đến một command boundary an toàn rồi đóng gói:
- `throughSeq`;
- gameplay checksum;
- serialized MatchState.

`applyAuthoritativeSnapshot()`:
- deserialize snapshot;
- verify checksum;
- verify command boundary;
- replace client gameplay state;
- rebuild accepted command map;
- drop buffered packet đã nằm trong snapshot;
- set `ackSeq = appliedSeq = throughSeq`;
- clear resync request.

Snapshot resync hiện là full gameplay snapshot, chưa phải delta snapshot.

## Network simulation fixture 0.1.12

File mới: `tests/host-client-queue.ts`.

Fixture dùng cùng authoritative stream nền:
- seed `123456789`;
- 24 gameplay commands;
- 20 roll;
- 4 branch choices;
- golden final checksum `0e7e9947`.

Test cố tình tạo transport xấu:
- command #4 tới trước #3;
- #9 tới trước #8;
- #15 tới trước #14;
- #21 tới trước #20;
- duplicate packet ở cả hai nửa trận;
- roll/branch dependency phải chờ command sau trước khi gameplay prefix có thể apply.

Sau command #11, fixture cố tình làm lệch client `money +77`, rồi gửi một stale/conflicting bản của command #6. Client phải:
- phát hiện checksum/state không còn khớp snapshot #11;
- reject stale/conflicting command #6;
- bật resync request;
- nhận authoritative snapshot #11;
- recover đúng checksum;
- tiếp tục nhận command #12–24;
- kết thúc cùng checksum với host.

CI output đã xác nhận:

`[host-client-ci] PASS ack=24 applied=24 checksum=0e7e9947 outOfOrder=4 duplicates=2 staleRejected=1 resyncs=1`

`[host-client-ci] probes: latency/out-of-order PASS • duplicate PASS • stale reject PASS • snapshot resync PASS`

## CI gate hiện tại

`.github/workflows/ci.yml` chạy 4 tầng:
1. `npm run build` — TypeScript + Vite production build;
2. `npm run test:replay` — deterministic replay golden fixture;
3. `npm run test:lockstep` — 2-peer command envelope/lockstep fixture;
4. `npm run test:host-client` — transport queue + snapshot resync fixture.

Verified outputs:
- replay: `PASS ... checksum=0e7e9947 rngCalls=29`;
- lockstep: `PASS commands=24 checkpoints=24 checksum=0e7e9947 randomTarget=P2`;
- host/client: `PASS ack=24 applied=24 checksum=0e7e9947 outOfOrder=4 duplicates=2 staleRejected=1 resyncs=1`.

## File chính

- `src/core/matchState.ts` — MatchState schema v3 + command envelope.
- `src/core/commandValidation.ts` — deterministic command guard.
- `src/core/replay.ts` — deterministic replay + checkpoints.
- `src/core/lockstep.ts` — 2-peer lockstep simulator + envelope stamping.
- `src/core/hostClient.ts` — host command queue, ACK/buffer, stale reject, snapshot resync.
- `src/core/checksum.ts` — gameplay checksum.
- `src/core/desync.ts` — field-level diff.
- `tests/replay-determinism.ts` — replay regression fixture.
- `tests/lockstep-peer.ts` — lockstep validation fixture.
- `tests/host-client-queue.ts` — latency/reorder/duplicate/resync fixture.
- `.github/workflows/ci.yml` — 4-layer CI gate.

## Browser QA hiện tại

Ở `PRE_ROLL_ACTION`:
- `S` — save MatchState JSON;
- `L` — restore snapshot;
- `V` — deterministic replay verify;
- `P` — 2-peer lockstep verify.

0.1.12 chưa thêm network UI/browser transport. Host/client queue hiện là core + headless CI PoC.

## Known limitations

- Chưa có socket/WebSocket/BroadcastChannel transport thật.
- Chưa có client-intent → host-authority protocol; fixture đang phát authoritative commands từ host xuống client.
- Chưa có retry timeout/packet loss policy.
- ACK hiện là highest contiguous received seq, không phải delivery receipt protocol final.
- Client apply accepted prefix bằng deterministic replay lại từ đầu; chưa có incremental atomic command executor tối ưu cho runtime network thật.
- Roll + branch vẫn là 2 command phụ thuộc; client có thể ACK roll nhưng phải chờ branch mới apply safe prefix.
- Snapshot resync là full snapshot, chưa có delta/compression/version negotiation.
- Chưa có session auth, reconnect, host migration hay anti-cheat model.
- Hand limit/card-per-turn, win condition, board topology, Job/Pet/Minigame vẫn chưa phải luật final.
- Tin Tức/reaction vẫn là demo engine content, chưa phải content final/approved.

## Validation

GitHub Actions cho code 0.1.12 đã xác nhận:
- TypeScript + Vite build: **PASS**;
- deterministic replay: **PASS**;
- lockstep simulator: **PASS**;
- host/client transport fixture: **PASS**;
- out-of-order buffering: **PASS**;
- duplicate ignore: **PASS**;
- stale/conflicting command reject: **PASS**;
- snapshot resync recovery: **PASS**;
- final host/client checksum: **`0e7e9947`**.

## Milestone kế tiếp đề xuất

**MVP 0.1.13 — Client Intent → Host Authority Protocol + Local Transport Adapter**

Mục tiêu:
1. tách `ClientIntent` khỏi authoritative `MatchCommand`;
2. client chỉ gửi ý định như roll/use-card/branch choice, không tự stamp authority checksum;
3. host validate current turn/actor/phase rồi mới tạo authoritative command envelope;
4. host broadcast command + ACK/result về client;
5. dựng adapter local bằng `BroadcastChannel` hoặc transport interface để 2 tab/browser context trao đổi thật mà chưa cần backend;
6. reuse snapshot resync 0.1.12 khi peer lệch/reconnect;
7. giữ CI in-memory làm regression gate.

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
