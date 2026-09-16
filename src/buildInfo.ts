const version = '0.1.68.2' as const;

/**
 * Canonical visible build identity for the playable vertical slice.
 *
 * Runtime scenes must read their visible version/copy from here instead of
 * hard-coding a historical MVP number. Historical regression docs/tests may
 * keep their original version references.
 */
export const MEMEME_BUILD = {
  version,
  phase: 'CANONICAL MOBILE UI CONTRACT',
  lobbyHeader: `PLAYTEST • MVP ${version}`,
  lobbySubtitle: 'Vertical Slice • Active HUD • Job Details • Setup → Luật → Roll → Trận → Podium → Rematch',
  setupHeader: `FACE SETUP • PLAYTEST MVP ${version}`,
  setupStatus: `${version}: Canonical mobile UI contract implementation on the stabilized vertical slice.`,
  rollOrderBadge: `MVP ${version} • AUTHORITATIVE D6 • MOBILE UI`,
  boardHeader: `CITY • MVP ${version} • CANONICAL MOBILE UI`,
  boardBadge: `PLAYTEST ${version} • ACTIVE HUD + DETAIL ON DEMAND`,
  artifactName: `mememe-playtest-${version}-canonical-mobile-ui`,
} as const;
