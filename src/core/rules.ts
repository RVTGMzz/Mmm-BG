// PoC-only defaults for MeMeMe MVP 0.1.x.
// These are intentionally isolated so they can be changed without touching runtime systems.
// They are NOT locked final MeMeMe rules.
export const MVP_CARD_HAND_LIMIT = 3;
export const MVP_MAX_CARD_PLAYS_PER_TURN = 1;

export type MVPBranchDecisionMode = 'manual' | 'odd_even';

// `manual` is the active 0.1.6 behavior.
// `odd_even` exists only to make the legacy chẵn/lẻ idea testable without hard-wiring it
// into the board graph. Switching this value is a PoC experiment, not a rules decision.
export const MVP_BRANCH_DECISION_MODE: MVPBranchDecisionMode = 'manual';
