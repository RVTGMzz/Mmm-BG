# MeMeMe 0.1.65.1 — Steam Deck Hotfix Playtest

## Mục tiêu

Bản này chỉ sửa presentation/input trên nền gameplay 0.1.64 đã khóa deterministic.

### 1. UI ghost / ô đen bị dính

Lỗi 0.1.65: rounded Graphics proxy có thể còn hiển thị sau khi popup gốc đã fade/đóng.

0.1.65.1 phải bảo đảm:
- đóng popup thì rounded proxy biến mất cùng source;
- source fade alpha về 0 thì proxy cũng fade/ẩn;
- source bị destroy thì proxy cũng destroy;
- không còn panel đen/kem bị dính trên board sau Roll For Order, Card, Job, News, Mini Game hay các modal khác.

## 2. Tay cầm / Steam Deck

Game dùng browser Gamepad API với standard mapping:
- D-pad ↑ ↓ ← →: chuyển focus giữa các nút/lựa chọn đang hiện ở lớp UI cao nhất;
- A: xác nhận, tương đương click chuột;
- hover/focus dùng lại pointerover/pointerout cũ để vẫn có feedback màu/scale.

Cần thử ít nhất:
- xúc xắc chính;
- chọn Lá Bài;
- chọn mục tiêu;
- Tactical Choice;
- Job Hub;
- các nút setup/lobby có pointer handler.

Gamepad navigation không phát RNG và không gửi gameplay intent trực tiếp. Nó chỉ kích hoạt handler UI sẵn có.

## 3. Steam Deck web build

GitHub Pages dùng chính production `dist` từ `npm run build`.

Trên Steam Deck:
1. mở URL GitHub Pages của repo bằng Chrome/Firefox trong Gaming Mode hoặc Desktop Mode;
2. bấm một nút trên Deck để browser nhận controller;
3. dùng D-pad để đổi lựa chọn, A để xác nhận;
4. có thể Add to Steam browser shortcut nếu muốn test như một game web.

## 4. Regression bắt buộc

Phải giữ nguyên:
- camera 0.1.63.2 đã được Ron xác nhận tốt;
- Card target direct-dice hotfix;
- Jail/Hospital release corridor 0.1.64;
- Job mid-roll continuation;
- HOST authority và replay/checksum;
- sentinel 611102 checksum `1dd42c7c`;
- sentinel 611113 checksum `856548f4`;
- visible names TIN TỨC / LÁ BÀI.

Manual status: PENDING RON ACCEPTANCE.
