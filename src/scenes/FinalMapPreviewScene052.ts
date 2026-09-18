import Phaser from 'phaser';
import boardJson from '../content/city/board_city_final_051.json';
import { getBoardNode, getOutgoingEdges, validateBoardDefinition } from '../core/board';
import { rollD6 } from '../core/dice';
import {
  FINAL_MAP_PREVIEW_052,
  canReleaseFrom,
  isDraftDBranchNode,
  lotteryRewardForRoll,
  previewExitRoute,
  type FinalMapHoldingLocation,
} from '../core/finalMapPreview052';
import { createRandomSource } from '../core/rng';
import { gameSession } from '../core/session';
import type { BoardDefinition, BoardEdge, BoardNode } from '../core/types';

const BOARD = boardJson as BoardDefinition;
const WORLD_W = 2200;
const WORLD_H = 1250;
const VIEW_W = 1280;
const VIEW_H = 720;
const PLAYER_COLORS = [0xef4545, 0x4c8df6, 0x49b96f, 0x9c5ce6];
const PLAYER_OFFSETS = [
  { x: -13, y: -13 },
  { x: 13, y: -13 },
  { x: -13, y: 13 },
  { x: 13, y: 13 },
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

export class FinalMapPreviewScene052 extends Phaser.Scene {
  private players: PreviewPlayer[] = [];
  private currentPlayerIndex = 0;
  private readonly tokens = new Map<number, Phaser.GameObjects.Container>();
  private readonly hud = new Map<number, HudHandle>();
  private random = Math.random;
  private rollButton?: Phaser.GameObjects.Rectangle;
  private rollText?: Phaser.GameObjects.Text;
  private diceText?: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Text;
  private overviewButton?: Phaser.GameObjects.Text;
  private uiLayer?: Phaser.GameObjects.Container;
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private busy = false;
  private overviewMode = false;

  constructor() {
    super('FinalMapPreview052');
  }

  preload(): void {
    for (const profile of gameSession.players) {
      const asset = profile.faces.neutral;
      if (asset && !this.textures.exists(asset.textureKey)) {
        this.load.image(asset.textureKey, asset.dataUrl);
      }
    }
  }

  create(): void {
    const errors = validateBoardDefinition(BOARD);
    if (errors.length > 0) throw new Error(`Draft D graph invalid:\n${errors.join('\n')}`);

    const seed = this.previewSeed();
    const rngState = { seed, state: seed >>> 0, calls: 0 };
    this.random = createRandomSource(rngState);
    this.players = gameSession.players.map((profile, index) => ({
      id: index,
      name: profile.name || `Player ${index + 1}`,
      nodeId: FINAL_MAP_PREVIEW_052.readyNodeId,
      money: 200,
      laps: 0,
    }));

    this.cameras.main.setBackgroundColor('#5eaf85');
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.drawWorld();
    this.drawBoard();
    this.createTokens();

    const worldObjects = [...this.children.list];
    this.uiLayer = this.add.container(0, 0).setDepth(1000);
    this.createHud();
    this.createControls();

    this.uiCamera = this.cameras.add(0, 0, VIEW_W, VIEW_H, false, 'ui-052');
    this.uiCamera.setScroll(0, 0).setZoom(1);
    this.uiCamera.ignore(worldObjects);
    this.cameras.main.ignore(this.uiLayer);

    this.refreshHud();
    this.focusCurrentPlayer(false);

    const params = new URLSearchParams(window.location.search);
    if (params.get('overview') === '1') {
      this.setOverviewMode(true, false);
    } else {
      this.showToast('0.1.52 DRAFT D • UI cố định + camera gần + full-map review');
    }
  }

  private previewSeed(): number {
    const raw = new URLSearchParams(window.location.search).get('seed');
    const parsed = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : Date.now();
  }

  private drawWorld(): void {
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x6fb68c).setDepth(-50);

    const parks = [
      [260, 250, 420, 300, 0x7bcf8a], [760, 300, 520, 330, 0x5ea77b], [1420, 360, 560, 360, 0x7ccf9a],
      [430, 880, 500, 300, 0x69b97d], [1030, 920, 620, 280, 0x7ac98b], [1740, 900, 500, 300, 0x63aa7d],
    ] as const;
    for (const [x, y, w, h, color] of parks) {
      this.add.ellipse(x, y, w, h, color, 0.48).setDepth(-48);
    }

    const blocks = [
      [720, 730, 170, 110, 0x5d91cf], [930, 720, 150, 150, 0xe47f90], [1120, 760, 180, 105, 0xf0b85f],
      [1250, 520, 160, 120, 0x8d79d7], [1490, 520, 180, 140, 0x68b39d], [520, 500, 150, 135, 0x6d9acb],
    ] as const;
    for (const [x, y, w, h, color] of blocks) {
      this.add.rectangle(x, y, w, h, color, 0.9).setStrokeStyle(5, 0xffffff, 0.65).setDepth(-40);
    }

    this.add.text(1080, 555, 'MeMeMe', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '70px', fontStyle: 'bold', color: '#ffffff', stroke: '#303454', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(-35);
    this.add.text(1080, 610, 'THÀNH PHỐ KHÔNG ĐI THEO ĐƯỜNG THẲNG', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#303454',
      backgroundColor: '#fff8e8', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(-34);

    this.addDistrictSign(310, 930, 'KHU KHỞI ĐẦU', 'READY • LÁ BÀI');
    this.addDistrictSign(1630, 850, 'KHU ĐẶC BIỆT', 'Jail • Event');
    this.addDistrictSign(1360, 170, 'KHU GIẢI TRÍ', 'Mini Game • Drama');
    this.addDistrictSign(590, 165, 'KHU ĐỜI SỐNG', 'Tin tức • Bạn bè');
    this.addDistrictSign(1080, 1020, 'KHU NGHỀ NGHIỆP', 'Job • Tiền');
  }

  private addDistrictSign(x: number, y: number, title: string, body: string): void {
    const root = this.add.container(x, y).setDepth(-20);
    const panel = this.add.rectangle(0, 0, 210, 54, 0x195b7a, 0.9).setStrokeStyle(3, 0xffffff, 0.85);
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
      const specialExit = edge.from === 100 || edge.from === 101 || edge.from === 102 || edge.from === 103 || edge.from === 110 || edge.from === 111 || edge.from === 112 || edge.from === 113;
      const optionalBranch = isDraftDBranchNode(edge.from) || isDraftDBranchNode(edge.to) || ([3, 16, 34].includes(edge.from) && edge.route === 'branch');
      const line = this.add.graphics().setDepth(0);
      if (specialExit) line.lineStyle(10, 0xf3a43b, 0.92);
      else if (optionalBranch) line.lineStyle(9, 0x66d0cc, 0.95);
      else line.lineStyle(13, 0xf6e6b6, 0.98);
      line.lineBetween(from.x, from.y, to.x, to.y);
    }

    for (const node of BOARD.nodes) this.drawNode(node);
  }

  private drawNode(node: BoardNode): void {
    const cid = node.contentId ?? '';
    const isHolding = cid === 'SPECIAL_JAIL_HOLD' || cid === 'SPECIAL_HOSPITAL_HOLD';
    const isGate = cid === 'SPECIAL_JAIL_GATE' || cid === 'SPECIAL_HOSPITAL_GATE';
    const isLottery = cid === 'SPECIAL_LOTTERY';
    const isReady = node.id === FINAL_MAP_PREVIEW_052.readyNodeId;
    const isOptional = isDraftDBranchNode(node.id);

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
    if (isOptional) fill = 0x66d0cc;

    if (isHolding || isReady || isGate || isLottery) {
      const radius = isHolding ? 42 : 30;
      this.add.circle(node.x, node.y, radius, fill, 1).setStrokeStyle(5, 0x30343b, 0.95).setDepth(4);
    } else if (isOptional) {
      this.add.rectangle(node.x, node.y, 36, 36, fill, 1).setRotation(Math.PI / 4).setStrokeStyle(4, 0x30343b, 0.95).setDepth(4);
    } else {
      this.add.rectangle(node.x, node.y, 48, 34, fill, 1).setStrokeStyle(4, 0x30343b, 0.92).setDepth(4);
    }

    this.add.text(node.x, node.y, this.nodeLabel(node), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: isHolding ? '17px' : '11px', fontStyle: 'bold', color: '#20242b', align: 'center',
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
    if (/^[ABC][123]$/.test(cid)) return cid;
    if (cid.startsWith('JAIL_EXIT_')) return `J${cid.at(-1)}`;
    if (cid.startsWith('HOSPITAL_EXIT_')) return `H${cid.at(-1)}`;
    if (node.feature === 'job') return '💼';
    if (node.feature === 'minigame') return '🎮';
    if (node.type === 'card') return '?';
    if (node.type === 'news') return '!';
    if (node.type === 'money') return (node.value ?? 0) >= 0 ? '$+' : '$−';
    return node.id < 44 ? String(node.id + 1) : '';
  }

  private createTokens(): void {
    for (const player of this.players) {
      const node = getBoardNode(BOARD, player.nodeId);
      const offset = PLAYER_OFFSETS[player.id] ?? { x: 0, y: 0 };
      const root = this.add.container(node.x + offset.x, node.y + offset.y).setDepth(30);
      const shadow = this.add.circle(2, 4, 17, 0x000000, 0.22);
      const body = this.add.circle(0, 0, 16, PLAYER_COLORS[player.id] ?? 0xffffff, 1).setStrokeStyle(4, 0xffffff, 1);
      const label = this.add.text(0, 0, String(player.id + 1), {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      root.add([shadow, body, label]);
      this.tokens.set(player.id, root);
    }
  }

  private createHud(): void {
    const positions = [
      { x: 132, y: 54 }, { x: 1148, y: 54 }, { x: 132, y: 666 }, { x: 1148, y: 666 },
    ];

    for (const player of this.players) {
      const pos = positions[player.id] ?? positions[0];
      const root = this.add.container(pos.x, pos.y).setDepth(20);
      const border = this.add.rectangle(0, 0, 238, 82, 0xfffbf3, 0.95)
        .setStrokeStyle(4, PLAYER_COLORS[player.id] ?? 0x333333, 1);
      root.add(border);

      const profile = gameSession.players[player.id];
      const face = profile?.faces.neutral;
      if (face && this.textures.exists(face.textureKey)) {
        root.add(this.add.image(-91, 0, face.textureKey).setDisplaySize(54, 54));
      } else {
        root.add(this.add.circle(-91, 0, 27, PLAYER_COLORS[player.id] ?? 0x777777, 1));
      }

      const name = this.add.text(-55, -24, player.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#202020', fixedWidth: 155,
      }).setOrigin(0, 0.5);
      const stats = this.add.text(-55, 0, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#3c3c3c',
      }).setOrigin(0, 0.5);
      const status = this.add.text(-55, 22, '', {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#6d655b', fixedWidth: 160,
      }).setOrigin(0, 0.5);
      root.add([name, stats, status]);
      this.uiLayer?.add(root);
      this.hud.set(player.id, { root, name, stats, status, border });
    }
  }

  private createControls(): void {
    this.rollButton = this.add.rectangle(640, 678, 188, 42, 0xef4545, 1)
      .setStrokeStyle(3, 0xffffff, 1).setInteractive({ useHandCursor: true });
    this.rollText = this.add.text(640, 678, 'ĐỔ XÚC XẮC', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.diceText = this.add.text(640, 632, '🎲', {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#202020', backgroundColor: '#fffaf0', padding: { x: 10, y: 4 },
    }).setOrigin(0.5);

    this.overviewButton = this.add.text(640, 24, '🗺️ FULL MAP', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#202020', backgroundColor: '#fffaf0', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const back = this.add.text(640, 55, '← MENU', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#ffffff', backgroundColor: '#5b6370', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.uiLayer?.add([this.rollButton, this.rollText, this.diceText, this.overviewButton, back]);

    this.rollButton.on('pointerdown', () => void this.handleRoll());
    this.overviewButton.on('pointerdown', () => this.setOverviewMode(!this.overviewMode, true));
    back.on('pointerdown', () => { window.location.href = window.location.pathname; });
  }

  private async handleRoll(): Promise<void> {
    if (this.busy) return;
    if (this.overviewMode) this.setOverviewMode(false, true);
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
        const outgoing = getOutgoingEdges(BOARD, player.nodeId);
        if (outgoing.length === 0) break;
        const edge = outgoing.length > 1 ? await this.chooseRoute(player, outgoing) : outgoing[0];
        player.nodeId = edge.to;
        if (edge.to === FINAL_MAP_PREVIEW_052.readyNodeId) player.laps += 1;
        await this.moveTokenTo(player, edge.to, 190);
      }

      await this.resolveLanding(player);
      this.advanceTurn();
    } finally {
      this.setBusy(false);
    }
  }

  private chooseRoute(player: PreviewPlayer, edges: BoardEdge[]): Promise<BoardEdge> {
    const token = this.tokens.get(player.id);
    const destinations = edges.map((edge) => getBoardNode(BOARD, edge.to));
    const avgX = destinations.reduce((sum, node) => sum + node.x, token?.x ?? 0) / (destinations.length + (token ? 1 : 0));
    const avgY = destinations.reduce((sum, node) => sum + node.y, token?.y ?? 0) / (destinations.length + (token ? 1 : 0));

    this.cameras.main.zoomTo(FINAL_MAP_PREVIEW_052.branchDecisionZoom, 240, 'Sine.easeInOut');
    this.cameras.main.pan(avgX, avgY, 240, 'Sine.easeInOut');

    return new Promise((resolve) => {
      const root = this.add.container(640, 560).setDepth(40);
      const panel = this.add.rectangle(0, 0, 440, 112, 0x202633, 0.94).setStrokeStyle(3, 0xffffff, 0.92);
      const title = this.add.text(0, -34, 'CHỌN ĐƯỜNG', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      root.add([panel, title]);

      const xs = edges.length === 2 ? [-105, 105] : edges.map((_, index) => (index - (edges.length - 1) / 2) * 150);
      edges.forEach((edge, index) => {
        const label = edge.label ?? (edge.route === 'branch' ? 'LỐI RẼ' : 'PHỐ CHÍNH');
        const button = this.add.rectangle(xs[index] ?? 0, 18, 178, 44, edge.route === 'branch' ? 0x36a9a3 : 0xefb843, 1)
          .setStrokeStyle(3, 0xffffff, 0.95).setInteractive({ useHandCursor: true });
        const text = this.add.text(xs[index] ?? 0, 18, label, {
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#202020', align: 'center', fixedWidth: 162,
        }).setOrigin(0.5);
        root.add([button, text]);
        button.on('pointerdown', () => {
          root.destroy();
          this.cameras.main.zoomTo(FINAL_MAP_PREVIEW_052.normalFollowZoom, 240, 'Sine.easeInOut');
          if (token) this.cameras.main.pan(token.x, token.y, 240, 'Sine.easeInOut');
          resolve(edge);
        });
      });
      this.uiLayer?.add(root);
    });
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

    this.showToast(`${place}: ${roll} → THOÁT! • chạy qua 3 ô lối ra để test hình học`);
    for (const nodeId of previewExitRoute(location)) {
      player.nodeId = nodeId;
      await this.moveTokenTo(player, nodeId, 220);
    }
    player.holding = undefined;
  }

  private async resolveLanding(player: PreviewPlayer): Promise<void> {
    const node = getBoardNode(BOARD, player.nodeId);
    const cid = node.contentId ?? '';

    if (player.nodeId === FINAL_MAP_PREVIEW_052.jailGateNodeId) {
      player.holding = 'jail';
      player.nodeId = FINAL_MAP_PREVIEW_052.jailNodeId;
      this.showToast('🚔 Dính cổng Nhà tù → vào Đồn cảnh sát');
      await this.moveTokenTo(player, player.nodeId, 430);
      return;
    }
    if (player.nodeId === FINAL_MAP_PREVIEW_052.hospitalGateNodeId) {
      player.holding = 'hospital';
      player.nodeId = FINAL_MAP_PREVIEW_052.hospitalNodeId;
      this.showToast('🏥 Dính cổng Bệnh viện → nhập viện');
      await this.moveTokenTo(player, player.nodeId, 430);
      return;
    }
    if (player.nodeId === FINAL_MAP_PREVIEW_052.lotteryNodeId) {
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
    if (node.type === 'card') return this.showToast('❓ LÁ BÀI • preview vị trí ô');
    if (node.type === 'news') return this.showToast('❗ TIN TỨC • preview vị trí ô');
    if (node.feature === 'job') return this.showToast('💼 JOB HUB');
    if (node.feature === 'minigame') return this.showToast('🎮 MINI GAME');
    if (cid === 'READY') return this.showToast('🏁 READY');
    this.showToast(cid || `Ô ${node.id + 1}`);
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
        onUpdate: () => {
          if (!this.overviewMode) this.cameras.main.centerOn(token.x, token.y);
        },
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
      ui.status.setText(player.holding === 'jail' ? '🚔 Đồn cảnh sát' : player.holding === 'hospital' ? '🏥 Bệnh viện' : 'Trên map');
      ui.border.setStrokeStyle(active ? 6 : 3, active ? 0xffd34d : (PLAYER_COLORS[player.id] ?? 0x333333), 1);
      ui.root.setScale(active ? 1 : 0.9).setAlpha(active ? 1 : 0.82);
    }
  }

  private focusCurrentPlayer(animated: boolean): void {
    this.overviewMode = false;
    this.overviewButton?.setText('🗺️ FULL MAP');
    const player = this.players[this.currentPlayerIndex];
    const token = player ? this.tokens.get(player.id) : undefined;
    if (!token) return;
    this.cameras.main.zoomTo(FINAL_MAP_PREVIEW_052.normalFollowZoom, animated ? 300 : 0, 'Sine.easeInOut');
    if (animated) this.cameras.main.pan(token.x, token.y, 340, 'Sine.easeInOut');
    else this.cameras.main.centerOn(token.x, token.y);
  }

  private setOverviewMode(enabled: boolean, animated: boolean): void {
    this.overviewMode = enabled;
    if (enabled) {
      this.overviewButton?.setText('↩ TRỞ LẠI LƯỢT');
      this.cameras.main.zoomTo(FINAL_MAP_PREVIEW_052.overviewZoom, animated ? 280 : 0, 'Sine.easeInOut');
      if (animated) this.cameras.main.pan(WORLD_W / 2, WORLD_H / 2, 280, 'Sine.easeInOut');
      else this.cameras.main.centerOn(WORLD_W / 2, WORLD_H / 2);
      return;
    }
    this.focusCurrentPlayer(animated);
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
    const toast = this.add.text(640, 585, message, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#202020',
      backgroundColor: '#fff7dd', padding: { x: 14, y: 8 }, align: 'center', wordWrap: { width: 610 },
    }).setOrigin(0.5).setDepth(50);
    this.uiLayer?.add(toast);
    this.toast = toast;
    this.time.delayedCall(1750, () => {
      if (this.toast !== toast || !toast.active) return;
      this.tweens.add({ targets: toast, alpha: 0, duration: 220, onComplete: () => toast.destroy() });
    });
  }
}
