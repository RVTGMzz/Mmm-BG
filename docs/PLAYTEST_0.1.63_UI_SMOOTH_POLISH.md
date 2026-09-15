# MeMeMe MVP 0.1.63 — UI Readability + Smooth Follow Polish

This build is a **presentation-only polish pass** on top of 0.1.62.

Gameplay remains unchanged:
- movement D6 odd = LEFT;
- movement D6 even = RIGHT;
- HOST resolves the branch automatically;
- no manual branch picker;
- economy, Job, Mini Game, Jail, Hospital, Lottery, TIN TỨC and LÁ BÀI rules are unchanged.

## What changed

1. **Larger event/chat presentation**
   - landing/event panels are visually enlarged;
   - Card/News cinematic presentation is also enlarged slightly for readability.

2. **Smoother active-token camera**
   - follow uses sub-pixel motion instead of rounded-pixel stepping;
   - lower follow lerp gives the camera a softer glide behind moving tokens;
   - Overview / `O` remains available.

3. **Smaller player tokens**
   - token containers render at 82% of the previous size;
   - authoritative token positions and movement are unchanged.

4. **Larger round spaces**
   - normal round spaces grow from radius 23 to 27;
   - feature/special spaces grow proportionally.

5. **Build label fix**
   - the 0.1.62 screenshot exposed that nested canonical UI labels still showed 0.1.61;
   - 0.1.63 recursively updates nested UI labels so the active build version is visible correctly.

## What Ron should watch

Please play several turns and focus on:
- Is the central event/chat panel now large enough without covering too much board?
- Does the camera glide smoothly while tokens move, without feeling delayed or floaty?
- Are player tokens small enough to stop obscuring spaces, but still easy to track?
- Are round movement spaces large enough and easier to read?
- Does `TỔNG QUAN / O` still return cleanly to the active player?
- Does any token snap backwards after many turns?

If you finish the match, also use `BÁO CÁO PLAYTEST -> COPY REPORT` and paste the report back into chat.

## Regression contract

0.1.63 must not change HOST authority, deterministic replay/checksum behavior, branch parity rules, special-location rules, economy, Card/News effects, Job logic, Mini Game payout ownership, result/podium flow, or the 0.1.48 stale-token guard.
