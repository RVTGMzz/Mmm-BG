export interface SerializableRngState {
  seed: number;
  state: number;
  calls: number;
}

const UINT32_RANGE = 0x1_0000_0000;
const FALLBACK_NON_ZERO_SEED = 0x6d2b79f5;

export function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return FALLBACK_NON_ZERO_SEED;
  const normalized = Math.floor(seed) >>> 0;
  return normalized === 0 ? FALLBACK_NON_ZERO_SEED : normalized;
}

export function createRngState(seed: number): SerializableRngState {
  const normalized = normalizeSeed(seed);
  return {
    seed: normalized,
    state: normalized,
    calls: 0,
  };
}

/**
 * xorshift32 backed by a serializable state object.
 * Same seed + same action order => same random stream.
 */
export function nextRandom(rng: SerializableRngState): number {
  let value = rng.state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;

  rng.state = value >>> 0;
  rng.calls += 1;
  return rng.state / UINT32_RANGE;
}

export function createRandomSource(rng: SerializableRngState): () => number {
  return () => nextRandom(rng);
}
