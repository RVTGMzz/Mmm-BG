const version = '0.1.70.4.32' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RELEASE CANDIDATE • RC UI DENSITY POLISH + HEADER RHYTHM + VERIFIED AUTHORITY',
  lobbyHeader: `MMM • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `MMM CITY • ${version}`,
  boardBadge: `PLAYTEST ${version} • RC CLEANUP`,
  artifactName: `mmm-playtest-${version}-rc-ui-rhythm`,
} as const;
