# MeMeMe — Project Handoff / Source of Truth

Cập nhật: 2026-09-12

Tài liệu này dùng để mở một phiên ChatGPT/AI/dev mới mà không cần đọc lại toàn bộ lịch sử brainstorm.

## 1. Identity

**Project / franchise:** MeMeMe  
**Alternate styling:** Me³ / 3M  
**Logo:** final logo đã chốt, màu đỏ/đen/kem, chữ `Me³` lớn và `MeMeMe` bên dưới, có ba icon cảm xúc dọc cạnh chữ.

MeMeMe được sinh ra từ prototype board game cũ `Bitches In Town`, nhưng đã **rebrand** để:
- không bị khóa vào một bối cảnh thành phố;
- mở rộng được nhiều map/chủ đề;
- hỗ trợ nhiều party game hoặc biến thể khác cùng dùng cơ chế gắn mặt người chơi;
- xây thành franchise đa nền tảng.

## 2. Product vision

- Party Board Game 2D, vui nhanh, thiên về may rủi và các pha lật kèo.
- Người chơi là “diễn viên” của game thông qua khuôn mặt thật, tên thật/tên nhập vào và personality.
- Visual cần đủ dễ chịu để chơi lâu nhưng vẫn đủ lố để meme hóa khuôn mặt thật.
- Thiết kế **landscape-first** ngay từ đầu để hợp mobile ngang, PC, TV và console về sau.
- Core logic phải tách khỏi map/content data để thêm theme mới không phải viết lại hệ thống.

## 3. Visual direction

### Locked / strong direction
- Logo hiện tại là final.
- Hướng chung: cute/cozy 2D + meme collage/sticker.
- Ảnh mặt người chơi được crop và có outline/sticker treatment để hòa với art.
- UI/bàn cờ không nên quá “ma thuật” ở map cơ bản; map đầu tiên nghiêng về **city / everyday life vibe**.
- Landscape 16:9 là bố cục chính.

### Runtime face compositing
Asset có thể dùng layout “tấm bảng khoét lỗ”:
- background/body/foreground do artist chuẩn bị;
- `face_slot` trong suốt có tọa độ/scale/rotation;
- runtime chèn face của player vào đúng slot;
- một card có thể có caster slot, target slot và spectator slot.

Không bake mặt người chơi vào asset final.

## 4. Personalization system

### Player identity
Mỗi người chơi nhập tên hiển thị.

### Face expressions
Hướng thiết kế hiện tại là có nhiều trạng thái mặt, tối thiểu theo nhóm:
- Neutral
- Positive / vui / đắc ý
- Negative / tức / mếu

Số lượng ảnh scan chính xác và pipeline crop/mask cần PoC trước khi khóa.

### Dynamic event text
Ví dụ:
- System: `{PlayerA} đã ném đá vào {PlayerB}.`
- Caster reaction: phụ thuộc personality + event
- Target reaction: phụ thuộc personality + event
- Có thể có spectator reaction ở event đủ lớn

Tên không hard-code, luôn đi qua biến.

## 5. Reaction pacing

Mục tiêu: reaction làm game vui hơn nhưng **không khiến turn flow lê thê**.

Nguyên tắc:
- auto-reaction, không bắt người chơi bấm chọn câu đáp trả ở MVP;
- gameplay state xử lý ngay, reaction chỉ là presentation;
- dialogue/reaction có thể overlap;
- khoảng 2.5–3 giây cho một cụm reaction lớn là target ban đầu;
- câu ngắn;
- lượt người tiếp theo không cần chờ toàn bộ reaction kết thúc;
- có thể thêm fast-forward/skip sau.

Audio:
- ưu tiên SFX cảm xúc chung/gibberish/non-verbal;
- không phụ thuộc voice line theo ngôn ngữ để tránh gánh nặng localization.

## 6. Content taxonomy

### 6.1 Lá Bài
Tên chung đã chốt để thay cho “Thần chú”.

Dùng cho action/item/trick mà người chơi có thể sử dụng. Có thể gồm:
- Core cards: dùng ở mọi map
- Map cards: riêng cho City, Magic, Rainbow...

### 6.2 Tin Tức
Tên chung đã chốt để thay cho “Lời tiên tri / Giếng tiên tri”.

Dùng cho event bất ngờ, cơ hội/tai họa, hiệu ứng cá nhân hoặc toàn bàn. Có thể gồm:
- Core news
- Map news

### 6.3 Rarity
Chốt hướng:
- N
- R
- SR
- SSR

Rarity dùng cho:
- xác suất rút;
- presentation/VFX;
- tâm lý săn lá hiếm;
- comeback moment.

Ví dụ design intent cho SSR: hoán đổi toàn bộ tiền của bản thân với một target. Tỉ lệ 1% từng được dùng làm ví dụ, chưa nên coi là balance final cho mọi pool.

### 6.4 Impact Level
Tách khỏi Rarity. Dùng để đánh giá mức độ “hiểm”/game-changing để balance pool.

## 7. Data-first workflow

Game content phải đi theo pipeline:

`Spreadsheet → validation/export → JSON/CSV → runtime loader`

Không hard-code 100 lá trong gameplay code.

### MVP
Chỉ cần một số card/news mẫu đủ để test schema và hệ thống. Sau khi core fun/ổn mới fill nội dung sâu.

File Excel hiện tại có 12 Card_ID (`ACT_001`…`ACT_012`) nhưng chỉ một số dòng có tên/logic. Repo giữ snapshot đúng theo file thật, không tự coi các gợi ý brainstorm là nội dung đã duyệt.

## 8. Architecture direction

Yêu cầu hệ thống:
- board data-driven;
- tile/event/card definitions không gắn cứng vào scene;
- face compositing generic;
- reaction sequencer generic;
- personality text pool generic;
- localization keys thay cho text hard-code khi bước sang production;
- map pack có thể đăng ký assets + data riêng.

Tech stack cụ thể chưa cần khóa chỉ vì brainstorm cũ từng nhắc Phaser/PeerJS. Cần chọn sau khi PoC chứng minh mục tiêu đa nền tảng.

## 9. MVP success criteria

Một vertical slice tốt cần chứng minh:

1. 2–4 player local mock session.
2. Roll dice và move trên node path.
3. Trigger một tile.
4. Rút một `Lá Bài` hoặc `Tin Tức` từ data.
5. Render card/news có mặt thật gắn runtime.
6. Resolve effect state.
7. Hiện system log có tên người chơi.
8. Chạy 2–3 auto-reactions theo personality/emotion.
9. Turn flow tiếp tục mà không chờ presentation hoàn tất.
10. Dữ liệu mới thêm vào spreadsheet/JSON không cần sửa gameplay core.

## 10. Legacy relationship

`Bitches In Town` là nguồn gốc prototype, rule set cũ rất giàu hệ thống như:
- jobs;
- pets;
- minigames;
- special tiles;
- branching odd/even path;
- two game modes;
- cards/spells;
- prophecies/events.

Nhưng MeMeMe **không tự động kế thừa tất cả**. Xem `LEGACY_RULES_REFERENCE.md` để quyết định từng hệ thống sau PoC.

## 11. Next recommended work

Ưu tiên tiếp theo:
1. khóa schema `Lá Bài` + `Tin Tức` + `Reaction`;
2. làm PoC face slot runtime;
3. làm board 10–16 node giả lập;
4. test turn pacing;
5. sau đó mới khóa board topology, balance rarity và content volume.
