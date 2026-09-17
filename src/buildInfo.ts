const version = '0.1.70.1' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RELEASE FLOW REPAIR + UI DENSITY',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • RELEASE FLOW + UI DENSITY`,
  artifactName: `mememe-playtest-${version}-release-flow-ui-density`,
} as const;
