# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.16.1 — First External Playtest Build + Windows Launcher Hotfix**

Mục tiêu milestone: biến demo 0.1.15 thành build có thể đưa cho người ngoài nhóm dev test lần đầu mà không bắt họ hiểu lịch sử kỹ thuật của project, đồng thời sửa friction lớn nhất khi tester Windows double-click `index.html` và gặp màn hình trắng do chạy bằng `file://`.

Luật demo vẫn là **temporary playtest rule**, không phải luật MeMeMe final:
- 4 người chơi;
- 3 vòng = 12 lượt;
- B$ cao nhất thắng;
- bằng B$ thì đồng hạng.

## Onboarding 0.1.16

### Lobby
`LocalLobbyScene` đổi sang nhãn **FIRST PLAYTEST • MVP 0.1.16** và có quick-guide ngay trên màn hình:
- Lá Bài có thể dùng trước roll;
- đổ xúc xắc → di chuyển;
- Card/News tile auto-trigger;
- branch thì chọn đường;
- hết 3 vòng so B$.

Lobby tự kiểm tra `BroadcastChannel`:
- browser hỗ trợ → bật HOST/JOIN 2-tab;
- không hỗ trợ → disable 2-tab nhưng vẫn cho SOLO/HOTSEAT.

### Face Setup giảm friction
0.1.16 không còn bắt buộc phải upload mặt 😐 cho đủ 4 người trước khi test.

- ảnh mặt trở thành optional trong external playtest;
- không có ảnh thì DemoBoard dùng fallback token màu sẵn có;
- nếu có ảnh, ảnh vẫn chỉ xử lý local browser và giữ trong memory của phiên;
- mục tiêu là cho tester vào core gameplay nhanh, nhưng vẫn có thể test USP face avatar nếu muốn.

### In-game quick guide
File mới: `src/scenes/PlaytestDemoBoardScene.ts`.

Scene này kế thừa `DemoBoardScene`, giữ nguyên scene key `DemoBoardScene`, rồi thêm presentation layer cho playtest:
- badge `PLAYTEST 0.1.16`;
- nút `? CÁCH CHƠI`;
- quick-guide 6 bước trong game;
- nhắc rõ luật 3 vòng chỉ là luật tạm;
- trong lúc guide mở, keyboard gameplay tạm disable để tránh tester vô tình roll phía sau overlay.

`src/main.ts` register `PlaytestDemoBoardScene` thay cho class DemoBoardScene gốc, nên các route hiện có vẫn gọi `DemoBoardScene` bình thường mà không phải đổi protocol/gameplay core.

## External playtest packaging

### Portable static paths
`vite.config.ts` dùng `base: './'`.

Production `dist/index.html` dùng asset path tương đối, phù hợp hơn cho static hosting ở subpath/artifact extraction.

### Windows launcher hotfix 0.1.16.1

Tester Windows **không được double-click `index.html` trực tiếp**. Khi URL là `file:///C:/...`, browser có thể chặn ES module/local asset và chỉ hiện màn hình trắng.

Package giờ có:
- `START_PLAYTEST.bat` — double-click để chạy;
- `serve-playtest.ps1` — dependency-free local static server dùng Windows PowerShell + `.NET TcpListener`.

Launcher:
- serve chính thư mục artifact qua `127.0.0.1`;
- ưu tiên port 4173, tự thử tới 4183 nếu bận;
- tự mở browser ở URL localhost;
- giữ terminal làm server cho tới khi tester nhấn `Ctrl+C`;
- không cần Node/Python cho đường chạy mặc định.

Chi tiết: `docs/HOTFIX_0.1.16.1_WINDOWS_LAUNCHER.md`.

### Quickstart nằm trong build
`public/PLAYTEST.txt` được Vite copy vào `dist/PLAYTEST.txt` và giờ đặt `START_PLAYTEST.bat` làm cách chạy Windows mặc định, kèm cảnh báo rõ về `file:///`.

Guide đầy đủ:
- `docs/PLAYTEST_0.1.16.md`
- CI copy thành `dist/PLAYTEST_GUIDE.md` trước khi upload artifact.

### Package verification
`scripts/verify-playtest-package.mjs` kiểm tra:
- `dist/index.html` tồn tại;
- `dist/PLAYTEST.txt` tồn tại;
- `dist/START_PLAYTEST.bat` tồn tại;
- `dist/serve-playtest.ps1` tồn tại;
- có JS + CSS bundle;
- index không dùng absolute `/assets/...` path;
- asset path tương đối hợp lệ;
- quickstart trỏ Windows tester sang launcher và cảnh báo `file:///`;
- launcher gọi PowerShell server;
- server có `TcpListener` và tự mở browser.

## CI gate 0.1.16.1

CI giữ toàn bộ regression cũ và package gate/artifact:
1. TypeScript + Vite production build;
2. deterministic replay fixture;
3. lockstep peer simulator;
4. noisy host/client + snapshot resync;
5. client intent → host authority;
6. two-tab local session fixture;
7. demo match shell + rematch fixture;
8. external playtest package validation;
9. copy full playtest guide;
10. upload artifact `mememe-playtest-0.1.16`.

Golden deterministic replay checksum nền vẫn `0e7e9947`.

## Cách chạy external playtest

### Hotseat Windows
1. Giải nén artifact.
2. Double-click `START_PLAYTEST.bat`.
3. Browser tự mở URL `http://127.0.0.1:<port>/`.
4. Chọn `SOLO / HOTSEAT`.
5. Đặt tên 4 người; ảnh có thể bỏ qua.
6. Bắt đầu demo và chơi đủ 3 vòng.
7. Khi xong nhấn `Ctrl+C` trong cửa sổ launcher để dừng server.

### Two-tab local
1. Chạy `START_PLAYTEST.bat` một lần.
2. Mở cùng URL localhost ở hai tab cùng browser profile.
3. Tab 1: `HOST 2 TAB` → giữ room code → setup → vào bàn.
4. Tab 2: `JOIN 2 TAB` → nhập room code → chọn P2/P3/P4.
5. Host bấm Start.
6. Client chỉ điều khiển seat đã claim; host điều khiển seat còn lại.

Đây vẫn là `BroadcastChannel` same-origin, chưa phải internet multiplayer.

## Source/data integrity giữ nguyên

- Không tự điền các Card_ID trống từ spreadsheet.
- 4 Card runtime source-backed hiện có vẫn giữ nguyên.
- `ACT_001 — Trượt Tay` vẫn là `random_other` host-resolved bằng seeded RNG đúng source.
- Tin Tức/reaction vẫn là demo engine content, chưa được xem là content final.
- Luật 3 vòng/B$ cao nhất vẫn được ghi rõ là temporary playtest rule.

## Known limitations sau 0.1.16.1

- Chưa có WebSocket/backend/internet multiplayer.
- Reload client chưa reclaim seat production-ready.
- Host migration/session auth/anti-cheat production chưa có.
- Remote movement vẫn snap authoritative state, chưa tween full path.
- Client chưa nhận face textures của host.
- Card/News/Reaction presentation giữa host/client chưa đạt parity với mục tiêu final.
- Content hiện còn mỏng cho playtest dài.
- Windows artifact giờ có one-click launcher, nhưng đây vẫn là web build chạy local HTTP server, chưa phải desktop executable native.
- Demo shell lifecycle vẫn ở browser/session layer riêng, chưa encode vào MatchCommand/MatchState.

## Milestone kế tiếp đề xuất

**MVP 0.1.17 — Playtest Feedback + Presentation Parity Pass**

Ưu tiên sau khi đã có build ngoài nhóm:
1. thêm playtest diagnostics/export ngắn gọn để tester gửi bug dễ hơn;
2. hiển thị rõ nguyên nhân B$/Card thay đổi sau mỗi authoritative action;
3. polish remote movement thay vì snap thẳng;
4. face/avatar sharing local giữa host-client nếu privacy contract rõ ràng;
5. tái phát Card/News/Reaction presentation trên client;
6. cân nhắc một hosted playtest URL sau khi local build ổn định;
7. chỉ thay đổi rule/content sau khi có feedback thật, tránh khóa luật quá sớm.

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
13. Host/client queue + noisy transport + snapshot resync. ✅ PoC.
14. ClientIntent → HostAuthority + local transport abstraction. ✅ PoC.
15. Two-tab local browser room + authoritative board sync. ✅ PoC.
16. Demo match start/end/winner/rematch shell. ✅ PoC.
17. First external playtest onboarding + verified package artifact. ✅
18. Windows one-click local launcher hotfix. ✅
