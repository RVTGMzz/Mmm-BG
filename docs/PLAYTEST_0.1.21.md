# MeMeMe MVP 0.1.21 — Settings & Audio Startup Playtest

Branch: `mememe-mvp-0.1-core`

## Mục tiêu

0.1.21 gom các điều khiển âm thanh đang chiếm góc màn hình vào một Settings panel gọn và giảm độ trễ của Menu BGM khi mới mở game.

## Cần test

### 1. Settings

- Góc phải chỉ còn nút `⚙️`.
- Bấm `⚙️` mở panel `CÀI ĐẶT`.
- Trong panel có:
  - Nhạc nền BẬT/TẮT;
  - thanh âm lượng BGM;
  - FX BẬT/TẮT.
- Bấm ngoài panel, nút `×`, hoặc `Esc` phải đóng panel.
- Settings không được kích hoạt Roll/Card phía sau.
- BGM/volume/FX vẫn nhớ lựa chọn qua `localStorage` như build trước.

### 2. Menu BGM startup

- Reload trang ở Lobby.
- Nếu trình duyệt cho autoplay, Menu BGM nên vào sớm hơn build 0.1.20.
- Nếu trình duyệt chặn autoplay, click/chạm/phím đầu tiên phải mở khóa track đã được preload sẵn và nhạc phải vào gần như ngay sau gesture.
- Không coi việc browser chặn âm thanh trước gesture là bug của game.

### 3. Regression

Xác nhận các tính năng 0.1.20 vẫn hoạt động:
- turn halo;
- compact board HUD;
- pip dice;
- step movement;
- Card/News/Reaction timing;
- BGM theo vòng;
- kết quả cuối trận chờ presentation;
- face crop/zoom/rotate.

## Lưu ý

Settings là presentation/client preference, không nằm trong gameplay checksum hoặc MatchState.
