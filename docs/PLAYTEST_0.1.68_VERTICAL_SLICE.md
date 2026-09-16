# MeMeMe MVP 0.1.68 — Vertical Slice Stabilization

## Mục tiêu

0.1.68 là baseline end-to-end, ưu tiên chơi trọn một trận ổn định thay vì thêm hệ thống mới.

Flow cần test:

`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

## Cách chạy

- Windows package: chỉ dùng `START_PLAYTEST.bat`.
- Web: dùng public GitHub Pages playtest hiện hành.
- Mobile ưu tiên landscape; có nút `⛶` dưới nút Settings để vào fullscreen khi trình duyệt hỗ trợ.
- Steam Deck/browser gamepad tiếp tục dùng navigation layer hiện hành.

## Checklist runtime chính

1. Menu hiển thị đúng MVP 0.1.68 và vào Setup bình thường.
2. Setup tên/mặt không tràn UI; bấm TIẾP TỤC mở màn CHỌN LUẬT CHƠI riêng.
3. Chọn lần lượt 1 / 2 / 3 LƯỢT và xác nhận target tương ứng 1 / 2 / 3 vòng mỗi người.
4. Roll For Order nằm gọn trong frame, hiển thị đúng build 0.1.68 và dùng authoritative D6.
5. Chơi nhiều lượt/CPU không freeze, đặc biệt sau Jail/Hospital release và Job Hub.
6. Popup JOB không để dòng legacy/HUD lộ xuyên phía sau trong lúc modal đang mở.
7. TIN TỨC / LÁ BÀI, branch, Mini Game, Lottery, Jail/Hospital tiếp tục resolve bình thường.
8. Mobile landscape/fullscreen không làm lệch DOM overlay khỏi canvas; icon fullscreen không che HUD.
9. Trận kết thúc đúng target 1/2/3 vòng, chuyển sang Podium đúng thứ hạng.
10. CHƠI LẠI reset match về trạng thái sạch; VỀ LOBBY quay đúng menu.
11. Theo dõi long-run token snap-back và mọi UI ghost sau nhiều lượt.

## Guardrails

- Không thay HOST authority, replay/checksum determinism hay RNG stream trong pass này.
- Không merge PR #1 chỉ vì 0.1.68 xanh CI.
- CI PASS không thay thế runtime acceptance trên điện thoại/Steam Deck.
- 0.1.68 chỉ được coi là user-accepted sau khi flow thực tế ở trên được xác nhận.
