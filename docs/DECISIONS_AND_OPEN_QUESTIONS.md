# Decisions and Open Questions

## Locked

- [x] Brand: MeMeMe
- [x] Alternate brand styling: Me³ / 3M
- [x] Logo hiện tại là logo đã chốt
- [x] Landscape-first
- [x] Franchise nhiều map/theme
- [x] Map cơ bản tránh quá nặng phép thuật, nghiêng city/everyday vibe
- [x] `Thần chú` → `Lá Bài`
- [x] `Tiên tri` → `Tin Tức`
- [x] Core deck + map-specific deck
- [x] N / R / SR / SSR
- [x] Có Impact Level riêng
- [x] Runtime face compositing
- [x] Dynamic player names trong log/dialogue
- [x] Personality-based randomized reaction
- [x] Reaction MVP chạy tự động, không bắt chọn đáp án
- [x] Generic/non-verbal audio để localization dễ hơn
- [x] MVP ít content trước, mở rộng sau
- [x] Spreadsheet/data-driven workflow

## Need prototype / decision

- [ ] Mỗi player bắt buộc bao nhiêu ảnh mặt?
- [ ] Auto cutout hay manual crop?
- [ ] Face data lưu local hay cloud?
- [ ] Privacy/consent/retention cho ảnh mặt?
- [ ] Board có bao nhiêu node ở MVP/final?
- [ ] Có giữ odd/even branch từ legacy không?
- [ ] Dynamic board có shuffle không?
- [ ] Nếu shuffle: payload tile, position tile hay cả path graph?
- [ ] Trigger shuffle theo lap của leader, theo round, hay event?
- [ ] Win condition launch
- [ ] Giữ jobs ở MVP hay phase 2?
- [ ] Giữ pets ở MVP hay phase 2?
- [ ] Minigames là core launch hay expansion?
- [ ] Rarity roll theo rarity-first hay entry-weight?
- [ ] SSR rate 1% có thực sự vui ở session length ngắn không?
- [ ] Có pity/anti-streak không?
- [ ] Có town-building meta layer không?
- [ ] Multiplayer local/pass-and-play/LAN/online ưu tiên thứ tự nào?
- [ ] Engine/stack final

## Recommended MVP cut

Để không phình scope:
- 1 board giả lập;
- 2–4 players;
- 1 dice;
- 1 branch rule;
- 3 tile types;
- 4–8 content entries;
- 1 card có caster+target face slots;
- 1 news có player face;
- 3 personality tags;
- 3 emotion states;
- 1 reaction sequence 2 người;
- 1 reaction sequence có spectator;
- 1 SSR comeback effect;
- không jobs/pets/minigame/town-building trong PoC đầu tiên.

## Important source discrepancy

Trong brainstorm, AI từng mô tả như thể đã “điền đầy” các dòng ACT_002…ACT_011 trong Excel. File `.xlsx` thực tế hiện tại **vẫn để trống nhiều tên và Game_Logic**.

Source-of-truth cho data là file spreadsheet thật, không phải đoạn văn mô tả của AI.
