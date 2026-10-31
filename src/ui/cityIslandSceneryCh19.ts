import type { BoardDefinition, BoardNode } from '../core/types';

/**
 * CH-19 City Island scenery (presentation only).
 *
 * Builds the island backdrop from the board graph: sea, island, lakes, paved
 * paths, buildings, trees and landmarks (jail, hospital, ferris wheel, job
 * offices, city fountain). Positions come from node coordinates + edges, so a
 * changed board JSON re-lays the city automatically. Style follows
 * docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png.
 *
 * The result is one SVG string that the scene rasterises once to a texture.
 * District labels are returned separately so the scene can draw them as crisp
 * Phaser text.
 */

export interface IslandBoundsCh19 { x: number; y: number; w: number; h: number }
export interface IslandLabelCh19 { x: number; y: number; title: string; subtitle: string }
export interface IslandSceneryCh19 {
  svg: string;
  bounds: IslandBoundsCh19;
  labels: IslandLabelCh19[];
}

interface Pt { x: number; y: number }
interface Rect { x: number; y: number; w: number; h: number }
interface Road { d: string; kind: 'main' | 'branch' | 'jail' | 'hospital'; w: number }

export const ISLAND_PALETTE_CH19 = {
  sea: '#1F78AE',
  seaLight: '#53B7E3',
  sand: '#F3DDA6',
  grass: '#7CC55A',
  grassDark: '#5DA845',
  path: '#F7EDD8',
  pathEdge: '#D8C29A',
  navy: '#24375E',
} as const;

const NS = 'http://www.w3.org/2000/svg';

function rng(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** shade('#rrggbb', +0.2) lightens, shade(hex, -0.2) darkens. */
export function shadeCh19(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16, n >> 8 & 255, n & 255]
    .map((v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))
    .map((v) => v.toString(16).padStart(2, '0')).join('');
}

function catmull(pts: Pt[], closed: boolean, pre?: Pt, post?: Pt): string {
  const n = pts.length;
  const get = (i: number): Pt => closed ? pts[(i + n) % n] : i < 0 ? pre! : i >= n ? post! : pts[i];
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2), k = 1 / 6;
    d += ` C${p1.x + (p2.x - p0.x) * k},${p1.y + (p2.y - p0.y) * k} ${p2.x - (p3.x - p1.x) * k},${p2.y - (p3.y - p1.y) * k} ${p2.x},${p2.y}`;
  }
  return d + (closed ? 'Z' : '');
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function buildCityIslandSceneryCh19(board: BoardDefinition, seed = 51): IslandSceneryCh19 {
  const rand = rng(seed);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rand() * a.length)];
  const N = new Map(board.nodes.map((n) => [n.id, n]));
  const P = (id: number): BoardNode => N.get(id)!;

  /* ---------------- graph → main loop + branch chains */
  const mainNext = new Map<number, number>(), mainPrev = new Map<number, number>();
  const branchOut = new Map<number, number[]>(), branchIn = new Set<number>();
  for (const e of board.edges) {
    if (e.route === 'main') { mainNext.set(e.from, e.to); mainPrev.set(e.to, e.from); }
    else { branchOut.set(e.from, [...(branchOut.get(e.from) ?? []), e.to]); branchIn.add(e.to); }
  }
  const loop = [board.startNodeId];
  for (let id = mainNext.get(board.startNodeId); id !== undefined && id !== board.startNodeId; id = mainNext.get(id)) loop.push(id);
  const reflect = (a: Pt, b: Pt): Pt => ({ x: 2 * a.x - b.x, y: 2 * a.y - b.y });
  const roads: Road[] = [{ d: catmull(loop.map(P), true), kind: 'main', w: 96 }];
  for (const e of board.edges) {
    if (e.route === 'main' || branchIn.has(e.from)) continue;
    const ids = [e.from, e.to];
    while (branchOut.has(ids[ids.length - 1]) && !mainNext.has(ids[ids.length - 1])) ids.push(branchOut.get(ids[ids.length - 1])![0]);
    const c = P(e.from).contentId;
    const pts = ids.map(P);
    const first = ids[0], last = ids[ids.length - 1];
    const pre = mainPrev.has(first) ? P(mainPrev.get(first)!) : reflect(pts[0], pts[1]);
    const post = mainNext.has(last) ? P(mainNext.get(last)!) : reflect(pts[pts.length - 1], pts[pts.length - 2]);
    roads.push({
      d: catmull(pts, false, pre, post),
      kind: c === 'SPECIAL_JAIL_HOLD' ? 'jail' : c === 'SPECIAL_HOSPITAL_HOLD' ? 'hospital' : 'branch',
      w: 78,
    });
  }

  const xs = board.nodes.map((n) => n.x), ys = board.nodes.map((n) => n.y);
  const W: IslandBoundsCh19 = { x: Math.min(...xs) - 380, y: Math.min(...ys) - 320, w: 0, h: 0 };
  W.w = Math.max(...xs) + 480 - W.x;
  W.h = Math.max(...ys) + 330 - W.y;

  /* ---------------- distance-to-path field */
  type Sample = { x: number; y: number; w: number };
  const samples: Sample[] = [], CELL = 100, grid = new Map<string, Sample[]>();
  const measure = document.createElementNS(NS, 'svg');
  measure.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  document.body.appendChild(measure);
  for (const r of roads) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', r.d);
    measure.appendChild(p);
    const len = p.getTotalLength();
    for (let s = 0; s <= len; s += 18) { const q = p.getPointAtLength(s); samples.push({ x: q.x, y: q.y, w: r.w / 2 }); }
  }
  measure.remove();
  for (const n of board.nodes) samples.push({ x: n.x, y: n.y, w: n.type === 'ready' ? 115 : 60 });
  for (const s of samples) {
    const k = `${Math.floor(s.x / CELL)},${Math.floor(s.y / CELL)}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(s);
  }
  const roadDist = (x: number, y: number): number => {
    let best = 999;
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++)
      for (const s of grid.get(`${cx + i},${cy + j}`) ?? []) best = Math.min(best, Math.hypot(s.x - x, s.y - y) - s.w);
    return best;
  };

  /* ---------------- island + lakes */
  const landBlobs = samples.filter((_, i) => i % 3 === 0)
    .map((s) => ({ x: s.x + (rand() - .5) * 40, y: s.y + (rand() - .5) * 40, r: 215 + rand() * 70 }));
  const onIsland = (x: number, y: number, m = 0) => landBlobs.some((b) => Math.hypot(b.x - x, b.y - y) < b.r - 55 - m);
  const lakes: { x: number; y: number; r: number }[] = [];
  for (let y = W.y; y < W.y + W.h; y += 34) for (let x = W.x; x < W.x + W.w; x += 34) {
    if (!onIsland(x, y, 60)) continue;
    const d = roadDist(x, y);
    if (d > 118) lakes.push({ x, y, r: Math.min(d - 80, 115) });
  }
  const inWater = (x: number, y: number, m = 0) => lakes.some((l) => Math.hypot(l.x - x, l.y - y) < l.r + 22 + m);
  const insideLand = (x: number, y: number, m = 0) => onIsland(x, y, m) && !inWater(x, y, m);

  /* ---------------- layout: landmarks, buildings, trees */
  const reserved: Rect[] = [];
  const items: { y: number; svg: () => string }[] = [];
  const labels: IslandLabelCh19[] = [];
  const overlaps = (r: Rect, m = 18) => reserved.some((p) => r.x < p.x + p.w + m && r.x + r.w + m > p.x && r.y < p.y + p.h + m && r.y + r.h + m > p.y);
  const findSpot = (cx: number, cy: number, w: number, h: number) => {
    let best: { x: number; y: number; d: number; rect: Rect } | undefined;
    for (const r of [150, 200, 250, 300, 350]) for (let a = 0; a < 24; a++) {
      const x = cx + Math.cos(a / 24 * Math.PI * 2) * r, y = cy + Math.sin(a / 24 * Math.PI * 2) * r;
      const pts = [[-w / 2, 0], [w / 2, 0], [-w / 2, -h], [w / 2, -h], [0, -h / 2], [0, 0], [-w / 2, -h / 2], [w / 2, -h / 2]];
      if (!pts.every(([dx, dy]) => insideLand(x + dx, y + dy))) continue;
      const rect = { x: x - w / 2, y: y - h, w, h };
      if (overlaps(rect, 10)) continue;
      const d = Math.min(...pts.map(([dx, dy]) => roadDist(x + dx, y + dy))) - r * .1;
      if (!best || d > best.d) best = { x, y, d, rect };
    }
    return best;
  };
  const byContent = (c: string) => board.nodes.find((n) => n.contentId === c);
  const landmark = (node: BoardNode | undefined, w: number, h: number, draw: (x: number, y: number) => string, title: string, subtitle: string) => {
    if (!node) return;
    const s = findSpot(node.x, node.y, w, h);
    if (!s) return;
    reserved.push(s.rect);
    items.push({ y: s.y, svg: () => draw(s.x, s.y) });
    labels.push({ x: s.x, y: s.y - h - 34, title, subtitle });
  };
  landmark(byContent('SPECIAL_HOSPITAL_HOLD'), 260, 230, hospital, 'NHÁNH BỆNH VIỆN', 'Chữa lành · Nghỉ ngơi · Quay lại');
  landmark(byContent('SPECIAL_JAIL_HOLD'), 270, 230, jail, 'NHÁNH NHÀ TÙ', 'Sai lầm · Trả giá · Làm lại');
  landmark(byContent('SPECIAL_LOTTERY'), 230, 250, ferris, 'KHU GIẢI TRÍ', 'Vui chơi · Xổ số · Drama');
  landmark(board.nodes.find((n) => n.feature === 'job'), 260, 260, offices, 'KHU NGHỀ NGHIỆP', 'Làm việc · Kiếm tiền · Thăng tiến');
  {
    let best: { x: number; y: number; d: number } | undefined;
    const mx = W.x + W.w / 2, my = W.y + W.h / 2;
    for (let y = W.y; y < W.y + W.h; y += 30) for (let x = W.x; x < W.x + W.w; x += 30) {
      if (!insideLand(x, y, 40) || overlaps({ x: x - 130, y: y - 130, w: 260, h: 260 }, 0)) continue;
      const d = roadDist(x, y) - Math.hypot(x - mx, y - my) * .12;
      if (!best || d > best.d) best = { x, y, d };
    }
    if (best) {
      const b = best;
      reserved.push({ x: b.x - 130, y: b.y - 120, w: 260, h: 220 });
      items.push({ y: b.y - 60, svg: () => fountain(b.x, b.y) });
      labels.push({ x: b.x, y: b.y + 150, title: 'TRUNG TÂM THÀNH PHỐ', subtitle: 'Kết nối · Cơ hội · Tất cả đều có thể' });
    }
  }

  const CITY = ['#F2E2C4', '#9EC9F0', '#F4B3C2', '#C2B2EE', '#F7C08A', '#7FD3C6', '#FFE08A', '#E8EEF6'];
  const trees: { x: number; y: number; kind: 'palm' | 'blossom' | 'tree'; s: number }[] = [];
  for (let y = W.y + 30; y < W.y + W.h; y += 52)
    for (let x = W.x + 30; x < W.x + W.w; x += 52) {
      const jx = x + (rand() - .5) * 28, jy = y + (rand() - .5) * 28;
      if (!insideLand(jx, jy, 10)) continue;
      const d = roadDist(jx, jy);
      if (d < 18) continue;
      if (d < 260 && rand() < .8) {
        const tall = d > 110 && rand() < .45;
        const w = 80 + Math.round(rand() * 50), h = tall ? 150 + Math.round(rand() * 110) : 70 + Math.round(rand() * 50);
        const dep = 26 + rand() * 14, r = { x: jx - w / 2, y: jy - h - dep * .4, w: w + dep * .7, h: h + dep * .4 };
        const pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x, jy], [r.x + r.w, jy], [jx, r.y], [jx, jy], [r.x, r.y + r.h / 2], [r.x + r.w, r.y + r.h / 2]];
        if (pts.every(([px, py]) => roadDist(px, py) > 16 && insideLand(px, py)) && !overlaps(r)) {
          reserved.push(r);
          const col = pick(CITY), kind = tall ? 'tower' : pick(['house', 'house', 'shop', 'block'] as const), sd = Math.floor(rand() * 9);
          items.push({ y: jy, svg: () => building(jx - w / 2, jy, w, h, dep, col, kind, sd) });
          continue;
        }
      }
      if (rand() < (d > 200 ? .55 : .35) && !trees.some((t) => Math.hypot(t.x - jx, t.y - jy) < 46) && !overlaps({ x: jx - 26, y: jy - 70, w: 52, h: 72 }, 0)) {
        const near = !onIsland(jx, jy, 70);
        trees.push({ x: jx, y: jy, kind: near && rand() < .7 ? 'palm' : rand() < .13 ? 'blossom' : 'tree', s: .8 + rand() * .45 });
      }
    }
  for (const t of trees) items.push({ y: t.y, svg: () => tree(t.x, t.y, t.s, t.kind) });
  let umbrellas = 0;
  for (let i = 0; i < 40 && umbrellas < 9; i++) {
    const b = pick(landBlobs), a = rand() * Math.PI * 2, x = b.x + Math.cos(a) * (b.r - 30), y = b.y + Math.sin(a) * (b.r - 30);
    if (onIsland(x, y, -10) && !onIsland(x, y, 50) && roadDist(x, y) > 40 && !overlaps({ x: x - 30, y: y - 50, w: 60, h: 55 }, 0)) {
      reserved.push({ x: x - 30, y: y - 50, w: 60, h: 55 });
      umbrellas++;
      const c = pick(['#F2554A', '#2F7FE0', '#F0509A', '#FFC93C']);
      items.push({ y, svg: () => umbrella(x, y, c) });
    }
  }

  /* ---------------- gate → hold escort links */
  const links: string[] = [];
  const link = (gate: string, hold: string, color: string) => {
    const g = byContent(gate), h = byContent(hold);
    if (!g || !h) return;
    const d = `M${g.x},${g.y} Q${(g.x + h.x) / 2 + 70},${(g.y + h.y) / 2} ${h.x},${h.y}`;
    links.push(`<path d="${d}" fill="none" stroke="#fff" stroke-width="13" stroke-dasharray="1 26" stroke-linecap="round" opacity=".9"/>`);
    links.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="8" stroke-dasharray="1 26" stroke-linecap="round"/>`);
  };
  link('SPECIAL_JAIL_GATE', 'SPECIAL_JAIL_HOLD', '#F4A23B');
  link('SPECIAL_HOSPITAL_GATE', 'SPECIAL_HOSPITAL_HOLD', '#F0509A');

  /* ---------------- SVG assembly */
  const C = ISLAND_PALETTE_CH19;
  const out: string[] = [];
  out.push(`<svg xmlns="${NS}" viewBox="${W.x} ${W.y} ${W.w} ${W.h}" width="${W.w}" height="${W.h}">`);
  out.push(`<defs>
    <filter id="shore" x="-5%" y="-5%" width="110%" height="110%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="42" result="d2"/>
      <feFlood flood-color="${C.seaLight}" flood-opacity=".75"/><feComposite in2="d2" operator="in" result="shallow"/>
      <feMorphology in="SourceAlpha" operator="dilate" radius="12" result="d1"/>
      <feFlood flood-color="#E9FAFF" flood-opacity=".9"/><feComposite in2="d1" operator="in" result="foam"/>
      <feMerge><feMergeNode in="shallow"/><feMergeNode in="foam"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="grassEdge" x="-5%" y="-5%" width="110%" height="110%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>
      <feFlood flood-color="${C.grassDark}"/><feComposite in2="d" operator="in" result="rim"/>
      <feOffset in="rim" dy="6" result="rim2"/>
      <feMerge><feMergeNode in="rim2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
    <radialGradient id="seaGrad" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#3AA6DA"/><stop offset="1" stop-color="${C.sea}"/></radialGradient>
    <pattern id="waves" width="120" height="70" patternUnits="userSpaceOnUse">
      <path d="M10 30q15-12 30 0t30 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".18"/>
      <path d="M70 62q12-9 24 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".14"/>
    </pattern>
    <pattern id="grassTex" width="70" height="60" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="14" r="10" fill="#8ED168" opacity=".55"/><circle cx="48" cy="42" r="13" fill="#6CB64C" opacity=".35"/>
      <path d="M30 18q3-7 6 0M58 10q3-7 6 0M8 48q3-7 6 0" stroke="#5DA845" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </pattern>
    <pattern id="pave" width="36" height="36" patternUnits="userSpaceOnUse">
      <rect width="36" height="36" fill="${C.path}"/><path d="M0 18h36M18 0v18" stroke="#EADBBB" stroke-width="2"/>
    </pattern>
  </defs>`);
  out.push(`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#seaGrad)"/>`);
  out.push(`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#waves)"/>`);
  out.push(`<g filter="url(#shore)">${landBlobs.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${C.sand}"/>`).join('')}</g>`);
  out.push(`<g filter="url(#grassEdge)">${landBlobs.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r - 55}" fill="${C.grass}"/>`).join('')}</g>`);
  out.push(`<g>${landBlobs.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r - 62}" fill="url(#grassTex)"/>`).join('')}</g>`);
  out.push(`<g filter="url(#grassEdge)">${lakes.map((l) => `<circle cx="${l.x}" cy="${l.y}" r="${l.r + 22}" fill="${C.sand}"/>`).join('')}</g>`);
  out.push(`<g>${lakes.map((l) => `<circle cx="${l.x}" cy="${l.y}" r="${l.r + 6}" fill="${C.seaLight}"/>`).join('')}`
    + lakes.map((l) => `<circle cx="${l.x}" cy="${l.y}" r="${l.r - 4}" fill="#3AA6DA"/><circle cx="${l.x}" cy="${l.y}" r="${l.r - 4}" fill="url(#waves)"/>`).join('') + '</g>');
  const sorted = roads.slice().sort((a, b) => (a.kind === 'main' ? 1 : 0) - (b.kind === 'main' ? 1 : 0));
  const edgeCol = (r: Road) => r.kind === 'jail' ? '#E3A05A' : r.kind === 'hospital' ? '#E58FB0' : C.pathEdge;
  const fillCol = (r: Road) => r.kind === 'jail' ? '#FBE3C2' : r.kind === 'hospital' ? '#FCE1EA' : C.path;
  const RL = 'stroke-linejoin="round" stroke-linecap="round" fill="none"';
  out.push(sorted.map((r) => `<path d="${r.d}" ${RL} stroke="#2B5E2A" stroke-opacity=".28" stroke-width="${r.w + 16}" transform="translate(0,12)" filter="url(#soft)"/>`).join(''));
  out.push(sorted.map((r) => `<path d="${r.d}" ${RL} stroke="${edgeCol(r)}" stroke-width="${r.w + 12}"/>`).join(''));
  out.push(sorted.map((r) => `<path d="${r.d}" ${RL} stroke="${fillCol(r)}" stroke-width="${r.w}"/>`).join(''));
  out.push(links.join(''));
  out.push(items.sort((a, b) => a.y - b.y).map((i) => i.svg()).join(''));
  out.push('</svg>');

  return { svg: out.join('\n'), bounds: W, labels };

  /* ================= drawing helpers (return SVG markup) ================= */
  function groundShadow(x: number, y: number, w: number): string {
    return `<ellipse cx="${x + w * .15}" cy="${y + 4}" rx="${w * .62}" ry="14" fill="#1E3A1E" opacity=".3" filter="url(#soft)"/>`;
  }
  function box(x: number, base: number, w: number, h: number, dep: number, col: string, noTop = false): { s: string; dx: number; dy: number; line: string } {
    const dx = dep * .7, dy = -dep * .4, line = shadeCh19(col, -.42);
    let s = `<polygon points="${x + w},${base} ${x + w + dx},${base + dy} ${x + w + dx},${base - h + dy} ${x + w},${base - h}" fill="${shadeCh19(col, -.2)}" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${col}" stroke="${line}" stroke-width="2.6"/>`;
    if (!noTop) s += `<polygon points="${x},${base - h} ${x + dx},${base - h + dy} ${x + w + dx},${base - h + dy} ${x + w},${base - h}" fill="${shadeCh19(col, .25)}" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/>`;
    return { s, dx, dy, line };
  }
  function windows(x: number, top: number, w: number, bottom: number, col: string, sd: number, glass = false): string {
    const cols = Math.max(2, Math.floor((w - 12) / 22)), cw = (w - 12) / cols;
    let s = '', i = 0;
    for (let wy = top + 14; wy < bottom - 16; wy += 24)
      for (let c = 0; c < cols; c++) {
        const lit = (c * 5 + i++ * 3 + sd) % 7 === 0;
        s += `<rect x="${x + 6 + c * cw + (cw - 13) / 2}" y="${wy}" width="13" height="15" rx="2" fill="${lit ? '#FFE38A' : glass ? '#CFE9FF' : '#BFDDF5'}" stroke="${shadeCh19(col, -.45)}" stroke-width="1.6"/>`;
      }
    return s;
  }
  function building(x: number, base: number, w: number, h: number, dep: number, col: string, kind: 'house' | 'shop' | 'block' | 'tower', sd: number): string {
    let s = groundShadow(x + w / 2, base, w);
    if (kind === 'house') {
      const b = box(x, base, w, h, dep, col, true);
      const roof = pick(['#E5634F', '#D9564A', '#5B7FC7', '#8A6BC9', '#E08A3C']), rl = shadeCh19(roof, -.4);
      s += b.s;
      s += `<polygon points="${x - 6},${base - h + 2} ${x + w / 2},${base - h - 40} ${x + w + 6},${base - h + 2}" fill="${roof}" stroke="${rl}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += `<polygon points="${x + w / 2},${base - h - 40} ${x + w / 2 + b.dx},${base - h - 40 + b.dy} ${x + w + 6 + b.dx},${base - h + 2 + b.dy} ${x + w + 6},${base - h + 2}" fill="${shadeCh19(roof, -.18)}" stroke="${rl}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += windows(x, base - h, w, base - 26, col, sd);
      s += `<rect x="${x + w / 2 - 9}" y="${base - 26}" width="18" height="26" rx="3" fill="#9C6B45" stroke="${b.line}" stroke-width="2"/>`;
    } else if (kind === 'shop') {
      const b = box(x, base, w, h, dep, col);
      s += b.s + windows(x, base - h, w, base - 44, col, sd);
      const n = Math.max(4, Math.round(w / 16)), sw = (w + 8) / n, c2 = pick(['#F2554A', '#2F7FE0', '#3DBA5C', '#F0509A']);
      for (let i = 0; i < n; i++)
        s += `<path d="M${x - 4 + i * sw},${base - 44} h${sw} v12 a${sw / 2},${sw / 2} 0 0 1 -${sw},0 z" fill="${i % 2 ? '#fff' : c2}" stroke="${shadeCh19(c2, -.4)}" stroke-width="1.6"/>`;
      s += `<rect x="${x + 8}" y="${base - 28}" width="${w - 16}" height="28" fill="#CFE9FF" stroke="${b.line}" stroke-width="2"/>`;
    } else {
      const glass = kind === 'tower';
      const b = box(x, base, w, h, dep, glass ? pick(['#7FB8EA', '#8FD0E8', '#B7A6EE', '#F2A7C0']) : col);
      s += b.s + windows(x, base - h, w, base - 20, col, sd, glass);
      if (glass && h > 210) {
        s += `<path d="M${x + w / 2 + b.dx / 2},${base - h + b.dy / 2} v-34" stroke="#5A6478" stroke-width="3"/>`;
        s += `<circle cx="${x + w / 2 + b.dx / 2}" cy="${base - h + b.dy / 2 - 36}" r="4" fill="#F2554A"/>`;
      }
    }
    return s;
  }
  function tree(x: number, y: number, sc: number, kind: 'palm' | 'blossom' | 'tree'): string {
    let s = `<g transform="translate(${x},${y}) scale(${sc})"><ellipse cx="6" cy="2" rx="26" ry="8" fill="#1E3A1E" opacity=".28" filter="url(#soft)"/>`;
    if (kind === 'palm') {
      s += '<path d="M0 0q-4 -36 8 -70" stroke="#8E6A45" stroke-width="8" fill="none" stroke-linecap="round"/>';
      s += '<path d="M0 0q-4 -36 8 -70" stroke="#B88A5A" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="3 6"/>';
      for (const a of [-160, -120, -60, -20, 30, 200]) {
        const r = a * Math.PI / 180;
        const d = `M8 -70 q${Math.cos(r) * 22} ${Math.sin(r) * 22 - 14} ${Math.cos(r) * 42} ${Math.sin(r) * 30 + 6}`;
        s += `<path d="${d}" stroke="#2E8A3E" stroke-width="11" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#52B85A" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      }
      return s + '<circle cx="6" cy="-68" r="5" fill="#7A5230"/></g>';
    }
    const base = kind === 'blossom' ? '#F2A2C2' : pick(['#4FA845', '#5DBB4F', '#3E9A47', '#68C058']);
    s += '<rect x="-4" y="-22" width="8" height="24" rx="3" fill="#8E6A45"/>';
    s += `<circle cx="0" cy="-40" r="26" fill="${shadeCh19(base, -.25)}"/><circle cx="-12" cy="-46" r="18" fill="${base}"/>`;
    s += `<circle cx="10" cy="-50" r="19" fill="${base}"/><circle cx="0" cy="-38" r="21" fill="${base}"/>`;
    return s + `<circle cx="-8" cy="-55" r="9" fill="${shadeCh19(base, .3)}" opacity=".8"/></g>`;
  }
  function umbrella(x: number, y: number, c: string): string {
    return `<g transform="translate(${x},${y})"><ellipse cx="6" cy="2" rx="24" ry="7" fill="#000" opacity=".18"/>`
      + '<path d="M0 2V-34" stroke="#7A5230" stroke-width="3"/>'
      + `<path d="M-28 -30q28 -24 56 0z" fill="${c}" stroke="${shadeCh19(c, -.4)}" stroke-width="2"/>`
      + '<path d="M-10 -30q10 -24 20 0" fill="#fff" opacity=".85"/></g>';
  }
  function hospital(cx: number, base: number): string {
    const w = 220, x = cx - w / 2 - 15;
    let s = groundShadow(cx, base, w) + box(x, base, w, 150, 50, '#FFFFFF').s + box(x + 70, base - 150, 80, 40, 30, '#FFFFFF').s;
    s += `<rect x="${x - 4}" y="${base - 154}" width="${w + 8}" height="12" fill="#F27AA0" stroke="#B8406A" stroke-width="2"/>`;
    s += windows(x, base - 140, w, base - 34, '#9EC9F0', 3, true);
    s += `<rect x="${cx - 40}" y="${base - 40}" width="50" height="40" fill="#7FC6F0" stroke="#3C6E92" stroke-width="2.5"/>`;
    s += `<g transform="translate(${x + 110},${base - 222})"><circle r="26" fill="#fff" stroke="#B8406A" stroke-width="3"/>`;
    return s + '<path d="M-6 -17h12v11h11v12h-11v11h-12v-11h-11v-12h11z" fill="#E5363F"/></g>';
  }
  function jail(cx: number, base: number): string {
    const w = 210, x = cx - w / 2 - 15, stone = '#8D93A3';
    let s = groundShadow(cx, base, w + 40) + box(x, base, w, 120, 46, stone).s;
    for (let i = 0; i < 7; i++) s += `<rect x="${x + 6 + i * 30}" y="${base - 134}" width="18" height="16" fill="${stone}" stroke="${shadeCh19(stone, -.42)}" stroke-width="2.4"/>`;
    for (const tx of [x - 30, x + w - 10]) {
      s += box(tx, base, 52, 180, 26, shadeCh19(stone, -.06)).s;
      s += `<polygon points="${tx - 6},${base - 180} ${tx + 26},${base - 228} ${tx + 70},${base - 190}" fill="#4F5A78" stroke="#2D3348" stroke-width="2.4" stroke-linejoin="round"/>`;
      s += `<rect x="${tx + 20}" y="${base - 150}" width="12" height="20" rx="6" fill="#FFE38A" stroke="#3B3F4E" stroke-width="2"/>`;
    }
    s += `<path d="M${cx - 50},${base} v-56 a35 35 0 0 1 70 0 v56z" fill="#3B3F4E" stroke="#22252F" stroke-width="2.5"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M${cx - 39 + i * 16},${base} v-70" stroke="#A9AFBF" stroke-width="3.5"/>`;
    return s;
  }
  function ferris(cx: number, base: number): string {
    const r = 92, cy = base - r - 34;
    let s = groundShadow(cx, base, 170);
    s += `<path d="M${cx - 60},${base} L${cx},${cy} L${cx + 60},${base}" stroke="#5A6478" stroke-width="8" fill="none" stroke-linejoin="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E8EEF6" stroke-width="9"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#B04FD0" stroke-width="4"/>`;
    const cab = ['#F2554A', '#FFC93C', '#3DBA5C', '#2F7FE0', '#F0509A', '#8B4FE0'];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      s += `<path d="M${cx},${cy} L${px},${py}" stroke="#D9DEEA" stroke-width="3"/>`;
      s += `<rect x="${px - 10}" y="${py - 4}" width="20" height="16" rx="5" fill="${cab[i % 6]}" stroke="${shadeCh19(cab[i % 6], -.4)}" stroke-width="2"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="12" fill="#FFC93C" stroke="#9A6E10" stroke-width="3"/>`;
    s += box(cx + 70, base, 56, 46, 22, '#FFE08A').s;
    for (let i = 0; i < 4; i++) s += `<path d="M${cx + 70 + i * 14},${base - 46} h14 v9 a7 7 0 0 1 -14 0z" fill="${i % 2 ? '#fff' : '#F2554A'}" stroke="#9A3A30" stroke-width="1.4"/>`;
    return s;
  }
  function offices(cx: number, base: number): string {
    let s = groundShadow(cx, base, 240);
    for (const [ox, h, w, c] of [[-120, 170, 70, '#7FB8EA'], [-40, 230, 80, '#8FD0E8'], [50, 150, 70, '#B7A6EE']] as const) {
      s += box(cx + ox, base, w, h, 32, c).s + windows(cx + ox, base - h, w, base - 16, c, ox, true);
    }
    s += `<g transform="translate(${cx},${base - 250})"><rect x="-40" y="-20" width="80" height="34" rx="6" fill="#2F7FE0" stroke="#fff" stroke-width="3"/>`;
    return s + `<text y="6" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" font-family="Arial, sans-serif">${esc('JOBS')}</text></g>`;
  }
  function fountain(cx: number, cy: number): string {
    let s = `<ellipse cx="${cx}" cy="${cy + 8}" rx="132" ry="92" fill="#2B5E2A" opacity=".25" filter="url(#soft)"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="130" ry="88" fill="url(#pave)" stroke="${C.pathEdge}" stroke-width="6"/>`;
    for (let a = 0; a < 8; a++) { const r = a / 8 * Math.PI * 2; s += tree(cx + Math.cos(r) * 112, cy + Math.sin(r) * 74 + 12, .55, a % 2 ? 'blossom' : 'tree'); }
    s += `<ellipse cx="${cx}" cy="${cy + 6}" rx="70" ry="42" fill="#B9C3D4" stroke="#7D879A" stroke-width="4"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 2}" rx="60" ry="34" fill="#6CC8F0"/><ellipse cx="${cx - 18}" cy="${cy - 6}" rx="20" ry="6" fill="#fff" opacity=".5"/>`;
    s += `<rect x="${cx - 18}" y="${cy - 30}" width="36" height="30" rx="4" fill="#C9CFDB" stroke="#7D879A" stroke-width="3"/>`;
    s += `<path d="M${cx - 16},${cy - 30} q-2 -34 16 -40 q18 6 16 40z" fill="#E3E7EF" stroke="#7D879A" stroke-width="3"/>`;
    s += `<circle cx="${cx}" cy="${cy - 84}" r="20" fill="#E3E7EF" stroke="#7D879A" stroke-width="3"/>`;
    s += `<path d="M${cx - 18},${cy - 92} l2 -20 l12 12 M${cx + 18},${cy - 92} l-2 -20 l-12 12" fill="#E3E7EF" stroke="#7D879A" stroke-width="3" stroke-linejoin="round"/>`;
    return s + `<path d="M${cx - 7},${cy - 86} v3 M${cx + 7},${cy - 86} v3" stroke="#4B5468" stroke-width="3" stroke-linecap="round"/>`;
  }
}

/** Rasterises the scenery SVG to a canvas (max side clamps to GPU-safe size). */
export async function rasterizeIslandSceneryCh19(svg: string, bounds: IslandBoundsCh19, maxSide = 4096): Promise<HTMLCanvasElement> {
  const scale = Math.min(1.25, maxSide / Math.max(bounds.w, bounds.h));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('island scenery failed to load'));
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bounds.w * scale);
    canvas.height = Math.round(bounds.h * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
