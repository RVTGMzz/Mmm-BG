# Legacy Rules Reference — Bitches In Town

> **Status:** Historical reference only.  
> Đây là luật prototype cũ được lưu để không mất ý tưởng. Không mặc định mang toàn bộ sang MeMeMe.

## 1. Game modes

### Tranh ngôi đoạt vị
- Trò chơi kết thúc khi có người lên ngôi Nữ Hoàng.
- Người về đích đầu tiên nhận 500 Bitches Dollar.
- Winner cuối dựa trên tổng tiền, Queen có lợi thế nhưng không chắc thắng.
- Người nhanh nhất và chậm nhất mỗi vòng nhận/vận hành hệ vương miện theo vòng.

### Sống còn
- Người chơi bị loại dần vì phá sản.
- Sau 3 vòng đầu của mỗi người, tiền âm được tính là phá sản.
- Còn 1 người có tiền là thắng.
- Legacy reward/penalty cho người nhanh/chậm gồm Cờ Tiên Phong và Quần Xì Đội Đầu.

## 2. Money / dice rounding

- Currency cũ: Bitches Dollars (B$).
- Tiền theo % nếu ra số lẻ dưới 5 B$ thì làm tròn xuống theo chục.
- Dice point lẻ làm tròn xuống.

## 3. Branching intersections

- Có các ngã 3 trên board.
- Khi đi qua/dừng tại ngã 3:
  - lẻ → nhánh dưới;
  - chẵn → nhánh trên.
- Hai đường một chiều từ Bệnh Viện/Đồn Cảnh Sát ra không tính như ngã 3 thường.

Đây là một mechanic legacy đáng giữ để prototype vì tạo “luck over choice”.

## 4. Active/special tiles

### Ready
- điểm xuất phát;
- đi ngang hoặc dừng sau một vòng lớn thì hoàn thành một vòng.

### Trung tâm tư vấn
- mỗi vòng khi ghé qua, roll để nhận việc mới hoặc thăng cấp;
- chỉ tính một lần mỗi vòng.

### Cửa hàng phép thuật
- legacy shop cho spell;
- đi ngang mua được 2;
- dừng đúng ô mua được 3;
- bốc 5 để chọn/giao dịch rồi xào lại;
- giao dịch có thể bí mật.

### Giếng tiên tri
- bốc một lời tiên tri/event và đọc cho mọi người.

### Tiên Ú / Pet
- legacy point để nhận spell/pet bí mật.

### Game
- khi một người vào, mọi người đủ điều kiện phải tham gia minigame.

### Đạp cứt chó
- mất một lượt dice ở lần sau.

## 5. Legacy prophecy system

Các nhóm từng có:
- dịch chuyển;
- lá giữ tới lúc sử dụng;
- thẻ ra tù/ra viện có thể giao dịch;
- global curse/thời tiết theo số lượt.

Tên `Tiên tri` hiện đã được rebrand thành **Tin Tức** cho MeMeMe.

## 6. Legacy spell system

- tối đa 2 spell use mỗi lượt, tính cả active/passive;
- nếu đã dùng đủ active thì không còn slot để phản kháng passive;
- reset quota ở lượt mới;
- cầm tối đa 5 spell;
- một số active chỉ dùng trước roll;
- passive có thể dùng ngoài lượt nếu còn quota;
- curse tile chỉ dùng khi ô trống;
- một số special attack có timing khác.

Tên `Thần chú` hiện đã được rebrand thành **Lá Bài** cho MeMeMe.

## 7. Legacy pets

- pet có thể đặt lên vị trí cho phép, không đặt ở ô tròn lớn hoặc nơi bị yểm;
- player khác chạm pet thì mất tiền theo pet;
- mỗi người tối đa 2 pet: 1 giữ, 1 đặt trên board;
- đủ pet thì có thể trả pet cũ vào deck rồi bốc lại.

## 8. Legacy minigames

- tất cả người đủ điều kiện tham gia khi trigger Game tile;
- người ở Bệnh Viện/Đồn Cảnh Sát không tham gia;
- chỉ còn 1 người đủ điều kiện thì auto hạng nhất;
- game cần ≥3 nhưng chỉ có 2 người thì legacy rule dùng oẳn tù tì phân hạng.

## 9. Legacy jobs

Mỗi người chỉ có một job và chỉ đổi khi thất nghiệp.

Các job khởi nghiệp từng có:
- Ca Sỹ — Online
- Diễn Viên — Quần Chúng
- Người Mẫu — Triển Vọng
- Giáo Viên — Thực Tập
- Kinh Doanh — Vỉa Hè
- Làm Gái — Hết Thời
- Cướp — Vặt

## 10. What to carry forward?

Đề xuất test lại từng hệ thống theo 3 câu hỏi:
1. Nó làm core loop vui hơn không?
2. Nó có làm turn dài hơn không?
3. Nó có thể data-drive theo map không?

Không mang cả legacy rulebook vào MVP một lần.
