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
- Board final phải có **hơn 40 ô trên map chính**.
- Draft B hiện dùng working target **44 ô main loop**: `M01..M44`.
- Không dùng full-map view làm góc camera gameplay thường trực.
- Tới lượt ai, camera chuyển/zoom về token của người đó và follow khi di chuyển.
- Full-map chỉ là overview có chủ đích như intro, xem bản đồ, route inspection hoặc QA/debug.
- Board ưu tiên một primary loop/path network dễ đọc ở góc nhìn gần.
- **Hospital** là đúng **1 special location** nằm ngoài vòng ordinary path.
- **Jail / Police Station** là đúng **1 special location** nằm ngoài vòng ordinary path.
- Hospital/Jail không phải chuỗi nhiều ô.
- Player có thể bị đưa tới Hospital/Jail từ ô gateway trên main loop hoặc bởi effect authoritative từ **TIN TỨC**, **LÁ BÀI**, hay effect được duyệt khác.

Current map source:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
- `docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.md`
- `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

### Four-corner board anchors
44 ô chia thành bốn quarter 11 ô:
- `M01` = **READY**
- `M12` = **JAIL_GATE**
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE**

Landing on `JAIL_GATE` sends the player to `JAIL`.

Landing on `HOSPITAL_GATE` sends the player to `HOSPITAL`.

### Jail release rule
- Khi tới lượt player đang ở `JAIL`, roll 1 D6.
- Ra **1 / 3 / 5** → được ra.
- Ra số khác → vẫn ở Jail và chờ lượt sau roll lại.
- Xác suất thoát mỗi lần thử: 50%.

### Hospital release rule
- Khi tới lượt player đang ở `HOSPITAL`, roll 1 D6.
- Ra **2 / 4 / 5** → được ra.
- Ra số khác → vẫn ở Hospital và chờ lượt sau roll lại.
- Xác suất thoát mỗi lần thử: 50%.
- Bộ số được duyệt là đúng `2 / 4 / 5`, không tự đổi thành rule số chẵn.

### Lottery rule
- `M23 LOTTERY` roll 1 D6.
- Thưởng = **D6 × 20 B$**.
- Payout: `20 / 40 / 60 / 80 / 100 / 120 B$`.
- Expected payout hiện tại: `70 B$` trước khi cân economy sâu hơn.
- RNG và wallet mutation phải HOST-authoritative khi implement.

### Working 44-space content distribution
Draft B1 hiện dùng:
- Job Hub: `M08`
- Mini Game: `M17 / M39`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 ô

Mini Game spacing hiện là đúng `22 / 22`.

Đây là working design source, chưa phải runtime lock.

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

Draft B4 hiện khuyên ưu tiên một **stylized toy/collage city thống nhất**, nhưng đây chưa phải art-style lock cuối.

### Async reaction
Gameplay logic và presentation tách nhau:
- effect resolve ngay;
- reaction chạy song song;
- turn tiếp có thể bắt đầu trước khi reaction biến mất.

Cần test readability trên màn hình nhỏ.

## C. Chưa chốt

### Final map runtime lock / art implementation
Draft B/B1/B2/B3/B4/B5 đã có working design khá đầy đủ, nhưng vẫn chưa khóa runtime:
- final art coordinates;
- final district names;
- final landmark sprites;
- final palette/materials;
- actual camera tween values;
- actual total match duration after 44-space runtime playtest;
- whether working node payload positions need rebalance after playtest.

Draft A cũ `40 + H1..H4 + J1..J4` đã superseded và không còn là thiết kế hiện tại.

### Post-release behavior
Jail/Hospital release faces đã chốt, nhưng vẫn chưa chốt:
- player re-enter main loop tại node nào sau khi thoát;
- roll thoát thành công có được dùng luôn làm bước di chuyển bình thường không;
- hay thoát xong kết thúc lượt;
- alternate release effect/card có tồn tại hay không.

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
3. Player token di chuyển trên main graph.
4. Tile payload trigger.
5. Nếu landing là `JAIL_GATE` hoặc `HOSPITAL_GATE`, HOST chuyển player tới singleton location tương ứng.
6. Nếu landing là `LOTTERY`, HOST roll D6 và cộng `D6 × 20 B$`.
7. Nếu là `Lá Bài/Tin Tức`, loader chọn entry theo pool.
8. Effect resolver thay đổi authoritative state; effect hợp lệ cũng có thể gửi player tới `HOSPITAL` hoặc `JAIL`.
9. Presentation layer xử lý card/news art, face slot, system log, reaction và camera movement.
10. Turn manager chuyển người kế tiếp theo authoritative state.

Nếu player bắt đầu lượt tại Hospital/Jail, dùng release roll đã khóa trước khi xử lý phần tiếp theo của lượt. Phần hậu-release vẫn TBD.

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

Nên dùng weight theo **pool**, không gắn một con số cố định vào rarity cho mọi map.

## G. Localization

Từ đầu:
- UI text qua key;
- reaction text qua key/template;
- `{PlayerA}`, `{PlayerB}`, `{Amount}`, `{Tile}` là variable;
- SFX không chứa câu thoại ngôn ngữ cụ thể ở MVP;
- không bake text vào art nếu text cần dịch.
