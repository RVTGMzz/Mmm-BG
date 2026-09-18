# MVP 0.1.22 — Content Depth & Tile Identity

Status: **ACTIVE / BUILDING**

## Goal

Move MeMeMe beyond a technical playtest shell by increasing visible gameplay variety without silently changing the established probability bands or core deterministic architecture.

## Card pool

`src/content/core/cards_mvp.json`

Expanded from **4 → 11 Cards**.

Probability bands stay locked at a total weight of 1000:
- N = 600 / 60%
- R = 300 / 30%
- SR = 90 / 9%
- SSR = 10 / 1%

Cards inside each band currently share the same gameplay effect class as the previous representative Card, so the content pool grows before a later balance pass introduces genuinely new mechanics.

New visible variants include:
- Mượn Tạm Không Hẹn Trả
- Ví Ai Nấy Lo
- Seen Không Rep
- Bị Réo Tên
- Thuế Drama
- Đại Hội Mất Ví
- Đổi Ví Đổi Đời

## News pool

`src/content/core/news_mvp_demo.json`

Expanded from **3 → 8 News** while preserving the previous outcome bands:
- positive self +60B$ = 600 / 60%
- negative self -80B$ = 300 / 30%
- whole-board -40B$ each = 100 / 10%

New visible News includes:
- Voucher Từ Trên Trời Rơi Xuống
- Chủ Quán Trả Nhầm Tiền
- Phí Duy Trì Bí Ẩn
- Đậu Xe Sai Hai Centimet
- Quỹ Chung Bốc Hơi

## Reaction variety

Added alternate News reaction sets:
- `NEWS_POSITIVE_ALT`
- `NEWS_NEGATIVE_ALT`
- `NEWS_GROUP_ALT`

They preserve the existing deterministic seat/personality selection and left/right presentation flow. No new presentation RNG is consumed.

## City tile identity

New helper:

`src/ui/tileIdentity.ts`

All current City MVP nodes now have their own player-facing name/copy, e.g.:
- Hẻm Cà Phê
- Ngã Tư Đông Nghẹt
- Bảng Tin Phố Chính
- Phí Gửi Xe
- Máy Gacha Lá Bài
- Quán Vỉa Hè
- Công Viên
- Chợ Đêm Lá Bài
- Loa Phường
- Hẻm Tắt
- Lối Tắt Sau Chợ

Tile identity is presentation-only. Board node type/value remains authoritative gameplay source-of-truth.

## Regression

New command:

`npm run test:content`

Locks:
- Card IDs unique;
- News IDs unique;
- Card rarity total weights remain 600/300/90/10;
- News outcome weights remain 600/300/100;
- representative RNG points still land in the same gameplay effect bands;
- every News reactionEventId resolves to an existing reaction definition;
- normal City nodes no longer all share generic copy.

Existing presentation regression was updated to lock named City landing copy and alternate News reaction resolution.

## Invariants

- no extra gameplay RNG calls;
- no approved BGM changes;
- no Settings/BGM/SFX/image state enters gameplay checksum;
- no PR merge / Ready state without Ron explicitly asking;
- Card/News expansion may change Card IDs present in hand and therefore can intentionally change the golden gameplay checksum. If this occurs, inspect the diff before updating the golden fixture.
