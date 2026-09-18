# MeMeMe MVP 0.1.61 — PLAYTEST REPORT

## Mục tiêu

0.1.61 không thêm luật mới. Bản này biến runtime feedback thành dữ liệu có thể gửi lại nguyên vẹn sau mỗi ván, để milestone tiếp theo dựa trên playtest thật thay vì đoán.

## Luật gameplay giữ nguyên từ 0.1.60

- một vòng / người;
- chạm READY đủ vòng thì dừng ngay, bỏ pip dư;
- B$ của người về đích được khóa;
- người đã về đích nghỉ các lượt còn lại;
- economy 0.1.60 giữ nguyên;
- Jail / Hospital / Lottery giữ nguyên;
- Mini Game payout vẫn HOST-authoritative;
- TIN TỨC / LÁ BÀI giữ nguyên tên và luật hiện hành.

## Tính năng mới

Khi màn kết quả/podium xuất hiện, có nút:

`📊 BÁO CÁO PLAYTEST`

Report chỉ được tạo từ `MatchState` + `eventLog` authoritative đang có sẵn. Không có upload tự động và không gửi dữ liệu ra ngoài.

Report gồm:
- board / seed / checksum;
- số người, starting B$, số turn / command / event / RNG calls;
- roll di chuyển / release / Lottery;
- Card / News / Mini Game / Job counts;
- số lần release Jail / Hospital;
- tổng Lottery payout;
- tổng Mini Game payout;
- tổng B$, trung bình B$, spread cuối ván;
- thứ tự về đích;
- B$ cuối và delta của từng người chơi.

## Checklist ưu tiên

1. Chơi trọn một ván bình thường tới podium.
2. Xác nhận nút `BÁO CÁO PLAYTEST` chỉ xuất hiện ở màn kết quả.
3. Mở report và xác nhận seed + checksum có hiển thị.
4. Kiểm tra thứ tự về đích trong report khớp những gì vừa chơi.
5. Kiểm tra final B$ từng người khớp podium.
6. Nếu có Mini Game, tổng payout report phải hợp lý theo các arena đã gặp.
7. Nếu có Lottery, số lần và tổng B$ Lottery phải khớp.
8. Nếu có Jail/Hospital, release attempts phải phản ánh số lần thử thoát.
9. Bấm `COPY REPORT`, dán vào Notepad/Discord/ChatGPT và xác nhận nội dung không bị mất dòng.
10. Chơi thêm một ván dài để kiểm tra token snap-back, Job, Card/News, BGM và final-result chain vẫn ổn.

## Cách gửi feedback tốt nhất

Gửi nguyên block report đã copy, rồi thêm 1–3 dòng cảm nhận như:

- ván này nhanh / vừa / dài;
- tiền cuối ván quá sát / vừa / quá lệch;
- phần nào làm chậm nhịp nhất;
- event nào quá mạnh hoặc quá nhạt.

Từ report đó mới chọn scope 0.1.62.

## Không đổi trong 0.1.61

- không đổi board topology;
- không đổi payout/economy;
- không đổi Card/News weights;
- không đổi Job rules;
- không đổi Mini Game rules;
- không đổi HOST authority;
- không thêm RNG;
- không thêm network telemetry;
- không merge PR #1.
