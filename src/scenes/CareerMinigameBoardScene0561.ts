import Phaser from 'phaser';
import boardJson from '../content/city/board_city_mvp.json';
import type { ClientIntentType } from '../core/authority';
import { getBoardNode, getOutgoingEdges } from '../core/board';
import type { MatchEventValue, MatchState } from '../core/matchState';
import { gameSession } from '../core/session';
import type { BoardDefinition, BoardNode, PlayerState } from '../core/types';
import { showBranchPicker } from '../ui/BranchPicker';
import {
  CANONICAL_PRESENTATION_0561,
  canonicalHudPosition0561,
  isCanonicalUiDepth0561,
} from '../ui/canonicalPresentation0561';
import type { PresentationEventModel } from '../ui/presentationModel';
import { CareerMinigameBoardScene056 } from './CareerMinigameBoardScene056';

const BOARD = boardJson as BoardDefinition;
const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];

type PlayerVisualRuntime0561 = { token: Phaser.GameObjects.Container };

type CanonicalInternals0561 = {
  match: MatchState;
  visuals: Map<number, PlayerVisualRuntime0561>;
  compactTurnText?: Phaser.GameObjects.Text;
  compactScoreText?: Phaser.GameObjects.Text;
  currentPlayer(): PlayerState | undefined;
  canControlCurrentPlayer(): boolean;
  submitIntent(type: ClientIntentType, data?: Record<string, MatchEventValue>): void;
  promptNetworkBranch(): Promise<void>;
};

type PresentationRuntime0561 = {
  active?: Phaser.GameObjects.Container;
  currentModel?: PresentationEventModel;
};

type HudHandle0561 = {
  root: Phaser.GameObjects.Container;
  border: Phaser.GameObjects.Rectangle;
  name: Phaser.GameObjects.Text;
  money: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
};

/**
 * 0.1.56.1 canonical presentation consolidation.
 *
 * Gameplay authority deliberately remains inherited from the 0.1.48 -> 0.1.56
 * chain. This scene owns only the canonical camera, fixed HUD, board readability,
 * branch-choice presentation and visible build identity.
 */
export class CareerMinigameBoardScene0561 extends CareerMinigameBoardScene056 {
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private uiRoot?: Phaser.GameObjects.Container;
  private overviewButton?: Phaser.GameObjects.Text;
  private turnStatus?: Phaser.GameObjects.Text;
  private readonly hud = new Map<number, HudHandle0561>();
  private readonly routedObjects = new Set<Phaser.GameObjects.GameObject>();
  private readonly compactedPresentationRoots = new WeakSet<Phaser.GameObjects.Container>();
  private overviewMode = false;
  private branchPickerOpen = false;
  private branchFocusSignature = '';
  private activePlayerId?: number;
  private hudSignature = '';

  create(): void {
    super.create();

    this.hideLegacyChrome();
    this.installCanonicalBoardVisuals();
    this.installCanonicalBranchPicker();
    this.createCanonicalHud();
    this.installCanonicalCameraRig();
    this.installCanonicalUiCamera();
    this.syncCanonicalHud(true);
    this.focusActiveToken(false);

    this.input.keyboard?.on('keydown-O', this.toggleOverviewFromKeyboard, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-O', this.toggleOverviewFromKeyboard, this);
      this.uiCamera = undefined;
      this.uiRoot = undefined;
      this.overviewButton = undefined;
      this.turnStatus = undefined;
      this.hud.clear();
      this.routedObjects.clear();
      this.overviewMode = false;
      this.branchPickerOpen = false;
      this.branchFocusSignature = '';
      this.activePlayerId = undefined;
      this.hudSignature = '';
    });
  }

  update(): void {
    super.update();
    this.routeNewObjectsToCorrectCamera();
    this.syncCanonicalHud(false);
    this.syncCameraState();
    this.compactEventPresentationIfNeeded();
  }

  private internals(): CanonicalInternals0561 {
    return this as unknown as CanonicalInternals0561;
  }

  private hideLegacyChrome(): void {
    const internals = this.internals();
    internals.compactTurnText?.setVisible(false);
    internals.compactScoreText?.setVisible(false);

    for (const object of this.children.list) {
      if (object instanceof Phaser.GameObjects.Text) {
        const text = object.text.trim();
        if (
          text === 'Me³' ||
          text.includes('MeMeMe CITY') ||
          text.startsWith('CITY •') ||
          text.startsWith('PLAYTEST ') ||
          text.startsWith('MATCH •') ||
          text.startsWith('MATCH SHELL') ||
          text.startsWith('📡 ') ||
          text.startsWith('🐛') ||
          text.startsWith('?  CÁCH CHƠI') ||
          text.startsWith('🤖 CPU TEST:') ||
          text.startsWith('Tip:')
        ) {
          object.setVisible(false);
        }
      }

      if (
        object instanceof Phaser.GameObjects.Rectangle &&
        Math.abs(object.y - 681) < 2 &&
        object.width >= 400
      ) {
        object.setVisible(false).disableInteractive();
      }
    }
  }

  private installCanonicalBoardVisuals(): void {
    const nodePositions = new Set(BOARD.nodes.map((node) => `${node.x}:${node.y}`));

    for (const object of this.children.list) {
      if (object instanceof Phaser.GameObjects.Graphics && object.depth <= 5) {
        object.setVisible(false);
        continue;
      }

      if (
        object instanceof Phaser.GameObjects.Arc &&
        object.depth <= 5 &&
        nodePositions.has(`${object.x}:${object.y}`)
      ) {
        object.setVisible(false);
        continue;
      }

      if (object instanceof Phaser.GameObjects.Text && object.depth <= 6) {
        if (nodePositions.has(`${object.x}:${object.y}`)) {
          object.setVisible(false);
          continue;
        }
        if ((object.text === 'MINI' || object.text === 'JOB') && BOARD.nodes.some((node) => node.x === object.x && Math.abs(node.y + 29 - object.y) < 2)) {
          object.setVisible(false);
        }
      }
    }

    this.cameras.main.setBackgroundColor('#6fae87');
    this.add.rectangle(640, 360, 1440, 840, 0x6fae87, 1).setDepth(-40);
    this.add.ellipse(310, 525, 520, 250, 0x7bcf8a, 0.3).setDepth(-35);
    this.add.ellipse(930, 505, 610, 250, 0x5fa17a, 0.27).setDepth(-35);
    this.add.ellipse(335, 205, 510, 220, 0x73c792, 0.26).setDepth(-35);
    this.add.ellipse(930, 210, 570, 240, 0x6aaf8d, 0.24).setDepth(-35);

    for (const edge of BOARD.edges) {
      const from = getBoardNode(BOARD, edge.from);
      const to = getBoardNode(BOARD, edge.to);
      const line = this.add.graphics().setDepth(0);
      line.lineStyle(edge.route === 'branch' ? 5 : 7, edge.route === 'branch' ? 0x4fb7b1 : 0xf3dfad, edge.route === 'branch' ? 0.92 : 0.95);
      line.lineBetween(from.x, from.y, to.x, to.y);
    }

    for (const node of BOARD.nodes) this.drawCanonicalNode(node);
  }

  private drawCanonicalNode(node: BoardNode): void {
    const contentId = node.contentId ?? '';
    const isHolding = contentId === 'SPECIAL_JAIL_HOLD' || contentId === 'SPECIAL_HOSPITAL_HOLD';
    const isAnchor = node.type === 'ready' || contentId === 'SPECIAL_JAIL_GATE' || contentId === 'SPECIAL_HOSPITAL_GATE' || contentId === 'SPECIAL_LOTTERY';
    const isBranch = /^[ABC][123]$/.test(contentId);

    let fill = 0xf7f0e4;
    if (node.type === 'money') fill = (node.value ?? 0) >= 0 ? 0xffd34d : 0xf2aaa4;
    if (node.type === 'news') fill = 0x9bcf74;
    if (node.type === 'card') fill = 0xb997d6;
    if (node.feature === 'job') fill = 0x6a9be8;
    if (node.feature === 'minigame') fill = 0xf2a65a;
    if (contentId.includes('JAIL')) fill = 0xe9a448;
    if (contentId.includes('HOSPITAL')) fill = 0xee91b7;
    if (contentId === 'SPECIAL_LOTTERY') fill = 0xffc928;
    if (node.type === 'ready') fill = 0x4b94e8;
    if (isBranch && node.type === 'normal') fill = 0x70cbc3;

    const width = isHolding ? 54 : isAnchor ? 46 : node.feature ? 42 : 34;
    const height = isHolding ? 38 : isAnchor ? 34 : node.feature ? 30 : 24;
    this.add.rectangle(node.x, node.y, width, height, fill, 1)
      .setStrokeStyle(isAnchor || isHolding ? 3 : 2, 0x30343b, 0.94)
      .setDepth(4);

    this.add.text(node.x, node.y, this.canonicalNodeLabel(node), {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: isHolding ? '10px' : isAnchor ? '12px' : '10px',
      fontStyle: 'bold',
      color: '#20242b',
      align: 'center',
    }).setOrigin(0.5).setDepth(5);
  }

  private canonicalNodeLabel(node: BoardNode): string {
    const contentId = node.contentId ?? '';
    if (node.type === 'ready') return 'READY';
    if (contentId === 'SPECIAL_JAIL_GATE') return '🚔';
    if (contentId === 'SPECIAL_JAIL_HOLD') return 'TÙ';
    if (contentId === 'SPECIAL_HOSPITAL_GATE') return '🏥';
    if (contentId === 'SPECIAL_HOSPITAL_HOLD') return 'BV';
    if (contentId === 'SPECIAL_LOTTERY') return '🎰';
    if (contentId.startsWith('JAIL_EXIT_')) return `J${contentId.at(-1)}`;
    if (contentId.startsWith('HOSPITAL_EXIT_')) return `H${contentId.at(-1)}`;
    if (node.feature === 'job') return '💼';
    if (node.feature === 'minigame') return '🎮';
    if (node.type === 'news') return '!';
    if (node.type === 'card') return '?';
    if (node.type === 'money') return (node.value ?? 0) >= 0 ? '$+' : '$−';
    if (/^[ABC][123]$/.test(contentId)) return contentId;
    return '•';
  }

  private createCanonicalHud(): void {
    this.uiRoot = this.add.container(0, 0).setDepth(1000);

    for (const player of this.internals().match.players) {
      const pos = canonicalHudPosition0561(player.id);
      const root = this.add.container(pos.x, pos.y).setDepth(10);
      const border = this.add.rectangle(0, 0, 252, 92, 0xfffbf3, 0.96)
        .setStrokeStyle(3, PLAYER_COLORS[player.id] ?? 0x444444, 1);
      root.add(border);

      const face = gameSession.players[player.id]?.faces.neutral;
      if (face && this.textures.exists(face.textureKey)) {
        root.add(this.add.image(-96, 0, face.textureKey).setDisplaySize(58, 58));
      } else {
        root.add(this.add.circle(-96, 0, 29, PLAYER_COLORS[player.id] ?? 0x777777, 1));
      }

      const name = this.add.text(-58, -27, '', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#202020',
        fixedWidth: 172,
      }).setOrigin(0, 0.5);
      const money = this.add.text(-58, -2, '', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#3b3732',
      }).setOrigin(0, 0.5);
      const meta = this.add.text(-58, 24, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#756b61',
        fixedWidth: 178,
      }).setOrigin(0, 0.5);
      root.add([name, money, meta]);
      this.uiRoot.add(root);
      this.hud.set(player.id, { root, border, name, money, meta });
    }

    const build = this.add.text(640, 18, CANONICAL_PRESENTATION_0561.header, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#39434b',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    this.overviewButton = this.add.text(640, 50, '🗺️ TỔNG QUAN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#202020',
      backgroundColor: '#fffaf0',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.overviewButton.on('pointerdown', () => this.setOverviewMode(!this.overviewMode, true));

    this.turnStatus = this.add.text(640, 82, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#3d3934',
      backgroundColor: '#fff7dd',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    const badge = this.add.text(640, 705, CANONICAL_PRESENTATION_0561.badge, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#ef4545',
      padding: { x: 7, y: 4 },
    }).setOrigin(0.5, 1);

    this.uiRoot.add([build, this.overviewButton, this.turnStatus, badge]);
  }

  private installCanonicalCameraRig(): void {
    this.cameras.main.setBounds(-80, -60, CANONICAL_PRESENTATION_0561.worldWidth + 160, CANONICAL_PRESENTATION_0561.worldHeight + 120);
    this.cameras.main.setZoom(CANONICAL_PRESENTATION_0561.normalFollowZoom);
  }

  private installCanonicalUiCamera(): void {
    this.uiCamera = this.cameras.add(0, 0, 1280, 720, false, 'canonical-ui-0561');
    this.uiCamera.setScroll(0, 0).setZoom(1);
    this.routeNewObjectsToCorrectCamera();
  }

  private routeNewObjectsToCorrectCamera(): void {
    if (!this.uiCamera) return;
    for (const object of this.children.list) {
      if (this.routedObjects.has(object)) continue;
      this.routedObjects.add(object);
      const depth = Number((object as Phaser.GameObjects.GameObject & { depth?: number }).depth ?? 0);
      if (isCanonicalUiDepth0561(depth)) this.cameras.main.ignore(object);
      else this.uiCamera.ignore(object);
    }
  }

  private installCanonicalBranchPicker(): void {
    const internals = this.internals();
    internals.promptNetworkBranch = async () => {
      if (this.branchPickerOpen) return;
      const player = internals.currentPlayer();
      if (!player || internals.match.turn.phase !== 'BRANCH_CHOICE') return;
      if (!internals.canControlCurrentPlayer()) return;

      const outgoing = getOutgoingEdges(BOARD, player.nodeId);
      if (outgoing.length <= 1) return;

      this.branchPickerOpen = true;
      this.frameBranchChoice(player.nodeId, true);
      try {
        const selected = await showBranchPicker(
          this,
          player,
          outgoing.map((edge) => ({ edge, destination: getBoardNode(BOARD, edge.to) })),
          internals.match.turn.lastRoll ?? 0,
        );
        this.focusActiveToken(true);
        internals.submitIntent('choose_branch', { to: selected.to });
      } finally {
        this.branchPickerOpen = false;
      }
    };
  }

  private syncCanonicalHud(force: boolean): void {
    const internals = this.internals();
    const current = internals.currentPlayer();
    if (!current) return;

    const signature = [
      internals.match.turn.currentPlayerIndex,
      internals.match.turn.phase,
      ...internals.match.players.flatMap((player) => [
        player.id,
        player.money,
        player.handCardIds.length,
        player.jobId ?? '',
        player.jobStatus ?? '',
        player.lapsCompleted ?? 0,
        player.cardBlockTurns,
      ]),
    ].join(':');
    if (!force && signature === this.hudSignature) return;
    this.hudSignature = signature;

    for (const player of internals.match.players) {
      const ui = this.hud.get(player.id);
      if (!ui) continue;
      const active = player.id === current.id;
      const job = player.jobStatus === 'employed' ? '💼 Có việc' : '💼 Chưa việc';
      const lock = player.cardBlockTurns > 0 ? ` • 🔒${player.cardBlockTurns}` : '';
      ui.name.setText(`${active ? '▶ ' : ''}P${player.id + 1} • ${player.name}`);
      ui.money.setText(`🪙 ${player.money} B$`);
      ui.meta.setText(`🃏 ${player.handCardIds.length}/3 • ${job} • 🏁 ${player.lapsCompleted ?? 0}${lock}`);
      ui.border.setStrokeStyle(active ? 6 : 3, active ? 0xffd34d : (PLAYER_COLORS[player.id] ?? 0x444444), 1);
      ui.root.setScale(active ? 1 : 0.94).setAlpha(active ? 1 : 0.84);
    }

    this.turnStatus?.setText(`LƯỢT: ${current.name} • ${this.phaseLabel(internals.match.turn.phase)}`);
  }

  private phaseLabel(phase: MatchState['turn']['phase']): string {
    if (phase === 'BRANCH_CHOICE') return 'CHỌN ĐƯỜNG';
    if (phase === 'PRE_ROLL_ACTION') return 'TRƯỚC KHI ĐỔ';
    if (phase === 'ROLL') return 'ĐỔ XÚC XẮC';
    if (phase === 'MOVE') return 'ĐANG DI CHUYỂN';
    if (phase === 'RESOLVE_TILE') return 'XỬ LÝ Ô';
    if (phase === 'JOB_CHOICE') return 'JOB HUB';
    return String(phase).replaceAll('_', ' ');
  }

  private syncCameraState(): void {
    if (this.overviewMode) return;
    const internals = this.internals();
    const current = internals.currentPlayer();
    if (!current) return;

    if (internals.match.turn.phase === 'BRANCH_CHOICE') {
      const signature = `${internals.match.turn.turnNumber}:${internals.match.turn.revision}:${current.id}:${current.nodeId}`;
      if (signature !== this.branchFocusSignature) {
        this.branchFocusSignature = signature;
        this.frameBranchChoice(current.nodeId, true);
      }
      return;
    }

    if (this.branchFocusSignature) {
      this.branchFocusSignature = '';
      this.focusActiveToken(true);
      return;
    }

    if (this.activePlayerId !== current.id) this.focusActiveToken(true);
  }

  private focusActiveToken(animated: boolean): void {
    const internals = this.internals();
    const current = internals.currentPlayer();
    const token = current ? internals.visuals.get(current.id)?.token : undefined;
    if (!current || !token) return;

    this.overviewMode = false;
    this.overviewButton?.setText('🗺️ TỔNG QUAN');
    this.activePlayerId = current.id;
    this.cameras.main.stopFollow();
    if (!animated) this.cameras.main.centerOn(token.x, token.y);
    this.cameras.main.zoomTo(CANONICAL_PRESENTATION_0561.normalFollowZoom, animated ? 260 : 0, 'Sine.easeInOut');
    this.cameras.main.startFollow(token, true, 0.12, 0.12);
  }

  private frameBranchChoice(nodeId: number, animated: boolean): void {
    if (this.overviewMode) return;
    const origin = getBoardNode(BOARD, nodeId);
    const destinations = getOutgoingEdges(BOARD, nodeId).map((edge) => getBoardNode(BOARD, edge.to));
    if (destinations.length === 0) return;
    const points = [origin, ...destinations];
    const x = points.reduce((sum, node) => sum + node.x, 0) / points.length;
    const y = points.reduce((sum, node) => sum + node.y, 0) / points.length;

    this.cameras.main.stopFollow();
    this.cameras.main.zoomTo(CANONICAL_PRESENTATION_0561.branchDecisionZoom, animated ? 220 : 0, 'Sine.easeInOut');
    if (animated) this.cameras.main.pan(x, y, 220, 'Sine.easeInOut');
    else this.cameras.main.centerOn(x, y);
  }

  private setOverviewMode(enabled: boolean, animated: boolean): void {
    this.overviewMode = enabled;
    this.cameras.main.stopFollow();
    if (enabled) {
      this.overviewButton?.setText('↩ TRỞ LẠI LƯỢT');
      this.cameras.main.zoomTo(CANONICAL_PRESENTATION_0561.overviewZoom, animated ? 260 : 0, 'Sine.easeInOut');
      if (animated) this.cameras.main.pan(CANONICAL_PRESENTATION_0561.worldWidth / 2, CANONICAL_PRESENTATION_0561.worldHeight / 2, 260, 'Sine.easeInOut');
      else this.cameras.main.centerOn(CANONICAL_PRESENTATION_0561.worldWidth / 2, CANONICAL_PRESENTATION_0561.worldHeight / 2);
      return;
    }
    this.focusActiveToken(animated);
  }

  private toggleOverviewFromKeyboard(): void {
    this.setOverviewMode(!this.overviewMode, true);
  }

  private compactEventPresentationIfNeeded(): void {
    const presentation = (this as unknown as { presentation?: PresentationRuntime0561 }).presentation;
    const root = presentation?.active;
    const model = presentation?.currentModel;
    if (!root || !model || this.compactedPresentationRoots.has(root)) return;
    if (model.kind !== 'news' && model.kind !== 'card_draw' && model.kind !== 'card_play') return;

    this.compactedPresentationRoots.add(root);
    this.time.delayedCall(240, () => {
      if (!root.active) return;
      this.tweens.add({
        targets: root,
        scaleX: 0.86,
        scaleY: 0.86,
        y: 382,
        duration: 130,
        ease: 'Sine.easeOut',
      });
    });
  }
}
