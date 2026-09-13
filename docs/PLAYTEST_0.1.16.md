# MeMeMe MVP 0.1.16 — First External Playtest Guide

## Mục tiêu build

Đây là build đầu tiên dành cho người ngoài nhóm dev chơi thử. Mục tiêu là kiểm tra xem một người chưa biết project có thể tự vào trận, hiểu flow cơ bản và chơi hết một demo match hay không.

Luật thắng trong build này chỉ là **temporary playtest rule**:

- 4 người chơi;
- 3 vòng = 12 lượt;
- hết vòng 3, ai có nhiều B$ nhất thắng;
- bằng B$ thì đồng hạng.

Luật trên **không phải luật MeMeMe final**.

## Cách chạy trên Windows

### Cách khuyên dùng

1. Giải nén artifact `mememe-playtest-0.1.16`.
2. Double-click `START_PLAYTEST.bat`.
3. Launcher sẽ mở một local HTTP server bằng PowerShell/Windows .NET, rồi tự mở trình duyệt ở `http://127.0.0.1:4173/` hoặc cổng gần đó nếu 4173 đang bận.
4. Giữ cửa sổ launcher mở trong lúc chơi. Khi chơi xong nhấn `Ctrl+C` để dừng server.

**Không mở `index.html` trực tiếp bằng double-click.** Nếu thanh địa chỉ hiện dạng `file:///C:/.../index.html`, browser có thể chặn ES module/local asset và chỉ hiện màn hình trắng. Đây là hành vi của browser khi chạy web app bằng `file://`, không phải gameplay crash.

Launcher mới gồm:
- `START_PLAYTEST.bat`;
- `serve-playtest.ps1`.

Launcher không cần cài Node hoặc Python.

### Cách thủ công nếu cần

Node:

```bash
npx serve .
```

Python:

```bash
python -m http.server 4173
```

Sau đó mở URL localhost mà terminal hiển thị.

## Cách chơi nhanh

1. Chọn `SOLO / HOTSEAT` để 4 người chơi chung một máy, hoặc `HOST 2 TAB` + `JOIN 2 TAB` để chia một ghế sang tab thứ hai.
2. Đặt tên 4 người. Ảnh mặt là **tùy chọn** trong 0.1.16. Nếu không thêm ảnh, game dùng token màu fallback.
3. Trong lượt của mình, có thể dùng Lá Bài trước khi đổ xúc xắc.
4. Bấm `ĐỔ XÚC XẮC` để di chuyển.
5. Ô `LÁ BÀI` tự rút bài. Ô `TIN TỨC` tự kích hoạt sự kiện. Gặp ngã rẽ thì chọn đường.
6. Hết 12 lượt, game hiện kết quả và có thể Rematch.

Trong bàn chơi có nút `? CÁCH CHƠI` để mở hướng dẫn nhanh.

## Test 2 tab local

- Hai tab phải mở cùng build/cùng origin trong cùng trình duyệt profile.
- Tab 1 chọn `HOST 2 TAB`, ghi lại room code, setup 4 người rồi vào bàn.
- Tab 2 mở lại đúng URL localhost của launcher, chọn `JOIN 2 TAB`, nhập room code và chọn P2/P3/P4.
- Host vẫn điều khiển các ghế chưa có client claim.
- Client chỉ được điều khiển đúng ghế đã chọn.

Đây vẫn là local `BroadcastChannel`, **chưa phải multiplayer internet**.

## Điều nên feedback

Ưu tiên ghi lại những điểm này:

- Có hiểu phải làm gì ngay từ Lobby không?
- Face Setup có gây chậm hoặc khó hiểu không?
- Có hiểu Lá Bài dùng lúc nào không?
- Khi gặp nhánh, có hiểu đang chọn đường không?
- Có lúc nào không biết vì sao tiền/bài thay đổi không?
- Nhịp 3 vòng có quá ngắn hoặc quá dài không?
- UI chữ/nút nào khó đọc hoặc khó bấm?
- Có lỗi treo lượt, sai người điều khiển, mất sync giữa 2 tab không?

Nếu báo lỗi multiplayer, nên ghi kèm: room code, ghế client, đang ở vòng/lượt nào và thao tác ngay trước khi lỗi xảy ra.

## Known limitations 0.1.16

- chưa có WebSocket/backend/internet multiplayer;
- client reload chưa reclaim seat production-ready;
- remote movement vẫn ưu tiên authoritative correctness hơn animation đầy đủ;
- client chưa nhận face textures của host;
- dynamic Card/News/Reaction presentation giữa các tab chưa hoàn chỉnh như mục tiêu final;
- content card/news hiện còn mỏng;
- win condition 3 vòng/B$ cao nhất chỉ là luật test tạm.
