const version = '0.1.70.4.20' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'STALE ROOM RECYCLE + WEBSOCKET KEEPALIVE',
  lobbyHeader: `MeMeMe • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `CITY • MVP ${version}`,
  boardBadge: `PLAYTEST ${version} • STALE ROOM RECYCLE + WEBSOCKET KEEPALIVE`,
  artifactName: `mememe-playtest-${version}-stale-room-recycle-websocket-keepalive`,
} as const;
