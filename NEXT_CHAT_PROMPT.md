# NEXT CHAT PROMPT — MeMeMe Board Game

Tiếp tục MeMeMe Board Game từ `HANDOFF_CURRENT.md` trên branch `mememe-mvp-0.1-core`.

Đọc trước:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. Ron's newest runtime feedback
4. `src/ui/friendlyVisibleCopy0701.ts`
5. `tests/ui-copy-overflow-0701.ts`
6. `src/scenes/CareerMinigameBoardScene069.ts`
7. `src/scenes/CareerMinigameBoardScene0682.ts`
8. `src/core/releaseFlow0701.ts`
9. `src/scenes/DirectDiceBoardScene.ts`

## Current milestone

**0.1.70.1 — Release Flow Repair + UI Density / Copy Overflow Hardening**

Do not resume 0.1.71.
Do not merge PR #1.

Latest runtime source:
`8c367837ab4400ed492462fe5c1f12cc35c0fe7d`

Ron has already confirmed the prior **kẹt/freeze symptom is fixed**, but full Jail/Hospital human acceptance is still pending.

Latest build chain:
- CI #2940 SUCCESS
- PR CI #2941 SUCCESS
- source web #273 SUCCESS
- publisher #229 SUCCESS
- public mirror `e7b40a6caf2b874a4031f54d8a58cd065f8178a4`
- Pages #34 SUCCESS

Test:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Latest UI fixes:
- Job result no longer loses text;
- multi-line readable Job detail;
- strict Card/News modal text ownership;
- no ACTOR/TARGET chips;
- natural transfer wording;
- stale world footer hidden;
- `đối thủ` -> `người chơi khác` on visible Card/News surfaces;
- no relevant legacy max-line truncation;
- dedicated CI regression gate for visible copy/overflow.

Next authority is Ron's runtime feedback. If anything still leaks/clips, patch 0.1.70.1 and rerun full CI/publisher/Pages. If Ron confirms the remaining Jail/Hospital release cases, record human acceptance before considering 0.1.71.

Keep **TIN TỨC / LÁ BÀI**.
Do not call full Runtime PASS before Ron confirms.
