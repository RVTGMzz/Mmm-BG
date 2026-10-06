import type { CharacterId } from '../../core/characterSystem';

export interface TangDongVisualCanonCh1818 {
  characterId: CharacterId;
  label: string;
  conceptAuthority: {
    driveFileName: string;
    driveFileId: string;
    repoAssetPath: string;
    sha256: string;
    width: number;
    height: number;
  };
  ageGender: string;
  silhouette: string;
  style: string;
  requiredVisualAnchors: readonly string[];
  forbiddenDrift: readonly string[];
}

export const TANG_DONG_VISUAL_CANON_CH1818: TangDongVisualCanonCh1818 = {
  characterId: 'starter-hyper',
  label: 'TĂNG ĐỘNG',
  conceptAuthority: {
    driveFileName: 'tangdong.webp',
    driveFileId: '1zjtCwUM3oh2_wsa9M7Ys7Msif9i2XYv5',
    repoAssetPath: 'docs/character-production/canon/tangdong.webp',
    sha256: '8bd94dc4cb712fe00dceec59ca68deb77069e79b04d6ee4f7d5aeb4c8c84dd5f',
    width: 1122,
    height: 1402,
  },
  ageGender: 'female 18-24',
  silhouette: 'compact, bouncy, constantly moving streetwear silhouette',
  style: 'bright sporty streetwear covered in stickers, charms and playful gadgets',
  requiredVisualAnchors: [
    'messy brown double-bun / twin-bun hair',
    'colorful sunglasses resting on top of the head',
    'pink-and-white headphones',
    'oversized yellow / pink / teal sticker-covered jacket',
    'white cropped top',
    'black athletic shorts with white trim',
    'chunky multicolor sneakers',
    'teal sticker-covered backpack',
    'bunny charms and dangling keychains',
    'small handheld game device',
    'bright bracelets and playful accessories',
    'energetic leaning / bouncing body language',
  ],
  forbiddenDrift: [
    'changing gender presentation or age band',
    'turning the outfit into muted officewear or formal clothing',
    'removing the double-bun hair silhouette',
    'removing the bright oversized jacket identity',
    'removing chunky colorful sneakers',
    'removing backpack / charms / gadget-heavy silhouette',
    'calm static posture that loses the hyperactive body language',
  ],
};
