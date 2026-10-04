const version = '0.1.70.4.39' as const;

/** Canonical visible build identity. Keep visible version copy centralized here. */
export const MEMEME_BUILD = {
  version,
  phase: 'RELEASE CANDIDATE • CH-16.1 QUICK MINI GAME + LANDING FIX',
  lobbyHeader: `MMM • ${version}`,
  lobbySubtitle: 'Chọn cách chơi',
  setupHeader: `TẠO NGƯỜI CHƠI • ${version}`,
  setupStatus: 'Sẵn sàng',
  rollOrderBadge: `MVP ${version} • ROLL FOR ORDER`,
  boardHeader: `MMM CITY • ${version}`,
  boardBadge: `PLAYTEST ${version} • QUICK MINI GAME + LANDING FIX`,
  artifactName: `mmm-playtest-${version}-ch16-1-quick-minigame-landing-fix`,
} as const;
