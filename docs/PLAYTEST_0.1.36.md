# MeMeMe MVP 0.1.36 Playtest

## Trọng tâm bản này

### 1. Event SFX
Kiểm tra đúng thời điểm phát của 8 cue:

- `victory.ogg`: chỉ khi bảng kết quả cuối thật sự xuất hiện.
- `news.ogg`: khi mở presentation Tin Tức.
- `card.ogg`: khi nhận/rút Lá Bài.
- `step.ogg`: mỗi `move_step` authoritative phát đúng một lần.
- `money_loss.ogg`: khi một packet authoritative làm B$ giảm.
- `money_gain.ogg`: khi một packet authoritative làm B$ tăng. Đây là file +money mới do user cung cấp.
- `dice.ogg`: các lần đổ D6, gồm gameplay dice, Job dice và Roll For Order presentation.
- `choice.ogg`: menu/chốt lựa chọn phù hợp, gồm Job và các picker đã nối cue.

FX mute phải tắt được toàn bộ cue trên. BGM mute/volume vẫn độc lập.

## 2. Roll For Order

Trước trận, từng player phải được trình diễn lượt đổ D6 riêng để nhìn thấy kết quả thay vì chỉ tính âm thầm.

- D6 cao hơn xếp trước.
- Chỉ những người hòa điểm mới đổ lại.
- CPU cũng diễn animation và nghe dice SFX.
- Player ID, face, màu, CPU/human ownership không đổi. Chỉ `playOrder` thay đổi.
- `playOrder` tiếp tục nằm trong checksum/replay/snapshot.

## 3. Mini Game BGM

Mini Game dùng đúng BGM đã duyệt:

`public/audio/bgm/03_City_Silly.ogg`

Không dùng `track 1.MP3`, không thêm `05_Mini_Game.ogg`, không re-encode hay thay thế bốn BGM đã khóa checksum.

Khi Mini Game kết thúc, BGM phải trở về track đang phát trước khi Mini Game mở.

## 4. Mini Game payout authoritative

### Nhiều ra ít bị

| Hạng | Thưởng |
| --- | ---: |
| 1 | 30 B$ |
| 2 | 20 B$ |
| 3 | 10 B$ |
| 4 | 0 B$ |

### Oẳn Tù Xì trực tiếp

| Hạng | Thưởng |
| --- | ---: |
| 1 | 25 B$ |
| 2 | 15 B$ |
| 3 | 5 B$ |
| 4 | 0 B$ |

Mini Game 4 người hiện tại bắt đầu bằng **Nhiều ra ít bị**, sau đó tự chuyển sang RPS khi còn 1v1. Toàn bộ bảng xếp hạng của flow này dùng bảng thưởng **30/20/10/0**. Bảng **25/15/5/0** dành cho mode RPS trực tiếp.

Payout không được cộng từ UI. Overlay chỉ tạo ranking, sau đó gửi `resolve_minigame` cho host authority. Replay áp dụng đúng bảng thưởng, B$ đi vào checksum và state đồng bộ bình thường.

## 5. Last-lap Mini Game safety

Tình huống cần soi kỹ:

1. Player cuối cùng chưa đủ vòng đi qua READY hoặc hoàn thành vòng.
2. Cùng lượt đó landing vào Mini Game.
3. Chơi Mini Game xong và nhận payout.
4. Chỉ **sau payout authoritative** mới được chốt bảng B$ cuối trận.

Không được hiện bảng kết quả trước rồi mới cộng tiền Mini Game.

## 6. RPS animation

Khi còn 2 người:

- Hiện 2 player đối đầu.
- Có nhịp `OẲN... TÙ... XÌ!` rồi mới lật BÚA / BAO / KÉO.
- Hòa thì diễn lại.
- CPU vs CPU vẫn phải diễn đủ, không xử lý ngầm rồi bỏ animation.

## 7. Regression bắt buộc

- Player 1 vào Job Hub không đứng visual ở ô cũ tới lượt sau.
- Card/News không làm token snap ngược rồi bay tới lại.
- Snapshot/rematch vẫn hard-snap đúng authoritative node.
- Qua READY tăng `lapsCompleted` đúng một lần và trả salary đúng một lần.
- Trận tiếp tục qua mốc 12 turn cũ nếu còn người chưa hoàn thành vòng.
- Result chỉ xuất hiện khi cả bàn đủ 1 vòng và không còn payout Mini Game đang chờ.
- Mini Game reward không tiêu gameplay RNG.
- Snapshot không replay SFX/presentation cũ.

## Luật chưa được tự mở rộng

- Jail sâu hơn vẫn chưa định nghĩa: không tự thêm skip turn, bail hoặc escape.
- CPU vẫn là QA bot, chưa phải AI final.
- Không merge PR #1 trong milestone này.
