# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.16 — First External Playtest Build / Packaging + Onboarding Polish**

Mục tiêu milestone: biến demo 0.1.15 thành build có thể đưa cho người ngoài nhóm dev test lần đầu mà không bắt họ hiểu lịch sử kỹ thuật của project.

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
File mới: `vite.config.ts` với `base: './'`.

Production `dist/index.html` dùng asset path tương đối, phù hợp hơn cho static hosting ở subpath/artifact extraction.

Lưu ý: build web vẫn nên chạy qua HTTP static server, **không cam kết chạy trực tiếp bằng `file://`**.

### Quickstart nằm trong build
File mới: `public/PLAYTEST.txt`.

Vite copy file này vào `dist/PLAYTEST.txt` để tester luôn có quickstart đi kèm package.

Guide đầy đủ:
- `docs/PLAYTEST_0.1.16.md`
- CI copy thành `dist/PLAYTEST_GUIDE.md` trước khi upload artifact.

### Package verification
File mới: `scripts/verify-playtest-package.mjs`.

`npm run test:package` kiểm tra:
- `dist/index.html` tồn tại;
- `dist/PLAYTEST.txt` tồn tại;
- có JS + CSS bundle;
- index không dùng absolute `/assets/...` path;
- asset path tương đối hợp lệ cho static hosting.

Verified CI output:

`[playtest-package-ci] PASS assets=2 quickstart=PLAYTEST.txt relativePaths=PASS`

## CI gate 0.1.16

CI giữ toàn bộ regression cũ và thêm package gate/artifact:
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

Verified run trên head `7f15b3aacdb584d3b264c184c9c3a93b65633e1b`:
- build: PASS;
- replay: PASS;
- lockstep: PASS;
- host/client: PASS;
- authority: PASS;
- two-tab: PASS;
- demo shell: PASS;
- package validation: PASS;
- artifact upload: PASS.

Artifact từ run này:
- name: `mememe-playtest-0.1.16`;
- artifact id: `10310720803`;
- size: 368055 bytes;
- retention: 14 ngày từ run;
- SHA-256: `72fc82c865bacf998b4ca1a09f2d78b456e1ff17a401951b134a7dff5d671be5`.

Golden deterministic replay checksum nền vẫn `0e7e9947`.

## Cách chạy external playtest

### Hotseat
1. Serve thư mục `dist/` bằng static HTTP server.
2. Mở URL localhost/static host.
3. Chọn `SOLO / HOTSEAT`.
4. Đặt tên 4 người; ảnh có thể bỏ qua.
5. Bắt đầu demo và chơi đủ 3 vòng.

### Two-tab local
1. Mở cùng URL ở hai tab cùng browser profile.
2. Tab 1: `HOST 2 TAB` → giữ room code → setup → vào bàn.
3. Tab 2: `JOIN 2 TAB` → nhập room code → chọn P2/P3/P4.
4. Host bấm Start.
5. Client chỉ điều khiển seat đã claim; host điều khiển seat còn lại.

Đây vẫn là `BroadcastChannel` same-origin, chưa phải internet multiplayer.

## Source/data integrity giữ nguyên

- Không tự điền các Card_ID trống từ spreadsheet.
- 4 Card runtime source-backed hiện có vẫn giữ nguyên.
- `ACT_001 — Trượt Tay` vẫn là `random_other` host-resolved bằng seeded RNG đúng source.
- Tin Tức/reaction vẫn là demo engine content, chưa được xem là content final.
- Luật 3 vòng/B$ cao nhất vẫn được ghi rõ là temporary playtest rule.

## Known limitations sau 0.1.16

- Chưa có WebSocket/backend/internet multiplayer.
- Reload client chưa reclaim seat production-ready.
- Host migration/session auth/anti-cheat production chưa có.
- Remote movement vẫn snap authoritative state, chưa tween full path.
- Client chưa nhận face textures của host.
- Card/News/Reaction presentation giữa host/client chưa đạt parity với mục tiêu final.
- Content hiện còn mỏng cho playtest dài.
- Demo build artifact vẫn cần HTTP static server; chưa có one-click desktop executable.
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
