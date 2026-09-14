# MeMeMe — Current Game Design

> Bản thiết kế hiện tại. Chỉ các mục ghi **Đã chốt** mới được coi là quyết định hiện hành.

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

### Final board / camera direction — Draft C current
- Board final có **44 ô trên main loop**: `M01..M44`.
- `M44 -> M01` là lap/salary crossing duy nhất.
- Không dùng full-map view làm camera gameplay thường trực.
- Tới lượt ai, camera chuyển/zoom về token người đó và follow khi di chuyển.
- Full-map chỉ là overview có chủ đích.
- Map dùng một primary loop dễ đọc, uốn quanh thành phố thay vì khung chữ nhật cứng.

Current source:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_C.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_C.json`
- `docs/MAP_VISUAL_BLUEPRINT_44_DRAFT_C1.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`

### Four anchors
- `M01` = **READY**
- `M12` = **JAIL_GATE**
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE**

### Jail / Hospital topology
- Có đúng **1 JAIL** ở phía trong map.
- Có đúng **1 HOSPITAL** ở phía trong map.
- Landing `M12 JAIL_GATE` đưa player thẳng vào `JAIL`.
- Landing `M34 HOSPITAL_GATE` đưa player thẳng vào `HOSPITAL`.
- TIN TỨC / LÁ BÀI / effect được duyệt cũng có thể đưa player trực tiếp tới hai location này.

Jail exit route:
`JAIL -> J1 -> J2 -> J3 -> M13`

Hospital exit route:
`HOSPITAL -> H1 -> H2 -> H3 -> M35`

Mỗi lối ra có đúng **3 ô**. Sáu ô branch không tính vào 44 ô main loop và không tạo lap crossing mới.

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
- Bộ số là đúng `2 / 4 / 5`, không đổi thành rule số chẵn.

### Lottery rule
- `M23 LOTTERY` roll 1 D6.
- Thưởng = **D6 × 20 B$**.
- Payout: `20 / 40 / 60 / 80 / 100 / 120 B$`.
- Expected payout hiện tại: `70 B$` trước khi cân economy sâu hơn.
- RNG và wallet mutation phải HOST-authoritative khi implement.

### Working 44-space content distribution
Draft B1 vẫn dùng được vì main loop không đổi:
- Job Hub: `M08`
- Mini Game: `M17 / M39`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 ô

Mini Game spacing = `22 / 22`.

### Approved visual direction — Draft C1
- Thành phố/island board rực rỡ nhìn từ trên cao.
- Đường chính là chuỗi ô tròn sáng, uốn tự nhiên qua thành phố.
- Landmark lớn giúp định hướng khi camera zoom gần.
- District sign dùng như mốc thị giác.
- Jail/Hospital nằm phía trong, nối bằng branch ngắn với main route.
- Trung tâm thành phố phải còn khoảng thở, không phủ kín bằng ô.
- Ảnh concept AI chỉ định hướng bố cục/mood; numbering và text AI không authoritative.
- Lỗi concept Jail `J1 / J1 / J3 / J4` phải sửa thành **`J1 / J2 / J3`**.

### Final 4-player HUD direction
- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- mỗi HUD tối thiểu avatar + tên + B$
- active player nổi bật
- HUD cố định screen-space, không di chuyển theo board camera
- chi tiết contract: `docs/UI_FINAL_PLAYER_HUD.md`

### Content names
- **LÁ BÀI** thay cho tên legacy
- **TIN TỨC** thay cho tên legacy
- Nội dung chia `Core` và `Map-specific`
- Rarity: `N / R / SR / SSR`
- Có `Impact_Level` riêng

### Personalization
- Tên player chèn động vào system log/dialogue
- Khuôn mặt thật có thể ghép vào avatar/card/situation art
- Reaction random từ pool theo event/personality
- MVP ưu tiên auto-reaction
- Audio ưu tiên non-verbal/generic để dễ localization

### Production philosophy
- Bắt đầu MVP ít content
- Test system trước, fill chiều sâu sau
- Data-driven, tránh hard-code content

## B. Hướng mạnh nhưng cần PoC

### Face input
Khả năng dùng 3 nhóm mặt: neutral / positive / negative.

Cần test consent, crop, storage, quality và fallback nếu người chơi từ chối camera.

### Art style
Hướng hiện tại nghiêng về stylized toy/collage city, sticker-like HUD/characters, outline rõ, màu tươi nhưng vẫn ưu tiên readability.

### Async reaction
Effect resolve và reaction presentation tách nhau. Cần test readability trên màn hình nhỏ.

## C. Chưa chốt

### Final map runtime lock / art implementation
Draft C/C1 đã khóa topology + visual direction nhưng chưa khóa runtime:
- final art coordinates
- final district names
- final landmark sprites
- final palette/materials
- actual camera tween values
- actual match duration sau 44-space runtime playtest
- payload positions có cần rebalance sau playtest hay không

### Post-release behavior
Route hình học đã chốt nhưng timing sau khi roll thoát thành công vẫn chưa chốt:
- dùng luôn số roll đó để di chuyển qua `J1..J3` / `H1..H3`;
- vào `J1/H1` rồi hết lượt;
- hay rule khác được duyệt sau.

### Dynamic board trigger
Ý tưởng board thay đổi sau một mốc vòng vẫn chưa khóa.

### Win condition
Legacy có nhiều mode; MeMeMe chưa khóa mode launch cuối.

### Town-building / attack
Là hướng mở rộng, không coi là core MVP trước khi board loop chứng minh đủ vui.

### Network stack
Không coi framework/protocol cụ thể là tech decision final nếu chưa được khóa riêng.

## D. Core gameplay hypothesis

1. Active player Roll.
2. HOST xác nhận dice.
3. Token di chuyển trên authoritative route.
4. Tile payload trigger.
5. `JAIL_GATE/HOSPITAL_GATE` chuyển player vào holding location tương ứng.
6. `LOTTERY` HOST roll D6 và cộng `D6 × 20 B$`.
7. LÁ BÀI / TIN TỨC dùng current pool/effect resolver.
8. Effect hợp lệ có thể gửi player vào JAIL/HOSPITAL.
9. Presentation layer xử lý camera, art, reaction, audio.
10. Turn manager chuyển người tiếp theo.

Player bắt đầu lượt ở Jail/Hospital dùng release roll đã khóa. Hậu-release timing vẫn TBD.

## E. Face-card rendering model

Asset schema dùng normalized coordinates 0..1 cho face slots để scale đa độ phân giải.

## F. Rarity philosophy

Rarity không đồng nghĩa 1:1 với damage:
- `N`: thường xuyên, dễ hiểu
- `R`: ưu thế rõ
- `SR`: swing lớn
- `SSR`: moment hiếm, có thể lật trận

## G. Localization

- UI/reaction text qua key/template
- `{PlayerA}`, `{PlayerB}`, `{Amount}`, `{Tile}` là variable
- SFX MVP tránh câu thoại gắn ngôn ngữ
- không bake text vào art nếu text cần dịch
