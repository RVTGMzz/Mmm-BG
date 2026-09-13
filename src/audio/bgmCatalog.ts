export type BgmRole = 'menu' | 'gameplay' | 'final_round';

export interface BgmTrackDefinition {
  id: 'menu_mememe' | 'city_bubble' | 'city_silly' | 'final_round';
  file: string;
  role: BgmRole;
  durationSeconds: number;
  loop: true;
}

export const BGM_BASE_PATH = 'audio/bgm';

export const BGM_TRACKS: readonly BgmTrackDefinition[] = [
  {
    id: 'menu_mememe',
    file: '01_Menu_MeMeMe.ogg',
    role: 'menu',
    durationSeconds: 155.99,
    loop: true,
  },
  {
    id: 'city_bubble',
    file: '02_City_Bubble.ogg',
    role: 'gameplay',
    durationSeconds: 126.38,
    loop: true,
  },
  {
    id: 'city_silly',
    file: '03_City_Silly.ogg',
    role: 'gameplay',
    durationSeconds: 138.07,
    loop: true,
  },
  {
    id: 'final_round',
    file: '04_Final_Round.ogg',
    role: 'final_round',
    durationSeconds: 120.02,
    loop: true,
  },
] as const;

export function bgmUrl(track: BgmTrackDefinition): string {
  return `${BGM_BASE_PATH}/${track.file}`;
}

export function getBgmTrack(id: BgmTrackDefinition['id']): BgmTrackDefinition {
  const track = BGM_TRACKS.find((entry) => entry.id === id);
  if (!track) throw new Error(`Unknown MeMeMe BGM track: ${id}`);
  return track;
}
