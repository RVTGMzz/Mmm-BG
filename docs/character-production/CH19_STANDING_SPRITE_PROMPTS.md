# CH-19 — Prompt tạo ảnh nhân vật đứng (board token)

Mục tiêu: mỗi nhân vật có **1 ảnh đứng toàn thân thật nét**, có thêm 2 ảnh biểu cảm thì càng tốt. Game sẽ tự làm chuyển động bằng code: nhún nhảy khi đi, co giãn khi tiếp đất, lật mặt theo hướng đi, thở khi đứng yên. **Không cần** vẽ từng khung đi bộ, vì đó là nguyên nhân khiến nhân vật hiện tại bị mờ và giật.

---

## 1. Quy cách ảnh (bắt buộc giống nhau cho cả 5 nhân vật)

| Mục | Yêu cầu |
|---|---|
| Định dạng | **PNG, nền trong suốt** (không nền trắng, không nền giấy) |
| Kích thước | **1024 × 1024** (vuông) |
| Khung hình | **Toàn thân**, từ đỉnh đầu (kể cả tóc, nơ, vương miện) đến đế giày |
| Vị trí | Nhân vật **đứng giữa**, **đế giày chạm gần đáy ảnh** (cách đáy khoảng 40px), đỉnh đầu cách mép trên khoảng 60px |
| Góc nhìn | **3/4, quay mặt sang PHẢI người xem** (game tự lật khi đi sang trái) |
| Tư thế | **Đứng yên, hai chân chạm đất**, không chạy, không nhảy, không ngồi |
| Tỉ lệ | Chibi khoảng 2,5 đầu, giống bản concept |
| Không có | Chữ, logo, khung, bóng đổ dưới đất, đồ vật bay xung quanh, hiệu ứng |
| Nét vẽ | Giống hệt bản concept: viền nâu đậm, tô màu mềm, ánh sáng từ trên trái |

**Tên file** (gửi lại mình đúng tên này):

| Nhân vật | Ảnh đứng (bắt buộc) | Vui (tuỳ chọn) | Quạu / buồn (tuỳ chọn) |
|---|---|---|---|
| Cau Có | `starter-grumpy.png` | `starter-grumpy_happy.png` | `starter-grumpy_angry.png` |
| Khóc Nhè | `starter-crybaby.png` | `starter-crybaby_happy.png` | `starter-crybaby_angry.png` |
| Lo Lắng | `starter-anxious.png` | `starter-anxious_happy.png` | `starter-anxious_angry.png` |
| Tăng Động | `starter-hyper.png` | `starter-hyper_happy.png` | `starter-hyper_angry.png` |
| Em Bé Bá Đạo | `secret-baby.png` | `secret-baby_happy.png` | `secret-baby_angry.png` |

---

## 2. Cách làm trong ChatGPT (hoặc công cụ vẽ ảnh AI khác)

1. Mở **một cuộc chat mới cho mỗi nhân vật**.
2. **Đính kèm ảnh concept của nhân vật đó** (file `cauco.webp`, `lolang.webp`… trong thư mục Google Drive concept). Bước này quan trọng nhất để giữ đúng mặt mũi và trang phục.
3. Dán **prompt của nhân vật đó** ở mục 4 (đã gồm phần phong cách chung).
4. Nếu ảnh ra **không trong suốt**, nhắn thêm: `Make the background fully transparent, PNG, keep everything else identical.`
5. Nếu ảnh ra **sai tư thế hoặc bị cắt chân**, nhắn thêm: `Full body from head to shoes, standing still, both feet on the ground, centered, nothing cropped.`
6. Có ảnh đứng ưng ý rồi thì làm **biểu cảm trong cùng cuộc chat** bằng prompt ở mục 5. Làm chung một cuộc chat để AI giữ đúng nhân vật.
7. Tải ảnh về, đặt đúng tên ở mục 1, gửi cho mình.

> Mẹo: ảnh nào chưa ổn thì bấm tạo lại 2–3 lần rồi chọn tấm đẹp nhất. Ưu tiên tấm **giống concept nhất**, không phải tấm "đẹp" nhất.

---

## 3. Phần phong cách chung (đã được ghép sẵn vào mỗi prompt bên dưới)

```
Style: MeMeMe board game character art — cute chibi (about 2.5 heads tall), clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. The character stands still in a relaxed idle pose, both feet flat on the ground, 3/4 view facing to the RIGHT of the viewer, centered horizontally, shoes about 40px above the bottom edge, top of the head about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, props flying around, extra characters.
```

---

## 4. Prompt ảnh đứng từng nhân vật

### 4.1 Cau Có — `starter-grumpy.png`
```
Create the idle board-game sprite of "CAU CÓ" from the attached concept sheet.
Character: grumpy Vietnamese man, 40–50 years old, chubby, wavy grey-silver hair, thick frowning eyebrows, gold-rimmed glasses, thick moustache and goatee, unimpressed side-eye expression.
Outfit: dark olive pinstripe blazer worn over the shoulders like a cape, white shirt, brown tie with small gold crown pattern, brown suspenders, brown trousers rolled at the ankle, brown leather belt with gold buckle, gold wristwatch, green ring, polished brown loafers with gold bits. Holds a small brown monogram briefcase (gold crown pattern) in his LEFT hand at his side; the other hand on his hip.
Pose: standing straight and stiff, chin slightly raised, a bit unapproachable.
Style: MeMeMe board game character art — cute chibi (about 2.5 heads tall), clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. The character stands still in a relaxed idle pose, both feet flat on the ground, 3/4 view facing to the RIGHT of the viewer, centered horizontally, shoes about 40px above the bottom edge, top of the head about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, props flying around, extra characters.
```

### 4.2 Khóc Nhè — `starter-crybaby.png`
```
Create the idle board-game sprite of "KHÓC NHÈ" from the attached concept sheet.
Character: dramatic, fashionable Vietnamese lady, 55–65 years old, voluminous curly silver-grey hair with a big pink bow, white cat-eye sunglasses pushed up on her head, gold earrings, rosy cheeks, slightly teary sentimental eyes, soft and theatrical.
Outfit: big yellow-gold leopard-print shawl draped over her shoulders, lavender/purple midi skirt, small heels, lots of accessories; holds a brown monogram handbag (gold crown pattern) on her forearm and a pink phone/wallet in her other hand close to her chest.
Pose: standing with a soft, theatrical posture, one hand near her chest.
Style: MeMeMe board game character art — cute chibi (about 2.5 heads tall), clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. The character stands still in a relaxed idle pose, both feet flat on the ground, 3/4 view facing to the RIGHT of the viewer, centered horizontally, shoes about 40px above the bottom edge, top of the head about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, props flying around, extra characters.
```

### 4.3 Lo Lắng — `starter-anxious.png`
```
Create the idle board-game sprite of "LO LẮNG" from the attached concept sheet.
Character: anxious Vietnamese man, 28–35 years old, messy curly brown hair, round tortoiseshell glasses, worried eyebrows, a small sweat drop, biting his lip nervously.
Outfit: green knit sweater over a white collared shirt, beige wide chino trousers, green-and-white sneakers, a smartwatch; carries lots of stuff: a brown messenger bag with many pockets across his body, pens, a keychain mascot, ID badges, and hugs a planner notebook to his chest with both hands.
Pose: standing slightly hunched and tense, shoulders up, clutching the notebook.
Style: MeMeMe board game character art — cute chibi (about 2.5 heads tall), clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. The character stands still in a relaxed idle pose, both feet flat on the ground, 3/4 view facing to the RIGHT of the viewer, centered horizontally, shoes about 40px above the bottom edge, top of the head about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, props flying around, extra characters.
```

### 4.4 Tăng Động — `starter-hyper.png`
```
Create the idle board-game sprite of "TĂNG ĐỘNG" from the attached concept sheet.
Character: hyper-energetic Vietnamese girl, 18–24 years old, messy brown curly hair in two puffy buns with lots of colourful clips (star, heart, bunny), purple heart-shaped sunglasses on her head, big pink headphones around her neck, winking with a huge open smile, sticker plaster on her cheek.
Outfit: oversized pink-yellow-teal patchwork jacket covered in stickers, white crop top with a crown, black shorts, plaster on the knee, white socks, chunky colourful sneakers (pink/yellow/teal); a teal bunny backpack with keychains (mini game console, bunny).
Pose: standing but bouncy — weight on one leg, one hand making a peace sign near her face, full of momentum while both feet still touch the ground.
Style: MeMeMe board game character art — cute chibi (about 2.5 heads tall), clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. The character stands still in a relaxed idle pose, both feet flat on the ground, 3/4 view facing to the RIGHT of the viewer, centered horizontally, shoes about 40px above the bottom edge, top of the head about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, props flying around, extra characters.
```

### 4.5 Em Bé Bá Đạo — `secret-baby.png`
```
Create the idle board-game sprite of "EM BÉ BÁ ĐẠO" from the attached concept sheet.
Character: bald chubby baby with a big golden crown, stern bossy eyebrows, golden pacifier with a crown, thick gold chain necklace with a crown pendant, gold bracelets.
Outfit: white diaper with small gold crowns, red royal cape with white ermine (black-spotted) trim.
Pose: sitting upright on the ground (babies don't stand) with both hands on the ground in front, chest proud, looking bossy — the bottom of the diaper/legs touches the ground line.
Style: MeMeMe board game character art — cute chibi, clean dark-brown outlines, soft cel shading, warm cozy colours, light from top-left, exactly the same art style and character design as the attached concept sheet.
Output: ONE full-body game sprite on a fully TRANSPARENT background, PNG, 1024x1024. 3/4 view facing to the RIGHT of the viewer, centered horizontally, the part touching the ground about 40px above the bottom edge, top of the crown about 60px below the top edge, nothing cropped.
Do NOT include: text, logos, labels, frames, ground shadow, floor, background, floating icons, toys, props flying around, extra characters.
```

---

## 5. Prompt biểu cảm (gửi tiếp trong cùng cuộc chat, sau khi có ảnh đứng)

**Vui** → `<id>_happy.png`
```
Using the sprite you just made, create the SAME character with the SAME outfit, size, position, framing, 3/4 right-facing view and transparent background — only change the expression and arms: very happy, big smile, sparkling eyes, one arm raised in celebration. Both feet stay on the ground. No text, no effects, no shadow.
```

**Quạu / buồn** → `<id>_angry.png`
```
Using the sprite you just made, create the SAME character with the SAME outfit, size, position, framing, 3/4 right-facing view and transparent background — only change the expression and arms: upset and dramatic (grumpy frown, or teary eyes for KHÓC NHÈ), arms crossed or hands on hips. Both feet stay on the ground. No text, no effects, no shadow.
```

---

## 6. Kiểm tra trước khi gửi

- [ ] Nền **trong suốt** (mở ảnh thấy ô cờ xám trắng phía sau)
- [ ] Thấy **đủ từ đỉnh đầu đến giày**, không bị cắt
- [ ] **Quay mặt sang phải**
- [ ] **Đứng yên**, hai chân chạm đất (riêng Em Bé là ngồi)
- [ ] **Không có** chữ, bóng đổ, đồ vật bay quanh
- [ ] Đặt cạnh ảnh concept thì **nhìn ra ngay là cùng một người**
- [ ] 5 ảnh đặt cạnh nhau thì **to nhỏ và cách vẽ đồng đều**

Gửi các file PNG (đúng tên ở mục 1) cho mình. Mình sẽ cắt gọn, thu nhỏ đúng kích thước game, rồi gắn vào bàn cờ, thẻ người chơi và màn chọn nhân vật.
