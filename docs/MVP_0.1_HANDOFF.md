# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.16.2 — Simple CPU / Autoplay Test Bots**

Mục tiêu: cho một người có thể test trọn demo mà không phải tự điều khiển cả 4 ghế, đồng thời thêm 4-CPU autoplay để stress-test turn/card/branch trước khi chuyển sang presentation parity 0.1.17.

CPU ở milestone này là **QA bot đơn giản**, không phải AI gameplay final và không khóa bất kỳ thiết kế AI/personality nào.

## Play modes mới

`SOLO / CPU TEST` ở Lobby có 4 lựa chọn:
- **1 người + 3 CPU**: P1 người thật, P2/P3/P4 CPU. Đây là mode khuyên dùng khi test một mình.
- **2 người + 2 CPU**: P1/P2 người thật, P3/P4 CPU.
- **4 người HOTSEAT**: không có CPU.
- **4 CPU AUTOPLAY**: cả trận tự chạy sau khi bấm Start, dùng để soi deadlock/turn flow.

CPU chỉ được bật trong solo local. `HOST/JOIN 2 TAB` giữ behavior cũ và không trộn CPU vào network PoC.

## CPU policy

File mới: `src/core/testBot.ts`.

`chooseTestBotIntent()` chỉ đưa ra `ClientIntent` cấp cao, vẫn đi qua `TwoTabHostSession -> HostAuthority` như thao tác người thật.

Policy hiện tại:
1. nếu đang `PRE_ROLL_ACTION`, có card hợp lệ, không bị khóa và chưa dùng card trong lượt thì dùng card đầu tiên trong tay;
2. card `single_other` chọn đối thủ đang có nhiều B$ nhất, tie thì player id thấp hơn;
3. `random_other` vẫn để HostAuthority quyết định target bằng seeded RNG đúng contract hiện có;
4. sau card thì roll;
5. nếu phase là `BRANCH_CHOICE`, bot chọn một outgoing edge theo `(turnNumber + playerId) % edgeCount`;
6. bot không gọi RNG riêng, nên không âm thầm làm lệch dice/card/news stream ngoài những command gameplay nó thật sự tạo.

## Browser/session integration

`src/core/browserSession.ts` thêm `cpuSeatIds` cho solo config và helper `isCpuSeat()`.

`src/scenes/LocalLobbyScene.ts` thêm dropdown CPU mode.

`src/scenes/SetupScene.ts`:
- ghế CPU có badge 🤖;
- default name `CPU N`;
- ảnh vẫn optional;
- nhắc rõ CPU chỉ là test bot.

`src/scenes/PlaytestDemoBoardScene.ts`:
- badge lên `PLAYTEST 0.1.16.2`;
- hiện danh sách CPU seat;
- CPU action delay khoảng 520ms để tester nhìn kịp state;
- CPU tự submit card/roll/branch qua authority path;
- normal human Roll/Card controls bị khóa khi current seat là CPU;
- guide mở sẽ tạm dừng bot timer;
- quick guide giải thích 1P+3CPU và 4CPU autoplay.

Playtest wrapper hiện shadow `canControlCurrentPlayer()` ở runtime để khóa input người thật trên CPU seat mà không sửa deterministic `DemoBoardScene` core. Đây là test-only integration, có thể thay bằng controller abstraction sạch hơn nếu CPU trở thành gameplay feature thật.

## CI bot stress

File mới: `tests/test-bot-autoplay.ts`.

`npm run test:bots` chạy 32 trận 4-CPU headless, mỗi trận 12 lượt và kiểm tra:
- đủ roll;
- có exercise card use;
- có exercise branch choice;
- không vượt safety command limit/deadlock;
- kết thúc ở `PRE_ROLL_ACTION` lượt 13;
- cùng seed chạy hai lần phải có cùng checksum và command count.

Verified output trên implementation run:

`[test-bot-ci] PASS matches=32 turns=384 cards=62 branches=126 maxCommands=20 deterministic=eab8d759`

`auto-roll PASS • card-use PASS • branch-choice PASS • no-deadlock PASS • same-seed PASS`

Golden deterministic replay nền vẫn giữ `0e7e9947`.

## Windows launcher giữ nguyên

Hotfix 0.1.16.1 vẫn áp dụng:
- giải nén artifact;
- double-click `START_PLAYTEST.bat`;
- launcher chạy dependency-free PowerShell static server trên localhost;
- không mở `index.html` trực tiếp bằng `file:///`.

Package vẫn có:
- `START_PLAYTEST.bat`;
- `serve-playtest.ps1`;
- `PLAYTEST.txt`;
- `PLAYTEST_GUIDE.md`.

Artifact CI được đổi tên thành `mememe-playtest-0.1.16.2`.

## Demo rule vẫn chỉ là playtest rule

- 4 người;
- 3 vòng = 12 lượt;
- B$ cao nhất thắng;
- hòa B$ = đồng hạng;
- không phải win condition final.

## Source/data integrity giữ nguyên

- Không tự điền các Card_ID trống từ spreadsheet.
- 4 Card runtime source-backed giữ nguyên.
- `ACT_001 — Trượt Tay` vẫn `random_other`, target do host seeded RNG resolve.
- Tin Tức/reaction vẫn là demo engine content.
- CPU không thay đổi rarity, card logic hay win condition.

## Known limitations

- CPU hiện là deterministic QA bot rất đơn giản, chưa có personality/strategy/difficulty.
- CPU mode chỉ solo local, chưa phối hợp với 2-tab client seats.
- Chưa có WebSocket/backend/internet multiplayer.
- Client reload chưa reclaim seat production-ready.
- Remote movement vẫn snap authoritative state.
- Client chưa nhận face textures của host.
- Card/News/Reaction presentation giữa host/client chưa parity hoàn chỉnh.
- Content hiện còn mỏng.
- Demo shell lifecycle vẫn ở browser/session layer riêng.

## Milestone kế tiếp đề xuất

**MVP 0.1.17 — Playtest Feedback + Presentation Parity Pass**

Ưu tiên:
1. diagnostics/export bug report cho tester;
2. giải thích rõ B$/Card delta sau action;
3. remote movement tween/presentation;
4. local face sharing nếu privacy contract rõ;
5. replay Card/News/Reaction presentation trên client;
6. dùng CPU autoplay để regression-test các polish mới;
7. chưa biến CPU test bot thành AI final cho tới khi core gameplay/rule ổn hơn.

## Nguyên tắc MVP đã đạt

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
13. Host/client queue + snapshot resync. ✅ PoC.
14. ClientIntent → HostAuthority. ✅ PoC.
15. Two-tab local browser room. ✅ PoC.
16. Demo start/end/winner/rematch shell. ✅ PoC.
17. First external playtest package. ✅
18. Windows one-click local launcher. ✅
19. Simple CPU + 4-CPU autoplay regression. ✅
