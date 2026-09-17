# MeMeMe 0.1.70 · Career Traits / Đặc tính nghề nghiệp

## Mục tiêu

0.1.70 biến nghề nghiệp từ bảng lương thành luật gameplay có thể bẻ rule chung. Authority vẫn nằm ở HOST/replay core; UI chỉ trình bày kết quả.

## Luật release canonical 0.1.70

| Trạng thái | Luật |
| --- | --- |
| Không có trait · Đồn | 1 / 3 / 5 |
| Không có trait · Bệnh viện | 2 / 4 / 6 |
| 👮 Cảnh sát · Đồn | 1 / 3 / 4 / 5 |
| 🩺 Bác sĩ · Bệnh viện | 2 / 4 / 5 / 6 |
| 🦹 Trộm cắp · Đồn | chỉ 1 / 5 |
| 🤸 Cascader · Bệnh viện | chỉ 2 / 6 |

## Job pool

Pool canonical tăng từ 10 lên 12 nghề với hai nghề mới:

- 👮 Cảnh sát: 60 / 85 / 115 B$/vòng, trait Nghiệp vụ.
- 🤸 Cascader: 70 / 105 / 155 B$/vòng, trait Chấn thương nghề.

Bác sĩ và Trộm cắp được cập nhật mô tả trait để rule release đọc được ngay trong Job Detail.

## Runtime checklist

1. Người không nghề ở Đồn: 1/3/5 thành công, 2/4/6 thất bại.
2. Người không nghề ở BV: 2/4/6 thành công, 1/3/5 thất bại.
3. Cảnh sát ở Đồn: mặt 4 phải được thả.
4. Bác sĩ ở BV: mặt 5 phải được xuất viện.
5. Cascader ở BV: mặt 4 phải thất bại; chỉ 2/6 thành công.
6. Trộm cắp bị bắt từ career check: nghề bị xóa như trước, nhưng hold vẫn nhớ JOB_THIEF; mặt 3 phải thất bại và 1/5 mới được thả.
7. Sau release thành công: đóng modal xong phải có D6 movement mới trong cùng lượt, không đứng hình.
8. Sau release thất bại: lượt phải chuyển bình thường.
9. HOST/CPU/human dùng cùng một kết quả authority, không có RNG trong UI trait.
10. Job Hub vẫn gọn; trait chi tiết xem qua detail, không nhồi thêm HUD thường trực.

## Không đổi trong 0.1.70

- Map topology và camera.
- 1/2/3 vòng.
- Podium/Rematch.
- Card/News authority.
- Mini Game payout.
- Cơ chế Roll For Order.

## Acceptance

CI PASS chỉ là build candidate. Runtime PASS chỉ được gọi sau khi playtest thật xác nhận ít nhất Doctor, Thief và một baseline hold không bị đơ sau release.
