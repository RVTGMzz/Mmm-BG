import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import {
  partyBannerCh19, partyBoxCh19, partyBustKeyCh19, partyCardCh19, partyPillButtonCh19, partyRoundButtonCh19,
  partyTextCh19, PARTY_CHARACTER_COLOUR_CH19, PARTY_INK_CH19, PARTY_PLAYER_COLOURS_CH19, fillStarCh19,
} from './partyKitCh19';
import { stageRectCh19 } from './responsiveStageCh19';

/**
 * CH-19 turn spotlight. When a turn starts, the player whose turn it is gets
 * a big portrait in the corner and (when this screen controls them) a menu:
 * roll, use a card, see the ranking, leave the match. The other players'
 * corner cards step aside until the turn is under way.
 *
 * Presentation only: actions call back into the inherited handlers.
 */

export type SpotlightPlayerCh19 = {
  id: number;
  name: string;
  money: number;
  handCount: number;
  handLimit: number;
  lockTurns: number;
  laps: number;
  characterId?: string;
  jobLine: string;
  isCpu: boolean;
};

export type SpotlightHooksCh19 = {
  players(): SpotlightPlayerCh19[];
  roll(): void;
  useCard(): void;
  leave(): void;
};

export type SpotlightStateCh19 = {
  show: boolean;
  playerId?: number;
  canAct: boolean;
  canUseCard: boolean;
};

const DEPTH = 905;

export class TurnSpotlightCh19 {
  private root?: Phaser.GameObjects.Container;
  private sig = '';
  private shown = false;
  private overlay?: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene, private readonly hooks: SpotlightHooksCh19) {}

  get visible(): boolean {
    return this.shown;
  }

  get overlayOpen(): boolean {
    return Boolean(this.overlay?.active);
  }

  update(state: SpotlightStateCh19): void {
    const r = stageRectCh19(this.scene);
    const player = state.show ? this.hooks.players().find((p) => p.id === state.playerId) : undefined;
    if (!player) {
      if (this.shown) this.hide();
      return;
    }
    const sig = [player.id, player.money, player.handCount, player.lockTurns, player.laps, player.characterId, player.jobLine, state.canAct, state.canUseCard, r.w, r.h].join('|');
    if (this.shown && sig === this.sig) return;
    const animate = !this.shown || this.root?.getData('pid') !== player.id;
    this.sig = sig;
    this.shown = true;
    this.root?.destroy(true);
    this.root = this.build(player, state, animate);
  }

  hide(): void {
    this.shown = false;
    this.sig = '';
    const root = this.root;
    this.root = undefined;
    if (!root) return;
    this.scene.tweens.add({ targets: root, alpha: 0, duration: 180, onComplete: () => root.destroy(true) });
  }

  destroy(): void {
    this.root?.destroy(true);
    this.overlay?.destroy(true);
  }

  /* -------------------------------------------------------------- spotlight */

  private build(p: SpotlightPlayerCh19, state: SpotlightStateCh19, animate: boolean): Phaser.GameObjects.Container {
    const s = this.scene;
    const r = stageRectCh19(s);
    const L = r.x, R = r.x + r.w, T = r.y, B = r.y + r.h;
    const root = s.add.container(0, 0).setDepth(DEPTH).setName('turn-spotlight-ch19').setData('pid', p.id);
    const colour = PARTY_PLAYER_COLOURS_CH19[p.id] ?? 0xf0524a;

    // headline
    const head = s.add.container(640, T + 58);
    head.add(partyBannerCh19(s, 0, 0, 470, `Lượt của ${p.name}!`, colour, 30));
    root.add(head);

    // big portrait
    const face = s.add.container(L + 140, B - 168);
    const charColour = PARTY_CHARACTER_COLOUR_CH19[p.characterId ?? ''] ?? colour;
    face.add(partyCardCh19(s, 0, 0, { w: 236, h: 290, colour: charColour, bust: partyBustKeyCh19(p.characterId), mystery: !partyBustKeyCh19(p.characterId) }));
    face.add(partyTextCh19(s, 0, 128, `${p.id + 1}P`, { size: 30, fill: '#ffffff', stroke: `#${colour.toString(16).padStart(6, '0')}`, strokeWidth: 8 }));
    root.add(face);

    // info box
    const info = s.add.container(L + 420, B - 74);
    info.add(partyBoxCh19(s, 0, 0, 300, 118, 0xfff6e0, { radius: 24, ring: 6, gloss: false, fillBottom: 0xffe7b8 }));
    info.add(partyTextCh19(s, -128, -32, p.name, { size: 26, fill: `#${colour.toString(16).padStart(6, '0')}`, stroke: '#ffffff', strokeWidth: 6, align: 'left' }));
    const icon = (key: string, x: number) => {
      if (!s.textures.exists(`ui-kit-ch19-${key}`)) return;
      const img = s.add.image(x, 6, `ui-kit-ch19-${key}`);
      img.setScale(32 / Math.max(img.width, img.height));
      info.add(img);
    };
    icon('icon-coin', -116);
    info.add(partyTextCh19(s, -96, 6, `${p.money}`, { size: 26, fill: '#3b2b27', stroke: '#ffffff', strokeWidth: 5, align: 'left', shadow: false }));
    icon('icon-card', 6);
    info.add(partyTextCh19(s, 26, 6, p.lockTurns > 0 ? `khóa ${p.lockTurns}` : `${p.handCount}/${p.handLimit}`, { size: 22, fill: '#3b2b27', stroke: '#ffffff', strokeWidth: 4, align: 'left', shadow: false }));
    info.add(partyTextCh19(s, 132, 6, `Vòng ${p.laps}`, { size: 18, fill: '#7a5a48', stroke: '#ffffff', strokeWidth: 4, align: 'right', shadow: false }));
    info.add(partyTextCh19(s, -128, 38, p.jobLine, { size: 15, fill: '#7a5a48', stroke: '#ffffff', strokeWidth: 3, align: 'left', shadow: false }));
    root.add(info);

    // menu
    if (state.canAct) {
      const menu = s.add.container(0, 0);
      const pill = (y: number, c: number, label: string, icon: string | undefined, onClick: () => void, enabled = true) => {
        const b = partyPillButtonCh19(s, R - 352, y, 210, 58, enabled ? c : 0xa4abbd, label, () => { if (enabled) { sfxController.play('ui_confirm'); onClick(); } }, 22);
        const key = icon ? `ui-kit-ch19-${icon}` : '';
        if (key && s.textures.exists(key)) {
          const img = s.add.image(-72, -3, key);
          img.setScale(40 / Math.max(img.width, img.height)).setAngle(-8);
          b.add(img);
          (b.getByName('label') as Phaser.GameObjects.Text | null)?.setX(16);
        }
        menu.add(b);
        return b;
      };
      pill(B - 212, 0x7a5cf0, 'Thẻ bài', 'icon-card', () => this.hooks.useCard(), state.canUseCard);
      pill(B - 142, 0xf5a43a, 'Xếp hạng', 'icon-crown', () => this.openRanking());
      pill(B - 72, 0x5b7fa8, 'Thoát', undefined, () => this.openLeave());
      const roll = partyRoundButtonCh19(s, R - 128, B - 132, 92, 0xf2549c, 'Đổ!', () => { sfxController.play('ui_confirm'); this.hooks.roll(); }, 44);
      const die = s.textures.exists('dice-ch19-dice-top-5') ? s.add.image(0, -36, 'dice-ch19-dice-top-5') : undefined;
      if (die) {
        die.setScale(64 / Math.max(die.width, die.height));
        roll.addAt(die, 1);
        (roll.getByName('label') as Phaser.GameObjects.Text | null)?.setY(34).setFontSize(34);
        s.tweens.add({ targets: die, angle: { from: -10, to: 10 }, y: -42, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      s.tweens.add({ targets: roll, scale: 1.06, duration: 560, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      menu.add(roll);
      menu.add(partyTextCh19(s, R - 128, B - 20, 'Space · chạm', { size: 14, fill: '#ffffff', strokeWidth: 4, shadow: false }));
      root.add(menu);
      if (animate) {
        menu.setX(260).setAlpha(0);
        s.tweens.add({ targets: menu, x: 0, alpha: 1, duration: 320, delay: 120, ease: 'Back.easeOut' });
      }
    }

    if (animate) {
      face.setX(face.x - 300).setAngle(-8);
      s.tweens.add({ targets: face, x: L + 140, angle: 0, duration: 380, ease: 'Back.easeOut' });
      info.setAlpha(0).setY(info.y + 40);
      s.tweens.add({ targets: info, alpha: 1, y: B - 74, duration: 300, delay: 140, ease: 'Cubic.easeOut' });
      head.setScale(0.4).setAlpha(0);
      s.tweens.add({ targets: head, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeOut' });
      const sparkle = s.add.graphics().setPosition(L + 140, B - 168);
      sparkle.fillStyle(0xffffff, 0.95);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        fillStarCh19(sparkle, Math.cos(a) * 150, Math.sin(a) * 170, 12);
      }
      root.add(sparkle);
      s.tweens.add({ targets: sparkle, scale: 1.3, alpha: 0, angle: 20, duration: 700, onComplete: () => sparkle.destroy() });
    }
    return root;
  }

  /* -------------------------------------------------------------- overlays */

  private modal(title: string, colour: number, w: number, h: number): { box: Phaser.GameObjects.Container; close: () => void } {
    const s = this.scene;
    this.overlay?.destroy(true);
    const ov = s.add.container(0, 0).setDepth(1990).setName('turn-spotlight-overlay-ch19');
    const dim = s.add.rectangle(640, 360, 4000, 3000, 0x14103a, 0.6).setInteractive();
    ov.add(dim);
    const box = s.add.container(640, 360);
    box.add(partyBoxCh19(s, 0, 0, w, h, 0xfff6e0, { radius: 30, ring: 8, gloss: false, fillBottom: 0xffeac4 }));
    box.add(partyBannerCh19(s, 0, -h / 2, Math.min(w - 80, 460), title, colour, 30));
    ov.add(box);
    box.setScale(0.7).setAlpha(0);
    s.tweens.add({ targets: box, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    const close = () => {
      if (this.overlay !== ov) return;
      this.overlay = undefined;
      s.tweens.add({ targets: ov, alpha: 0, duration: 160, onComplete: () => ov.destroy(true) });
    };
    dim.on('pointerdown', close);
    this.overlay = ov;
    return { box, close };
  }

  openRanking(): void {
    const s = this.scene;
    const players = [...this.hooks.players()].sort((a, b) => b.money - a.money || b.laps - a.laps);
    const { box, close } = this.modal('🏆 Bảng xếp hạng', 0xf5a43a, 720, 470);
    const medal = [0xf5c33b, 0xc9d3e0, 0xe0965a, 0x9aa3b5];
    players.forEach((p, i) => {
      const y = -150 + i * 92;
      const row = s.add.container(0, y);
      const g = s.add.graphics();
      g.fillStyle(i === 0 ? 0xfff0b3 : 0xffffff, 1).fillRoundedRect(-320, -38, 640, 76, 22);
      g.lineStyle(3, PARTY_INK_CH19, 0.25).strokeRoundedRect(-320, -38, 640, 76, 22);
      g.fillStyle(PARTY_INK_CH19, 1).fillCircle(-282, 0, 26);
      g.fillStyle(medal[i] ?? 0x9aa3b5, 1).fillCircle(-282, 0, 22);
      row.add(g);
      row.add(partyTextCh19(s, -282, 1, `${i + 1}`, { size: 24, fill: '#ffffff', strokeWidth: 5 }));
      row.add(partyCardCh19(s, -210, 0, { w: 58, h: 72, colour: PARTY_CHARACTER_COLOUR_CH19[p.characterId ?? ''] ?? PARTY_PLAYER_COLOURS_CH19[p.id], bust: partyBustKeyCh19(p.characterId), mystery: !partyBustKeyCh19(p.characterId) }));
      row.add(partyTextCh19(s, -164, -12, p.name, { size: 24, fill: `#${(PARTY_PLAYER_COLOURS_CH19[p.id] ?? 0x333333).toString(16).padStart(6, '0')}`, stroke: '#ffffff', strokeWidth: 5, align: 'left' }));
      row.add(partyTextCh19(s, -164, 18, p.jobLine, { size: 14, fill: '#7a5a48', stroke: '#ffffff', strokeWidth: 3, align: 'left', shadow: false }));
      row.add(partyTextCh19(s, 296, -2, `${p.money} B$  ·  vòng ${p.laps}`, { size: 24, fill: '#3b2b27', stroke: '#ffffff', strokeWidth: 5, align: 'right', shadow: false }));
      box.add(row);
      row.setAlpha(0).setX(-40);
      s.tweens.add({ targets: row, alpha: 1, x: 0, duration: 240, delay: 120 + i * 70, ease: 'Cubic.easeOut' });
    });
    box.add(partyPillButtonCh19(s, 0, 206, 200, 56, 0x3cbf6b, 'Đóng', close, 24));
  }

  openLeave(): void {
    const s = this.scene;
    const { box, close } = this.modal('Thoát trận?', 0x5b7fa8, 600, 280);
    box.add(partyTextCh19(s, 0, -24, 'Ván đang chơi sẽ kết thúc và quay về màn hình chính.', { size: 21, fill: '#3b2b27', stroke: '#ffffff', strokeWidth: 4, wrap: 500, shadow: false }));
    box.add(partyRoundButtonCh19(s, -90, 70, 52, 0xf2549c, 'Có', () => { close(); this.hooks.leave(); }, 32));
    box.add(partyRoundButtonCh19(s, 90, 70, 52, 0x5b7fa8, 'Không', close, 22));
  }
}
