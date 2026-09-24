# MeMeMe — Character Concept Art Reference

Status: **APPROVED CONCEPT ART / GOOGLE DRIVE IS VISUAL SOURCE OF TRUTH**

The approved Character concept sheets are intentionally **not stored as full image binaries in the source repo**. This keeps Git history light while preserving a stable visual authority for future chats and implementation.

## Canonical Drive folder

https://drive.google.com/drive/folders/1NGZQXRXWSiKGVNjjDawJzvnboFcfZHoN?usp=drive_link

Current approved files:

| Character | File | Drive file ID | Approx size | Status |
|---|---|---|---:|---|
| CAU CÓ | `cauco.webp` | `1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf` | 168 KB | APPROVED CONCEPT |
| EM BÉ BÁ ĐẠO | `embe.webp` | `1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv` | 182 KB | APPROVED SECRET CONCEPT |
| KHÓC NHÈ | `khocnhe.webp` | `1jZTUH6RM0_KgoAERIWzDlsz0bJntO7-B` | 185 KB | APPROVED CONCEPT |
| LO LẮNG | `lolang.webp` | `1PLBsvV5_d0fvda4K7od9dv_de7M-H8qq` | 213 KB | APPROVED CONCEPT |
| TĂNG ĐỘNG | `tangdong.webp` | `1zjtCwUM3oh2_wsa9M7Ys7Msif9i2XYv5` | 241 KB | APPROVED CONCEPT |

Combined current concept size is under 1 MB, but the binaries stay in Drive so repeated art revisions do not bloat Git history.

## Visual authority rule

When implementing Character Select, reaction poses, face sockets, TIN TỨC/LÁ BÀI art, or Secret reveal:
- use the Drive folder above as the primary visual reference;
- use `docs/VISUAL_STYLE_BIBLE_V0.1.md` as the style-system authority;
- use source/data specs for age, gender, passives, random rules and runtime logic;
- do not silently replace an approved concept with a newly generated interpretation;
- if concept art changes in Drive, update this manifest and the relevant Character spec.

## Runtime asset rule

These concept sheets are **reference art**, not runtime production assets.

Production-ready assets belong under the actual game asset pipeline only after they are:
- cropped/layered for face compositing;
- separated into body/foreground/masks;
- sized for game runtime;
- named by Character/pose;
- validated on desktop/mobile/Steam Deck.

Do not bake the Drive concept sheets directly into the runtime bundle as-is.

## Character mapping

- KHÓC NHÈ → female, 55–65 → starter
- CAU CÓ → male, 40–50 → starter
- LO LẮNG → male, 28–35 → starter
- TĂNG ĐỘNG → female, 18–24 → starter
- EM BÉ BÁ ĐẠO → Secret Character → RANDOM-only, 5% eligibility per RANDOM slot, max one per batch

