export type TurnPhase =
  | 'TURN_START'
  | 'PRE_ROLL_ACTION'
  | 'CARD_ACTION'
  | 'ROLLING'
  | 'MOVING'
  | 'BRANCH_CHOICE'
  | 'RESOLVING_TILE'
  | 'JOB_CHOICE'
  | 'TURN_END';

export type TurnAction = 'roll' | 'use_card' | 'choose_branch' | 'choose_job';

export interface TurnPhaseSnapshot {
  phase: TurnPhase;
  revision: number;
}

const ALLOWED_TRANSITIONS: Record<TurnPhase, readonly TurnPhase[]> = {
  TURN_START: ['PRE_ROLL_ACTION'],
  PRE_ROLL_ACTION: ['CARD_ACTION', 'ROLLING'],
  CARD_ACTION: ['PRE_ROLL_ACTION'],
  ROLLING: ['MOVING'],
  // 0.1.57 special-location release succeeds by traversing the visible exit
  // corridor, then returns to PRE_ROLL_ACTION in the SAME turn for a fresh
  // movement D6. 0.1.63.4 also lets a resolved Job encounter resume unspent pips.
  MOVING: ['BRANCH_CHOICE', 'RESOLVING_TILE', 'PRE_ROLL_ACTION'],
  BRANCH_CHOICE: ['MOVING'],
  RESOLVING_TILE: ['MOVING', 'JOB_CHOICE', 'TURN_END'],
  JOB_CHOICE: ['MOVING', 'TURN_END'],
  TURN_END: ['TURN_START'],
};

const ACTION_PHASES: Record<TurnAction, readonly TurnPhase[]> = {
  roll: ['PRE_ROLL_ACTION'],
  use_card: ['PRE_ROLL_ACTION'],
  choose_branch: ['BRANCH_CHOICE'],
  choose_job: ['JOB_CHOICE'],
};

export const TURN_PHASE_LABELS: Record<TurnPhase, string> = {
  TURN_START: 'BẮT ĐẦU LƯỢT',
  PRE_ROLL_ACTION: 'CHỜ HÀNH ĐỘNG',
  CARD_ACTION: 'ĐANG DÙNG LÁ BÀI',
  ROLLING: 'ĐANG ĐỔ XÚC XẮC',
  MOVING: 'ĐANG DI CHUYỂN',
  BRANCH_CHOICE: 'ĐANG CHỌN ĐƯỜNG',
  RESOLVING_TILE: 'ĐANG XỬ LÝ Ô',
  JOB_CHOICE: 'ĐANG CHỌN NGHỀ',
  TURN_END: 'KẾT THÚC LƯỢT',
};

export class TurnPhaseMachine {
  private readonly state: TurnPhaseSnapshot;

  constructor(state?: TurnPhaseSnapshot) {
    this.state = state ?? { phase: 'TURN_START', revision: 0 };
  }

  get phase(): TurnPhase {
    return this.state.phase;
  }

  get revision(): number {
    return this.state.revision;
  }

  get snapshot(): TurnPhaseSnapshot {
    return {
      phase: this.state.phase,
      revision: this.state.revision,
    };
  }

  is(phase: TurnPhase): boolean {
    return this.state.phase === phase;
  }

  can(action: TurnAction): boolean {
    return ACTION_PHASES[action].includes(this.state.phase);
  }

  canTransition(next: TurnPhase): boolean {
    return ALLOWED_TRANSITIONS[this.state.phase].includes(next);
  }

  transition(next: TurnPhase): TurnPhaseSnapshot {
    if (next === this.state.phase) return this.snapshot;

    if (!this.canTransition(next)) {
      throw new Error(`Invalid turn phase transition: ${this.state.phase} → ${next}`);
    }

    this.state.phase = next;
    this.state.revision += 1;
    return this.snapshot;
  }
}
