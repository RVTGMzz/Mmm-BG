import Phaser from 'phaser';
import jobsJson from '../content/core/jobs_mvp.json';
import { sfxController } from '../audio/sfxController';
import type { JobDefinition } from '../core/jobs';
import type { MatchEvent, MatchState } from '../core/matchState';
import { followRevealCh19, openRevealCh19 } from './cardArtCh19';
import { PARTY_BUST_IDS_CH19, partyTextCh19, PARTY_INK_CH19, partyPillShapeCh19 } from './partyKitCh19';
import { publicAssetUrl } from './publicAssetUrl';
import { poseKeyCh19, type MoodCh19 } from './storyPanelCh19';

/**
 * CH-19 Job Centre, Police Station and Hospital as places with people in them:
 * a visual-novel style scene with the NPC in charge on the left, your Character
 * on the right, a dialog box that explains what is happening, and in the
 * middle a slot machine (job draw), job cards, a review meter (promotion /
 * demotion) or the six die faces (release roll). Presentation only: every
 * result still comes from the HOST events.
 */

const JOBS = jobsJson as JobDefinition[];
export type NpcCh19 = 'job' | 'police' | 'doctor';
const NPC_NAME: Record<NpcCh19, string> = { job: 'Chị Mai • Trung tâm việc làm', police: 'Chú Hùng • Đồn cảnh sát', doctor: 'Bác sĩ Lan • Bệnh viện' };
const NPC_COLOUR: Record<NpcCh19, number> = { job: 0xf08a2c, police: 0x3f6fd8, doctor: 0xf0524a };
const npcKey = (n: NpcCh19) => `npc-ch19-${n}`;
export const jobIconKeyCh19 = (id: string) => `job-icon-ch19-${id}`;

export function preloadJobCentreCh19(scene: Phaser.Scene): void {
  for (const n of ['job', 'police', 'doctor'] as NpcCh19[]) {
    if (!scene.textures.exists(npcKey(n))) scene.load.image(npcKey(n), publicAssetUrl(`assets/ui/ch19/npc/${n}.webp`));
  }
  for (const job of JOBS) {
    if (!scene.textures.exists(jobIconKeyCh19(job.id))) scene.load.image(jobIconKeyCh19(job.id), publicAssetUrl(`assets/ui/ch19/jobs/${job.id}.png`));
  }
}

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
const salary = (job: JobDefinition, level = 1) => job.salaryByLevel[Math.max(0, Math.min(job.salaryByLevel.length - 1, level - 1))] ?? 0;

/* ------------------------------------------------------------------ the scene */

type Scene = {
  st: Phaser.GameObjects.Container;
  content: Phaser.GameObjects.Container; // centre stage, (0, 0) is its middle
  say: (line: string) => void;
  player?: Phaser.GameObjects.Image;
};

/** NPC left, Character right, dialog box at the bottom, content in the middle. */
function npcScene(
  scene: Phaser.Scene, root: Phaser.GameObjects.Container, npc: NpcCh19,
  bust: string | undefined, mood: MoodCh19, line: string, dialogY = 238,
): Scene {
  const st = openRevealCh19(scene, root, 0.62);
  const colour = NPC_COLOUR[npc];

  // soft spotlight behind the middle
  const glow = scene.add.graphics();
  for (let i = 0; i < 6; i++) glow.fillStyle(colour, 0.05).fillCircle(0, -60, 420 - i * 55);
  st.add(glow);

  const left = scene.textures.exists(npcKey(npc)) ? scene.add.image(-470, 372, npcKey(npc)).setOrigin(0.5, 1) : undefined;
  if (left) { left.setScale(540 / left.height); st.add(left); }
  const rightKey = bust ? poseKeyCh19(bust, mood) : undefined;
  const right = rightKey && scene.textures.exists(rightKey) ? scene.add.image(480, 372, rightKey).setOrigin(0.5, 1).setFlipX(true) : undefined;
  if (right) { right.setScale(500 / right.height); st.add(right); }

  const content = scene.add.container(0, -130);
  st.add(content);

  // dialog box, speaker chip on its top-left edge
  const box = scene.add.container(0, dialogY);
  const g = scene.add.graphics();
  const BW = 760, BH = 128;
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(-BW / 2 + 6, -BH / 2 + 10, BW, BH, 22);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-BW / 2 - 6, -BH / 2 - 6, BW + 12, BH + 12, 26);
  g.fillStyle(0xfffaf0, 1).fillRoundedRect(-BW / 2, -BH / 2, BW, BH, 22);
  g.fillStyle(colour, 1).fillRoundedRect(-BW / 2, -BH / 2, 14, BH, { tl: 22, bl: 22, tr: 0, br: 0 });
  box.add(g);
  const chip = scene.add.container(-BW / 2 + 170, -BH / 2 - 4);
  const cg = scene.add.graphics();
  cg.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-160, -20, 320, 40, 20);
  cg.fillStyle(colour, 1).fillRoundedRect(-156, -16, 312, 32, 16);
  chip.add(cg);
  chip.add(partyTextCh19(scene, 0, 0, NPC_NAME[npc], { size: 17, fill: '#ffffff', strokeWidth: 3, shadow: false }));
  box.add(chip);
  const text = partyTextCh19(scene, -BW / 2 + 36, 10, '', { size: 23, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 2, align: 'left', wrap: BW - 70, shadow: false }).setOrigin(0, 0.5);
  box.add(text);
  st.add(box);

  // typewriter line
  let typing: Phaser.Time.TimerEvent | undefined;
  const say = (copy: string) => {
    typing?.remove(false);
    let n = 0;
    text.setText('');
    typing = scene.time.addEvent({
      delay: 22, repeat: copy.length - 1,
      callback: () => { n += 1; if (text.active) text.setText(copy.slice(0, n)); },
    });
  };
  say(line);

  if (left) { const x = left.x; left.setX(x - 240); scene.tweens.add({ targets: left, x, duration: 380, ease: 'Back.easeOut' }); }
  if (right) {
    const x = right.x; right.setX(x + 240); scene.tweens.add({ targets: right, x, duration: 380, delay: 80, ease: 'Back.easeOut' });
  }
  box.setAlpha(0).setY(dialogY + 30);
  scene.tweens.add({ targets: box, alpha: 1, y: dialogY, duration: 260, delay: 150 });
  content.setScale(0.7).setAlpha(0);
  scene.tweens.add({ targets: content, scale: 1, alpha: 1, duration: 340, delay: 120, ease: 'Back.easeOut' });
  return { st, content, say, player: right };
}

export function reactCh19(scene: Phaser.Scene, pose: Phaser.GameObjects.Image | undefined, mood: MoodCh19): void {
  if (!pose) return;
  if (mood === 'happy') scene.tweens.add({ targets: pose, y: pose.y - 24, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.easeOut' });
  if (mood === 'angry') scene.tweens.add({ targets: pose, x: pose.x + 8, duration: 55, yoyo: true, repeat: 7 });
}

/** A job as a card: painted icon (emoji fallback), name and pay. */
function jobCard(scene: Phaser.Scene, job: JobDefinition, w = 190, level = 1): Phaser.GameObjects.Container {
  const h = Math.round(w * 1.18);
  const c = scene.add.container(0, 0);
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.3).fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 24);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 20);
  g.fillStyle(job.risk === 'crime' ? 0x3a2f4a : 0xffe7a8, 1).fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h * 0.58, 16);
  c.add(g);
  const iconY = -h / 2 + 8 + h * 0.29;
  if (scene.textures.exists(jobIconKeyCh19(job.id))) {
    const img = scene.add.image(0, iconY, jobIconKeyCh19(job.id));
    img.setScale((h * 0.5) / Math.max(img.width, img.height));
    c.add(img);
  } else {
    c.add(scene.add.text(0, iconY, job.icon, { fontSize: `${Math.round(w * 0.36)}px` }).setOrigin(0.5));
  }
  c.add(partyTextCh19(scene, 0, h * 0.18, job.title, { size: Math.round(w * 0.11), fill: '#1f2340', stroke: '#ffffff', strokeWidth: 3, shadow: false, wrap: w - 16 }));
  c.add(partyTextCh19(scene, 0, h * 0.36, `${salary(job, level)} M$ / vòng`, { size: Math.round(w * 0.085), fill: '#2fae6a', stroke: '#ffffff', strokeWidth: 3, shadow: false }));
  return c;
}

/* ------------------------------------------------------------------ install */

type Model = { kind: string; eventSeq: number; tileType?: string; actorId?: number; actorName: string; eyebrow: string; roll?: number };
type Runtime = { presentation?: { currentModel?: Model }; match?: MatchState };

export function installJobCentreCh19(scene: Phaser.Scene, characterIdOf: (playerId: number) => string | undefined): void {
  const bustOf = (id: number | undefined) => {
    const cid = id === undefined ? undefined : characterIdOf(id);
    return cid ? PARTY_BUST_IDS_CH19[cid] : undefined;
  };
  const tick = () => {
    const runtime = scene as unknown as Runtime;
    for (const o of scene.children.list) {
      if (!(o instanceof Phaser.GameObjects.Container) || !o.active) continue;
      if (o.name !== 'job-presentation-card' && o.name !== 'job-hub-modal' && o.name !== 'presentation-landing-card-ch1713') continue;
      if (followRevealCh19(o) || o.getData('ch19-npc-skip')) continue;
      const match = runtime.match;
      if (o.name === 'job-hub-modal') {
        const player = match?.players.find((p) => p.id === match.pendingJobPlayerId);
        const offer = (match?.pendingJobOfferIds ?? []).map((id) => JOBS.find((j) => j.id === id)).filter((j): j is JobDefinition => Boolean(j));
        if (!player || offer.length !== 3) { o.setData('ch19-npc-skip', true); continue; }
        jobPicker(scene, o, offer, player.name, bustOf(player.id));
        continue;
      }
      const model = runtime.presentation?.currentModel;
      const event = model ? match?.eventLog.find((e) => e.seq === model.eventSeq) : undefined;
      if (!model || !event) { o.setData('ch19-npc-skip', true); continue; }
      const bust = bustOf(model.actorId);
      if (o.name === 'job-presentation-card') jobEvent(scene, o, event, model, bust);
      else if (event.type === 'special_release') releaseEvent(scene, o, event, model, bust);
      // other landings belong to the tile story panel
      else o.setData('ch19-npc-skip', true);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
}

/* ------------------------------------------------------------------ job centre */

function offerRow(scene: Phaser.Scene, content: Phaser.GameObjects.Container, offer: JobDefinition[], y = 0): Phaser.GameObjects.Container[] {
  return offer.map((job, i) => {
    const card = jobCard(scene, job, 170).setPosition((i - 1) * 200, y);
    content.add(card);
    card.setScale(0).setAngle((i - 1) * 4);
    scene.tweens.add({ targets: card, scale: 1, duration: 300, delay: 200 + i * 120, ease: 'Back.easeOut' });
    return card;
  });
}

/** The human's own turn: the three jobs and a big lever button (the old roll button stays the hit area). */
function jobPicker(scene: Phaser.Scene, root: Phaser.GameObjects.Container, offer: JobDefinition[], name: string, bust: string | undefined): void {
  // the old job cards open detail pop-ups; only the roll button stays live
  for (const o of root.list) {
    const r = o as Phaser.GameObjects.GameObject & { y?: number };
    if (o.input?.enabled && !(o instanceof Phaser.GameObjects.Rectangle && Math.abs((r.y ?? 0) - 223) < 2) && !(o instanceof Phaser.GameObjects.Rectangle && (o as Phaser.GameObjects.Rectangle).width >= 1280)) o.disableInteractive();
  }
  const s = npcScene(scene, root, 'job', bust, 'neutral', `Chào ${name}! Hôm nay trung tâm có 3 việc. Kéo cần máy quay, máy dừng ở việc nào thì bạn nhận việc đó nhé!`, 100);
  s.content.setY(-150);
  offerRow(scene, s.content, offer);
  const btn = scene.add.container(0, 223);
  btn.add(partyPillShapeCh19(scene, 380, 74, 0xf2549c));
  btn.add(partyTextCh19(scene, 0, 0, '🎰  KÉO CẦN QUAY!', { size: 28, fill: '#ffffff', strokeWidth: 6 }));
  s.st.add(btn);
  scene.tweens.add({ targets: btn, scale: { from: 1, to: 1.06 }, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function lastOffer(match: MatchState | undefined, beforeSeq: number): JobDefinition[] {
  const offerEvent = [...(match?.eventLog ?? [])].reverse().find((e) => e.type === 'job_offer' && e.seq < beforeSeq);
  return String(offerEvent?.data.optionIds ?? '').split(',').map((id) => JOBS.find((j) => j.id === id)).filter((j): j is JobDefinition => Boolean(j));
}

function jobEvent(scene: Phaser.Scene, root: Phaser.GameObjects.Container, event: MatchEvent, model: Model, bust: string | undefined): void {
  const name = model.actorName;
  const runtime = scene as unknown as Runtime;
  if (event.type === 'job_offer') {
    const offer = String(event.data.optionIds ?? '').split(',').map((id) => JOBS.find((j) => j.id === id)).filter((j): j is JobDefinition => Boolean(j));
    const s = npcScene(scene, root, 'job', bust, 'neutral', `Chào ${name}! Trung tâm đang có 3 việc. Máy quay sẽ chọn giúp bạn 1 việc trong số này.`);
    offerRow(scene, s.content, offer, 10);
    return;
  }
  const job = JOBS.find((j) => j.id === String(event.data.jobId ?? ''));
  if (!job) { root.setData('ch19-npc-skip', true); return; }
  if (event.type === 'job_selected') {
    const s = npcScene(scene, root, 'job', bust, 'happy', `Chúc mừng ${name}! Từ giờ bạn là ${job.title}. Mỗi lần đi qua cổng xuất phát, bạn nhận ${salary(job)} M$ tiền lương.`);
    const card = jobCard(scene, job, 230).setY(10);
    s.content.add(card);
    const stamp = partyTextCh19(scene, 120, -110, 'NHẬN VIỆC!', { size: 34, fill: '#ffe066', strokeWidth: 8 }).setAngle(12);
    s.content.add(stamp);
    stamp.setScale(2.2).setAlpha(0);
    scene.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 240, delay: 600, ease: 'Quad.easeIn', onComplete: () => sfxController.play('coin_gain') });
    reactCh19(scene, s.player, 'happy');
    void runtime;
    return;
  }
  if (event.type === 'job_progress') {
    const outcome = String(event.data.outcome ?? 'kept');
    const level = Number(event.data.level ?? 1), prev = Number(event.data.previousLevel ?? 1);
    const good = outcome === 'promoted';
    const bad = outcome === 'demoted' || outcome === 'fired' || outcome === 'jailed';
    const mood: MoodCh19 = good ? 'happy' : bad ? 'angry' : 'neutral';
    const lines: Record<string, string> = {
      promoted: `Sếp khen ${name} làm tốt! ${job.title} lên Lv.${level}, lương ${salary(job, prev)} → ${salary(job, level)} M$ mỗi vòng.`,
      demoted: `Tháng này hơi đuối... ${job.title} tụt về Lv.${level}, lương còn ${salary(job, level)} M$ mỗi vòng.`,
      fired: `Rất tiếc, ${name} bị cho nghỉ việc ${job.title}. Lần sau ghé trung tâm để nhận việc mới nhé.`,
      jailed: `Bị tóm rồi! Làm ${job.title} thì sớm muộn cũng phải gặp chú cảnh sát thôi...`,
    };
    const s = npcScene(scene, root, outcome === 'jailed' ? 'police' : 'job', bust, mood,
      lines[outcome] ?? `Xét duyệt xong: ${name} giữ nguyên ${job.title} Lv.${level}. Cứ làm đều tay nhé!`);
    reviewMeter(scene, s.content, job, outcome, model.eventSeq);
    scene.time.delayedCall(1900, () => reactCh19(scene, s.player, mood));
  }
}

/**
 * Promotion review as a meter everybody can read: green = promotion chance,
 * grey = stay, red = demotion chance. The needle sweeps and stops in the
 * zone of what the HOST decided.
 */
function reviewMeter(scene: Phaser.Scene, content: Phaser.GameObjects.Container, job: JobDefinition, outcome: string, seq: number): void {
  const W = 560, H = 64;
  const up = Math.max(0, Math.min(1, job.promotionChance ?? 0));
  const down = Math.max(0, Math.min(1, job.demotionChance ?? 0));
  const g = scene.add.graphics();
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-W / 2 - 6, -H / 2 - 6, W + 12, H + 12, 20);
  g.fillStyle(0xdfe3ee, 1).fillRect(-W / 2, -H / 2, W, H);
  g.fillStyle(0x2fae6a, 1).fillRect(-W / 2, -H / 2, W * up, H);
  g.fillStyle(0xf0524a, 1).fillRect(W / 2 - W * down, -H / 2, W * down, H);
  content.add(g);
  content.add(partyTextCh19(scene, -W / 2 + (W * up) / 2, 0, `⬆ ${Math.round(up * 100)}%`, { size: 20, fill: '#ffffff', strokeWidth: 4, shadow: false }));
  content.add(partyTextCh19(scene, 0 + (up - down) * W / 2, 0, 'GIỮ NGUYÊN', { size: 18, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 3, shadow: false }));
  content.add(partyTextCh19(scene, W / 2 - (W * down) / 2, 0, `⬇ ${Math.round(down * 100)}%`, { size: 20, fill: '#ffffff', strokeWidth: 4, shadow: false }));
  content.add(partyTextCh19(scene, 0, -H / 2 - 56, `XÉT DUYỆT ${job.icon} ${job.title.toUpperCase()}`, { size: 26, fill: '#ffffff', strokeWidth: 6 }));
  content.add(partyTextCh19(scene, 0, H / 2 + 34, 'Kim dừng ở vùng xanh: thăng cấp • vùng đỏ: tụt cấp', { size: 17, fill: '#cfe4ff', strokeWidth: 4, shadow: false }));
  // where the needle ends, inside the right zone (position inside the zone is cosmetic)
  const j = ((seq * 2654435761) >>> 0) % 1000 / 1000;
  const zone = outcome === 'promoted' ? [0, up] : outcome === 'demoted' || outcome === 'fired' || outcome === 'jailed' ? [1 - down, 1] : [up, 1 - down];
  const target = -W / 2 + W * (zone[0] + (zone[1] - zone[0]) * (0.2 + 0.6 * j));
  const needle = scene.add.container(-W / 2, 0);
  const ng = scene.add.graphics();
  ng.fillStyle(PARTY_INK_CH19, 1).fillTriangle(-14, -H / 2 - 22, 14, -H / 2 - 22, 0, -H / 2 + 6).fillRect(-3, -H / 2, 6, H + 10);
  ng.fillStyle(0xffe066, 1).fillTriangle(-9, -H / 2 - 18, 9, -H / 2 - 18, 0, -H / 2 + 1);
  needle.add(ng);
  content.add(needle);
  scene.tweens.add({ targets: needle, x: W / 2, duration: 260, yoyo: true, repeat: 2, delay: 300, ease: 'Sine.easeInOut',
    onComplete: () => scene.tweens.add({ targets: needle, x: target, duration: 700, ease: 'Back.easeOut', onComplete: () => sfxController.play(outcome === 'promoted' ? 'coin_gain' : 'land') }) });
}

/* ------------------------------------------------------------------ slot machine */

/** The job draw as a slot machine spinning through the three offered jobs. */
export function playJobSlotCh19(
  scene: Phaser.Scene, container: Phaser.GameObjects.Container, model: Model, bust: string | undefined, onDone: () => void,
): boolean {
  const runtime = scene as unknown as Runtime;
  const offer = lastOffer(runtime.match, model.eventSeq);
  const rollEvent = runtime.match?.eventLog.find((e) => e.seq === model.eventSeq);
  const landed = Number(rollEvent?.data.offerIndex ?? -1);
  if (offer.length !== 3 || landed < 0) return false;
  const s = npcScene(scene, container, 'job', bust, 'neutral', 'Quay nào... quay nào...!');
  const c = s.content;
  // the machine
  const g = scene.add.graphics();
  g.fillStyle(0x10143a, 0.35).fillRoundedRect(-226, -166, 460, 340, 40);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-236, -176, 472, 340, 42);
  g.fillStyle(0xf0524a, 1).fillRoundedRect(-230, -170, 460, 328, 38);
  g.fillStyle(0xff8a7a, 1).fillRoundedRect(-216, -160, 432, 70, 26);
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-170, -76, 340, 214, 20);
  g.fillStyle(0xffffff, 1).fillRoundedRect(-162, -68, 324, 198, 16);
  // lever
  g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(236, -40, 30, 120, 10);
  c.add(g);
  const lever = scene.add.container(266, -40);
  const lg = scene.add.graphics();
  lg.fillStyle(PARTY_INK_CH19, 1).fillRect(-5, -110, 10, 110).fillCircle(0, -116, 24);
  lg.fillStyle(0xffe066, 1).fillCircle(0, -116, 19);
  lever.add(lg);
  c.add(lever);
  c.add(partyTextCh19(scene, 0, -125, '🎰 MÁY CHỌN NGHỀ', { size: 26, fill: '#ffe066', strokeWidth: 6 }));
  // blinking bulbs
  const bulbs = scene.add.graphics();
  c.add(bulbs);
  let blink = 0;
  const bulbTimer = scene.time.addEvent({ delay: 120, loop: true, callback: () => {
    blink++; bulbs.clear();
    for (let i = 0; i < 14; i++) {
      const on = (i + blink) % 2 === 0;
      bulbs.fillStyle(on ? 0xffe066 : 0xffffff, on ? 1 : 0.5).fillCircle(-210 + i * 32.3, 150, 7);
    }
  } });
  // reel window: one job at a time, cycling fast then slowing to the HOST's pick
  const reel = scene.add.container(0, 30);
  c.add(reel);
  const show = (i: number) => {
    reel.removeAll(true);
    const job = offer[i]!;
    if (scene.textures.exists(jobIconKeyCh19(job.id))) {
      const img = scene.add.image(0, -18, jobIconKeyCh19(job.id));
      img.setScale(130 / Math.max(img.width, img.height));
      reel.add(img);
    } else reel.add(scene.add.text(0, -18, job.icon, { fontSize: '96px' }).setOrigin(0.5));
    reel.add(partyTextCh19(scene, 0, 72, job.title, { size: 24, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 3, shadow: false }));
    reel.setY(10);
    scene.tweens.add({ targets: reel, y: 30, duration: 70 });
  };
  scene.tweens.add({ targets: lever, angle: 180, duration: 220, yoyo: true, ease: 'Quad.easeIn' });
  // 18 flips with growing gaps, ending on the landed job
  const steps = 18;
  const startIndex = (landed + 3 - (steps % 3)) % 3;
  let t = 0;
  for (let k = 0; k <= steps; k++) {
    const idx = (startIndex + k) % 3;
    t += 60 + k * k * 1.6;
    scene.time.delayedCall(t, () => {
      if (!reel.active) return;
      show(idx);
      sfxController.play(k === steps ? 'coin_gain' : 'step');
      if (k === steps) {
        bulbTimer.remove(false);
        scene.cameras.getCamera('canonical-ui-0561')?.flash(220, 255, 240, 160);
        scene.tweens.add({ targets: reel, scale: { from: 1.3, to: 1 }, duration: 320, ease: 'Back.easeOut' });
        s.say(`Ra rồi! Máy chọn ${offer[landed]!.title} cho ${model.actorName}!`);
        reactCh19(scene, s.player, 'happy');
        scene.time.delayedCall(1700, onDone);
      }
    });
  }
  return true;
}

/* ------------------------------------------------------------------ police / hospital */

function releaseEvent(scene: Phaser.Scene, root: Phaser.GameObjects.Container, event: MatchEvent, model: Model, bust: string | undefined): void {
  const jail = String(event.data.location) !== 'hospital';
  const success = event.data.success === true;
  const roll = Number(event.data.result ?? 1);
  const faces = String(event.data.releaseFaces ?? '').split(',').map(Number).filter((n) => n >= 1 && n <= 6);
  const trait = String(event.data.traitName ?? '');
  const name = model.actorName;
  const line = success
    ? jail
      ? `Đổ ra ${roll}, đúng số được thả! ${name} về đi, lần sau đi đứng cẩn thận nhé.`
      : `Đổ ra ${roll}! Khỏe hẳn rồi, ${name} được xuất viện. Ra ngoài nhớ giữ sức khỏe nha.`
    : jail
      ? `Đổ ra ${roll}... chưa trúng số được thả (${faces.join(', ')}). ${name} ở lại Đồn thêm một lượt nhé!`
      : `Đổ ra ${roll}... chưa trúng số xuất viện (${faces.join(', ')}). ${name} nằm nghỉ thêm một lượt nha.`;
  const s = npcScene(scene, root, jail ? 'police' : 'doctor', bust, success ? 'happy' : 'angry', line);
  const c = s.content;
  c.setY(-80); // clear of the hold banner at the top
  c.add(partyTextCh19(scene, 0, -112, jail ? '🚓 XIN RA ĐỒN' : '🏥 XIN XUẤT VIỆN', { size: 28, fill: '#ffffff', strokeWidth: 6 }));
  c.add(partyTextCh19(scene, 0, -72, `Số được ra: ${faces.join(' • ')}${trait ? `  (${trait})` : ''}`, { size: 19, fill: '#cfe4ff', strokeWidth: 4, shadow: false }));
  for (let f = 1; f <= 6; f++) {
    const x = (f - 3.5) * 92;
    const ok = faces.includes(f);
    const die = scene.add.container(x, 20);
    const g = scene.add.graphics();
    g.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-38, -38, 76, 76, 16);
    g.fillStyle(ok ? 0x6fe0a0 : 0xffffff, 1).fillRoundedRect(-33, -33, 66, 66, 12);
    g.fillStyle(PARTY_INK_CH19, 1);
    const pip: Record<number, Array<[number, number]>> = {
      1: [[0, 0]], 2: [[-14, -14], [14, 14]], 3: [[-14, -14], [0, 0], [14, 14]], 4: [[-14, -14], [14, -14], [-14, 14], [14, 14]],
      5: [[-14, -14], [14, -14], [0, 0], [-14, 14], [14, 14]], 6: [[-14, -15], [14, -15], [-14, 0], [14, 0], [-14, 15], [14, 15]],
    };
    for (const [px, py] of pip[f]!) g.fillCircle(px, py, 6);
    die.add(g);
    c.add(die);
    if (f === roll) {
      const ring = scene.add.graphics();
      ring.lineStyle(7, success ? 0xffe066 : 0xf0524a, 1).strokeRoundedRect(-48, -48, 96, 96, 22);
      die.add(ring);
      die.setScale(0.6);
      scene.tweens.add({ targets: die, scale: 1.18, duration: 360, delay: 650, ease: 'Back.easeOut', onComplete: () => sfxController.play(success ? 'coin_gain' : 'land') });
    }
  }
  c.add(partyTextCh19(scene, 0, 92, success ? '✅ ĐƯỢC RA!' : '⛔ Ở LẠI 1 LƯỢT', { size: 30, fill: success ? '#7dff9a' : '#ff8a8a', strokeWidth: 6 }));
  scene.time.delayedCall(1000, () => reactCh19(scene, s.player, success ? 'happy' : 'angry'));
  void hex;
}
