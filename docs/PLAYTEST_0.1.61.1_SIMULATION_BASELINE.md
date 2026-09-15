# MeMeMe MVP 0.1.61.1 — Simulation Baseline / QA Lab

## Mục tiêu

0.1.61.1 **không đổi gameplay, economy, RNG hay authority** so với 0.1.61.

Patch này thêm một simulation lab deterministic để CI chạy nhiều ván bot hoàn chỉnh bằng đúng HOST authority hiện tại. Mục tiêu là tạo một baseline số liệu trước khi dùng report người chơi thật để quyết 0.1.62.

## Runtime vẫn giữ nguyên

- launcher vẫn dùng `CareerMinigameBoardScene061`;
- chain vẫn là `061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`;
- one-lap finish lock, final B$ lock và economy 0.1.60 giữ nguyên;
- Jail/Hospital/Lottery giữ nguyên;
- Job / Mini Game / TIN TỨC / LÁ BÀI giữ nguyên;
- stale-token guard 0.1.48 giữ nguyên.

Visible build/report được đóng dấu **0.1.61.1** để phân biệt package có simulation baseline với 0.1.61 gốc.

## Simulation lab làm gì?

CI chạy một dải seed cố định qua full match 4 CPU đến khi cả bốn người hoàn thành 1 vòng.

Bot dùng:
- HOST-authoritative `roll`;
- HOST-authoritative `choose_branch`;
- HOST-authoritative `play_card`;
- HOST-authoritative `choose_job`;
- `host-system resolve_minigame` cho payout Mini Game.

Mini Game ranking trong lab được xoay deterministic theo seed + event sequence để tránh mặc định ưu tiên P1. Không dùng `Math.random` hay RNG phụ.

Lab ghi lại:
- số turn và command;
- tổng B$ cuối ván và spread;
- movement/release rolls;
- Card / News / Mini Game / Job / Lottery frequency;
- tổng payout Mini Game và Lottery;
- số lần từng seat về đích đầu tiên;
- số lần từng seat đứng top B$;
- seed có số turn cao nhất;
- seed có B$ spread lớn nhất.

## File baseline trong artifact

Artifact 0.1.61.1 có thêm:

`SIMULATION_BASELINE_0.1.61.1.txt`

Đây là baseline CI, **không thay thế cảm giác chơi thật**. Nó chỉ giúp phát hiện việc một thay đổi code vô tình làm lệch economy/pacing trước khi human playtest.

## Human playtest vẫn dùng report như 0.1.61

Sau một ván thật:
1. chơi đến podium;
2. mở `📊 BÁO CÁO PLAYTEST`;
3. bấm `📋 COPY REPORT`;
4. paste nguyên report;
5. thêm cảm nhận: nhanh / vừa / chậm;
6. nói B$ cuối ván: quá sít / vừa / quá swingy;
7. chỉ ra event kéo nhịp nhất hoặc mạnh/yếu nhất.

## Quan trọng

0.1.62 vẫn phải dựa trên **runtime report + subjective feedback của người chơi thật**. Không lấy bot simulation một mình để tự quyết balance.

PR #1 vẫn Draft/Open. Không merge nếu Ron chưa yêu cầu.
