import Phaser from 'phaser';
import boardJson from '../content/city/board_city_final_050.json';
import { getBoardNode, validateBoardDefinition } from '../core/board';
import { rollD6 } from '../core/dice';
import {
  FINAL_MAP_PREVIEW_050,
  canReleaseFrom,
  lotteryRewardForRoll,
  previewExitRoute,
  type FinalMapHoldingLocation,
} from '../core/finalMapPreview050';
import { createRandomSource } from '../core/rng';
import { gameSession } from '../core/session';
import type { BoardDefinition, BoardNode } from '../core/types';

const BOARD = boardJson as BoardDefinition;
const WORLD_W = 1600;
const WORLD_H = 900;
const PLAYER_COLORS = [0xef4545, 0x4c8df6, 0x49b96f, 0x9c5ce6];
const PLAYER_OFFSETS = [
  { x: -12, y: -12 },
  { x: 12, y: -12 },
  { x: -12, y: 12 },
  { x: 12, y: 12 },
];

type PreviewPlayer = {
  id: number;
  name: string;
  nodeId: number;
  money: number;
  laps: number;
  holding?: FinalMapHoldingLocation;
};

type HudHandle = {
  root: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  stats: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
  border: Phaser.GameObjects.Rectangle;
};

export class FinalMapPreviewScene050 extends Phaser.Scene {
  private players: PreviewPlayer[] = [];
  private currentPlayerIndex = 0;
  private readonly tokens = new Map<number, Phaser.GameObjects.Container>();
  private readonly hud = new Map<number, HudHandle>();
  private random = Math.random;
  private rollButton?: Phaser.GameObjects.Rectangle;
  private rollText?: Phaser.GameObjects.Text;
  private diceText?: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Text;
  private busy = false;

  constructor() {
    super('FinalMapPreview050');
  }

  create(): void {
    const errors = validateBoardDefinition(BOARD);
    if (errors.length > 0) throw new Error(`Final map preview graph invalid:\n${errors.join('\n')}`);

    const seed = this.previewSeed();
    const rngState = { seed, state: seed >>> 0, calls: 0 };
    this.random = createRandomSource(rngState);
    this.players = gameSession.players.map((profile, index) => ({
      id: index,
      name: profile.name || `Player ${index + 1}`,
      nodeId: FINAL_MAP_PREVIEW_050.readyNodeId,
      money: 200,
      laps: 0,
    }));

    this.cameras.main.setBackgroundColor('#58b8d8');
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.drawWorld();
    this.drawBoard();
    this.createTokens();
    this.createHud();
    this.createControls();
    this.refreshHud();
    this.focusCurrentPlayer(false);

    this.showToast('FINAL MAP 0.1.50 PREVIEW • 44 ô + Jail/Hospital 3 ô lối ra');
  }

  private previewSeed(): number {
    const raw = new URLSearchParams(window.location.search).get('seed');
    const parsed = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : Date.now();
  }

  private drawWorld(): void {
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x56b9dc).setDepth(-50);
    this.add.ellipse(800, 455, 1450, 790, 0x8acb79, 1).setStrokeStyle(12, 0xf1d989, 0.8).setDepth(-45);
    this.add.ellipse(805, 458, 1150, 610, 0xa6d88a, 0.55).setDepth(-44);

    const blocks = [
      [705, 345, 150, 110, 0x6aa8d8], [850, 325, 120, 145, 0xe5798d], [950, 390, 140, 95, 0x8f78d5],
      [690, 490, 125, 150, 0xf0b766], [835, 500, 165, 120, 0x72bb9b], [980, 510, 105, 150, 0x5f91c9],
    ] as const;
    for (const [x, y, w, h, color] of blocks) {
      this.add.rectangle(x, y, w, h, color, 0.92).setStrokeStyle(5, 0xffffff, 0.75).setDepth(-40);
    }

    this.add.text(800, 430, 'MeMeMe', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '74px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#303454',
      strokeThickness: 11,
    }).setOrigin(0.5).setDepth(-35);
    this.add.text(800, 486, 'CUỘC SỐNG LÀ MỘT TRÒ CHƠI', {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#303454',
      backgroundColor: '#fff8e8', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(-34);

    this.addDistrictSign(310, 470, 'KHU ĐẶC BIỆT', 'Khám phá • Bất ngờ');
    this.addDistrictSign(585, 125, 'KHU GIẢI TRÍ', 'Mini Game • Drama');
    this.addDistrictSign(1110, 125, 'KHU ĐỜI SỐNG', 'Bạn bè • Tin tức');
    this.addDistrictSign(1300, 520, 'KHU MUA SẮM', 'Tiền • Thử thách');
    this.addDistrictSign(890, 790, 'KHU NGHỀ NGHIỆP', 'Job • Kiếm tiền');
  }

  private addDistrictSign(x: number, y: number, title: string, body: string): void {
    const root = this.add.container(x, y).setDepth(-20);
    const panel = this.add.rectangle(0, 0, 190, 52, 0x195b7a, 0.92).setStrokeStyle(3, 0xffffff, 0.85);
    const text = this.add.text(0, -8, title, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const sub = this.add.text(0, 11, body, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#e6f6ff',
    }).setOrigin(0.5);
    root.add([panel, text, sub]);
  }

  private drawBoard(): void {
    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const branch = edge.route === 'branch';
      const line = this.add.graphics().setDepth(0);
      line.lineStyle(branch ? 11 : 15, branch ? 0xf3a43b : 0xf8f4ec, 0.98);
      line.lineBetween(from.x, from.y, to.x, to.y);
      if (branch) {
        const accent = this.add.graphics().setDepth(1);
        accent.lineStyle(3, 0xb97316, 0.8);
        accent.lineBetween(from.x, from.y, to.x, to.y);
      }
    }

    for (const node of BOARD.nodes) this.drawNode(node);
  }

  private drawNode(node: BoardNode): void {
    const cid = node.contentId ?? '';
    const isHolding = cid === 'SPECIAL_JAIL_HOLD' || cid === 'SPECIAL_HOSPITAL_HOLD';
    const isGate = cid === 'SPECIAL_JAIL_GATE' || cid === 'SPECIAL_HOSPITAL_GATE';
    const isLottery = cid === 'SPECIAL_LOTTERY';
    const isReady = node.id === FINAL_MAP_PREVIEW_050.readyNodeId;
    const isBranch = node.id >= 100;
    const radius = isHolding ? 43 : (isReady || isGate || isLottery ? 30 : (isBranch ? 20 : 18));

    let fill = 0xf8f4ec;
    if (node.type === 'money') fill = (node.value ?? 0) >= 0 ? 0xffd34d : 0xf3a3a3;
    if (node.type === 'card') fill = 0x9b63dc;
    if (node.type === 'news') fill = 0xe85656;
    if (node.feature === 'job') fill = 0x4f8ee8;
    if (node.feature === 'minigame') fill = 0xf49f35;
    if (cid.startsWith('JAIL_') || cid === 'SPECIAL_JAIL_HOLD' || cid === 'SPECIAL_JAIL_GATE') fill = 0xf0a83c;
    if (cid.startsWith('HOSPITAL_') || cid === 'SPECIAL_HOSPITAL_HOLD' || cid === 'SPECIAL_HOSPITAL_GATE') fill = 0xf28bbb;
    if (isLottery) fill = 0xffca2f;
    if (isReady) fill = 0x3c8ff0;

    this.add.circle(node.x, node.y, radius, fill, 1)
      .setStrokeStyle(isHolding ? 6 : 4, 0x30343b, 0.95)
      .setDepth(4);

    this.add.text(node.x, node.y, this.nodeLabel(node), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: isHolding ? '18px' : (isReady || isGate || isLottery ? '15px' : '11px'),
      fontStyle: 'bold',
      color: '#20242b',
      align: 'center',
    }).setOrigin(0.5).setDepth(5);
  }

  private nodeLabel(node: BoardNode): string {
    const cid = node.contentId ?? '';
    if (cid === 'READY') return 'START';
    if (cid === 'SPECIAL_JAIL_GATE') return '🚔';
    if (cid === 'SPECIAL_JAIL_HOLD') return 'NHÀ TÙ';
    if (cid === 'SPECIAL_HOSPITAL_GATE') return '🏥';
    if (cid === 'SPECIAL_HOSPITAL_HOLD') return 'BỆNH\nVIỆN';
    if (cid === 'SPECIAL_LOTTERY') return '🎰';
    if (cid === 'JAIL_EXIT_1') return 'J1';
    if (cid === 'JAIL_EXIT_2') return 'J2';
    if (cid === 'JAIL_EXIT_3') return 'J3';
    if (cid === 'HOSPITAL_EXIT_1') return 'H1';
    if (cid === 'HOSPITAL_EXIT_2') return 'H2';
    if (cid === 'HOSPITAL_EXIT_3') return 'H3';
    if (node.feature === 'job') return '💼';
    if (node.feature === 'minigame') return '🎮';
    if (node.type === 'card') return '?';
    if (node.type === 'news') return '!';
    if (node.type === 'money') return (node.value ?? 0) >= 0 ? '$+' : '$−';
    return String(node.id + 1);
  }

  private createTokens(): void {
    for (const player of this.players) {
      const offset = PLAYER_OFFSETS[player.id] ?? { x: 0, y: 0 };
      const node = getBoardNode(BOARD, player.nodeId);
      const root = this.add.container(node.x + offset.x, node.y + offset.y).setDepth(20);
      const shadow = this.add.circle(2, 4, 15, 0x000000, 0.2);
      const body = this.add.circle(0, 0, 14, PLAYER_COLORS[player.id] ?? 0xffffff, 1).setStrokeStyle(4, 0xffffff, 1);
      const label = this.add.text(0, 0, String(player.id + 1), {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      root.add([shadow, body, label]);
      this.tokens.set(player.id, root);
    }
  }

  private createHud(): void {
    const positions = [
      { x: 165, y: 78 }, { x: 1115, y: 78 }, { x: 165, y: 642 }, { x: 1115, y: 642 },
    ];

    for (const player of this.players) {
      const pos = positions[player.id] ?? positions[0];
      const root = this.add.container(pos.x, pos.y).setScrollFactor(0).setDepth(200);
      const border = this.add.rectangle(0, 0, 290, 112, 0xfffbf3, 0.95)
        .setStrokeStyle(5, PLAYER_COLORS[player.id] ?? 0x333333, 1);
      const avatar = this.add.circle(-112, 0, 34, PLAYER_COLORS[player.id] ?? 0x777777, 1).setStrokeStyle(4, 0xffffff, 1);
      const avatarText = this.add.text(-112, 0, String(player.id + 1), {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      const name = this.add.text(-64, -31, player.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#202020',
        fixedWidth: 180,
      }).setOrigin(0, 0.5);
      const stats = this.add.text(-64, 0, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#3c3c3c',
      }).setOrigin(0, 0.5);
      const status = this.add.text(-64, 29, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#6d655b',
      }).setOrigin(0, 0.5);
      root.add([border, avatar, avatarText, name, stats, status]);
      this.hud.set(player.id, { root, name, stats, status, border });
    }
  }

  private createControls(): void {
    this.rollButton = this.add.rectangle(640, 674, 220, 50, 0xef4545, 1)
      .setStrokeStyle(4, 0xffffff, 1)
      .setScrollFactor(0)
      .setDepth(220)
      .setInteractive({ useHandCursor: true });
    this.rollText = this.add.text(640, 674, 'ĐỔ XÚC XẮC', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(221);
    this.diceText = this.add.text(640, 625, '🎲', {
      fontFamily: 'Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#202020',
      backgroundColor: '#fffaf0', padding: { x: 12, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(221);

    const overview = this.add.text(640, 28, '🗺️  TỔNG QUAN', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#202020',
      backgroundColor: '#fffaf0', padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(221).setInteractive({ useHandCursor: true });

    const back = this.add.text(640, 62, '← MENU', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#5b6370', padding: { x: 9, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(221).setInteractive({ useHandCursor: true });

    this.rollButton.on('pointerdown', () => void this.handleRoll());
    overview.on('pointerdown', () => this.showOverview());
    back.on('pointerdown', () => {
      window.location.href = window.location.pathname;
    });
  }

  private async handleRoll(): Promise<void> {
    if (this.busy) return;
    const player = this.players[this.currentPlayerIndex];
    if (!player) return;

    this.setBusy(true);
    try {
      const roll = rollD6(this.random);
      this.diceText?.setText(`🎲 ${roll}`);

      if (player.holding) {
        await this.resolveHoldingRoll(player, roll);
        this.advanceTurn();
        return;
      }

      this.showToast(`${player.name} đổ ${roll}`);
      for (let step = 0; step < roll; step += 1) {
        const from = player.nodeId;
        const to = (from + 1) % FINAL_MAP_PREVIEW_050.mainNodeCount;
        player.nodeId = to;
        if (to === FINAL_MAP_PREVIEW_050.readyNodeId) player.laps += 1;
        await this.moveTokenTo(player, to, 155);
      }

      await this.resolveLanding(player);
      this.advanceTurn();
    } finally {
      this.setBusy(false);
    }
  }

  private async resolveHoldingRoll(player: PreviewPlayer, roll: number): Promise<void> {
    const location = player.holding;
    if (!location) return;
    const success = canReleaseFrom(location, roll);
    const place = location === 'jail' ? 'ĐỒN CẢNH SÁT' : 'BỆNH VIỆN';

    if (!success) {
      this.showToast(`${place}: ${roll} chưa đúng • lượt sau thử lại`);
      return;
    }

    this.showToast(`${place}: ${roll} → THOÁT! • preview chạy qua đúng 3 ô lối ra`);
    for (const nodeId of previewExitRoute(location)) {
      player.nodeId = nodeId;
      await this.moveTokenTo(player, nodeId, 210);
    }
    player.holding = undefined;
    this.showToast('⚠️ Preview chỉ test hình học nhánh; timing sau khi thoát vẫn chưa khóa luật final.');
  }

  private async resolveLanding(player: PreviewPlayer): Promise<void> {
    const node = getBoardNode(BOARD, player.nodeId);
    const cid = node.contentId ?? '';

    if (player.nodeId === FINAL_MAP_PREVIEW_050.jailGateNodeId) {
      player.holding = 'jail';
      player.nodeId = FINAL_MAP_PREVIEW_050.jailNodeId;
      this.showToast('🚔 Dính cổng Nhà tù → vào Đồn cảnh sát');
      await this.moveTokenTo(player, player.nodeId, 430);
      return;
    }

    if (player.nodeId === FINAL_MAP_PREVIEW_050.hospitalGateNodeId) {
      player.holding = 'hospital';
      player.nodeId = FINAL_MAP_PREVIEW_050.hospitalNodeId;
      this.showToast('🏥 Dính cổng Bệnh viện → nhập viện');
      await this.moveTokenTo(player, player.nodeId, 430);
      return;
    }

    if (player.nodeId === FINAL_MAP_PREVIEW_050.lotteryNodeId) {
      const lotteryRoll = rollD6(this.random);
      const reward = lotteryRewardForRoll(lotteryRoll);
      player.money += reward;
      this.diceText?.setText(`🎰 ${lotteryRoll} × 20 = +${reward} B$`);
      this.showToast(`🎰 TRÚNG SỐ! ${lotteryRoll} × 20 = +${reward} B$`);
      return;
    }

    if (node.type === 'money') {
      const amount = node.value ?? 0;
      player.money += amount;
      this.showToast(`${amount >= 0 ? '🪙' : '💸'} ${amount >= 0 ? '+' : ''}${amount} B$`);
      return;
    }
    if (node.type === 'card') {
      this.showToast('❓ LÁ BÀI • preview vị trí ô');
      return;
    }
    if (node.type === 'news') {
      this.showToast('❗ TIN TỨC • preview vị trí ô');
      return;
    }
    if (node.feature === 'job') {
      this.showToast('💼 JOB HUB • giữ logic Job cho milestone tích hợp');
      return;
    }
    if (node.feature === 'minigame') {
      this.showToast('🎮 MINI GAME • vị trí map đã hoạt động');
      return;
    }
    if (cid === 'READY') {
      this.showToast('🏁 READY');
      return;
    }
    this.showToast(`Ô ${node.id + 1}`);
  }

  private moveTokenTo(player: PreviewPlayer, nodeId: number, duration: number): Promise<void> {
    const token = this.tokens.get(player.id);
    if (!token) return Promise.resolve();
    const node = getBoardNode(BOARD, nodeId);
    const offset = PLAYER_OFFSETS[player.id] ?? { x: 0, y: 0 };
    return new Promise((resolve) => {
      this.tweens.add({
        targets: token,
        x: node.x + offset.x,
        y: node.y + offset.y,
        duration,
        ease: 'Sine.easeInOut',
        onUpdate: () => this.cameras.main.centerOn(token.x, token.y),
        onComplete: () => resolve(),
      });
    });
  }

  private advanceTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.refreshHud();
    this.focusCurrentPlayer(true);
  }

  private refreshHud(): void {
    for (const player of this.players) {
      const ui = this.hud.get(player.id);
      if (!ui) continue;
      const active = player.id === this.currentPlayerIndex;
      ui.name.setText(`${active ? '▶ ' : ''}${player.name}`);
      ui.stats.setText(`🪙 ${player.money} B$   🏁 ${player.laps}`);
      ui.status.setText(player.holding === 'jail' ? '🚔 Đang ở Đồn cảnh sát' : player.holding === 'hospital' ? '🏥 Đang ở Bệnh viện' : 'Đang trên map');
      ui.border.setStrokeStyle(active ? 7 : 4, active ? 0xffd34d : (PLAYER_COLORS[player.id] ?? 0x333333), 1);
      ui.root.setScale(active ? 1.03 : 0.94).setAlpha(active ? 1 : 0.88);
    }
  }

  private focusCurrentPlayer(animated: boolean): void {
    const player = this.players[this.currentPlayerIndex];
    const token = player ? this.tokens.get(player.id) : undefined;
    if (!token) return;
    if (animated) this.cameras.main.pan(token.x, token.y, 360, 'Sine.easeInOut');
    else this.cameras.main.centerOn(token.x, token.y);
  }

  private showOverview(): void {
    const camera = this.cameras.main;
    camera.stopFollow();
    camera.zoomTo(0.78, 260, 'Sine.easeInOut');
    camera.pan(WORLD_W / 2, WORLD_H / 2, 260, 'Sine.easeInOut');
    this.time.delayedCall(1850, () => {
      camera.zoomTo(1, 300, 'Sine.easeInOut');
      this.focusCurrentPlayer(true);
    });
  }

  private setBusy(busy: boolean): void {
    this.busy = busy;
    if (this.rollButton) {
      if (busy) this.rollButton.disableInteractive().setFillStyle(0x9a9a9a, 1);
      else this.rollButton.setInteractive({ useHandCursor: true }).setFillStyle(0xef4545, 1);
    }
    this.rollText?.setText(busy ? 'ĐANG CHẠY...' : 'ĐỔ XÚC XẮC');
    this.refreshHud();
  }

  private showToast(message: string): void {
    this.toast?.destroy();
    const toast = this.add.text(640, 570, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#202020',
      backgroundColor: '#fff7dd', padding: { x: 16, y: 9 }, align: 'center', wordWrap: { width: 640 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(230);
    this.toast = toast;
    this.time.delayedCall(1800, () => {
      if (this.toast !== toast || !toast.active) return;
      this.tweens.add({ targets: toast, alpha: 0, duration: 240, onComplete: () => toast.destroy() });
    });
  }
}
