# NEXT CHAT PROMPT — MeMeMe Board Game

Tiếp tục MeMeMe Board Game từ `HANDOFF_CURRENT.md` trên branch `mememe-mvp-0.1-core`.

Đọc theo thứ tự:

1. `HANDOFF_CURRENT.md`
2. `docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`
3. `docs/UI_FINAL_PLAYER_HUD.md`
4. `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
5. `docs/GAME_DESIGN_CURRENT.md`
6. `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
7. `docs/MVP_0.1.56_BRANCH_IDENTITY.md`
8. `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`

Sau đó inspect:
- `src/scenes/FinalMapPreviewScene052.ts`
- `src/scenes/CareerMinigameBoardScene056.ts`
- `src/scenes/PresentationParityBoardScene.ts`
- `src/scenes/DemoBoardScene.ts`
- `src/main.ts`

## Trạng thái cần nhớ

- 0.1.48 vẫn là user-validated authoritative rollback baseline.
- 0.1.56 Branch Identity gameplay/CI green.
- Artifact 0.1.56: `mememe-playtest-0.1.56-branch-identity`
- Run: `#1846 / 34908302700`
- Code SHA: `dfa391e50666802dfc91ae2e3c585da39837bac1`
- Artifact ID: `10373547363`
- SHA256: `8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44`

Nhưng Ron đã manual-test `START_PLAYTEST.bat` và **không chấp nhận presentation hiện tại**.

## Lỗi presentation đã xác nhận

- header/badge vẫn leak `0.1.25`;
- normal gameplay hiện full board thay vì close camera;
- camera quá xa;
- chưa có HUD 4 góc final;
- 44 ô Draft D bị dồn/chồng trong old 1280×720 shell;
- event/card overlay che quá nhiều map;
- old `MeMeMe CITY / DEMO MATCH` copy còn sót.

Root cause:
- `START_PLAYTEST.bat` và `main.ts` không launch nhầm.
- `CareerMinigameBoardScene056` chỉ wrap `CareerMinigameBoardScene048`.
- authoritative scene chain vẫn render qua old `DemoBoardScene` / `PresentationParityBoardScene`.
- camera/HUD tốt hơn đang tồn tại ở preview `FinalMapPreviewScene052` nhưng chưa được extract/reuse vào canonical runtime.
- version label đang mutate bằng chained exact-string replacement nên downstream update có thể fail.

## Immediate milestone

Làm **0.1.56.1 — Canonical Presentation Consolidation** trước 0.1.57.

Mục tiêu:
- giữ nguyên authoritative gameplay/state;
- `START_PLAYTEST.bat` phải là build đẹp/tốt nhất;
- close active-token camera;
- smooth follow movement;
- branch junction zoom-out vừa đủ thấy cả 2 hướng rồi zoom lại;
- fixed screen-space HUD: P1 TL / P2 TR / P3 BL / P4 BR;
- explicit Overview/full-map only;
- clean Draft D greybox tile rendering, không giant circle chồng nhau;
- integrate Job/Mini Game identity gọn;
- TIN TỨC/LÁ BÀI overlay nhỏ/gọn hơn, giữ board context;
- one authoritative visible build/version source, bỏ chained label mutation.

Không duplicate gameplay state từ preview. Chỉ extract/reuse presentation ideas.

Phải giữ green:
- replay/checksum;
- HOST authority;
- multiplayer parity;
- remote Roll For Order;
- Job Hub;
- Mini Game payout ownership;
- stale token guard;
- audio/BGM;
- READY/lap/final result;
- branch rules 0.1.56.

## Locked gameplay rules

Draft D:
- 44 main spaces `M01..M44`;
- 3 forward equal-step junctions;
- 5 Mini Games `M09/M17/M26/M35/M44`;
- Branch A AN TOÀN = Normal×3;
- Branch B DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- Branch C TIỀN = +25/-20/+25 B$;
- other route = PHỐ CHÍNH.

Special locations for later 0.1.57:
- Jail releases on `1/3/5`;
- Hospital releases exactly on `2/4/5`;
- release die only checks release;
- success traverses 3 exit spaces then fresh movement D6 same turn;
- Jail/Hospital players cannot join Mini Games;
- 1 eligible participant = auto rank #1;
- 0 eligible = skip/no payout;
- Lottery = D6×20 B$.

Keep **TIN TỨC / LÁ BÀI**.
Do not merge PR #1 unless Ron explicitly asks.
