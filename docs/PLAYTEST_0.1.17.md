# MeMeMe MVP 0.1.17 — BGM + Presentation Parity Playtest

## Mục tiêu build

MVP 0.1.17 là build external playtest đầu tiên có **BGM thật đã checksum-lock** và một lớp Presentation Parity rõ ràng hơn giữa host/client.

Gameplay core vẫn giữ nguyên nguyên tắc deterministic, host-authoritative. CPU vẫn chỉ là **QA bot đơn giản**, chưa phải AI gameplay final.

Luật thắng tạm thời của playtest:

- 4 người chơi;
- 3 vòng = 12 lượt;
- hết vòng 3, ai có nhiều B$ nhất thắng;
- bằng B$ thì đồng hạng.

Luật trên **không phải luật MeMeMe final**.

## BGM trong 0.1.17

BGM runtime đã được đóng gói trực tiếp trong build:

- Lobby / Setup → `01_Menu_MeMeMe.ogg`;
- Round 1 → `02_City_Bubble.ogg`;
- Round 2 → `03_City_Silly.ogg`;
- Final Round → `04_Final_Round.ogg`.

Tên runtime được rút gọn cho sạch, nhưng audio vẫn dùng whole-file seamless loop trong game.

Góc trên bên phải có điều khiển:

- bật/tắt BGM;
- chỉnh volume;
- preference được lưu local trong trình duyệt.

Browser có thể chặn autoplay trước tương tác đầu tiên. Game sẽ thử phát lại sau click/touch/keyboard đầu tiên mà không ảnh hưởng gameplay.

## Cách chạy trên Windows

### Cách khuyên dùng

1. Giải nén artifact `mememe-playtest-0.1.17`.
2. Double-click `START_PLAYTEST.bat`.
3. Launcher mở local HTTP server bằng PowerShell/Windows .NET rồi tự mở trình duyệt ở `http://127.0.0.1:4173/` hoặc cổng gần đó nếu 4173 đang bận.
4. Giữ cửa sổ launcher mở trong lúc chơi. Khi chơi xong nhấn `Ctrl+C` để dừng server.

**Không mở `index.html` trực tiếp bằng double-click.** Nếu thanh địa chỉ hiện `file:///C:/.../index.html`, browser có thể chặn ES module/local asset và chỉ hiện màn hình trắng.

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

- **1 người + 3 CPU**: khuyên dùng khi test một mình.
- **2 người + 2 CPU**.
- **4 người HOTSEAT**: không có CPU.
- **4 CPU AUTOPLAY**: dùng để soi deadlock/turn flow.

CPU test bot hiện sẽ:

1. nếu có Lá Bài hợp lệ và chưa dùng bài trong lượt thì dùng bài đầu tiên đang cầm;
2. với card cần chọn mục tiêu, ưu tiên đối thủ đang có nhiều B$ nhất;
3. sau đó tự đổ xúc xắc;
4. nếu gặp ngã rẽ thì tự chọn một nhánh theo policy deterministic;
5. không tiêu thụ RNG riêng ngoài những command gameplay đã chọn.

CPU này **không đại diện cho độ khó, chiến thuật hay personality AI final**.

## Presentation Parity cần test

0.1.17 bổ sung các phần sau:

- token remote tween tới vị trí authoritative thay vì snap cứng;
- B$ thay đổi có delta rõ ràng;
- card rút / mất / dùng có thông báo rõ ràng;
- Card draw / Card play / News / Reaction dùng presentation events chung giữa host và client;
- snapshot resync không tạo fake toast/delta;
- nút `🐛 BUG REPORT` xuất JSON chẩn đoán khi gặp lỗi.

Khi test 2 tab, hãy để ý xem host và client có thấy cùng sự kiện Card/News/Reaction hay không.

## Cách chơi nhanh

1. Chọn mode phù hợp ở Lobby.
2. Đặt tên 4 ghế. Ghế CPU được đánh dấu 🤖. Ảnh mặt là tùy chọn.
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

## Nếu gặp lỗi

Bấm `🐛 BUG REPORT` trong bàn chơi. File JSON sẽ chứa build ID, session/mode, checksum, BGM state, log hiện tại và serialized MatchState để debug dễ hơn.

Khi gửi feedback nên ghi thêm:

- mode chơi;
- ghế đang tới lượt;
- vòng/lượt hiện tại;
- thao tác ngay trước khi lỗi xảy ra;
- nếu là 2-tab, lỗi xuất hiện ở Host hay Client.

## Điều nên feedback

Ưu tiên:

- BGM chuyển Menu → Round 1 → Round 2 → Final Round có đúng và tự nhiên không?
- volume mặc định có hợp lý không?
- BGM có bị im sau khi browser chặn autoplay không?
- chuyển bài có bị cắt khó chịu không?
- token remote có di chuyển mượt, đúng đích không?
- B$/Card delta có dễ hiểu không?
- Card/News/Reaction có hiển thị giống nhau giữa host/client không?
- CPU có bị đứng ở PRE_ROLL hoặc BRANCH không?
- có lỗi treo lượt, sai người điều khiển hoặc mất sync giữa 2 tab không?

## CI / integrity

Package validation bắt buộc cả bốn OGG phải tồn tại trong `dist/audio/bgm/` và khớp SHA-256 đã duyệt. Audio sai/missing sẽ làm CI fail thay vì phát hành build im lặng.

## Known limitations 0.1.17

- CPU vẫn là deterministic QA bot đơn giản, chưa phải AI final;
- chưa có WebSocket/backend/internet multiplayer;
- client reload chưa reclaim seat production-ready;
- Card/News/Reaction đã có parity dữ liệu và toast cơ bản nhưng chưa phải visual treatment final;
- client chưa nhận face textures của host;
- content card/news hiện còn mỏng;
- win condition 3 vòng/B$ cao nhất chỉ là luật test tạm.
