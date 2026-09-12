# MeMeMe MVP 0.1 — Playable Handoff

Branch: `mememe-mvp-0.1-core`

## Current milestone

**MVP 0.1.6 — Branching Board Graph PoC**

Mục tiêu milestone: bỏ giả định board luôn là một vòng tuyến tính, chuyển City board sang graph node/edge data-driven và chứng minh một ngã rẽ thật có thể hoạt động mà không phải viết lại Lá Bài, Tin Tức, face runtime hay reaction.

## Đã triển khai

### Core board graph
- Vite + TypeScript + Phaser.
- Landscape 1280×720.
- City test board hiện là graph data-driven.
- `BoardDefinition` có `startNodeId`, `nodes`, `edges`.
- `BoardEdge` có thể khai báo `label`, `route` và parity test `odd/even`.
- `PlayerState` dùng `nodeId` thay cho `tileIndex`, phù hợp với board không còn tuyến tính.
- Runtime validate node ID, start node, edge target/source và node không có outgoing edge trước khi scene chạy.

### City graph PoC
Board hiện có **20 node**.

Đường chính giữ phần lớn layout 18 node cũ. Tại node `4` có ngã rẽ đầu tiên:

- `PHỐ CHÍNH`: `4 → 5 → 6 → 7`
- `HẺM TẮT`: `4 → 18 → 19 → 7`

Hai route có cùng số edge trong PoC để milestone này chỉ test kiến trúc route, không cố tạo lợi thế cân bằng giả.

Node 18 và 19 hiện là ô thường. Đây là geometry/data test, chưa phải content City final.

### Route decision
Mặc định 0.1.6 dùng:

`MVP_BRANCH_DECISION_MODE = 'manual'`

Khi movement còn bước và player đứng tại node có nhiều outgoing edge, `BranchPicker` mở để người chơi chọn route. Đây là input gameplay nên movement chờ lựa chọn trước khi tiếp tục.

Có mode thử nghiệm:

`odd_even`

Nếu bật mode này, edge có `parity: odd/even` sẽ được chọn từ kết quả xúc xắc. Mapping PoC hiện tại:

- lẻ → `PHỐ CHÍNH`
- chẵn → `HẺM TẮT`

**Quan trọng:** đây chỉ là công tắc để test ý tưởng chẵn/lẻ từ legacy prototype. Default vẫn là `manual`, và parity mapping **không phải luật MeMeMe đã chốt**.

### Movement
Movement không còn dùng `(tileIndex + 1) % nodes.length`.

Flow mới:

`current node → lấy outgoing edges → nếu 1 edge thì đi thẳng → nếu nhiều edge thì route resolver quyết định → tween tới destination node → lặp cho tới hết số bước.`

Khi edge đưa player về `startNodeId`, READY lap reward PoC `+100B$` vẫn hoạt động như trước.

### Face runtime + personality PoC
- Setup 4 người, tên riêng + 3 expression: `neutral`, `happy`, `angry`.
- Face xử lý local trong browser, chưa upload server.
- Reaction personality vẫn là assignment PoC theo ghế để test engine, chưa phải taxonomy/UX final.

### Lá Bài source-backed
Runtime deck vẫn chỉ dùng đúng 4 Lá Bài hiện có dữ liệu thật trong spreadsheet:

- `ACT_001 — Trượt Tay` — N — weight 600.
- `ACT_006 — Khóa Mõm` — R — weight 300.
- `ACT_010 — Triệu Hồi Hắc Ín` — SR — weight 90.
- `ACT_012 — Chuyển Sinh Đổi Vận` — SSR — weight 10.

Không tự điền Card_ID còn trống.

### Card Inventory 0.1.5 giữ nguyên
Flow:

`Đáp ô Lá Bài → weighted draw → card vào hand → trong lượt của player mở tay bài → chọn card → chọn target nếu cần → resolve effect → card bị tiêu hao → overlay/reaction chạy non-blocking.`

PoC constants hiện vẫn là:
- hand limit: `3` card;
- tối đa `1` card/lượt.

Hai con số này chưa phải luật final.

### Tin Tức + Reaction giữ nguyên
- `news_mvp_demo.json` chỉ là demo runtime, chưa phải content Tin Tức được duyệt;
- reaction text chỉ là writing PoC;
- reaction sequence dùng delay/overlap và không block turn;
- SFX hiện mới là `sfxId`, chưa có audio playback.

## File chính

- `src/core/types.ts` — board graph types + PlayerState `nodeId`.
- `src/core/board.ts` — graph lookup, outgoing edge, parity resolver, validation.
- `src/core/rules.ts` — PoC card rules + branch decision mode.
- `src/content/city/board_city_mvp.json` — City graph 20 node, 1 branch.
- `src/ui/BranchPicker.ts` — manual route selection.
- `src/scenes/BoardScene.ts` — graph rendering + movement + route choice.
- `src/ui/CardHandPicker.ts` — UI chọn Lá Bài đang giữ.
- `src/ui/TargetPicker.ts` — target selection khi thật sự play card.
- `src/core/news.ts` / `src/ui/NewsOverlay.ts` — Tin Tức runtime demo.
- `src/core/reactions.ts` / `src/ui/ReactionSequencer.ts` — non-blocking auto reaction.

## Chưa triển khai

- luật route/branch final;
- odd/even có phải core rule hay không;
- route cost / shortcut / one-way special rules;
- luật hand limit/card-per-turn final;
- discard/replace UX khi tay đầy;
- rarity-first pool khi mỗi rarity có nhiều card;
- Tin Tức content final;
- personality setup UX/final taxonomy;
- audio asset + SFX playback;
- camera capture;
- face detection/background removal;
- Job / Pet / Minigame;
- multiplayer online;
- town-building;
- win condition final.

## Milestone kế tiếp đề xuất

**MVP 0.1.7 — Turn Phase State Machine + Safe Action Windows**

Graph, card inventory và target/branch picker đã khiến một lượt bắt đầu có nhiều trạng thái. Bước kế nên gom chúng thành state machine rõ ràng:

1. `TURN_START`
2. `PRE_ROLL_ACTION`
3. `ROLLING`
4. `MOVING`
5. `BRANCH_CHOICE` khi cần
6. `RESOLVING_TILE`
7. `TURN_END`

Mục tiêu là không dựa vào nhiều boolean rời (`rolling`, `actionBusy`) khi game phức tạp hơn, đồng thời chuẩn bị nền cho multiplayer/network sync sau này.

## Nguyên tắc MVP

1. Roll → Move → Trigger. ✅
2. Face runtime. ✅
3. Lá Bài data-driven + weighted draw + effect state. ✅
4. Tin Tức data-driven. ✅ PoC demo content.
5. Auto-reaction không block turn. ✅ PoC.
6. Card inventory + chủ động use timing. ✅ PoC.
7. Board graph + route choice. ✅ PoC.
