const version = '0.1.68' as const;

/**
 * Canonical visible build identity for the playable vertical slice.
 *
 * Runtime scenes must read their visible version/copy from here instead of
 * hard-coding a historical MVP number. Historical regression docs/tests may
 * keep their original version references.
 */
export const MEMEME_BUILD = {
  version,
  phase: 'VERTICAL SLICE STABILIZATION',
  lobbyHeader: `PLAYTEST • MVP ${version}`,
  lobbySubtitle: 'Vertical Slice • Setup → Luật → Roll → Trận → Podium → Rematch',
  setupHeader: `FACE SETUP • PLAYTEST MVP ${version}`,
  setupStatus: `${version}: Menu → Face Setup → Chọn luật chơi → Roll For Order → Trận → Podium → Rematch.`,
  rollOrderBadge: `MVP ${version} • AUTHORITATIVE D6 • VERTICAL SLICE`,
  boardHeader: `CITY • MVP ${version} • VERTICAL SLICE`,
  boardBadge: `PLAYTEST ${version} • END-TO-END STABILIZATION`,
  artifactName: `mememe-playtest-${version}-vertical-slice`,
} as const;
