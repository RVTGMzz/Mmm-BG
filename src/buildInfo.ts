const version = '0.1.70.4.8' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'JOB UI COMPACT PASS',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • JOB UI COMPACT`,
  artifactName: `mememe-playtest-${version}-job-ui-compact`,
} as const;
