import { normalizeSeed } from './rng';

export type PreviewBranchMode = 'auto' | 'manual';

export const DEFAULT_PREVIEW_BRANCH_MODE: PreviewBranchMode = 'auto';
export const DEFAULT_PREVIEW_SEED = 5454;
const BRANCH_SEED_SALT = 0x054b12a9;

export function resolvePreviewBranchMode(value: string | null | undefined): PreviewBranchMode {
  return value?.toLowerCase() === 'manual' ? 'manual' : DEFAULT_PREVIEW_BRANCH_MODE;
}

export function resolvePreviewSeed(value: string | null | undefined): number {
  if (value === null || value === undefined || value.trim() === '') return DEFAULT_PREVIEW_SEED;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? normalizeSeed(parsed) : DEFAULT_PREVIEW_SEED;
}

export function derivePreviewBranchSeed(baseSeed: number): number {
  return normalizeSeed((normalizeSeed(baseSeed) ^ BRANCH_SEED_SALT) >>> 0);
}

export function chooseAutoBranchEdge<T>(edges: readonly T[], random: () => number): T {
  if (edges.length === 0) throw new Error('AUTO BRANCH cannot choose from an empty edge list.');
  const raw = random();
  const safe = Number.isFinite(raw) ? Math.max(0, Math.min(raw, 0.999999999999)) : 0;
  return edges[Math.floor(safe * edges.length)]!;
}
