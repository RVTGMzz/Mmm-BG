const version = '0.1.70.4.65' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RELEASE CANDIDATE • CH-18.11 KHÓC NHÈ PRODUCTION WALK',
  lobbyHeader: `MMM • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `MMM CITY • ${version}`,
  boardBadge: `PLAYTEST ${version} • CH-18.11 KHÓC NHÈ PRODUCTION WALK`,
  artifactName: `mmm-playtest-${version}-ch18-11-crybaby-production-walk`,
} as const;
