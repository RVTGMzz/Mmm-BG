# MeMeMe MVP 0.1.47 - MULTIPLAYER PRESENTATION PARITY

## Focus

0.1.47 đổi lớp hiển thị theo bộ bài cũ:

- **TIÊN TRI** thay cho Tin Tức và dùng form lá dọc.
- **PHÉP THUẬT** thay cho Lá Bài / Thẻ Bài và dùng form lá ngang.
- Tên kỹ thuật bên trong vẫn giữ `news`, `card_draw`, `card_play`, `play_card` để không ảnh hưởng replay và authority.

## Test HOST + CLIENT

1. Tab A tạo HOST, Tab B JOIN cùng room.
2. Qua Remote Roll For Order rồi vào trận.
3. Khi có Tiên Tri, cả hai tab phải thấy cùng nội dung, actor và event.
4. Khi rút hoặc dùng Phép Thuật, cả hai tab phải thấy cùng lá, cùng mục tiêu và effect.
5. Tab không sở hữu lượt vẫn phải thấy presentation spectator giống tab đang chơi.
6. Client không được tự tạo outcome khác HOST.

## Snapshot / resync

- Snapshot không được phát lại presentation cũ.
- State packet bình thường chỉ enqueue event mới hơn presentation cursor.
- Queued `move_step` vẫn sở hữu token movement; snapshot/rematch mới được hard-snap.

## Retained rules

- Remote Roll For Order vẫn host-authoritative.
- Multiplayer Job Hub vẫn host-authoritative.
- Job D6: `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Starting wallet: `200 B$`.
- Mỗi người hoàn thành 1 vòng trước khi chốt B$.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Final Mini Game payout phải commit trước khi chốt kết quả.
- Final podium/result gate giữ nguyên.

## Audio / privacy

- Bốn BGM approved và tám SFX supplied giữ nguyên checksum.
- Ảnh mặt gốc vẫn local.
- Các ảnh reference Tiên Tri / Phép Thuật chỉ dùng làm visual direction, chưa đóng gói thành runtime asset.

## Known limits

- 2-tab hiện vẫn là BroadcastChannel local QA.
- CPU vẫn là QA bot.
- Jail deep mechanics vẫn chưa được định nghĩa.
