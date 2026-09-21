const version = '0.1.70.4.19' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RUNTIME RELIABILITY + RELEASE GUARD',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • RUNTIME RELIABILITY + RELEASE GUARD`,
  artifactName: `mememe-playtest-${version}-runtime-reliability-release-guard`,
} as const;
