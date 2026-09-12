# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.15 — Demo Match Shell + Temporary Win Condition**

Mục tiêu milestone: biến vertical slice kỹ thuật thành một trận demo có đầu, giữa và cuối rõ ràng để chuẩn bị external playtest. Luật thắng ở milestone này **chỉ là luật demo tạm**, cố ý dễ thay và không được xem là game design final.

## Luật demo tạm 0.1.15

- 4 người chơi.
- 3 vòng = 12 lượt tổng.
- Sau lượt thứ 12, trận kết thúc.
- Người có nhiều B$ nhất thắng.
- Nếu nhiều người bằng B$ cao nhất thì đồng hạng.
- Không thêm tiebreaker tự chế.

Code nằm trong `src/core/demoMatch.ts`:
- `DemoMatchShellState` với `waiting | active | ended`;
- `turnLimit` tính từ player count × round count;
- `shouldEndDemoMatch()`;
- `demoMatchResult()`;
- `demoMatchTurnProgress()`.

Luật này không thay đổi deterministic MatchState schema v3 và không làm đổi golden replay checksum cũ.

## Demo shell sync

File mới: `src/core/demoShellSession.ts`.

Shell state được host sở hữu và đồng bộ riêng qua local transport:
- client gửi `shell_hello`;
- host trả/broadcast `shell_state`;
- host chuyển `waiting → active` khi bấm bắt đầu;
- host tính winner và chuyển `active → ended` sau vòng cuối;
- rematch reset shell rồi vào active lại.

Shell protocol cố ý tách khỏi `MatchCommand` để không phá deterministic gameplay contract 0.1.8–0.1.14. Gameplay command authority vẫn do `TwoTabHostSession + HostAuthority` giữ.

## DemoBoardScene

Scene mới: `src/scenes/DemoBoardScene.ts`.

Đây là scene chính cho demo 0.1.15 ở cả hotseat và two-tab:
- màn chờ trước trận;
- host/hotseat có nút **BẮT ĐẦU DEMO**;
- client thấy **CHỜ HOST BẮT ĐẦU**;
- HUD hiện vòng hiện tại và tiến độ lượt;
- Roll / Card / Branch chỉ mở khi shell đang `active`;
- hết 3 vòng sẽ khóa gameplay và hiện Match End overlay;
- winner summary + bảng xếp hạng B$;
- host/hotseat có **CHƠI LẠI**;
- rematch tạo seed mới, reset money/board/hand/command seq về đầu trận;
- client nhận authoritative state mới rồi tiếp tục cùng host;
- tất cả có nút **VỀ LOBBY**.

`BoardScene` và `NetworkBoardScene` cũ vẫn giữ lại như technical reference/regression path, nhưng flow demo mới đi qua `DemoBoardScene`.

## Lobby + Setup flow

`LocalLobbyScene` hiện có:
1. **SOLO / HOTSEAT** — Face Setup 4 người → DemoBoardScene;
2. **HOST 2 TAB** — room code → Face Setup → DemoBoardScene;
3. **JOIN 2 TAB** — room code + P2/P3/P4 → vào thẳng DemoBoardScene.

Host có thể cho client join trước khi bấm bắt đầu.

0.1.15 cũng thêm retry đơn giản ở client:
- nếu join packet gửi trước khi host endpoint tồn tại, client re-send join request khoảng mỗi 1.5s;
- shell state cũng được request lại cho tới khi nhận được.

## Multiplayer behavior giữ nguyên

- Host giữ `HostAuthority`.
- Client chỉ gửi `ClientIntent`.
- Host điều khiển ghế chưa bị client claim.
- Client chỉ điều khiển đúng seat của mình.
- Roll/Branch/Card đều qua authority protocol.
- State/snapshot checksum vẫn được verify.
- `ACT_001 — Trượt Tay` vẫn dùng host-resolved seeded `random_other` đúng source.

Rematch không tạo authority contract mới; host reset `authority.source/state/receipts`, broadcast state command boundary #0 và shell active mới. Seat claim hiện tại được giữ trong cùng browser session.

## Face behavior

- Host/hotseat vẫn dùng Face Setup đủ 4 người.
- Client join chưa nhận face texture từ host nên dùng fallback token màu.
- Ảnh vẫn local browser, chưa upload server.

## CI gate 0.1.15

`.github/workflows/ci.yml` chạy 7 tầng:
1. `npm run build`;
2. `npm run test:replay`;
3. `npm run test:lockstep`;
4. `npm run test:host-client`;
5. `npm run test:authority`;
6. `npm run test:two-tab`;
7. `npm run test:demo-shell`.

Fixture mới: `tests/demo-match-shell.ts`.

Nó kiểm tra:
- shell waiting sync;
- host start sync sang client;
- 3 vòng / 12 lượt thật;
- match end;
- winner list đồng bộ;
- rematch reset turn/command boundary/money;
- client nhận state rematch.

Golden deterministic fixture nền vẫn giữ checksum `0e7e9947`.

## File mới/thay đổi chính

- `src/core/demoMatch.ts` — temporary demo rule + winner/progress helpers.
- `src/core/demoShellSession.ts` — host/client shell state sync.
- `src/scenes/DemoBoardScene.ts` — unified demo runtime.
- `src/scenes/LocalLobbyScene.ts` — demo wording + JOIN route fix.
- `src/scenes/SetupScene.ts` — route solo/host vào DemoBoardScene.
- `src/main.ts` — register DemoBoardScene.
- `tests/demo-match-shell.ts` — demo lifecycle regression.
- `package.json` / `.github/workflows/ci.yml` — seventh CI gate.

## Known limitations

- **3 vòng + B$ cao nhất thắng chỉ là luật demo tạm**, chưa phải win condition final.
- Demo shell gate hiện ở browser/session layer riêng, chưa được encode thành `MatchCommand`/MatchState schema. UI hợp lệ sẽ không gửi gameplay intent trước Start/sau End, nhưng production network protocol vẫn cần formalize lifecycle authority hơn nữa.
- BroadcastChannel vẫn chỉ same-origin/local browser, chưa internet multiplayer.
- Reload client tạo clientId mới; seat reclaim/reconnect production chưa xong.
- Host migration/session auth/anti-cheat production chưa có.
- Remote movement hiện snap authoritative state, chưa tween path đẹp.
- Client chưa nhận face textures và chưa tái phát đầy đủ Card/News/Reaction presentation.
- Full snapshot resync chưa có delta/compression/version negotiation.
- Content vẫn rất mỏng: chỉ 4 Card source-backed và Tin Tức/reaction demo engine content.
- Hand limit/card-per-turn, board topology và các hệ Job/Pet/Minigame chưa phải luật final.

## Milestone kế tiếp

**MVP 0.1.16 — First External Playtest Build / Packaging + Polish**

Ưu tiên:
1. dọn debug text/HUD cho người ngoài dễ hiểu;
2. thêm màn hướng dẫn cực ngắn trước trận;
3. tween remote movement thay vì snap nếu không tạo regression;
4. đồng bộ face avatar host → client hoặc có fallback trình bày đẹp hơn mà vẫn tôn trọng privacy;
5. pass UI cho Card/News/Reaction trong DemoBoardScene;
6. tạo build/package dễ mở cho tester;
7. checklist test hotseat + two-tab;
8. giữ rõ nhãn **PLAYTEST / RULES NOT FINAL**.

Nếu 0.1.16 không gặp blocker lớn, đây là mốc phù hợp để gửi build đầu tiên cho mem Discord/bạn bè chơi thử.

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
16. Demo match start/end/winner/rematch shell. ✅ PoC.
