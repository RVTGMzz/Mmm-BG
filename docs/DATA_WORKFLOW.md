# MeMeMe — Data Workflow

## 1. Mục tiêu

Designer có thể thêm/sửa content trong spreadsheet mà không cần chạm gameplay code.

Pipeline:

`Excel / Google Sheets → Validate → Export CSV/JSON → Runtime`

## 2. Card schema

File Excel hiện tại mới có:

| Field | Ý nghĩa |
|---|---|
| `Card_ID` | ID ổn định |
| `Card_Name` | tên hiển thị |
| `Rarity` | N/R/SR/SSR |
| `Drop_Weight` | weight hiện tại |
| `Impact_Level` | độ ảnh hưởng |
| `Game_Logic` | mô tả logic cho designer/dev |

### Đề xuất mở rộng schema trước khi code production

Không cần điền hết ngay, nhưng nên chuẩn bị cột:

- `Deck_Scope`: `CORE`, `MAP_CITY`, `MAP_MAGIC`, ...
- `Card_Type`: attack / defense / utility / trap / passive
- `Target_Mode`: self / single_other / any_player / all_others / all
- `Effect_ID`: ID máy đọc, ví dụ `SWAP_MONEY`
- `Effect_Params`: JSON nhỏ hoặc các cột param tách riêng
- `Art_ID`
- `Caster_Emotion`
- `Target_Emotion`
- `Reaction_Event_ID`
- `Localization_Key_Name`
- `Localization_Key_Desc`
- `Enabled`
- `Notes`

**Không dùng `Game_Logic` prose làm logic runtime duy nhất.** Prose rất tốt cho design review, nhưng runtime cần `Effect_ID + params`.

## 3. News schema

`Tin Tức` nên có schema gần giống card nhưng không mặc định có caster.

Đề xuất:

- `News_ID`
- `News_Name`
- `Scope`: core/map
- `Rarity`
- `Drop_Weight`
- `Impact_Level`
- `Target_Mode`
- `Effect_ID`
- `Effect_Params`
- `Duration_Turns`
- `Global_State_ID` nếu là event toàn bàn
- `Art_ID`
- `Reaction_Event_ID`
- localization keys

## 4. Reaction schema

Reaction là presentation data, không phải gameplay rule.

Tối thiểu:

| Field | Ý nghĩa |
|---|---|
| `Reaction_Event_ID` | nhóm event, ví dụ `CARD_ROCK_THROW` |
| `Variant_ID` | biến thể random |
| `Sequence` | thứ tự xuất hiện |
| `Delay_ms` | độ trễ tương đối |
| `Speaker_Role` | caster/target/spectator/system |
| `Personality_Tag` | badmouth/whiny/gossip/neutral... |
| `Emotion` | neutral/positive/negative |
| `Text_Key` | localization key |
| `SFX_ID` | âm thanh chung |
| `Duration_ms` | presentation duration |
| `Can_Overlap` | true/false |
| `Blocking` | MVP mặc định false |

### Rule pacing đề xuất
- `Blocking = false` cho phần lớn reaction.
- `Sequence` không có nghĩa phải đợi câu trước biến mất.
- dùng `Delay_ms` để tạo nhịp 0ms → 700ms → 1400ms.
- câu ngắn, đọc được trong nhịp party game.

## 5. Variable convention

Dùng token thống nhất:

- `{PlayerA}` caster/actor
- `{PlayerB}` primary target
- `{PlayerC}` spectator/secondary target
- `{Amount}`
- `{Percent}`
- `{Turns}`
- `{CardName}`
- `{NewsName}`

Khi production, mỗi event resolver phải gửi một `context object` để renderer/localization thay biến.

## 6. Rarity / weight

### Không cộng trực tiếp các `Drop_Weight` theo từng row hiện tại
Workbook hiện tại đang lặp cùng weight trên nhiều card. Nếu coi mỗi row là weight tuyệt đối, tổng pool sẽ không phải 1000.

Nên chọn một trong hai mô hình:

**A. Rarity-first**
1. roll rarity theo bảng rarity weight;
2. random đều/weighted trong các entry cùng rarity.

**B. Entry-weight**
Mỗi entry có weight riêng, tổng pool tùy ý; xác suất = `entry_weight / sum(pool_weights)`.

Với MeMeMe, mô hình A dễ cân bằng N/R/SR/SSR hơn trong giai đoạn đầu.

## 7. Validation rules

Exporter nên fail nếu:
- ID trùng;
- rarity không hợp lệ;
- `Effect_ID` không tồn tại;
- target mode không phù hợp effect;
- localization key thiếu;
- card enabled nhưng thiếu art;
- face slot yêu cầu target nhưng effect không có target;
- SSR có impact thấp bất thường hoặc N có impact quá cao thì cảnh báo, không nhất thiết fail.

## 8. Current workbook audit

File `Lá Bài - MemeMe.xlsx` có 12 ID từ `ACT_001` đến `ACT_012`.

Các row đang có `Card_Name + Game_Logic` thật:
- ACT_001 — Trượt Tay
- ACT_006 — Khóa Mõm
- ACT_010 — Triệu Hồi Hắc Ín
- ACT_012 — Chuyển Sinh Đổi Vận

Các row còn lại có rarity/weight/impact nhưng tên và logic đang trống.

Điều này khác với đoạn brainstorm sau đó từng **đề xuất** điền các card còn thiếu. Repo giữ dữ liệu thật theo workbook và không tự coi đề xuất đó là final.
