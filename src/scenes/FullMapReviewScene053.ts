import Phaser from 'phaser';
import boardJson from '../content/city/board_city_final_051.json';
import { getBoardNode, validateBoardDefinition } from '../core/board';
import { FINAL_MAP_PREVIEW_052, isDraftDBranchNode } from '../core/finalMapPreview052';
import type { BoardDefinition, BoardNode } from '../core/types';

const BOARD = boardJson as BoardDefinition;
const VIEW_W = 1280;
const VIEW_H = 720;
const PADDING_X = 120;
const PADDING_Y = 90;

export class FullMapReviewScene053 extends Phaser.Scene {
  constructor() {
    super('FullMapReviewScene053');
  }

  create(): void {
    const errors = validateBoardDefinition(BOARD);
    if (errors.length > 0) throw new Error(`Full Map graph invalid:\n${errors.join('\n')}`);

    this.cameras.main.setBackgroundColor('#5eaf85');
    this.drawWorld();
    this.drawBoard();
    this.fitWholeBoard();
  }

  private drawWorld(): void {
    this.add.rectangle(1005, 585, 1900, 1130, 0x6fb68c).setDepth(-50);

    const parks = [
      [300, 260, 360, 250, 0x7bcf8a], [780, 300, 470, 300, 0x5ea77b], [1430, 360, 470, 330, 0x7ccf9a],
      [420, 880, 430, 260, 0x69b97d], [1040, 900, 560, 250, 0x7ac98b], [1640, 850, 400, 260, 0x63aa7d],
    ] as const;
    for (const [x, y, w, h, color] of parks) {
      this.add.ellipse(x, y, w, h, color, 0.45).setDepth(-48);
    }

    this.add.text(1005, 585, 'MeMeMe', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '66px', fontStyle: 'bold', color: '#ffffff', stroke: '#303454', strokeThickness: 9,
    }).setOrigin(0.5).setDepth(-35);

    const headerShadow = this.add.graphics().setDepth(19).setName('full-map-header-shadow-ch1711');
    headerShadow.fillStyle(0x4b302a, 0.22);
    headerShadow.fillRoundedRect(540, 43, 930, 66, 22);

    const header = this.add.graphics().setDepth(20).setName('full-map-header-ch1711');
    header.fillStyle(0xfff7e8, 0.98);
    header.fillRoundedRect(540, 36, 930, 66, 22);
    header.fillStyle(0xffd76a, 1);
    header.fillRoundedRect(550, 44, 910, 14, 7);
    header.lineStyle(4, 0x4b302a, 0.94);
    header.strokeRoundedRect(540, 36, 930, 66, 22);

    this.add.text(1005, 71, 'BẢN ĐỒ TỔNG QUAN  •  3 NGÃ RẼ TRÁI / PHẢI  •  MỌI ĐƯỜNG ĐỀU TIẾN VỀ READY', {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
      fontSize: '18px', fontStyle: 'bold', color: '#4b302a',
    }).setOrigin(0.5).setDepth(21);
  }

  private drawBoard(): void {
    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const specialExit = [100, 101, 102, 103, 110, 111, 112, 113].includes(edge.from);
      const optionalBranch = isDraftDBranchNode(edge.from) || isDraftDBranchNode(edge.to) || ([3, 16, 34].includes(edge.from) && edge.route === 'branch');
      const line = this.add.graphics().setDepth(0);
      line.lineStyle(specialExit ? 14 : optionalBranch ? 12 : 16, 0x4b302a, 0.17);
      line.lineBetween(from.x + 2, from.y + 3, to.x + 2, to.y + 3);
      if (specialExit) line.lineStyle(10, 0xf3a43b, 0.95);
      else if (optionalBranch) line.lineStyle(8, 0x66d0cc, 0.98);
      else line.lineStyle(11, 0xf6e6b6, 1);
      line.lineBetween(from.x, from.y, to.x, to.y);
      line.lineStyle(2, 0xffffff, 0.34);
      line.lineBetween(from.x - 1, from.y - 1, to.x - 1, to.y - 1);
    }

    for (const node of BOARD.nodes) this.drawNode(node);

    this.addBranchLabel(760, 920, 'A  ← TRÁI / PHẢI →  nhập lại M08');
    this.addBranchLabel(1080, 250, 'B  ← TRÁI / PHẢI →  nhập lại M21');
    this.addBranchLabel(1320, 555, 'C  ← TRÁI / PHẢI →  nhập lại M39');
  }

  private addBranchLabel(x: number, y: number, label: string): void {
    const width = 270;
    const skin = this.add.graphics().setDepth(8).setName('full-map-branch-label-ch1711');
    skin.fillStyle(0x4b302a, 0.16);
    skin.fillRoundedRect(x - width / 2 + 2, y - 15 + 3, width, 30, 11);
    skin.fillStyle(0xdffaf7, 0.98);
    skin.fillRoundedRect(x - width / 2, y - 15, width, 30, 11);
    skin.lineStyle(2, 0x4b302a, 0.52);
    skin.strokeRoundedRect(x - width / 2, y - 15, width, 30, 11);
    this.add.text(x, y, label, {
      fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#31584f',
    }).setOrigin(0.5).setDepth(9);
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

    const skin = this.add.graphics().setDepth(4).setName('full-map-node-ch1711');
    if (isHolding || isReady || isGate || isLottery) {
      const radius = isHolding ? 42 : 30;
      skin.fillStyle(0x4b302a, 0.20);
      skin.fillCircle(node.x + 2, node.y + 4, radius + 2);
      skin.fillStyle(fill, 1);
      skin.fillCircle(node.x, node.y, radius);
      skin.fillStyle(0xffffff, 0.42);
      skin.fillCircle(node.x - radius * 0.25, node.y - radius * 0.30, Math.max(5, radius * 0.18));
      skin.lineStyle(4, 0x4b302a, 0.90);
      skin.strokeCircle(node.x, node.y, radius);
    } else if (isOptional) {
      const size = 36;
      skin.save();
      skin.translateCanvas(node.x, node.y);
      skin.rotateCanvas(Math.PI / 4);
      skin.fillStyle(0x4b302a, 0.20);
      skin.fillRoundedRect(-size / 2 + 2, -size / 2 + 3, size, size, 7);
      skin.fillStyle(fill, 1);
      skin.fillRoundedRect(-size / 2, -size / 2, size, size, 7);
      skin.lineStyle(3, 0x4b302a, 0.90);
      skin.strokeRoundedRect(-size / 2, -size / 2, size, size, 7);
      skin.restore();
    } else {
      skin.fillStyle(0x4b302a, 0.18);
      skin.fillRoundedRect(node.x - 22, node.y - 13, 48, 34, 9);
      skin.fillStyle(fill, 1);
      skin.fillRoundedRect(node.x - 24, node.y - 17, 48, 34, 9);
      skin.fillStyle(0xffffff, 0.36);
      skin.fillRoundedRect(node.x - 19, node.y - 13, 38, 6, 3);
      skin.lineStyle(3, 0x4b302a, 0.88);
      skin.strokeRoundedRect(node.x - 24, node.y - 17, 48, 34, 9);
    }

    this.add.text(node.x, node.y, this.nodeLabel(node), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: isHolding ? '17px' : '11px', fontStyle: 'bold', color: '#4b302a', align: 'center',
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

  private fitWholeBoard(): void {
    const xs = BOARD.nodes.map((node) => node.x);
    const ys = BOARD.nodes.map((node) => node.y);
    const minX = Math.min(...xs) - PADDING_X;
    const maxX = Math.max(...xs) + PADDING_X;
    const minY = Math.min(...ys) - PADDING_Y;
    const maxY = Math.max(...ys) + PADDING_Y;
    const width = maxX - minX;
    const height = maxY - minY;
    const zoom = Math.min(VIEW_W / width, VIEW_H / height, 0.68);

    this.cameras.main.setBounds(minX, minY, width, height);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn((minX + maxX) / 2, (minY + maxY) / 2);
  }
}
