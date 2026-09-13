# MeMeMe MVP 0.1.17 — BGM + Presentation Parity Playtest

## Mục tiêu build

MVP 0.1.17 là build external playtest đầu tiên có **BGM thật đã checksum-lock** và lớp Presentation Parity rõ ràng hơn giữa host/client.

Gameplay core vẫn deterministic, host-authoritative. CPU vẫn chỉ là **QA bot đơn giản**, chưa phải AI gameplay final.

Luật thắng tạm thời:

- 4 người chơi;
- 3 vòng = 12 lượt;
- hết vòng 3, ai có nhiều B$ nhất thắng;
- bằng B$ thì đồng hạng.

Luật trên **không phải luật MeMeMe final**.

## BGM trong 0.1.17

- Lobby / Setup → `01_Menu_MeMeMe.ogg`;
- Round 1 → `02_City_Bubble.ogg`;
- Round 2 → `03_City_Silly.ogg`;
- Final Round → `04_Final_Round.ogg`.

Tên runtime được rút gọn cho sạch, nhưng audio vẫn whole-file seamless loop trong game.

Góc trên bên phải có mute + volume. Preference được lưu local trong trình duyệt. Nếu browser chặn autoplay, game thử lại sau tương tác thật đầu tiên mà không ảnh hưởng gameplay.

## Cách chạy trên Windows

1. Giải nén artifact `mememe-playtest-0.1.17`.
2. Double-click `START_PLAYTEST.bat`.
3. Launcher mở local HTTP server rồi tự mở trình duyệt ở `http://127.0.0.1:4173/` hoặc cổng gần đó.
4. Giữ cửa sổ launcher mở trong lúc chơi. Xong thì nhấn `Ctrl+C`.

**Không mở `index.html` trực tiếp bằng double-click.** Nếu URL là `file:///...`, browser có thể chặn module/local asset.

## Test một mình với CPU

Ở Lobby, `SOLO / CPU TEST` có:

- **1 người + 3 CPU**: khuyên dùng;
- **2 người + 2 CPU**;
- **4 người HOTSEAT**;
- **4 CPU AUTOPLAY**: dùng soi deadlock/turn flow.

CPU test bot có thể dùng card, chọn target, đổ xúc xắc và chọn branch theo policy deterministic. CPU này không đại diện độ khó hay chiến thuật final.

## Presentation Parity cần test kỹ

### 1. Card Draw

Khi rút Lá Bài, thay vì chỉ có toast nhỏ, game phải hiện panel lớn ở giữa với:

- nhãn `LÁ BÀI • RÚT ĐƯỢC`;
- tên card;
- rarity `N / R / SR / SSR`;
- impact sao;
- mô tả card;
- actor chip.

### 2. Card Play

Khi dùng Lá Bài, panel phải cho thấy:

- card nào được dùng;
- ai dùng;
- target nếu có;
- mô tả card;
- kết quả authoritative, ví dụ ai mất/nhận B$;
- reaction sequence nếu card có reaction hook.

### 3. News

Ô `TIN TỨC` phải hiện panel riêng màu/nhịp khác Card, gồm:

- tiêu đề News;
- rarity + impact;
- mô tả;
- kết quả authoritative;
- reaction của subject/spectator theo event đã sync.

### 4. Reaction

Reaction giờ là speech bubble riêng, không còn chỉ hiện `reactionEventId` thô.

Hãy kiểm tra:

- đúng người đang nói;
- đúng thứ tự reaction;
- target/spectator giống nhau ở Host và Client;
- placeholder như tên người chơi / số tiền được điền đúng;
- bubble không đè nhau quá khó đọc;
- timing không quá chậm làm cảm giác trận đấu bị nghẽn.

Nếu local tab có face texture thì bubble có thể dùng mặt local; tab không có texture phải fallback avatar chữ cái mà **không làm khác nội dung event**.

### 5. Các parity khác

- token remote tween tới vị trí authoritative thay vì snap cứng;
- B$ thay đổi có delta rõ ràng;
- card rút / mất / dùng có log/delta rõ ràng;
- snapshot resync không tạo fake cinematic event;
- nút `🐛 BUG REPORT` xuất JSON chẩn đoán.

## Test 2 tab local

- Hai tab phải mở cùng build/cùng origin trong cùng browser profile.
- Tab 1 chọn `HOST 2 TAB`, setup rồi vào bàn.
- Tab 2 mở đúng URL localhost, chọn `JOIN 2 TAB`, nhập room code và chọn P2/P3/P4.
- Host vẫn điều khiển ghế chưa có client claim.
- Client chỉ điều khiển ghế đã chọn.

Đây vẫn là local `BroadcastChannel`, **chưa phải multiplayer internet**.

### Checklist parity 2-tab

Khi có Card Play hoặc News, đặt hai tab cạnh nhau và kiểm tra:

- cùng title;
- cùng rarity/impact;
- cùng actor;
- cùng target;
- cùng spectator;
- cùng reaction text;
- cùng thứ tự reaction;
- client reload/resync không phát lại event cũ.

## Nếu gặp lỗi

Bấm `🐛 BUG REPORT`. JSON chứa build ID, session/mode, checksum, BGM state, log và serialized MatchState.

Khi gửi feedback nên ghi:

- mode chơi;
- ghế đang tới lượt;
- vòng/lượt hiện tại;
- thao tác ngay trước lỗi;
- lỗi ở Host hay Client;
- nếu là presentation, ghi Card/News title đang hiện.

## Điều nên feedback

Ưu tiên:

- Card/News panel có đủ rõ và đủ “đã” chưa?
- panel che bàn quá lâu không?
- reaction bubble đọc kịp không?
- actor/target chip có dễ hiểu không?
- rarity/impact có nổi bật vừa đủ không?
- Host/Client có thấy đúng cùng reaction không?
- BGM chuyển Menu → R1 → R2 → Final có tự nhiên không?
- remote movement có mượt và đúng đích không?
- B$/Card delta có dễ hiểu không?
- CPU có bị đứng ở PRE_ROLL hoặc BRANCH không?
- có mất sync hoặc treo lượt không?

## CI / integrity

CI hiện kiểm:

- deterministic replay;
- lockstep;
- host/client authority + snapshot resync;
- two-tab session;
- CPU autoplay stress;
- Card/News/Reaction presentation model parity;
- package integrity;
- exact SHA-256 của bốn OGG.

## Known limitations 0.1.17

- CPU vẫn là deterministic QA bot, chưa phải AI final;
- chưa có WebSocket/backend/internet multiplayer;
- client reload chưa reclaim seat production-ready;
- custom personality chưa được sync thành presentation-authoritative metadata, nên reaction variant hiện dùng stable seat-based voice để đảm bảo host/client giống nhau;
- client chưa nhận face textures của host, nên có thể fallback avatar chữ cái;
- reaction SFX riêng chưa nối vào cinematic layer;
- content card/news hiện còn mỏng;
- win condition 3 vòng/B$ cao nhất chỉ là luật test tạm.
