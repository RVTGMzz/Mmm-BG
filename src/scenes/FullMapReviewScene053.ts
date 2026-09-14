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
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '66px', fontStyle: 'bold', color: '#ffffff', stroke: '#303454', strokeThickness: 9,
    }).setOrigin(0.5).setDepth(-35);

    this.add.text(1005, 72, 'FULL MAP REVIEW 0.1.53  •  3 NGÃ RẼ TRÁI / PHẢI  •  MỌI ĐƯỜNG ĐỀU TIẾN VỀ READY', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '18px', fontStyle: 'bold', color: '#20242b', backgroundColor: '#fff8e8', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(20);
  }

  private drawBoard(): void {
    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const specialExit = [100, 101, 102, 103, 110, 111, 112, 113].includes(edge.from);
      const optionalBranch = isDraftDBranchNode(edge.from) || isDraftDBranchNode(edge.to) || ([3, 16, 34].includes(edge.from) && edge.route === 'branch');
      const line = this.add.graphics().setDepth(0);
      if (specialExit) line.lineStyle(10, 0xf3a43b, 0.92);
      else if (optionalBranch) line.lineStyle(9, 0x66d0cc, 0.95);
      else line.lineStyle(13, 0xf6e6b6, 0.98);
      line.lineBetween(from.x, from.y, to.x, to.y);
    }

    for (const node of BOARD.nodes) this.drawNode(node);

    this.addBranchLabel(760, 920, 'A  ← TRÁI / PHẢI →  nhập lại M08');
    this.addBranchLabel(1080, 250, 'B  ← TRÁI / PHẢI →  nhập lại M21');
    this.addBranchLabel(1320, 555, 'C  ← TRÁI / PHẢI →  nhập lại M39');
  }

  private addBranchLabel(x: number, y: number, label: string): void {
    this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#173b43',
      backgroundColor: '#dffaf7', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(8);
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
