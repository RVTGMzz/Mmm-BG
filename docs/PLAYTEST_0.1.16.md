# MeMeMe MVP 0.1.16.2 — First External Playtest + Simple CPU Test Bots

## Mục tiêu build

Đây là build đầu tiên dành cho người ngoài nhóm dev chơi thử, nay có thêm **CPU test bot** để một người vẫn có thể chạy một trận hoàn chỉnh mà không phải tự bấm cả 4 ghế.

CPU ở mốc này chỉ là **QA bot đơn giản**, chưa phải AI gameplay final. Mục tiêu chính là test turn flow, card, branch, match end và phát hiện kẹt lượt nhanh hơn.

Luật thắng trong build này vẫn chỉ là **temporary playtest rule**:

- 4 người chơi;
- 3 vòng = 12 lượt;
- hết vòng 3, ai có nhiều B$ nhất thắng;
- bằng B$ thì đồng hạng.

Luật trên **không phải luật MeMeMe final**.

## Cách chạy trên Windows

### Cách khuyên dùng

1. Giải nén artifact `mememe-playtest-0.1.16.2`.
2. Double-click `START_PLAYTEST.bat`.
3. Launcher mở local HTTP server bằng PowerShell/Windows .NET, rồi tự mở trình duyệt ở `http://127.0.0.1:4173/` hoặc cổng gần đó nếu 4173 đang bận.
4. Giữ cửa sổ launcher mở trong lúc chơi. Khi chơi xong nhấn `Ctrl+C` để dừng server.

**Không mở `index.html` trực tiếp bằng double-click.** Nếu thanh địa chỉ hiện dạng `file:///C:/.../index.html`, browser có thể chặn ES module/local asset và chỉ hiện màn hình trắng.

Launcher gồm:
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

## Test một mình với CPU

Ở Lobby, mục `SOLO / CPU TEST` có 4 chế độ:

- **1 người + 3 CPU**: khuyên dùng khi test một mình. P1 do bạn điều khiển, P2/P3/P4 tự chơi.
- **2 người + 2 CPU**: P1/P2 là người, P3/P4 là CPU.
- **4 người HOTSEAT**: không có CPU.
- **4 CPU AUTOPLAY**: bấm Start rồi ngồi xem cả trận tự chạy, hợp để soi deadlock/turn flow.

CPU test bot hiện sẽ:

1. nếu có Lá Bài hợp lệ và chưa dùng bài trong lượt thì dùng bài đầu tiên đang cầm;
2. với card cần chọn mục tiêu, ưu tiên đối thủ đang có nhiều B$ nhất;
3. sau đó tự đổ xúc xắc;
4. nếu gặp ngã rẽ thì tự chọn một nhánh theo policy deterministic;
5. không tiêu thụ RNG riêng ngoài những command gameplay đã chọn, giúp replay/debug dễ kiểm tra hơn.

CPU này **không đại diện cho độ khó, chiến thuật hay personality AI final**.

## Cách chơi nhanh

1. Chọn mode phù hợp ở Lobby.
2. Đặt tên 4 ghế. Ghế CPU sẽ được đánh dấu 🤖. Ảnh mặt là **tùy chọn**.
3. Trong lượt người thật, có thể dùng Lá Bài trước khi đổ xúc xắc.
4. Bấm `ĐỔ XÚC XẮC` để di chuyển.
5. Ô `LÁ BÀI` tự rút bài. Ô `TIN TỨC` tự kích hoạt sự kiện. Gặp ngã rẽ thì chọn đường.
6. CPU tự xử lý lượt của nó sau một khoảng delay ngắn.
7. Hết 12 lượt, game hiện kết quả và có thể Rematch.

Trong bàn chơi có nút `? CÁCH CHƠI` để mở hướng dẫn nhanh.

## Test 2 tab local

- Hai tab phải mở cùng build/cùng origin trong cùng trình duyệt profile.
- Tab 1 chọn `HOST 2 TAB`, ghi lại room code, setup 4 người rồi vào bàn.
- Tab 2 mở lại đúng URL localhost của launcher, chọn `JOIN 2 TAB`, nhập room code và chọn P2/P3/P4.
- Host vẫn điều khiển các ghế chưa có client claim.
- Client chỉ được điều khiển đúng ghế đã chọn.
- CPU mode hiện chỉ áp dụng cho `SOLO / CPU TEST`, không trộn với 2-tab PoC.

Đây vẫn là local `BroadcastChannel`, **chưa phải multiplayer internet**.

## Điều nên feedback

Ưu tiên ghi lại những điểm này:

- Có hiểu phải làm gì ngay từ Lobby không?
- CPU có tự chạy đúng lượt không?
- Có lúc nào CPU bị đứng ở PRE_ROLL hoặc BRANCH không?
- CPU có dùng card làm game kẹt không?
- Có hiểu Lá Bài dùng lúc nào không?
- Có lúc nào không biết vì sao tiền/bài thay đổi không?
- Nhịp 3 vòng có quá ngắn hoặc quá dài không?
- UI chữ/nút nào khó đọc hoặc khó bấm?
- Có lỗi treo lượt, sai người điều khiển, mất sync giữa 2 tab không?

Nếu báo lỗi, nên ghi kèm mode chơi, ghế đang tới lượt, vòng/lượt hiện tại và thao tác ngay trước khi lỗi xảy ra.

## CI CPU stress

CI có thêm `npm run test:bots`:

- chạy nhiều trận 4 CPU headless;
- bắt buộc đủ 12 roll/trận;
- phải exercise được card + branch qua tập seed stress;
- giới hạn command để bắt deadlock;
- chạy cùng seed hai lần phải ra cùng checksum/command count.

Mục tiêu là biến CPU thành một "máy lắc hộp" tự động cho core loop trước khi tester người thật vào.

## Known limitations 0.1.16.2

- CPU chỉ là deterministic QA bot đơn giản, chưa phải AI final;
- chưa có WebSocket/backend/internet multiplayer;
- client reload chưa reclaim seat production-ready;
- remote movement vẫn ưu tiên authoritative correctness hơn animation đầy đủ;
- client chưa nhận face textures của host;
- dynamic Card/News/Reaction presentation giữa các tab chưa hoàn chỉnh như mục tiêu final;
- content card/news hiện còn mỏng;
- win condition 3 vòng/B$ cao nhất chỉ là luật test tạm.
