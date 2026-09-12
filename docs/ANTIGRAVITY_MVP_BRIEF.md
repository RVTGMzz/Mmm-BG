# Antigravity MVP Brief — MeMeMe

Tài liệu này là brief để bắt đầu PoC/MVP với AI coding agent. Mục tiêu là chứng minh core systems, **không làm full game ngay**.

## Goal

Tạo một vertical slice 2D landscape cho 2–4 người chơi giả lập, chứng minh được:

1. dice → movement → tile trigger;
2. data-driven `Lá Bài` / `Tin Tức`;
3. runtime face compositing vào art;
4. dynamic player names;
5. auto-reaction theo personality/emotion;
6. reaction presentation không block turn flow.

## Hard constraints

- Architecture modular, data-driven.
- Không hard-code từng card/news vào turn controller.
- Gameplay state và presentation/reaction tách nhau.
- Không bake player face hoặc player name vào art.
- Mọi text có khả năng dịch phải đi qua localization key/template.
- Landscape-first.
- MVP không cần jobs, pets, town-building hoặc full minigame suite.

## Minimal game state

```ts
Player {
  id
  displayName
  tileId
  money
  personalityTag
  faces: {
    neutral
    positive
    negative
  }
  statuses[]
}
```

```ts
GameState {
  activePlayerId
  round
  players[]
  boardState
  globalStatuses[]
  rngSeed
}
```

## Board PoC

- 10–16 nodes là đủ.
- 1 start node.
- 1 branch node để test path rule.
- 1 normal tile.
- 1 card/news trigger tile.
- 1 penalty/reward tile.

Nếu muốn test mechanic legacy odd/even:
- odd → lower branch;
- even → upper branch.

Mechanic này phải là rule/config, không hard-code tọa độ scene.

## Content loader

Dùng data trong `data/cards/` làm snapshot ban đầu.

Runtime cần interface kiểu:

```ts
resolveEffect(effectId, params, context)
```

Không parse prose trong `Game_Logic` để thực thi. `Game_Logic` chỉ dành cho designer review.

## Face compositing PoC

Chuẩn bị một mock card có 2 face slots:
- caster;
- target.

Slot config dùng normalized coordinates:

```json
{
  "role": "caster",
  "x": 0.3,
  "y": 0.45,
  "scale": 0.8,
  "rotation_deg": -4,
  "emotion": "positive"
}
```

Renderer nhận `playerId + role`, chọn đúng face state rồi đặt vào slot.

## Reaction sequencer

Input:
- `Reaction_Event_ID`
- context player roles
- personality tags
- emotion state

Output presentation:
- system log;
- player bubble/card/avatar reaction;
- generic SFX.

Reaction entries có `Delay_ms`, `Duration_ms`, `Can_Overlap`, `Blocking`.

**Default MVP:** `Blocking = false`.

Target nhịp thử nghiệm:
- 0 ms: caster reaction;
- 700 ms: target reaction;
- 1400 ms: spectator reaction;
- ~2500–3000 ms: presentation kết thúc;
- turn logic có thể chuyển trước thời điểm này.

## Rarity PoC

Cần test đủ N/R/SR/SSR nhưng **không khóa balance final**.

Khuyến nghị PoC:
1. roll rarity;
2. roll entry bên trong rarity pool.

Như vậy designer dễ kiểm soát tỉ lệ tổng N/R/SR/SSR hơn việc coi mỗi row weight là xác suất cuối.

## Acceptance tests

PoC đạt khi:

- [ ] Có thể tạo 4 player với tên khác nhau.
- [ ] Có thể gán ảnh mặt mock cho từng emotion.
- [ ] Dice di chuyển token đúng số node.
- [ ] Branch rule hoạt động.
- [ ] Tile trigger load content từ data.
- [ ] Một effect thực sự thay đổi money/status/tile.
- [ ] Card render đúng mặt caster + target.
- [ ] System log thay đúng `{PlayerA}` / `{PlayerB}`.
- [ ] Reaction random đúng role/personality.
- [ ] Reaction không khóa turn manager.
- [ ] Thêm một content entry mới không cần sửa turn controller.

## Do not build yet

- production networking;
- account/cloud save;
- gacha monetization;
- full art pipeline;
- full legacy rule set;
- dozens/hundreds of cards;
- console port.

Làm lõi vui và sạch trước, rồi mới mở scope.
