const version = '0.1.70.4.18' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'ADAPTIVE PRESENTATION SAFE AREA',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • ADAPTIVE PRESENTATION SAFE AREA`,
  artifactName: `mememe-playtest-${version}-adaptive-presentation-safe-area`,
} as const;
