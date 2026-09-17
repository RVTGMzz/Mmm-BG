const version = '0.1.70' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'CAREER TRAITS',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • CAREER TRAITS`,
  artifactName: `mememe-playtest-${version}-career-traits`,
} as const;
