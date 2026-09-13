# MeMeMe MVP 0.1.18.1 — Presentation Flow Fix

## Mục tiêu hotfix

0.1.18.1 sửa trực tiếp feedback từ playtest 0.1.18:

- reaction/panel không được chạy trễ rồi dồn đống ở cuối trận;
- gameplay phải chờ người chơi đọc/xác nhận presentation hiện tại;
- ngã rẽ không còn bắt người chơi chọn tay;
- xúc xắc chẵn/lẻ tự quyết định route.

Gameplay core, replay, authority và checksum vẫn giữ nguyên.

## Manual presentation gate

Tile/Card/News/Reaction giờ là một flow blocking theo event:

1. authoritative event tới client;
2. panel/FX/SFX của đúng event đó xuất hiện;
3. reaction thuộc event đó chạy theo sequence;
4. khi đã đủ thời gian đọc, UI hiện `SPACE / ENTER / CLICK • TIẾP TỤC`;
5. chỉ sau khi xác nhận, panel mới đóng và event tiếp theo mới được trình bày;
6. chỉ khi queue presentation đã hết thì roll/card/CPU mới được phép tiếp tục.

Mục tiêu là không còn tình trạng gameplay chạy trước còn reaction xếp hàng phía sau.

### 4 CPU AUTOPLAY

Chế độ 4 CPU vẫn tự acknowledge presentation để giữ chức năng stress-test tự động. Các mode có người chơi thật dùng manual acknowledge.

## Luật nhánh chẵn/lẻ

Khi roll dừng ở node có nhiều đường:

- roll **LẺ** → chọn edge có `parity: odd`;
- roll **CHẴN** → chọn edge có `parity: even`;
- không còn Branch Picker cho người chơi;
- phía dưới vẫn ghi `choose_branch` authoritative command để replay/host-client không đổi kiến trúc.

CPU QA cũng dùng cùng `pickParityEdge()` với người chơi, không chọn route theo turn/player nữa.

Ở board MVP hiện tại:

- đường `PHỐ CHÍNH` là odd;
- đường `HẺM TẮT` là even.

## Cách test nhanh

Khuyên dùng **1 người + 3 CPU**.

1. Roll và quan sát: khi landing/card/news hiện, lượt kế tiếp không được tự chạy.
2. Đợi reaction của đúng event hiện xong.
3. Khi thấy `SPACE / ENTER / CLICK • TIẾP TỤC`, bấm một lần.
4. Xác nhận không có reaction cũ xuất hiện muộn ở lượt sau.
5. Đi tới ngã rẽ nhiều lần:
   - số lẻ phải tự theo route odd;
   - số chẵn phải tự theo route even;
   - không được hiện màn chọn đường.
6. Chơi hết 3 vòng và xác nhận màn xếp hạng không còn bị một loạt panel/reaction cũ tràn lên sau đó.
7. Chạy 4 CPU AUTOPLAY để chắc chắn stress mode vẫn tự chạy hết trận.

## Regression giữ nguyên

- deterministic replay;
- lockstep peer;
- host/client resync;
- host authority;
- two-tab session;
- demo match shell/rematch;
- CPU autoplay stress;
- Tile/Card/News/Reaction presentation model;
- image transform bounds;
- package/BGM checksum verification.

## Known limitations

- match state vẫn có thể đã chuyển sang next player trước khi presentation của event trước đóng, nhưng input/CPU bị khóa cho tới khi presentation queue rỗng;
- face image chưa sync sang client 2-tab;
- personality custom chưa là synced presentation metadata;
- SFX hiện vẫn là WebAudio synth placeholder;
- CPU vẫn chỉ là QA bot deterministic.