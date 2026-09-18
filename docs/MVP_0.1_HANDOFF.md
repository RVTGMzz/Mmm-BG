# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.16.2 — Simple CPU / Autoplay Test Bots + Audio Handoff Staging**

Mục tiêu gameplay của 0.1.16.2: cho một người có thể test trọn demo mà không phải tự điều khiển cả 4 ghế, đồng thời thêm 4-CPU autoplay để stress-test turn/card/branch trước khi chuyển sang presentation parity 0.1.17.

CPU ở milestone này là **QA bot đơn giản**, không phải AI gameplay final và không khóa bất kỳ thiết kế AI/personality nào.

Audio staging ở cuối milestone chỉ chuẩn bị nguyên liệu/contract cho build kế tiếp, chưa bật playback trong runtime 0.1.16.2.

## Play modes mới

`SOLO / CPU TEST` ở Lobby có 4 lựa chọn:
- **1 người + 3 CPU**: P1 người thật, P2/P3/P4 CPU. Đây là mode khuyên dùng khi test một mình.
- **2 người + 2 CPU**: P1/P2 người thật, P3/P4 CPU.
- **4 người HOTSEAT**: không có CPU.
- **4 CPU AUTOPLAY**: cả trận tự chạy sau khi bấm Start, dùng để soi deadlock/turn flow.

CPU chỉ được bật trong solo local. `HOST/JOIN 2 TAB` giữ behavior cũ và không trộn CPU vào network PoC.

## CPU policy

File: `src/core/testBot.ts`.

`chooseTestBotIntent()` chỉ đưa ra `ClientIntent` cấp cao, vẫn đi qua `TwoTabHostSession -> HostAuthority` như thao tác người thật.

Policy hiện tại:
1. nếu đang `PRE_ROLL_ACTION`, có card hợp lệ, không bị khóa và chưa dùng card trong lượt thì dùng card đầu tiên trong tay;
2. card `single_other` chọn đối thủ đang có nhiều B$ nhất, tie thì player id thấp hơn;
3. `random_other` vẫn để HostAuthority quyết định target bằng seeded RNG đúng contract hiện có;
4. sau card thì roll;
5. nếu phase là `BRANCH_CHOICE`, bot chọn một outgoing edge theo `(turnNumber + playerId) % edgeCount`;
6. bot không gọi RNG riêng, nên không âm thầm làm lệch dice/card/news stream ngoài những command gameplay nó thật sự tạo.

## Browser/session integration

`src/core/browserSession.ts` có `cpuSeatIds` cho solo config và helper `isCpuSeat()`.

`src/scenes/LocalLobbyScene.ts` có dropdown CPU mode.

`src/scenes/SetupScene.ts`:
- ghế CPU có badge 🤖;
- default name `CPU N`;
- ảnh vẫn optional;
- nhắc rõ CPU chỉ là test bot.

`src/scenes/PlaytestDemoBoardScene.ts`:
- badge `PLAYTEST 0.1.16.2`;
- hiện danh sách CPU seat;
- CPU action delay khoảng 520ms để tester nhìn kịp state;
- CPU tự submit card/roll/branch qua authority path;
- normal human Roll/Card controls bị khóa khi current seat là CPU;
- guide mở sẽ tạm dừng bot timer;
- quick guide giải thích 1P+3CPU và 4CPU autoplay.

Playtest wrapper shadow `canControlCurrentPlayer()` ở runtime để khóa input người thật trên CPU seat mà không sửa deterministic `DemoBoardScene` core. Đây là test-only integration, có thể thay bằng controller abstraction sạch hơn nếu CPU trở thành gameplay feature thật.

## CI bot stress

File: `tests/test-bot-autoplay.ts`.

`npm run test:bots` chạy 32 trận 4-CPU headless, mỗi trận 12 lượt và kiểm tra:
- đủ roll;
- có exercise card use;
- có exercise branch choice;
- không vượt safety command limit/deadlock;
- kết thúc ở `PRE_ROLL_ACTION` lượt 13;
- cùng seed chạy hai lần phải có cùng checksum và command count.

Verified output:

`[test-bot-ci] PASS matches=32 turns=384 cards=62 branches=126 maxCommands=20 deterministic=eab8d759`

`auto-roll PASS • card-use PASS • branch-choice PASS • no-deadlock PASS • same-seed PASS`

Golden deterministic replay nền vẫn giữ `0e7e9947`.

## Approved BGM pack staged for next build

Audio source bundle prepared in the current work session:

`MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:
`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Canonical repo metadata:
- `docs/AUDIO_PACK_0.1.16.2.md`
- `assets/audio/bgm/bgm_manifest.json`
- `src/audio/bgmCatalog.ts`
- `docs/LATEST_HANDOFF.md`

Approved playtest tracks:
1. `01_Menu_MeMeMe_LOOP.ogg` — 02:35.99 — menu/lobby — SHA-256 `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e`
2. `02_City_Bubble_LOOP.ogg` — 02:06.38 — gameplay — SHA-256 `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5`
3. `03_City_Silly_LOOP_EXTENDED.ogg` — 02:18.07 — gameplay — SHA-256 `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d`
4. `04_Final_Round_LOOP.ogg` — 02:00.02 — final round — SHA-256 `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83`

Format:
- OGG Vorbis Q4;
- 48 kHz stereo;
- whole-file seamless loops;
- source supplied as MP3, so final release should be re-encoded from WAV if WAV masters become available.

Intended 0.1.17 flow:
- Lobby/Menu → `menu_mememe` loop;
- Round 1–2 → alternate/randomize `city_bubble` and `city_silly`, avoid immediate repeat;
- Round 3 → transition to `final_round`;
- add BGM mute/volume control;
- keep audio presentation-only so deterministic gameplay/replay/checksum state is unaffected.

Expected binary paths after import:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

### Binary connector limitation

The GitHub connector available in this session can write UTF-8 repository files but cannot directly upload binary OGG/ZIP bytes. Therefore the repo now contains the exact filenames, hashes, metadata, expected paths and TypeScript catalog, while the binary bundle itself remains in the ChatGPT file context/File Library under the exact filename above.

When resuming in a new chat, recover the bundle by exact filename and verify its SHA-256. Do not silently regenerate or substitute the tracks if the bundle is missing.

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

Artifact CI hiện mang tên `mememe-playtest-0.1.16.2`.

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
- BGM không được phép tác động RNG/gameplay authority state.

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
- BGM metadata/catalog đã stage nhưng binary OGG chưa commit trực tiếp do connector limitation và runtime playback chưa được wired.

## Milestone kế tiếp

**MVP 0.1.17 — Playtest Feedback + Presentation Parity + BGM Integration**

Ưu tiên:
1. recover/import đúng BGM bundle theo checksum rồi wire menu/gameplay/final-round flow;
2. add BGM mute/volume control;
3. diagnostics/export bug report cho tester;
4. giải thích rõ B$/Card delta sau action;
5. remote movement tween/presentation;
6. local face sharing nếu privacy contract rõ;
7. replay Card/News/Reaction presentation trên client;
8. dùng CPU autoplay để regression-test các polish/audio lifecycle mới;
9. chưa biến CPU test bot thành AI final cho tới khi core gameplay/rule ổn hơn.

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
20. BGM manifest/catalog/handoff contract staged for next build. ✅
