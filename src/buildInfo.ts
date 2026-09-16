const version = '0.1.68.1' as const;

/**
 * Canonical visible build identity for the playable vertical slice.
 *
 * Runtime scenes must read their visible version/copy from here instead of
 * hard-coding a historical MVP number. Historical regression docs/tests may
 * keep their original version references.
 */
export const MEMEME_BUILD = {
  version,
  phase: 'MOBILE READABILITY + MODAL CLEANUP',
  lobbyHeader: `PLAYTEST • MVP ${version}`,
  lobbySubtitle: 'Vertical Slice • Mobile Readability • Setup → Luật → Roll → Trận → Podium → Rematch',
  setupHeader: `FACE SETUP • PLAYTEST MVP ${version}`,
  setupStatus: `${version}: Mobile readability + modal cleanup on the stabilized vertical slice.`,
  rollOrderBadge: `MVP ${version} • AUTHORITATIVE D6 • MOBILE READABILITY`,
  boardHeader: `CITY • MVP ${version} • MOBILE READABILITY`,
  boardBadge: `PLAYTEST ${version} • MOBILE READABILITY + MODAL CLEANUP`,
  artifactName: `mememe-playtest-${version}-mobile-readability`,
} as const;
