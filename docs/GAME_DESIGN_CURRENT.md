# MeMeMe — Current Game Design

> Đây là bản thiết kế hiện tại được chắt lọc từ brainstorm. Mọi mục được gắn nhãn để tránh biến “ý tưởng từng được đề xuất” thành “quyết định đã chốt”.

## A. Đã chốt

### Brand
- Tên thương hiệu: **MeMeMe**
- Styling phụ: **Me³ / 3M**
- Logo hiện tại: final
- Hướng franchise nhiều map/chủ đề

### Platform / layout
- Đa nền tảng là mục tiêu dài hạn
- Mobile là điểm vào thực tế
- **Landscape-first** để không phải đập UI khi đi PC/console

### Final board / camera direction
- Board final phải có **hơn 40 playable spaces**.
- Working design band hiện tại: khoảng **44–48 spaces**; số chính xác chưa khóa.
- Không dùng full-map view làm góc camera gameplay thường trực.
- Tới lượt ai, camera chuyển/zoom về token của người đó và follow khi di chuyển, theo hướng digital party-board game.
- Full-map chỉ là overview có chủ đích như intro, xem bản đồ, route inspection hoặc QA/debug.
- Board ưu tiên một primary loop/path network dễ đọc ở góc nhìn gần.
- **Hospital** và **Jail** được chốt là hai special side-branch/location của board final.
- Deep rules của Hospital/Jail vẫn phải được định nghĩa riêng; không tự suy diễn luật Jail như mất lượt, bail, escape roll/card.

### Final 4-player HUD direction
- 4 player HUD cố định ở 4 góc màn hình, không di chuyển cùng board camera.
- P1: top-left; P2: top-right; P3: bottom-left; P4: bottom-right.
- Mỗi HUD tối thiểu có avatar, tên và B$.
- Có thể thêm hand count, Job và status badge theo dạng compact.
- Active player phải nổi bật rõ bằng border/glow/pulse/marker nhưng không làm thay đổi authoritative state.
- Chi tiết contract nằm tại `docs/UI_FINAL_PLAYER_HUD.md`.
- Visual reference hiện tại: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.

### Content names
- `Lá Bài` thay cho `Thần chú`
- `Tin Tức` thay cho `Tiên tri`
- Nội dung chia `Core` và `Map-specific`
- Rarity: `N / R / SR / SSR`
- Có `Impact_Level` riêng để cân bằng mức độ ảnh hưởng

### Personalization
- Tên người chơi được chèn động vào system log và dialogue
- Khuôn mặt thật được ghép động vào avatar/card/situation art
- Reaction được random từ pool theo event/personality
- MVP ưu tiên auto-reaction, không bắt người chơi chọn câu đáp
- Audio ưu tiên non-verbal/generic để dễ localization

### Production philosophy
- Bắt đầu bằng MVP ít content
- Test system trước, fill chiều sâu sau
- Data-driven, không hard-code content

## B. Hướng rất mạnh nhưng cần PoC trước khi khóa

### Face input
Khả năng dùng 3 nhóm mặt:
1. Neutral
2. Positive
3. Negative

Cần test:
- người chơi có chịu chụp 3 ảnh không;
- crop thủ công hay auto;
- lưu local hay sync;
- chất lượng ảnh tối thiểu;
- fallback nếu từ chối camera.

### Art style
Hướng phù hợp nhất với concept:
- 2D cozy;
- paper cutout / sticker / collage;
- outline mạnh;
- pastel/cream nền nhẹ;
- các điểm nhấn đỏ, vàng, xanh, tím theo brand;
- body vẽ 2D, face thật cố ý hơi “lệch pha” để tạo hài.

### Async reaction
Gameplay logic và presentation tách nhau:
- effect resolve ngay;
- reaction chạy song song;
- turn tiếp có thể bắt đầu trước khi reaction biến mất.

Cần test readability trên màn hình nhỏ.

## C. Chưa chốt

### Exact final board count / detailed route graph
Hướng final đã khóa ở mức **hơn 40 spaces**, camera close-follow và Hospital/Jail side branches, nhưng vẫn chưa khóa:
- exact node count trong khoảng làm việc 44–48;
- vị trí từng branch connector;
- district count và landmark placement;
- shortcut/alternate-route topology nếu có;
- effect distribution trên từng khu.

### Dynamic board trigger
Từng có ý tưởng “leader/queen hoàn thành một vòng thì board xáo lại”.
Cần chốt:
- ai trigger;
- shuffle cái gì;
- có ảnh hưởng path graph hay chỉ tile payload;
- có phá readability hay không.

### Win condition
Legacy có:
- `Tranh ngôi đoạt vị`
- `Sống còn`

MeMeMe chưa chốt mode launch.

### Town-building / attack
Brainstorm có nhắc hướng hybrid kiểu town-building / social attack.
Đây là ý tưởng mở rộng, **không nên coi là core MVP nếu chưa prototype board loop đủ vui**.

### Network stack
Phaser.js, PeerJS, Socket.io từng được đề xuất.
Không coi đây là tech decision final.

## D. Core gameplay hypothesis cho MVP

Một lượt thử nghiệm:

1. Active player bấm Roll.
2. Dice ra kết quả.
3. Player token di chuyển trên graph.
4. Nếu qua branch node, rule path chọn nhánh.
5. Tile payload trigger.
6. Nếu là `Lá Bài/Tin Tức`, loader chọn entry theo pool.
7. Effect resolver thay đổi state.
8. Presentation layer:
   - card/news art;
   - face slot compositing;
   - system log;
   - reaction sequencer.
9. Turn manager chuyển người kế tiếp.

## E. Face-card rendering model

Đề xuất schema asset:

```json
{
  "art_id": "card_swap_money",
  "base_texture": "cards/card_swap_money.png",
  "face_slots": [
    {
      "role": "caster",
      "x": 0.31,
      "y": 0.43,
      "scale": 0.85,
      "rotation_deg": -4,
      "emotion": "positive"
    },
    {
      "role": "target",
      "x": 0.70,
      "y": 0.45,
      "scale": 0.82,
      "rotation_deg": 3,
      "emotion": "negative"
    }
  ]
}
```

Tọa độ normalized 0..1 để asset dễ scale đa độ phân giải.

## F. Rarity philosophy

Rarity không đồng nghĩa 1:1 với “damage”.

- `N`: thường xuyên, dễ hiểu, ít đảo game
- `R`: tạo ưu thế rõ
- `SR`: swing lớn
- `SSR`: moment hiếm, có thể lật mặt trận

Nên dùng weight theo **pool**, không gắn một con số cố định vào rarity cho mọi map. Ví dụ 1% SSR có thể đúng ở một pool nhưng chưa phải chuẩn toàn game.

## G. Localization

Từ đầu:
- UI text qua key;
- reaction text qua key/template;
- `{PlayerA}`, `{PlayerB}`, `{Amount}`, `{Tile}` là variable;
- SFX không chứa câu thoại ngôn ngữ cụ thể ở MVP;
- không bake text vào art nếu text cần dịch.
