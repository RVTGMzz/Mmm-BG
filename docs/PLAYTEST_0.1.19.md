# MeMeMe MVP 0.1.19 — Board Flow & Movement

## Mục tiêu build

0.1.19 tập trung vào cảm giác chơi trên bàn cờ sau feedback playtest 0.1.18.1:

- bàn cờ phải là phần nhìn chính, không bị một HUD lớn đóng giữa màn hình;
- thông báo gameplay chính nằm giữa màn hình khi cần, sau đó biến mất;
- reaction/chat của nhân vật tách sang hai bên trái/phải xen kẽ;
- timing thông báo phụ thuộc đối tượng bị ảnh hưởng thay vì mọi event đều bắt bấm;
- xúc xắc chỉ xuất hiện lúc roll và có animation;
- quân cờ đi từng ô thay vì teleport/tween thẳng tới đích;
- Tin Tức/Card/SFX không được làm đổi BGM gameplay đang chạy.

## HUD mới

HUD lớn cố định giữa bàn đã được loại khỏi presentation wrapper.

Trong trận chỉ giữ một thanh điều khiển gọn ở cạnh dưới:

- vòng + người đang chơi;
- nút ĐỔ XÚC XẮC;
- nút LÁ BÀI.

Phase/checksum/log debug không còn chiếm vùng giữa bàn. Score vẫn nằm ngoài khu vực chính để QA.

## Dice + movement timeline

Mỗi roll authoritative giờ phát thêm presentation events:

1. `dice_roll` — animation xúc xắc ở giữa màn hình, chỉ tồn tại lúc roll;
2. `move_step` — một event cho từng node quân cờ bước qua;
3. landing/tile event;
4. Card/News/Reaction nếu có.

`dice_roll` và `move_step` là presentation-only và không đi vào gameplay checksum.

Token di chuyển từng node với tween ngắn + squash nhẹ ở mỗi bước. Ngã rẽ vẫn dùng luật chẵn/lẻ của 0.1.18.1.

## Timing thông báo 3s / 6s / 10s

### 1 người + CPU

- event ảnh hưởng trực tiếp người chơi thật → cần người chơi xác nhận;
- event chỉ liên quan CPU → tự đóng, tối đa 6 giây;
- CPU notice chỉ cho skip sau ít nhất 3 giây.

### Hotseat / người chơi với người chơi

Không giữ cả bàn vô thời hạn:

- notification tự đóng tối đa 6 giây;
- có thể bấm bỏ qua sau ít nhất 3 giây và sau khi text đã hiện đủ.

### Event toàn bàn / text dài

- tự đóng tối đa 10 giây;
- chỉ được bấm bỏ qua sau khi chữ đã hiện hết.

### 4 CPU AUTOPLAY

Stress mode vẫn chạy nhanh tự động để CI/QA không phải chờ 6 giây mỗi event.

## Notification + reaction layout

- Tile/Card/News/Ready notification: trung tâm màn hình.
- Reaction/chat: xen kẽ mép trái và mép phải.
- Reaction có avatar/expression + type-in text.
- Main notification cũng reveal text trước khi nút skip/continue được kích hoạt.

## BGM

0.1.19 giữ BGM gameplay ổn định trong toàn bộ presentation queue.

- Dice/Card/News/Reaction chỉ phát SFX;
- round-track sync bị tạm khóa trong lúc presentation đang chạy;
- nếu thật sự sang vòng mới, đổi BGM chỉ xảy ra sau khi presentation cũ đã kết thúc.

Bốn file BGM approved vẫn giữ nguyên, không re-encode.

## Cách test ưu tiên

Khuyên dùng **1 người + 3 CPU**.

1. Vào bàn và xác nhận không còn khối HUD lớn ở giữa map.
2. Roll vài lần và kiểm tra dice chỉ hiện khi roll.
3. Quan sát token đi từng ô, không bay thẳng tới node cuối.
4. Khi CPU gặp ô thường/tiền/Card/News:
   - notification phải tự đóng trong <= 6s;
   - không được skip trước 3s.
5. Khi event ảnh hưởng P1:
   - ở mode 1P+3CPU phải chờ P1 xác nhận.
6. Test event toàn bàn:
   - text phải hiện đủ rồi mới cho skip;
   - không giữ quá 10s.
7. Reaction phải xuất hiện trái/phải xen kẽ, không chồng thành hàng dài ở giữa.
8. Theo dõi BGM trước/trong/sau News/Card:
   - event không được đổi theme;
   - chỉ SFX được phát trên nền BGM.
9. Chơi hết trận để chắc chắn result overlay vẫn chờ presentation cuối cùng xử lý xong.

## Invariants

- Không đổi gameplay RNG vì animation/FX.
- Event presentation vẫn bị loại khỏi checksum.
- Snapshot resync không replay presentation cũ.
- Odd/even branch command vẫn authoritative.
- Ảnh mặt vẫn không upload/persist âm thầm.
- PR #1 không merge/Ready nếu chưa có yêu cầu trực tiếp.
