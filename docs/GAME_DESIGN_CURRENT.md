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

### Final board / camera direction — Draft D current
- Board final working topology có **44 ô trên main loop**: `M01..M44`.
- `M44 -> M01` là lap/salary crossing duy nhất.
- Map không còn là một oval/loop đơn giản; Draft D dùng silhouette bất đối xứng và **3 junction rẽ nhánh thật**.
- Mỗi junction có `RẼ TRÁI / RẼ PHẢI`, cả hai hướng đều tiến về phía trước và nhập lại trước section kế tiếp.
- Current working branch distance giữa split và merge là bằng nhau để lựa chọn thay đổi content exposure, không giấu lợi thế khoảng cách.
- Không dùng full-map view làm camera gameplay thường trực.
- Tới lượt ai, camera chuyển/zoom về token người đó và follow khi di chuyển.
- Full-map là review/overview có chủ đích.

Current sources:
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_BRANCHING_RULE_D2.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
- `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

### Branching rule
Canonical gameplay khi Draft D được tích hợp vào `START_PLAYTEST.bat`:
- human active player tự chọn **RẼ TRÁI / RẼ PHẢI**;
- route choice phải HOST-authoritative;
- không đi ngược;
- không cycle;
- không dead-end;
- luôn merge phía trước và tiếp tục hướng về READY.

Preview QA:
- `START_DRAFT_D_PREVIEW.bat` mặc định **AUTO BRANCH**;
- cùng seed cho cùng branch sequence;
- có toggle **AUTO / THỦ CÔNG**;
- AUTO chỉ là QA convenience, không phải luật người chơi final.

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

Mỗi lối ra có đúng **3 ô**. Sáu ô exit không tính vào 44 ô main loop và không tạo lap crossing mới.

### Jail release rule
- Khi tới lượt player đang ở `JAIL`, roll 1 D6 release check.
- Ra **1 / 3 / 5** → được ra.
- Ra số khác → vẫn ở Jail, **lượt kết thúc**, lượt sau roll lại.
- Xác suất thoát mỗi lần thử: 50%.
- Khi thoát thành công, token đi qua `J1 -> J2 -> J3 -> M13`.
- Sau đó player **tiếp tục cùng lượt bằng một movement D6 mới**.
- Release die **không** được tái sử dụng làm movement distance.

### Hospital release rule
- Khi tới lượt player đang ở `HOSPITAL`, roll 1 D6 release check.
- Ra **2 / 4 / 5** → được ra.
- Ra số khác → vẫn ở Hospital, **lượt kết thúc**, lượt sau roll lại.
- Xác suất thoát mỗi lần thử: 50%.
- Bộ số là đúng `2 / 4 / 5`, không đổi thành rule số chẵn.
- Khi thoát thành công, token đi qua `H1 -> H2 -> H3 -> M35`.
- Sau đó player **tiếp tục cùng lượt bằng một movement D6 mới**.
- Release die **không** được tái sử dụng làm movement distance.

### Lottery rule
- `M23 LOTTERY` roll 1 D6.
- Thưởng = **D6 × 20 B$**.
- Payout: `20 / 40 / 60 / 80 / 100 / 120 B$`.
- Expected payout hiện tại: `70 B$` trước khi cân economy sâu hơn.
- RNG và wallet mutation phải HOST-authoritative khi implement.

### Working 44-space content distribution
Draft B1 content distribution vẫn là working baseline trên Draft D:
- Job Hub: `M08`
- Mini Game: `M17 / M39`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 ô

Mini Game spacing = `22 / 22`.

### Approved visual direction
- Thành phố/island board rực rỡ nhìn từ trên cao.
- Đường board uốn tự nhiên qua thành phố, không cần toàn bộ ô cùng một hình tròn.
- Có khoảng thở giữa các ô; tránh dày đặc và tránh hàng thẳng dài.
- Landmark lớn giúp định hướng khi camera zoom gần.
- District sign dùng như mốc thị giác.
- Jail/Hospital nằm phía trong, có exit route 3 ô.
- Trung tâm thành phố phải còn khoảng thở, không phủ kín bằng ô.
- Ảnh concept AI chỉ định hướng bố cục/mood; numbering và text AI không authoritative.
- Canonical combined visual reference: `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`.

### Final 4-player HUD direction
- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- mỗi HUD tối thiểu avatar + tên + B$
- active player nổi bật
- HUD cố định screen-space, không di chuyển/zoom theo board camera
- chi tiết contract: `docs/UI_FINAL_PLAYER_HUD.md`

### Launcher roles
- `START_PLAYTEST.bat` = gameplay chuẩn / integration target.
- `START_DRAFT_D_PREVIEW.bat` = sandbox map/camera; 0.1.54 mặc định AUTO BRANCH seed `5454`, có MANUAL toggle.
- `START_DRAFT_D_FULL_MAP.bat` = full topology review.
- Legacy `START_FINAL_MAP_PREVIEW.bat` không còn ship trong tester package từ 0.1.54.

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

### Draft D authoritative integration / final art
Preview topology đã chạy, nhưng standard gameplay integration vẫn cần 0.1.55:
- authoritative route-choice intent + HOST resolution;
- replay/checksum coverage cho branches;
- multiplayer presentation parity trên Draft D;
- final art coordinates;
- final district names;
- final landmark sprites;
- final palette/materials;
- actual match duration sau integrated runtime playtest;
- payload positions có cần rebalance sau playtest hay không.

### Branch gameplay identity
Topology đã chốt working rule nhưng safe/drama/money identity của từng route vẫn cần playtest ở 0.1.56+.

### Dynamic board trigger
Ý tưởng board thay đổi sau một mốc vòng vẫn chưa khóa.

### Win condition
Legacy có nhiều mode; MeMeMe chưa khóa mode launch cuối.

### Town-building / attack
Là hướng mở rộng, không coi là core MVP trước khi board loop chứng minh đủ vui.

### Network stack
Không coi framework/protocol cụ thể là tech decision final nếu chưa được khóa riêng.

## D. Core gameplay hypothesis

1. Active player bắt đầu lượt.
2. Nếu đang Jail/Hospital: HOST resolve release D6.
3. Fail release → kết thúc lượt; success → chạy exit route và nhận **fresh movement D6** trong cùng lượt.
4. HOST xác nhận movement dice.
5. Token di chuyển trên authoritative Draft D route.
6. Tại junction, active human gửi intent **RẼ TRÁI / RẼ PHẢI**, HOST resolve route.
7. Tile payload trigger.
8. `JAIL_GATE/HOSPITAL_GATE` chuyển player vào holding location tương ứng.
9. `LOTTERY` HOST roll D6 và cộng `D6 × 20 B$`.
10. LÁ BÀI / TIN TỨC dùng current pool/effect resolver; effect hợp lệ có thể gửi player vào JAIL/HOSPITAL.
11. Presentation layer xử lý camera, art, reaction, audio.
12. Turn manager chuyển người tiếp theo.

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
