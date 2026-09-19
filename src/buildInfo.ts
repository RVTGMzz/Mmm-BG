const version = '0.1.70.4.16' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'SEMANTIC CARD FOOTER + REACTION SPLIT',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • SEMANTIC CARD FOOTER + REACTION SPLIT`,
  artifactName: `mememe-playtest-${version}-semantic-footer-reaction-split`,
} as const;
