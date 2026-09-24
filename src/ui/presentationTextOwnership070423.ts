/**
 * 0.1.70.4.22 content-containment hotfix.
 *
 * Older presentation producers sometimes emit one loose Text containing both
 * description and result lines. Exact whole-string comparisons miss that case:
 *   description
 *   → summary
 *
 * Compare semantic lines instead. Every non-empty line in the detached text
 * must belong to the active cinematic before we suppress it, so unrelated HUD
 * and reaction copy is left alone.
 */
export function normalizeCinematicLine070423(value: string): string {
  return value
    .replace(/^[\s→•·\-–—]+/u, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('vi');
}

export function cinematicSemanticLines070423(value: string): string[] {
  return value
    .split(/\n+/)
    .map(normalizeCinematicLine070423)
    .filter(Boolean);
}

export function isDetachedCinematicCopy070423(
  candidate: string,
  ownedValues: readonly string[],
): boolean {
  const candidateLines = cinematicSemanticLines070423(candidate);
  if (candidateLines.length === 0) return false;

  const owned = new Set(
    ownedValues.flatMap(cinematicSemanticLines070423),
  );
  if (owned.size === 0) return false;

  return candidateLines.every((line) => owned.has(line));
}
