# MeMeMe (Me³ / 3M) 🎲😶😆😡

**MeMeMe** là thương hiệu game party đa nền tảng lấy người chơi làm trung tâm: khuôn mặt thật của người chơi được đưa vào nhân vật, lá bài và các tình huống phản ứng để biến mỗi ván chơi thành một “meme sống”.

> **Current status:** Pre-production / MVP planning  
> **Primary format:** 2D Party Board Game, landscape-first, data-driven  
> **Target platforms:** Mobile first, thiết kế sẵn cho PC và console về sau

## Brand core

- **Tên lõi:** MeMeMe
- **Cách viết phụ:** Me³, 3M
- **Ý nghĩa:** `Me` + `Meme` + tinh thần “Me! Me! Me!” của party game
- **Logo:** đã chốt; thông số nhận diện hiện lưu tại `assets/brand/LOGO_REFERENCE.md`
- **Franchise model:** một core game dùng lại cho nhiều map/chủ đề
  - City / đời sống đô thị: map cơ bản đầu tiên
  - Magic: map mở rộng tương lai
  - Rainbow / LGBT: map mở rộng tương lai
  - Các chủ đề khác có thể thêm bằng data + asset thay vì viết lại core

## Điểm khác biệt cốt lõi

1. **Face-driven party game**  
   Người chơi đưa khuôn mặt vào game. Khuôn mặt có thể được gắn động vào avatar, lá bài và hình minh họa tình huống.

2. **Dynamic personalized cards**  
   Lá bài có các “face slots” để ghép mặt caster/target theo runtime, thay vì đóng cứng nhân vật.

3. **Fast auto-reactions**  
   Tên người chơi, tính cách, biểu cảm, câu thoại và SFX chung được ghép động. Reaction chạy nhanh, có thể chồng lấn và không được làm chậm lượt kế tiếp.

4. **Core + map-specific content**  
   `Lá Bài` và `Tin Tức` đều chia thành phần lõi dùng chung và phần riêng theo từng map.

5. **Rarity as comeback pressure**  
   Nội dung chia `N > R > SR > SSR`. SSR cực hiếm có thể tạo các pha lật kèo lớn, giúp người đang ở cuối bảng vẫn còn lý do để tiếp tục chơi.

## Thuật ngữ hiện tại

- **Lá Bài**: hệ thống hành động/chơi lên người khác, thay cho tên “Thần chú” của prototype cũ.
- **Tin Tức**: hệ thống sự kiện/ngẫu nhiên, thay cho tên “Lời tiên tri / Giếng tiên tri”.
- **Rarity:** N / R / SR / SSR
- **Impact Level:** mức độ ảnh hưởng của hiệu ứng, tách khỏi độ hiếm để cân bằng.

## Repo map

- `docs/PROJECT_HANDOFF.md` — source-of-truth để tiếp tục làm việc với ChatGPT/AI/dev.
- `docs/GAME_DESIGN_CURRENT.md` — thiết kế hiện tại đã phân biệt rõ quyết định chốt và ý tưởng còn mở.
- `docs/DATA_WORKFLOW.md` — workflow Excel/CSV/JSON cho Lá Bài, Tin Tức và Reaction.
- `docs/LEGACY_RULES_REFERENCE.md` — luật Bitches In Town cũ, chỉ để tham chiếu, **không mặc định là luật final của MeMeMe**.
- `docs/DECISIONS_AND_OPEN_QUESTIONS.md` — những gì đã chốt và những gì cần test/chốt.
- `assets/brand/LOGO_REFERENCE.md` — hướng nhận diện của logo đã chốt.
- `data/cards/mvp_cards.csv` / `.json` — snapshot dữ liệu thật đang có trong file Excel.
- `data/templates/` — template cho Reaction và Tin Tức.
- `source/La-Bai-MemeMe.xlsx` — file spreadsheet gốc hiện tại.

## Nguyên tắc phát triển MVP

- Không cố “fill” toàn bộ chiều sâu ngay.
- Ưu tiên chứng minh 4 thứ trước:
  1. roll → move → trigger tile;
  2. ghép mặt runtime;
  3. Lá Bài/Tin Tức đọc từ data;
  4. auto-reaction nhanh, không block turn flow.
- Nội dung có thể mở rộng sau nếu schema tốt ngay từ đầu.

## Chú ý quan trọng về source

Tài liệu brainstorm cũ có nhiều đề xuất của AI và một số điểm mâu thuẫn nhau. Repo này **không coi mọi câu trong brainstorm là quyết định final**. Các file trong `docs/` đã tách rõ:
- điều người thiết kế đã chốt,
- hướng đang nghiêng về,
- đề xuất chưa duyệt,
- luật legacy cần quyết định có mang sang MeMeMe hay không.
