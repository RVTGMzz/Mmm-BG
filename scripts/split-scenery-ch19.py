"""CH-19: cut an AI scenery sheet on flat green into one PNG per object.

usage: python scripts/split-scenery-ch19.py <sheet.png> <cols> <rows> <outdir> <name1> <name2> ... [--max <px>]

- keys out the flat #00FF00 background (soft edge + green-spill removal)
- each grid cell holds one object; it is cropped tight to its pixels
- objects are downscaled so their longest side is at most --max px (default 512)
- prints "name width height" so the layout code can read real footprints
"""
import os
import sys
from PIL import Image

args = [a for a in sys.argv[1:]]
max_side = 512
if '--max' in args:
    i = args.index('--max')
    max_side = int(args[i + 1])
    del args[i:i + 2]
sheet_path, cols, rows, outdir, *names = args
cols, rows = int(cols), int(rows)
os.makedirs(outdir, exist_ok=True)

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
                alpha = max(0, min(255, int(255 * (1 - (spill - 25) / 65))))
                px[x, y] = (r, max(r, b), b, min(a, alpha))
    return im

sheet = key_green(Image.open(sheet_path))
cw, ch = sheet.width / cols, sheet.height / rows
for index, name in enumerate(names):
    col, row = index % cols, index // cols
    cell = sheet.crop((round(col * cw), round(row * ch), round((col + 1) * cw), round((row + 1) * ch)))
    # keep only the main object: the widest run of non-empty columns/rows
    alpha = cell.split()[3].point(lambda a: 255 if a > 40 else 0)
    def main_run(sums):
        runs, start = [], None
        for i, v in enumerate(sums + [0]):
            if v and start is None: start = i
            if not v and start is not None: runs.append((start, i)); start = None
        return max(runs, key=lambda r: r[1] - r[0]) if runs else None
    cols_ = [sum(1 for y in range(0, alpha.height, 2) if alpha.getpixel((x, y))) > 2 for x in range(alpha.width)]
    run = main_run(cols_)
    if run:
        mask = Image.new('L', alpha.size, 0); mask.paste(alpha.crop((run[0], 0, run[1], alpha.height)), (run[0], 0))
        cell.putalpha(Image.composite(cell.split()[3], Image.new('L', cell.size, 0), mask))
    bb = cell.split()[3].point(lambda a: 255 if a > 40 else 0).getbbox()
    if not bb:
        print(f'{name} EMPTY')
        continue
    obj = cell.crop(bb)
    scale = min(1.0, max_side / max(obj.size))
    if scale < 1:
        obj = obj.resize((round(obj.width * scale), round(obj.height * scale)), Image.LANCZOS)
    obj.save(os.path.join(outdir, f'{name}.png'))
    print(name, obj.width, obj.height)
