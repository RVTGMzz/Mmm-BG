# MeMeMe MVP 0.1.26 — Turn Stakes & Money Drama

## Mục tiêu test

0.1.26 giữ nguyên gameplay/economy 200 B$ của 0.1.25 và tập trung làm trạng thái thắng thua dễ đọc hơn ngay trong lúc chơi.

## Những điểm mới cần nhìn

1. Bảng B$ góc phải tự xếp theo tiền hiện tại.
2. Người dẫn đầu có `👑`; người cuối bảng có `🛟`.
3. Khi toàn bàn bằng tiền nhau, không ai bị gắn crown/lifebuoy giả.
4. Dòng lượt hiện tại hiển thị tên + B$ + hạng.
5. Khi B$ thay đổi, `+/- B$` nhỏ xuất hiện cạnh đúng dòng người chơi rồi tự biến mất.
6. Khi leader đổi người, leaderboard pulse nhẹ, không che map và không khóa lượt.
7. Snapshot/resync không được phát lại wallet delta cũ.

## Regression cần giữ

- New match vẫn bắt đầu 200 B$.
- Money tile / News / Phao Cứu Sinh vẫn theo scale 0.1.25.
- READY vẫn +100 B$.
- Card/News/Reaction queue không backlog.
- Odd/even route, movement từng ô, dice, Settings, BGM và SFX giữ nguyên.
- Không thêm gameplay RNG hoặc command mới.

## Cách test nhanh

Chơi `1 người + 3 CPU` đủ 3 vòng. Quan sát bảng B$ sau mỗi lần có Money tile, News, Card và READY. Đặc biệt để ý lúc người dẫn đầu đổi ngôi và lúc một người tụt xuống cuối bảng.
