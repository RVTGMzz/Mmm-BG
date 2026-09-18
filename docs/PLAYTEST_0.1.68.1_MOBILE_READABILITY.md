# MeMeMe MVP 0.1.68.1 — Mobile Readability + Modal Cleanup

## Mục tiêu

0.1.68.1 không thêm gameplay mới. Đây là pass presentation để bản 0.1.68 dễ đọc hơn trên mobile/Steam Deck và loại các lớp chữ dư khi modal đang mở.

Flow vẫn là:

`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

## Thay đổi cần test

1. Player HUD ưu tiên `Tên + B$`; không còn luôn hiển thị `Chưa có nghề`, `Lương 0`, `🃏0/3`, `🏁0` khi chưa cần.
2. Khi đã có nghề, HUD chỉ thêm một dòng ngắn dạng `Shipper L1 • 45/vòng`.
3. Font tên/tiền lớn hơn và dễ đọc ở landscape mobile.
4. JOB result chỉ giữ thông tin nghề/lương ngắn; không còn paragraph legacy trắng rò phía sau popup.
5. Khi JOB HUB hoặc presentation modal lớn đang mở, ẩn `CITY/version`, `TỔNG QUAN` và pill `LƯỢT:` để modal có không gian riêng.
6. Khi modal đóng, các HUD cần thiết trở lại bình thường.
7. Fullscreen shortcut `⛶ / ↙` vẫn hoạt động dưới Settings.
8. 1/2/3 lượt, CPU, Jail/Hospital release, Podium và Rematch không thay đổi hành vi.

## Cách test nhanh trên mobile

- Dùng landscape + fullscreen.
- Chơi 1 lượt trước.
- Chụp lại 3 trạng thái: HUD thường, JOB HUB, JOB result.
- Nếu cả 3 sạch/readable, mới chạy tiếp 2 và 3 lượt.

## Guardrails

- Không đổi HOST authority, replay/checksum, RNG, economy, camera hay luật 1/2/3 lượt.
- CI PASS không thay thế runtime acceptance trên thiết bị thật.
- Không merge PR #1 nếu chưa có yêu cầu rõ ràng.
