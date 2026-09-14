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
- `docs/MVP_0.1.56_BRANCH_IDENTITY.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

### Branching rule
Canonical gameplay trong `START_PLAYTEST.bat`:
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

### Branch gameplay identity — 0.1.56 locked
Ba alternate corridor có bản sắc rõ ràng, còn lựa chọn kia tại mỗi junction là **PHỐ CHÍNH** với nhịp mixed.

- **Branch A — AN TOÀN 🛡️**: `A1 / A2 / A3` đều là Normal. Không có money swing, TIN TỨC hay LÁ BÀI trực tiếp trong corridor.
- **Branch B — DRAMA 🎭**: `B1 = TIN TỨC`, `B2 = LÁ BÀI`, `B3 = TIN TỨC`. Đây là corridor biến động/content interaction cao.
- **Branch C — TIỀN 💰**: `C1 = +25 B$`, `C2 = -20 B$`, `C3 = +25 B$`. Mọi điểm dừng trong corridor đều tác động trực tiếp tới ví.
- Cả ba alternate corridor vẫn có cùng step count tới merge như PHỐ CHÍNH. 0.1.56 không dùng shortcut để tạo lợi thế ẩn.
- Branch picker phải hiển thị tên flavor + mô tả rủi ro để người chơi hiểu lựa chọn mà không cần mở full map.

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
- Sau đó player **phải đổ một movement D6 mới** để đi tiếp trong cùng lượt.
- Release die **chỉ dùng để xét thoát**, tuyệt đối không được tái sử dụng làm movement distance.

### Hospital release rule
- Khi tới lượt player đang ở `HOSPITAL`, roll 1 D6 release check.
- Ra **2 / 4 / 5** → được ra.
- Ra số khác → vẫn ở Hospital, **lượt kết thúc**, lượt sau roll lại.
- Xác suất thoát mỗi lần thử: 50%.
- Bộ số là đúng `2 / 4 / 5`, không đổi thành rule số chẵn.
- Khi thoát thành công, token đi qua `H1 -> H2 -> H3 -> M35`.
- Sau đó player **phải đổ một movement D6 mới** để đi tiếp trong cùng lượt.
- Release die **chỉ dùng để xét thoát**, tuyệt đối không được tái sử dụng làm movement distance.

### Mini Game eligibility rule
- Player đang ở **JAIL hoặc HOSPITAL không được tham gia Mini Game**.
- Participant list phải được xác định từ authoritative holding state tại thời điểm Mini Game bắt đầu.
- Nếu còn **2+ người hợp lệ** → chạy Mini Game bình thường.
- Nếu còn đúng **1 người hợp lệ** → người đó **auto hạng 1**; không mở gameplay Mini Game giả tạo chỉ có một người.
- Nếu còn **0 người hợp lệ** → Mini Game **skip, không payout**.
- Rule eligibility này là luật core và không được thay đổi khi 0.1.59 mở rộng thêm loại Mini Game.

### Lottery rule
- `M23 LOTTERY` roll 1 D6.
- Thưởng = **D6 × 20 B$**.
- Payout: `20 / 40 / 60 / 80 / 100 / 120 B$`.
- Expected payout hiện tại: `70 B$` trước khi cân economy sâu hơn.
- RNG và wallet mutation phải HOST-authoritative khi implement.

### Working 44-space content distribution — 5 Mini Game spaces locked
Draft D phải có **5 ô Mini Game** để hệ thống này còn đủ đất phát triển sâu hơn về sau.

Working distribution:
- Job Hub: `M08`
- Mini Game: **`M09 / M17 / M26 / M35 / M44`**
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M39`
- Money -: `M07 / M18 / M30 / M40`
- các ô còn lại = Normal/breathing

Khoảng cách Mini Game quanh main loop xấp xỉ **8 / 9 / 9 / 9 / 9 ô**, tránh dồn toàn bộ Mini Game về một nửa bản đồ.

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
- `START_PLAYTEST.bat` = gameplay chuẩn / canonical Draft D integration.
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

### Draft D final art / pacing follow-up
Canonical Draft D gameplay integration đã có từ 0.1.55. Những phần còn cần playtest/tuning:
- final art coordinates;
- final district names;
- final landmark sprites;
- final palette/materials;
- actual match duration;
- payload positions có cần rebalance sau playtest hay không.

### Branch balance
Bản sắc AN TOÀN / DRAMA / TIỀN đã chốt ở 0.1.56, nhưng **độ mạnh tương đối** giữa ba flavor chưa phải final. Giá trị reward/risk sẽ được cân sâu ở 0.1.60 sau khi có runtime playtest thực tế.

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
2. Nếu đang Jail/Hospital: HOST resolve **release D6 chỉ để xét thoát**.
3. Fail release → kết thúc lượt; success → chạy exit route và phải **roll movement D6 mới** trong cùng lượt.
4. HOST xác nhận movement dice.
5. Token di chuyển trên authoritative Draft D route.
6. Tại junction, active human gửi intent **RẼ TRÁI / RẼ PHẢI**, HOST resolve route; branch picker cho biết PHỐ CHÍNH hoặc flavor AN TOÀN / DRAMA / TIỀN.
7. Tile payload trigger.
8. `JAIL_GATE/HOSPITAL_GATE` chuyển player vào holding location tương ứng.
9. `LOTTERY` HOST roll D6 và cộng `D6 × 20 B$`.
10. Mini Game lấy participant list sau khi loại mọi player đang ở Jail/Hospital; 1 người hợp lệ = auto hạng 1; 0 người = skip.
11. LÁ BÀI / TIN TỨC dùng current pool/effect resolver; effect hợp lệ có thể gửi player vào JAIL/HOSPITAL.
12. Presentation layer xử lý camera, art, reaction, audio.
13. Turn manager chuyển người tiếp theo.

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
