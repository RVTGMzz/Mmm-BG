const version = '0.1.70.4.15' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'PRESENTATION SPACING PASS',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • PRESENTATION SPACING PASS`,
  artifactName: `mememe-playtest-${version}-presentation-spacing-pass`,
} as const;
