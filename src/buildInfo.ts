const version = '0.1.70.4.21' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'FINAL MODAL OWNERSHIP + CAREER LAYOUT',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • FINAL MODAL OWNERSHIP + CAREER LAYOUT`,
  artifactName: `mememe-playtest-${version}-final-modal-career-layout`,
} as const;
