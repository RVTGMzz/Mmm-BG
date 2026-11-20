"""CH-19: turn an AI walk-cycle sheet on flat green into the game's walk strip.

usage: python scripts/pack-walk-sheet-ch19.py <sheet.png> <out.png> [cols rows] [frame px] [target height px] [--keep-y]

- keys out the flat #00FF00 background (soft edge + green-spill removal)
- cuts the grid into frames and crops each to the character
- scales every frame by ONE common factor so the character never "breathes"
  between frames, puts the shoes on a shared baseline and centres the torso
- writes a horizontal strip of square frames (default 8 x 192px), the format
  the board token already loads (walk-*-production-x4.png)
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
rows = int(sys.argv[4]) if len(sys.argv) > 4 else 2
cell = int(sys.argv[5]) if len(sys.argv) > 5 else 192
BASELINE = round(cell * 180 / 192)   # shoe line used by the existing strips
TARGET_H = int(sys.argv[6]) if len(sys.argv) > 6 else round(cell * 172 / 192)   # tallest frame height
# --keep-y: keep each frame's height above frame 1's ground line (hops stay airborne)
KEEP_Y = '--keep-y' in sys.argv

def key_green(im: Image.Image) -> Image.Image:
    im = im.convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            spill = g - max(r, b)
            if spill > 90 and g > 140:
                px[x, y] = (0, 0, 0, 0)
            elif spill > 25:
                # soft edge: fade by how green it is, and pull the green down
                alpha = max(0, min(255, int(255 * (1 - (spill - 25) / 65))))
                px[x, y] = (r, max(r, b), b, min(a, alpha))
    return im

sheet = key_green(Image.open(src))
cw, ch = sheet.width // cols, sheet.height // rows
frames = []
bottoms = []
for row in range(rows):
    for col in range(cols):
        f = sheet.crop((col * cw, row * ch, col * cw + cw, row * ch + ch))
        mask = f.split()[3].point(lambda a: 255 if a > 60 else 0)
        bb = mask.getbbox()
        if bb:
            frames.append(f.crop(bb))
            bottoms.append(bb[3])

scale = TARGET_H / max(f.height for f in frames)
strip = Image.new('RGBA', (cell * len(frames), cell), (0, 0, 0, 0))
for i, f in enumerate(frames):
    f = f.resize((max(1, round(f.width * scale)), max(1, round(f.height * scale))), Image.LANCZOS)
    # centre on the torso (upper half), not the swinging legs
    upper = f.crop((0, 0, f.width, f.height // 2)).split()[3]
    xs = [x for x in range(upper.width) for y in range(0, upper.height, 3) if upper.getpixel((x, y)) > 60]
    cx = (min(xs) + max(xs)) / 2 if xs else f.width / 2
    x = round(i * cell + cell / 2 - cx)
    y = BASELINE - f.height
    if KEEP_Y:
        y -= round((bottoms[0] - bottoms[i]) * scale)
    strip.alpha_composite(f, (max(i * cell, x), max(0, y)))
strip.save(out)
print(f'{len(frames)} frames -> {out} ({strip.width}x{strip.height}), scale {scale:.3f}')
