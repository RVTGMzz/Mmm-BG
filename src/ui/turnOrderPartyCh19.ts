import Phaser from 'phaser';
import { gameSession } from '../core/session';
import { DICE_TOP_KEYS_CH19, DICE_TUMBLE_KEYS_CH19 } from './diceRollCh19';
import {
  fillStarCh19, partyBadgeCh19, partyBannerCh19, partyBoxCh19, partyBustKeyCh19, partyCardCh19, partyPillButtonCh19,
  partyRoundButtonCh19, partyTextCh19, PARTY_CHARACTER_COLOUR_CH19, PARTY_INK_CH19, PARTY_PLAYER_COLOURS_CH19,
} from './partyKitCh19';
import { stageRectCh19 } from './responsiveStageCh19';

/**
 * CH-19 party skin for Roll For Order. The inherited scene keeps running the
 * whole ceremony (rolls, ties, remote seats, character reveal) with its own
 * texts; this layer hides that old chrome and re-presents the same state:
 * portrait cards, a painted die tray per player, a dialog box and a big round
 * button that calls the inherited primary action.
 */

type Runtime = Phaser.Scene & {
  valueTexts: Map<number, Phaser.GameObjects.Text>;
  rankTexts: Map<number, Phaser.GameObjects.Text>;
  promptText?: Phaser.GameObjects.Text;
  detailText?: Phaser.GameObjects.Text;
  rollButton?: Phaser.GameObjects.Rectangle;
  rollButtonText?: Phaser.GameObjects.Text;
  handlePrimaryButton(): void;
};

const MINE = 'party-ch19';
const dieKey = (name: string) => `dice-ch19-${name}`;
const DICE_GLYPHS = '⚀⚁⚂⚃⚄⚅';

export function installTurnOrderPartyCh19(sceneIn: Phaser.Scene): void {
  const scene = sceneIn as Runtime;
  const mark = <T extends Phaser.GameObjects.GameObject>(o: T): T => { o.setData(MINE, true); return o; };
  const root = mark(scene.add.container(0, 0).setDepth(1500).setName('party-turn-order-ch19'));

  root.add(partyBannerCh19(scene, 640, 54, 520, 'Ai đi trước?', 0xf0524a, 34));
  root.add(partyTextCh19(scene, 640, 106, 'Mỗi người đổ 1 xúc xắc • điểm cao đi trước • hòa thì đổ lại', { size: 17, fill: '#ffffff', stroke: '#9a5a00', strokeWidth: 5, shadow: false }));

  const xs = gameSession.players.map((_, i) => 640 + (i - 1.5) * 262);
  const CARD_Y = 294, TRAY_Y = 474;
  const cards = new Map<number, Phaser.GameObjects.Container>();
  const trays = new Map<number, { die: Phaser.GameObjects.Image; q: Phaser.GameObjects.Text; rank: Phaser.GameObjects.Container; last: string; spin?: Phaser.Time.TimerEvent }>();
  let cardSig = '';

  const arrow = scene.add.graphics().setVisible(false);
  arrow.fillStyle(PARTY_INK_CH19, 1).fillTriangle(-20, -8, 20, -8, 0, 18);
  arrow.fillStyle(0xffe066, 1).fillTriangle(-13, -4, 13, -4, 0, 11);
  scene.tweens.add({ targets: arrow, y: '+=8', duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  const buildCards = (active?: number) => {
    for (const c of cards.values()) c.destroy();
    cards.clear();
    gameSession.players.forEach((player, i) => {
      const charId = gameSession.getCharacterId(player.id);
      // random picks stay face-down until the reveal has played
      const known = Boolean(charId) && (gameSession.getCharacterSelectionMode(player.id) !== 'random' || revealed);
      const c = scene.add.container(xs[i], CARD_Y);
      const colour = known && charId ? PARTY_CHARACTER_COLOUR_CH19[charId] ?? PARTY_PLAYER_COLOURS_CH19[i] : PARTY_PLAYER_COLOURS_CH19[i];
      c.add(partyCardCh19(scene, 0, 0, { w: 190, h: 232, colour, bust: known ? partyBustKeyCh19(charId) : undefined, mystery: !known }));
      c.add(partyBadgeCh19(scene, 0, 98, `${player.id + 1}P`, PARTY_PLAYER_COLOURS_CH19[i], 30));
      c.add(partyTextCh19(scene, 0, -146, player.name, { size: 24, fill: '#ffffff', strokeWidth: 6 }));
      if (active === player.id) c.setScale(1.07);
      else if (active !== undefined) c.setAlpha(0.82);
      root.addAt(c, 0);
      cards.set(player.id, c);
    });
    if (active !== undefined && xs[active] !== undefined) arrow.setPosition(xs[active], CARD_Y - 186).setVisible(true);
    else arrow.setVisible(false);
  };
  let revealed = false;
  root.add(arrow);

  gameSession.players.forEach((player, i) => {
    const tray = scene.add.graphics().setPosition(xs[i], TRAY_Y);
    tray.fillStyle(0x10143a, 0.25).fillRoundedRect(-62 + 3, -50 + 6, 124, 100, 26);
    tray.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-66, -54, 132, 108, 30);
    tray.fillStyle(0xffffff, 1).fillRoundedRect(-62, -50, 124, 100, 26);
    tray.fillStyle(0xfff4d6, 1).fillRoundedRect(-55, -43, 110, 86, 21);
    root.add(tray);
    const q = partyTextCh19(scene, xs[i], TRAY_Y, '?', { size: 44, fill: '#f0c98a', stroke: '#ffffff', strokeWidth: 4, shadow: false });
    const die = scene.add.image(xs[i], TRAY_Y, dieKey(DICE_TOP_KEYS_CH19[0])).setVisible(false);
    die.setDisplaySize(84, 84);
    const rank = scene.add.container(xs[i] + 78, CARD_Y - 104).setVisible(false).setAngle(12);
    root.add([q, die, rank]);
    trays.set(player.id, { die, q, rank, last: '' });
  });

  // dialog + action button
  root.add(partyBoxCh19(scene, 600, 636, 1000, 112, 0x2f6fd6, { radius: 30, ring: 8 }));
  const prompt = partyTextCh19(scene, 130, 616, '', { size: 30, fill: '#ffffff', strokeWidth: 7, align: 'left' });
  const detail = partyTextCh19(scene, 132, 655, '', { size: 17, fill: '#d6e8ff', strokeWidth: 4, align: 'left', shadow: false, wrap: 760 });
  root.add([prompt, detail]);
  let button: Phaser.GameObjects.Container | undefined;
  let buttonLabel = '';
  const setButton = (label: string | undefined, colour: number) => {
    if ((label ?? '') === buttonLabel) return;
    buttonLabel = label ?? '';
    button?.destroy();
    button = undefined;
    if (!label) return;
    button = partyRoundButtonCh19(scene, 1130, 616, 72, colour, label, () => scene.handlePrimaryButton(), label.length > 4 ? 26 : 38);
    scene.tweens.add({ targets: button, scale: 1.07, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    root.add(button);
  };
  for (const k of ['keydown-SPACE', 'keydown-ENTER']) scene.input.keyboard?.on(k, () => button && scene.handlePrimaryButton());

  // back button (the inherited "← QUAY LẠI" text keeps its handler)
  const oldBack = scene.children.list.find((o) => o instanceof Phaser.GameObjects.Text && o.text.trim() === '← QUAY LẠI') as Phaser.GameObjects.Text | undefined;
  if (oldBack?.input) {
    const back = partyPillButtonCh19(scene, 0, 0, 170, 52, 0x5b7fa8, '← Quay lại', () => oldBack.emit('pointerdown'), 20);
    const place = () => { const r = stageRectCh19(scene); back.setPosition(Math.max(r.x + 110, 110), Math.max(r.y + 50, 40)); };
    place();
    scene.scale.on(Phaser.Scale.Events.RESIZE, place);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off(Phaser.Scale.Events.RESIZE, place));
    root.add(back);
  }

  /* ---------------------------------------------------------------- character reveal */
  let revealLayer: Phaser.GameObjects.Container | undefined;
  const showReveal = () => {
    revealLayer = mark(scene.add.container(0, 0).setDepth(1700).setName('party-character-reveal-ch19'));
    revealLayer.add(scene.add.rectangle(640, 360, 4000, 3000, 0x1b1440, 0.62));
    revealLayer.add(partyBannerCh19(scene, 640, 110, 600, 'Nhân vật đã chốt!', 0xa056e6, 38));
    gameSession.players.forEach((player, i) => {
      const charId = gameSession.getCharacterId(player.id);
      const random = gameSession.getCharacterSelectionMode(player.id) === 'random';
      const x = xs[i];
      const holder = scene.add.container(x, 360);
      const front = partyCardCh19(scene, 0, 0, { w: 210, h: 260, colour: PARTY_CHARACTER_COLOUR_CH19[charId ?? ''] ?? 0xf5c33b, bust: partyBustKeyCh19(charId) });
      const back = partyCardCh19(scene, 0, 0, { w: 210, h: 260, colour: 0x7a6cf0, mystery: true });
      holder.add([front, back]);
      front.setVisible(!random);
      back.setVisible(random);
      holder.add(partyTextCh19(scene, 0, -160, player.name, { size: 24, fill: '#ffffff', strokeWidth: 6 }));
      const label = partyTextCh19(scene, 0, 158, random ? 'NGẪU NHIÊN' : 'ĐÃ CHỌN', { size: 22, fill: random ? '#ffe066' : '#ffffff', strokeWidth: 6 });
      holder.add(label);
      revealLayer!.add(holder);
      holder.setScale(0.6).setAlpha(0);
      scene.tweens.add({ targets: holder, scale: 1, alpha: 1, duration: 300, delay: i * 80, ease: 'Back.easeOut' });
      if (random) {
        scene.time.delayedCall(520 + i * 260, () => {
          scene.tweens.add({
            targets: holder, scaleX: 0, duration: 140, ease: 'Quad.easeIn',
            onComplete: () => {
              back.setVisible(false);
              front.setVisible(true);
              const secret = charId === 'secret-baby';
              label.setText(secret ? '✨ SECRET! ✨' : 'RA RỒI!');
              scene.tweens.add({ targets: holder, scaleX: 1, duration: 180, ease: 'Back.easeOut' });
              const burst = scene.add.graphics().setPosition(x, 360);
              burst.fillStyle(0xffffff, 0.9);
              for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                fillStarCh19(burst, Math.cos(a) * 120, Math.sin(a) * 150, secret ? 16 : 11);
              }
              revealLayer?.add(burst);
              scene.tweens.add({ targets: burst, scale: 1.4, alpha: 0, duration: 650, onComplete: () => burst.destroy() });
            },
          });
        });
      }
    });
  };

  /* ---------------------------------------------------------------- per-frame sync */
  const tick = () => {
    // old chrome stays invisible (it keeps re-styling itself every frame)
    for (const o of scene.children.list) {
      if (o.getData?.(MINE) || o.name === 'party-backdrop-ch19') continue;
      const a = o as unknown as Phaser.GameObjects.Components.Alpha;
      if (a.alpha !== 0) a.setAlpha(0);
    }
    // character reveal overlay
    const oldReveal = scene.children.getByName('character-reveal-ch02c');
    if (oldReveal && !revealLayer) showReveal();
    if (!oldReveal && revealLayer) { revealLayer.destroy(); revealLayer = undefined; revealed = true; cardSig = ''; }

    // who is rolling: the inherited highlight dims everyone else's value text
    const values = [...scene.valueTexts.entries()];
    const dims = values.filter(([, t]) => t.alpha < 0.9 && t.alpha > 0.01);
    let active: number | undefined;
    if (dims.length) active = values.find(([, t]) => t.alpha >= 0.9)?.[0];
    const sig = `${active}|${revealed}|${gameSession.players.map((p) => gameSession.getCharacterId(p.id)).join()}`;
    if (sig !== cardSig) { cardSig = sig; buildCards(active); }

    for (const [id, text] of values) {
      const tray = trays.get(id);
      if (!tray) continue;
      const v = text.text.trim();
      const rankText = scene.rankTexts.get(id)?.text ?? '';
      if (v !== tray.last) {
        tray.last = v;
        const final = /(\d)\s*$/.exec(v);
        if (final) {
          tray.spin?.remove(); tray.spin = undefined;
          tray.q.setVisible(false);
          const n = Phaser.Math.Clamp(Number(final[1]), 1, 6);
          tray.die.setVisible(true).setTexture(dieKey(DICE_TOP_KEYS_CH19[n - 1])).setAngle(0).setDisplaySize(84, 84);
          const s = tray.die.scale;
          tray.die.setScale(s * 1.5);
          scene.tweens.add({ targets: tray.die, scale: s, duration: 260, ease: 'Back.easeOut' });
        } else if (DICE_GLYPHS.includes(v.charAt(0)) || v === '🎲') {
          tray.q.setVisible(false);
          tray.die.setVisible(true);
          if (!tray.spin) {
            let f = 0;
            tray.spin = scene.time.addEvent({
              delay: 60, loop: true,
              callback: () => {
                f++;
                tray.die.setTexture(dieKey(f % 2 ? DICE_TUMBLE_KEYS_CH19[f % 4] : DICE_TOP_KEYS_CH19[f % 6])).setDisplaySize(80, 80).setAngle(f * 38);
                tray.die.y = TRAY_Y - Math.abs(Math.sin(f * 0.7)) * 26;
              },
            });
          }
        } else {
          tray.spin?.remove(); tray.spin = undefined;
          tray.die.setVisible(false).setY(TRAY_Y);
          tray.q.setVisible(true);
        }
      }
      const rankKey = `r:${rankText}`;
      if (tray.rank.getData('k') !== rankKey) {
        tray.rank.setData('k', rankKey).removeAll(true);
        const m = /(\d)/.exec(rankText);
        if (m) {
          const n = Number(m[1]);
          tray.rank.add(partyPillButtonCh19(scene, 0, 0, 104, 42, n === 1 ? 0xf5b335 : 0x3cbf6b, `Thứ ${n}`, undefined, 22));
          tray.rank.setVisible(true).setScale(0.4);
          scene.tweens.add({ targets: tray.rank, scale: 1, duration: 260, ease: 'Back.easeOut' });
        } else tray.rank.setVisible(false);
      }
    }

    prompt.setText(scene.promptText?.text ?? '');
    detail.setText((scene.detailText?.text ?? '').replace(/\s+•\s+/g, '  •  '));
    const btnVisible = Boolean(scene.rollButton?.visible && scene.rollButtonText?.visible);
    const raw = scene.rollButtonText?.text ?? '';
    if (!btnVisible) setButton(undefined, 0);
    else if (/VÀO TRẬN/.test(raw)) setButton('Vào trận!', 0x3cbf6b);
    else if (/HOST|⏳/.test(raw)) setButton('Chờ…', 0x8c95ab);
    else setButton('Đổ!', 0xf2549c);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
  // all inherited objects were created already; children added from now on by
  // the kit helpers belong to this layer, but are created via scene.add, so tag them
  for (const o of root.list) mark(o);
  tick();
}
