export const JOB_HUB_VF06 = Object.freeze({
  width: 950,
  height: 516,
  radius: 28,
  shell: 0xfff8ea,
  shellWarm: 0xf8ebd2,
  cocoa: 0x4a302a,
  cocoaSoft: 0x765047,
  butter: 0xffd86b,
  coral: 0xff8f86,
  mint: 0x84d5a1,
  aqua: 0x77d9e7,
  lavender: 0xb9a6e8,
  creamHighlight: 0xfffff7,
  cardWidth: 250,
  cardHeight: 230,
  iconWellRadius: 34,
  safeInset: 32,
});

export interface JobCardPaletteVf06 {
  fill: number;
  accent: number;
  soft: number;
  strong: number;
}

const SLOT_PALETTES_VF06: readonly JobCardPaletteVf06[] = [
  { fill: 0xfff2d8, accent: 0xffb872, soft: 0xffe4bd, strong: 0x9a5b31 },
  { fill: 0xeef8ef, accent: 0x84d5a1, soft: 0xd8f0df, strong: 0x3f7e56 },
  { fill: 0xeaf6fb, accent: 0x77d9e7, soft: 0xd6eef5, strong: 0x357686 },
];

export function jobCardPaletteVf06(index: number, risky: boolean): JobCardPaletteVf06 {
  if (risky) {
    return {
      fill: 0xffece8,
      accent: JOB_HUB_VF06.coral,
      soft: 0xffd9d3,
      strong: 0x9f3f38,
    };
  }
  return SLOT_PALETTES_VF06[index] ?? {
    fill: JOB_HUB_VF06.shellWarm,
    accent: JOB_HUB_VF06.lavender,
    soft: 0xeee5fa,
    strong: 0x645084,
  };
}

export function jobHubBoundsVf06(): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  return {
    left: 640 - JOB_HUB_VF06.width / 2,
    right: 640 + JOB_HUB_VF06.width / 2,
    top: 360 - JOB_HUB_VF06.height / 2,
    bottom: 360 + JOB_HUB_VF06.height / 2,
  };
}

export function jobHubFitsLogicalViewportVf06(): boolean {
  const bounds = jobHubBoundsVf06();
  return bounds.left >= JOB_HUB_VF06.safeInset
    && bounds.right <= 1280 - JOB_HUB_VF06.safeInset
    && bounds.top >= JOB_HUB_VF06.safeInset
    && bounds.bottom <= 720 - JOB_HUB_VF06.safeInset;
}
