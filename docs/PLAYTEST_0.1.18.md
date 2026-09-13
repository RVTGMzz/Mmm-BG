# MeMeMe MVP 0.1.18 — Tile Resolution + Image Editor + FX

## Mục tiêu build

0.1.18 tập trung làm cho vòng lặp **đổ xúc xắc → di chuyển → đáp ô → hiểu ngay chuyện gì xảy ra** rõ ràng và có cảm giác game hơn, đồng thời tối ưu ảnh người chơi trước khi đưa vào runtime.

Gameplay core vẫn deterministic, host-authoritative. Toàn bộ crop/FX/SFX/BGM transition chỉ là presentation/client-side và không đi vào gameplay checksum.

## Image Editor mới

Khi chọn ảnh mặt ở Face Setup, game mở editor trước khi lưu sticker:

- kéo ảnh để canh vị trí;
- zoom bằng slider;
- cuộn chuột để zoom;
- pinch bằng hai ngón trên thiết bị cảm ứng;
- xoay mịn từ -180° đến +180°;
- xoay nhanh ±90°;
- reset về mặc định;
- preview trực tiếp trong khung sticker.

Khi bấm **DÙNG ẢNH NÀY**:

- ảnh gốc không được đưa vào gameplay;
- game render sticker runtime 320×320;
- ưu tiên WebP quality ~84% khi trình duyệt hỗ trợ;
- trình duyệt không hỗ trợ WebP canvas sẽ tự fallback sang PNG;
- ảnh vẫn chỉ nằm trong bộ nhớ phiên chơi, chưa upload lên server.

## Tile Resolution Presentation

Mỗi lần quân cờ dừng lại, host/client đều nhận event `tile_land` presentation-only trước khi hiệu ứng ô chạy.

Feedback hiện có:

- **Ô thường** → banner nhỏ xác nhận đã đáp ô;
- **Ô tiền** → banner + số B$ bay lên, màu tăng/giảm tương ứng;
- **Ô Lá Bài** → banner landing rồi nối sang Card Draw cinematic;
- **Ô Tin Tức** → banner landing rồi nối sang News cinematic;
- **READY / qua vòng** → bonus +100 B$, burst + confetti.

`tile_land` nằm trong presentation eventLog và vẫn bị loại khỏi gameplay checksum.

## Visual FX mới

- deterministic radial burst khi landing/Card/News;
- floating money `+/- B$`;
- card flip nhỏ khi draw/play;
- SSR có burst mạnh hơn + camera shake rất nhẹ;
- READY có confetti;
- reaction bubble giữ sequence đã đồng bộ từ 0.1.17.

FX không gọi gameplay RNG.

## SFX mới

0.1.18 thêm lightweight synthesized WebAudio SFX, chưa cần asset audio rời:

- coin gain;
- coin loss;
- card draw;
- card play;
- news hit;
- reaction pop;
- READY bonus;
- landing;
- UI confirm hook.

HUD audio có thêm nút **FX 🔔 / FX 🔕** riêng, lưu preference local.

SFX hiện là placeholder kỹ thuật để test timing/cảm giác. Sau này có thể thay bằng OGG/WAV thật mà không đổi event logic.

## BGM polish

BGM vẫn dùng bốn track đã checksum-lock:

- Menu;
- Round 1;
- Round 2;
- Final Round.

Khi đổi track, 0.1.18 dùng fade-out ngắn rồi fade-in thay vì cắt ngang trực tiếp.

## Cách test nhanh

Khuyên dùng **1 người + 3 CPU**.

1. Ở Face Setup, thêm ít nhất một ảnh và test crop/zoom/rotate.
2. Vào trận, để ý mỗi lần đáp ô có banner/FX rõ ràng hay không.
3. Kiểm tra ô tiền tăng/giảm B$ có dễ hiểu không.
4. Kiểm tra ô Card/News có landing feedback trước cinematic, nhưng không bị chậm nhịp quá mức.
5. Qua READY và kiểm tra +100 B$ + confetti.
6. Tắt/mở FX trong audio HUD.
7. Quan sát chuyển BGM Round 1 → Round 2 → Final Round có mềm hơn không.
8. Test 2-tab và so host/client có cùng landing/Card/News/Reaction event hay không.

## Feedback ưu tiên

- Crop/zoom/rotate có dễ dùng trên mobile không?
- 320×320 runtime có đủ nét không?
- Sticker có bị nặng/chậm khi đủ 12 ảnh không?
- Banner landing có quá nhanh hoặc quá lâu không?
- Floating money có che UI không?
- FX có vui nhưng vẫn dễ đọc bàn chơi không?
- SFX nào khó chịu hoặc quá to?
- Card/News cinematic có nối tự nhiên sau landing không?
- BGM fade có bị hụt hoặc chồng tiếng không?

## Known limitations

- SFX hiện là WebAudio synth placeholder, chưa phải sound pack final;
- face image vẫn chưa sync sang client 2-tab;
- personality custom vẫn chưa sync thành presentation metadata;
- chưa có backend/internet multiplayer;
- CPU vẫn là QA bot deterministic;
- tile art/content hiện còn MVP, presentation đã đi trước content depth.
