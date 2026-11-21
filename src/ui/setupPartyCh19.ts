import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { playCharacterVoiceCh19 } from '../audio/characterVoiceCh19';
import { browserSession } from '../core/browserSession';
import { gameSession } from '../core/session';
import { STARTER_CHARACTERS_V01 } from '../content/core/characters_starter_v01';
import {
  drawPartyBoxCh19, fillStarCh19, partyBadgeCh19, partyBannerCh19, partyBoxCh19, partyBustKeyCh19, partyCardCh19,
  partyCloudCh19, partyHintBarCh19, partyPillButtonCh19, partyRoundButtonCh19, partyTextCh19, pressDomCh19,
  veilDomCh19, PARTY_CHARACTER_COLOUR_CH19, PARTY_INK_CH19, PARTY_PLAYER_COLOURS_CH19, tintCh19,
} from './partyKitCh19';

/**
 * CH-19 party-style Setup screens drawn in Phaser over the (veiled) DOM forms
 * of SetupScene, which still own every rule: the skin only reads the DOM /
 * session state and presses the DOM buttons.
 *
 *  - Character select: roster of polka-dot portrait cards + seat cards (1P/COM)
 *  - Match info ("Thông tin ván"): players, board, laps clouds, "Chơi vậy nhé?"
 */

const PLAYER_TAG = (id: number) => `${id + 1}P`;

/** Age stays a guess for the players; each Character gets a star sign that fits its temper. */
export const ZODIAC_CH19: Record<string, string> = {
  'starter-crybaby': 'Cung Cự Giải ♋', // tender, emotional, theatrical tears
  'starter-grumpy': 'Cung Ma Kết ♑', // stern, stubborn, all business
  'starter-anxious': 'Cung Xử Nữ ♍', // overthinks and worries about every detail
  'starter-hyper': 'Cung Song Tử ♊', // restless, chatty, never sits still
  'secret-baby': 'Cung Sư Tử ♌', // wears the crown, rules the room
};

/** While a party screen is up, the old paper panel and loose header texts step aside. */
function shadeOldChrome(scene: Phaser.Scene, hide: boolean): void {
  for (const o of scene.children.list) {
    const isPanel = o.name === 'toy-town-backdrop-ch17';
    const isHeader = o instanceof Phaser.GameObjects.Text && (o.depth ?? 0) < 50;
    if (isPanel || isHeader) (o as Phaser.GameObjects.Text).setVisible(!hide);
  }
}

function seatCards(scene: Phaser.Scene, layer: Phaser.GameObjects.Container, x0: number, y: number, w: number, h: number, gap: number, activeId?: number): void {
  gameSession.players.forEach((player, i) => {
    const mode = gameSession.getCharacterSelectionMode(player.id);
    const charId = mode === 'fixed' ? gameSession.getCharacterId(player.id) : undefined;
    const x = x0 + i * (w + gap);
    const colour = charId ? PARTY_CHARACTER_COLOUR_CH19[charId] ?? PARTY_PLAYER_COLOURS_CH19[i] : PARTY_PLAYER_COLOURS_CH19[i];
    const card = partyCardCh19(scene, x, y, { w, h, colour, bust: partyBustKeyCh19(charId), mystery: !charId });
    layer.add(card);
    const cpu = browserSession.isCpuSeat(player.id);
    layer.add(partyBadgeCh19(scene, x, y + h / 2 - 4, PLAYER_TAG(player.id), PARTY_PLAYER_COLOURS_CH19[i], Math.round(w * 0.22)));
    if (cpu) layer.add(partyTextCh19(scene, x, y - h / 2 + 16, 'COM', { size: Math.round(w * 0.17), fill: '#f0524a', stroke: '#ffffff', strokeWidth: 5 }));
    layer.add(partyTextCh19(scene, x, y - h / 2 - 22, player.name, { size: 22, fill: '#ffffff', strokeWidth: 5, shadow: false }));
    if (activeId === player.id) {
      const arrow = scene.add.graphics().setPosition(x, y - h / 2 - 50);
      arrow.fillStyle(PARTY_INK_CH19, 1).fillTriangle(-17, -6, 17, -6, 0, 16);
      arrow.fillStyle(0xffe066, 1).fillTriangle(-11, -3, 11, -3, 0, 10);
      layer.add(arrow);
      scene.tweens.add({ targets: arrow, y: arrow.y + 8, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      card.setScale(1.08);
    }
  });
}

/* ================================================================== character select */

export function installCharacterSelectPartyCh19(scene: Phaser.Scene, dom: Phaser.GameObjects.DOMElement): void {
  const root = veilDomCh19(dom);
  const layer = scene.add.container(0, 0).setDepth(50).setName('party-character-select-ch19').setVisible(false);
  let sig = '';
  let focus = 0;
  const options = [...STARTER_CHARACTERS_V01.map((c) => c.id), 'random'];

  const press = (id: string) => {
    pressDomCh19(root, id === 'random' ? '[data-character-mode="random"]' : `[data-character-id="${id}"]`);
  };

  const render = () => {
    layer.removeAll(true);
    const owner = root.querySelector('#character-owner-ch02c')?.textContent ?? '';
    const ownerId = Number(/P(\d)/.exec(owner)?.[1] ?? 1) - 1;
    const selected = options.find((id) => root.querySelector(id === 'random' ? '[data-character-mode="random"]' : `[data-character-id="${id}"]`)?.classList.contains('selected'));
    if (selected) focus = options.indexOf(selected);
    const canConfirm = !(root.querySelector<HTMLButtonElement>('.character-confirm-ch02c')?.disabled ?? true);

    layer.add(partyBannerCh19(scene, 290, 70, 440, 'Chọn nhân vật', 0xf5a43a, 34));
    layer.add(partyTextCh19(scene, 290, 126, `${owner} đang chọn`, { size: 22, fill: '#ffffff', strokeWidth: 6, shadow: false }));

    // seats (top right)
    seatCards(scene, layer, 650, 178, 118, 150, 26, ownerId);

    // roster (bottom left)
    options.forEach((id, i) => {
      const x = 118 + i * 178, y = 448;
      const isRandom = id === 'random';
      const colour = isRandom ? 0x7a6cf0 : PARTY_CHARACTER_COLOUR_CH19[id];
      const char = STARTER_CHARACTERS_V01.find((c) => c.id === id);
      const isSel = selected === id;
      const card = partyCardCh19(scene, x, y + (isSel ? -14 : 0), {
        w: 164, h: 222, colour, bust: isRandom ? undefined : partyBustKeyCh19(id), mystery: isRandom,
        label: isRandom ? 'NGẪU NHIÊN' : char?.archetypeLabel,
      });
      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => { focus = i; press(id); if (!isRandom) playCharacterVoiceCh19(id, 'happy', i * 5 + 1); });
      card.on('pointerover', () => { if (!isSel) scene.tweens.add({ targets: card, y: y - 8, duration: 110 }); });
      card.on('pointerout', () => { if (!isSel) scene.tweens.add({ targets: card, y, duration: 110 }); });
      if (isSel || focus === i) {
        const glow = scene.add.graphics();
        glow.lineStyle(7, isSel ? 0xffe066 : 0xffffff, 1).strokeRoundedRect(x - 92, y + (isSel ? -14 : 0) - 121, 184, 242, 24);
        layer.add(glow);
        if (isSel) scene.tweens.add({ targets: glow, alpha: 0.35, duration: 420, yoyo: true, repeat: -1 });
      }
      layer.add(card);
      if (isSel) {
        // red seal stamp like a roster "decided" mark
        const stamp = scene.add.container(x + 54, y - 112);
        const sg = scene.add.graphics();
        sg.lineStyle(6, 0xe8322a, 0.95).strokeCircle(0, 0, 32);
        sg.lineStyle(3, 0xe8322a, 0.95).strokeCircle(0, 0, 25);
        stamp.add(sg);
        stamp.add(partyTextCh19(scene, 0, 0, 'CHỌN', { size: 15, fill: '#e8322a', stroke: '#ffffff', strokeWidth: 4, shadow: false }));
        stamp.setAngle(-14).setScale(1.6).setAlpha(0);
        scene.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
        layer.add(stamp);
      }
    });

    // info box (bottom right)
    const info = scene.add.container(1092, 448);
    const ig = scene.add.graphics();
    drawPartyBoxCh19(ig, -165, -125, 330, 250, 0xf5a43a, { radius: 22, ring: 7 });
    ig.fillStyle(0xffffff, 0.22);
    for (const [sx, sy, r] of [[-120, -70, 16], [110, -86, 12], [-130, 80, 12], [120, 72, 18], [10, 96, 9]] as const) fillStarCh19(ig, sx, sy, r);
    info.add(ig);
    const focusId = options[focus];
    const focusChar = STARTER_CHARACTERS_V01.find((c) => c.id === focusId);
    if (focusChar) {
      info.add(partyTextCh19(scene, 0, -86, focusChar.archetypeLabel, { size: 32, gradient: ['#ffffff', '#fff1c4'], stroke: '#8a3c08', strokeWidth: 7 }));
      info.add(partyTextCh19(scene, 0, -50, `${focusChar.genderPresentation === 'female' ? 'NỮ' : 'NAM'} · ${ZODIAC_CH19[focusChar.id] ?? ''}`, { size: 17, fill: '#ffffff', stroke: '#8a3c08', strokeWidth: 4, shadow: false }));
      info.add(partyTextCh19(scene, 0, -16, `Nội tại: ${focusChar.passiveConcept.label}`, { size: 21, fill: '#fff36b', stroke: '#8a3c08', strokeWidth: 5, shadow: false }));
      info.add(partyTextCh19(scene, 0, 48, focusChar.passiveConcept.designIntent.split('.')[0] + '.', { size: 16, fill: '#ffffff', stroke: '#8a3c08', strokeWidth: 4, wrap: 290, shadow: false }));
    } else {
      info.add(partyTextCh19(scene, 0, -70, 'NGẪU NHIÊN', { size: 32, gradient: ['#ffffff', '#fff1c4'], stroke: '#8a3c08', strokeWidth: 7 }));
      info.add(partyTextCh19(scene, 0, 10, 'Úp kết quả tới khi vào trận.\nCó thể có điều bất ngờ…', { size: 19, fill: '#ffffff', stroke: '#8a3c08', strokeWidth: 4, wrap: 290, shadow: false }));
    }
    layer.add(info);

    // hint bar + confirm
    const hints = partyHintBarCh19(scene, 470, 655, [
      { key: 'A', label: 'Chọn', colour: '#ff5fa2' },
      { key: 'B', label: 'Trở về', colour: '#2f9be8' },
    ]);
    layer.add(hints);
    layer.add(partyPillButtonCh19(scene, 800, 655, 190, 60, 0x5b7fa8, '← Trở về', () => pressDomCh19(root, '.character-back-ch02c'), 22));
    const confirm = partyPillButtonCh19(scene, 1092, 655, 300, 70, canConfirm ? 0xf0524a : 0xa4abbd, 'TIẾP TỤC →', () => {
      if (canConfirm) pressDomCh19(root, '.character-confirm-ch02c');
    }, 28);
    if (canConfirm) scene.tweens.add({ targets: confirm, scale: 1.05, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    layer.add(confirm);
  };

  const keys = (e: KeyboardEvent) => {
    if (!layer.visible) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      focus = (focus + (e.key === 'ArrowLeft' ? options.length - 1 : 1)) % options.length;
      sfxController.play('ui_confirm');
      sig = '';
    } else if (e.key === 'Enter' || e.key === ' ') {
      const sel = root.querySelector('.character-card-ch02c.selected');
      const focusSel = sel && (sel as HTMLElement).dataset.characterId === options[focus];
      const randSel = sel && (sel as HTMLElement).dataset.characterMode === 'random' && options[focus] === 'random';
      if (focusSel || randSel) pressDomCh19(root, '.character-confirm-ch02c');
      else press(options[focus]);
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      pressDomCh19(root, '.character-back-ch02c');
    } else return;
    e.preventDefault();
  };
  scene.input.keyboard?.on('keydown', keys);

  const tick = () => {
    const visible = dom.visible;
    if (layer.visible !== visible) { layer.setVisible(visible); shadeOldChrome(scene, visible); sig = ''; }
    if (!visible) return;
    const s = [
      root.querySelector('#character-owner-ch02c')?.textContent,
      [...root.querySelectorAll('.character-card-ch02c.selected')].map((b) => (b as HTMLElement).dataset.characterId ?? 'r').join(),
      root.querySelector<HTMLButtonElement>('.character-confirm-ch02c')?.disabled,
      focus,
      gameSession.players.map((p) => `${gameSession.getCharacterSelectionMode(p.id)}:${gameSession.getCharacterId(p.id)}`).join(),
    ].join('|');
    if (s !== sig) { sig = s; render(); }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, tick);
    scene.input.keyboard?.off('keydown', keys);
  });
}

/* ================================================================== match info */

export function installMatchInfoPartyCh19(scene: Phaser.Scene, dom: Phaser.GameObjects.DOMElement, modeLabel: string): void {
  const root = veilDomCh19(dom);
  const layer = scene.add.container(0, 0).setDepth(50).setName('party-match-info-ch19').setVisible(false);
  let sig = '';

  const render = () => {
    layer.removeAll(true);
    layer.add(partyBannerCh19(scene, 640, 70, 560, 'Thông tin ván', 0x2f6fd6, 36));
    // players
    seatCards(scene, layer, 340, 262, 150, 170, 50);

    const laps = gameSession.targetLaps;
    const label = (x: number, text: string) => layer.add(partyTextCh19(scene, x, 392, text, { size: 30, fill: '#ffffff', strokeWidth: 7 }));
    label(300, 'Bàn cờ');
    label(640, 'Số vòng');
    label(980, 'Chế độ');
    layer.add(partyPillButtonCh19(scene, 300, 458, 250, 72, 0xf59a3a, 'Đảo Thành Phố', undefined, 24));
    const lapCloud = partyPillButtonCh19(scene, 640, 458, 170, 72, 0xf58ac0, String(laps), () => {
      const next = (laps % 3) + 1;
      pressDomCh19(root, `[data-laps="${next}"]`);
    }, 40);
    layer.add(lapCloud);
    for (const dir of [-1, 1]) {
      const a = scene.add.container(640 + dir * 128, 458).setSize(44, 52);
      const ag = scene.add.graphics();
      ag.fillStyle(PARTY_INK_CH19, 1).fillTriangle(dir * 22, 0, -dir * 14, -24, -dir * 14, 24);
      ag.fillStyle(0xffffff, 1).fillTriangle(dir * 14, 0, -dir * 9, -15, -dir * 9, 15);
      a.add(ag);
      a.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        const next = Phaser.Math.Wrap(laps - 1 + dir, 0, 3) + 1;
        pressDomCh19(root, `[data-laps="${next}"]`);
      });
      scene.tweens.add({ targets: a, x: a.x + dir * 6, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      layer.add(a);
    }
    layer.add(partyPillButtonCh19(scene, 980, 458, 260, 72, 0x3f8cf0, modeLabel, undefined, modeLabel.length > 14 ? 20 : 24));
    layer.add(partyTextCh19(scene, 640, 512, laps === 1 ? 'Nhanh gọn' : laps === 2 ? 'Cân bằng' : 'Dài hơi', { size: 18, fill: '#ffffff', strokeWidth: 5, shadow: false }));

    // dialog
    const box = partyBoxCh19(scene, 640, 616, 1080, 132, 0x2f6fd6, { radius: 30, ring: 8 });
    layer.add(box);
    layer.add(partyTextCh19(scene, 150, 600, 'Chơi vậy nhé?', { size: 34, fill: '#ffffff', strokeWidth: 7, align: 'left' }));
    layer.add(partyTextCh19(scene, 152, 640, `${laps} vòng / người · thứ tự đi sẽ đổ xúc xắc quyết định`, { size: 17, fill: '#cfe4ff', strokeWidth: 4, align: 'left', shadow: false }));
    const yes = partyRoundButtonCh19(scene, 960, 610, 66, 0xf2549c, 'Có', () => pressDomCh19(root, '.rule-confirm'), 40);
    const no = partyRoundButtonCh19(scene, 1100, 616, 50, 0x5b7fa8, 'Không', () => pressDomCh19(root, '.rule-back'), 20);
    scene.tweens.add({ targets: yes, scale: 1.06, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    layer.add([yes, no]);
    // little sparkles on the dialog
    for (const [sx, sy] of [[820, 650], [1185, 560]] as const) {
      const sp = scene.add.graphics().setPosition(sx, sy);
      sp.fillStyle(0xfff6b0, 1);
      fillStarCh19(sp, 0, 0, 12);
      layer.add(sp);
      scene.tweens.add({ targets: sp, alpha: 0.2, angle: 30, duration: 700, yoyo: true, repeat: -1 });
    }
    void tintCh19;
  };

  const keys = (e: KeyboardEvent) => {
    if (!layer.visible) return;
    const laps = gameSession.targetLaps;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') pressDomCh19(root, `[data-laps="${Phaser.Math.Wrap(laps - 1 + (e.key === 'ArrowLeft' ? -1 : 1), 0, 3) + 1}"]`);
    else if (e.key === 'Enter' || e.key === ' ') pressDomCh19(root, '.rule-confirm');
    else if (e.key === 'Escape' || e.key === 'Backspace') pressDomCh19(root, '.rule-back');
    else return;
    e.preventDefault();
  };
  scene.input.keyboard?.on('keydown', keys);

  const tick = () => {
    const visible = dom.visible;
    if (layer.visible !== visible) { layer.setVisible(visible); shadeOldChrome(scene, visible); sig = ''; }
    if (!visible) return;
    const s = `${gameSession.targetLaps}|${gameSession.players.map((p) => `${p.name}:${gameSession.getCharacterSelectionMode(p.id)}:${gameSession.getCharacterId(p.id)}`).join()}`;
    if (s !== sig) { sig = s; render(); }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, tick);
    scene.input.keyboard?.off('keydown', keys);
  });
}
