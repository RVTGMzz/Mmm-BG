# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.14 — Two-Tab Browser Session PoC**

Mục tiêu milestone: đưa `BroadcastChannelTransport` và `ClientIntent → HostAuthority` vào browser runtime thật để hai tab cùng origin có thể vào cùng local room, cùng nhìn một authoritative board state và thay phiên gửi gameplay intent mà chưa cần backend/WebSocket.

## Nền tảng giữ nguyên

- Vite + TypeScript + Phaser, landscape 1280×720.
- City graph data-driven 20 node + 1 branch thật.
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
- Replay/lockstep/desync diagnostics.
- Host/client noisy command queue + snapshot resync.
- ClientIntent → HostAuthority + local transport abstraction.

## Local Lobby 0.1.14

Scene mới: `src/scenes/LocalLobbyScene.ts`.

Khi mở game, người dùng có 3 lựa chọn:
1. **SOLO / HOTSEAT** — đi vào Face Setup rồi dùng `BoardScene` cũ;
2. **HOST 2 TAB** — tạo/nhập room code, Face Setup 4 người, sau đó vào `NetworkBoardScene`;
3. **JOIN 2 TAB** — nhập room code + chọn ghế P2/P3/P4 rồi vào thẳng `NetworkBoardScene`.

Host hiển thị room code ngay trong network HUD để tab khác có thể join.

`src/core/browserSession.ts` giữ config runtime:
- mode `solo | host | client`;
- room code;
- client id;
- local seat id;
- BroadcastChannel name theo room.

## Two-tab session core

File mới: `src/core/twoTabSession.ts`.

### Protocol message
Browser-local protocol hiện có:
- `join_request`;
- `join_accept` / `join_reject`;
- `intent`;
- `intent_receipt`;
- authoritative `state`;
- authoritative `snapshot`;
- `resync_request`.

### Host session
`TwoTabHostSession`:
- giữ `HostAuthority`;
- bind client endpoint với seat P2/P3/P4;
- host tự điều khiển các seat chưa có client claim;
- reject intent nếu endpoint/clientId/actor không khớp seat claim;
- submit local host intent qua cùng authority contract;
- broadcast authoritative state sau command accepted;
- broadcast snapshot ở safe `PRE_ROLL_ACTION` boundary;
- trả receipt accepted/duplicate/rejected.

### Client session
`TwoTabClientSession`:
- gửi join request tới endpoint `host`;
- chỉ điều khiển đúng seat đã chọn;
- gửi `ClientIntent` với `observedCommandSeq` mới nhất;
- nhận host receipt;
- verify checksum của state/snapshot trước khi apply;
- tự gửi `resync_request` nếu nhận state lỗi checksum hoặc stale-view receipt.

## Browser NetworkBoardScene

Scene mới: `src/scenes/NetworkBoardScene.ts`.

PoC này cố ý tách khỏi `BoardScene` solo để không làm yếu vertical slice cũ.

Network board hiện:
- render cùng City graph 20 node;
- host/client cùng nhận authoritative PlayerState;
- token snap về đúng node sau state update;
- HUD hiển thị HOST/CLIENT, room, checksum, turn, phase;
- host giữ authority;
- client không mutate gameplay trực tiếp;
- Roll gửi intent;
- Card picker/Target picker chạy local presentation rồi gửi `play_card` intent;
- khi authority dừng ở `BRANCH_CHOICE`, đúng tab sở hữu actor sẽ mở BranchPicker và gửi `choose_branch` intent;
- host điều khiển các ghế chưa được client claim nên PoC hai tab vẫn có thể đi qua đủ vòng 4 người.

Network scene hiện ưu tiên correctness/sync. Movement của remote state đang snap node thay vì tween toàn bộ authoritative path; visual polish dành cho demo polish milestone.

## Face behavior trong two-tab PoC

Host vẫn dùng Face Setup đầy đủ và thấy sticker của phiên host.

Client join bỏ qua Face Setup và hiện fallback token màu nếu tab client chưa có texture ảnh. 0.1.14 chưa broadcast face data URL giữa tab để tránh trộn privacy/asset-sync vào networking core. Đây là limitation có chủ đích.

## Two-tab regression fixture

File mới: `tests/two-tab-session.ts`.

CI dùng `InMemoryTransportHub` nhưng chạy đúng `TwoTabHostSession/TwoTabClientSession` protocol:
- client join room và claim P2;
- host chơi lượt P1;
- client nhận authoritative state rồi gửi roll cho P2;
- branch intent được xử lý nếu roll dừng ở branch;
- host/client phải về cùng authoritative checksum;
- client giả actor khác seat bị reject và không được tăng host command seq;
- safe snapshots phải được client nhận.

## CI gate 0.1.14

`.github/workflows/ci.yml` chạy 6 tầng:
1. `npm run build`;
2. `npm run test:replay`;
3. `npm run test:lockstep`;
4. `npm run test:host-client`;
5. `npm run test:authority`;
6. `npm run test:two-tab`.

Golden deterministic fixture nền vẫn dùng checksum `0e7e9947`.

## File chính mới/thay đổi

- `src/core/browserSession.ts` — local mode/room/seat config.
- `src/core/twoTabSession.ts` — join/intent/receipt/state/snapshot/resync protocol.
- `src/scenes/LocalLobbyScene.ts` — SOLO/HOST/JOIN local UI.
- `src/scenes/NetworkBoardScene.ts` — browser two-tab board runtime.
- `src/scenes/SetupScene.ts` — host route sang network board.
- `src/main.ts` — scene order bắt đầu bằng lobby.
- `src/styles.css` — lobby UI.
- `tests/two-tab-session.ts` — two-tab protocol regression.
- `package.json` / `.github/workflows/ci.yml` — test gate mới.

## Known limitations

- BroadcastChannel chỉ chạy cùng origin/trình duyệt profile, chưa phải internet multiplayer.
- Client nên join sau khi host đã hoàn tất Face Setup và vào NetworkBoardScene; PoC chưa có join retry timer robust nếu join packet bị gửi trước khi host endpoint tồn tại.
- Reload client tạo clientId mới nên seat reclaim/reconnect final chưa hoàn thiện.
- Host migration/session auth/anti-cheat production chưa có.
- NetworkBoardScene chưa broadcast face texture/data URL sang client.
- Network movement hiện snap state, chưa tween authoritative command path.
- Network scene chưa tái phát đầy đủ dynamic Card/News/Reaction presentation ở remote tab.
- Full snapshot resync, chưa có delta/compression/version negotiation.
- Chưa có backend/WebSocket packet loss/retry policy thật.
- Chưa khóa hand limit/card-per-turn/win condition/board topology final.
- Tin Tức/reaction vẫn là demo engine content, chưa phải content final/approved.

## Milestone kế tiếp đề xuất

**MVP 0.1.15 — Demo Match Shell + Temporary Win Condition**

Mục tiêu:
1. thêm Match Start/Ready flow rõ ràng;
2. chọn một win condition tạm, dễ thay và ghi rõ chưa final;
3. Match End screen + winner summary;
4. restart/rematch;
5. network host là authority cho start/end match;
6. dọn một lớp debug UI để người ngoài hiểu cách chơi;
7. giữ 0.1.16 cho demo packaging/polish/content pass.

Sau 0.1.15, 0.1.16 nên là mốc **first external playtest build** nếu không phát sinh blocker lớn.

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
15. Two-tab local browser room + authoritative board sync. ✅ PoC.
