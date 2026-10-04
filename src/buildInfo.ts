const version = '0.1.70.4.54' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RELEASE CANDIDATE • CH-17.14 MODE ENTRY HARDENING',
  lobbyHeader: `MMM • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `MMM CITY • ${version}`,
  boardBadge: `PLAYTEST ${version} • CH-17.14 MODE ENTRY`,
  artifactName: `mmm-playtest-${version}-ch17-14-mode-entry-hardening`,
} as const;
