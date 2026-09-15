import { CareerMinigameBoardScene059 } from './CareerMinigameBoardScene059';

/**
 * 0.1.60 gameplay changes live in the HOST/replay economy layer.
 *
 * This wrapper intentionally adds no client authority and no RNG. It exists so the
 * packaged runtime has an explicit 0.1.60 inheritance point while retaining every
 * presentation fix from 059 -> 058 -> 057 -> 0561 -> 056 -> 048.
 */
export class CareerMinigameBoardScene060 extends CareerMinigameBoardScene059 {}
