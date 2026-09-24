import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { createBrowserSessionTransport } from '../core/onlineTransport0702';
import { configureInitialPlayOrder } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import {
  TurnOrderClientSession,
  TurnOrderHostSession,
  type TurnOrderEvent,
  type TurnOrderMessage,
  type TurnOrderProfileWire07042,
  type TurnOrderCharacterAssignmentCh02c,
} from '../core/turnOrderSession';
import {
  characterDisplayLabelCh02c,
  createPregameCharacterRngCh02c,
  resolveCharacterAssignmentsCh02c,
  type CharacterRevealAssignmentCh02c,
} from '../core/characterPregameCh02c';
import { faceTextureKey } from '../systems/faces';

const PLAYER_COLORS = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function localD6(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return Math.floor((value[0]! / 0x100000000) * 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

export class TurnOrderScene extends Phaser.Scene {
  private rollButton?: Phaser.GameObjects.Rectangle;
  private rollButtonText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  private detailText?: Phaser.GameObjects.Text;
  private readonly nameTexts = new Map<number, Phaser.GameObjects.Text>();
  private readonly ownerTexts = new Map<number, Phaser.GameObjects.Text>();
  private readonly valueTexts = new Map<number, Phaser.GameObjects.Text>();
  private readonly rankTexts = new Map<number, Phaser.GameObjects.Text>();
  private waitingResolver?: () => void;
  private enterBattleReady = false;
  private remoteClientPromptId?: string;
  private hostOrderSession?: TurnOrderHostSession;
  private clientOrderSession?: TurnOrderClientSession;
  private unsubscribeOrder?: () => void;
  private pendingCharacterAssignmentsCh02c?: CharacterRevealAssignmentCh02c[];

  constructor() {
    super('TurnOrderScene');
  }

  create(): void {
    if (browserSession.current.mode === 'client' && browserSession.current.transport !== 'online') gameSession.reset();

    this.cameras.main.setBackgroundColor('#f4ead7');
    this.add.rectangle(640, 360, 1130, 620, 0xfffbf3, 1).setStrokeStyle(5, 0x202020, 1);
    this.add.text(640, 55, '🎲 ROLL FOR ORDER', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    this.add.text(640, 96, 'Mỗi người tự đổ D6 • điểm cao đi trước • nhóm hòa chỉ đổ lại trong nhóm.', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#6d655b',
    }).setOrigin(0.5);
    this.add.text(640, 124, 'MVP 0.1.45 • REMOTE ROLL FOR ORDER • HOST AUTHORITATIVE', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#795796',
      backgroundColor: '#f1e6f8', padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    gameSession.players.forEach((player, index) => {
      const x = 220 + index * 280;
      const color = PLAYER_COLORS[player.id] ?? 0x999999;
      this.add.rectangle(x, 278, 230, 210, 0xffffff, 1).setStrokeStyle(5, color, 1);
      this.add.circle(x, 218, 26, color, 1).setStrokeStyle(3, 0x202020, 1);
      this.add.text(x, 218, `P${player.id + 1}`, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      const nameText = this.add.text(x, 266, player.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#202020',
        fixedWidth: 205, align: 'center',
      }).setOrigin(0.5);
      const ownerText = this.add.text(x, 299, this.ownerLabel(player.id), {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#746a60',
      }).setOrigin(0.5);
      const value = this.add.text(x, 342, '—', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '41px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      const rank = this.add.text(x, 389, '', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#746a60',
      }).setOrigin(0.5);
      this.nameTexts.set(player.id, nameText);
      this.ownerTexts.set(player.id, ownerText);
      this.valueTexts.set(player.id, value);
      this.rankTexts.set(player.id, rank);
    });

    this.promptText = this.add.text(640, 432, 'Chuẩn bị...', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    this.detailText = this.add.text(640, 468, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#6d655b', align: 'center', fixedWidth: 930,
    }).setOrigin(0.5);

    this.rollButton = this.add.rectangle(640, 548, 300, 72, 0xef4545, 1)
      .setStrokeStyle(4, 0x202020, 1)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.rollButtonText = this.add.text(640, 548, '🎲 ĐỔ XÚC XẮC', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setVisible(false);
    this.rollButton.on('pointerover', () => this.rollButton?.setScale(1.035));
    this.rollButton.on('pointerout', () => this.rollButton?.setScale(1));
    this.rollButton.on('pointerdown', () => this.handlePrimaryButton());

    this.setupRemoteOrderSession();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.closeRemoteOrderSession());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.closeRemoteOrderSession());

    const mode = browserSession.current.mode;
    if (mode === 'solo') void this.runSoloCeremony();
    else if (mode === 'host') void this.runHostCeremony();
    else this.runClientWaitingRoom();
  }

  private setupRemoteOrderSession(): void {
    const config = browserSession.current;
    if (config.mode === 'solo') return;
    if (config.mode === 'host') {
      const transport = createBrowserSessionTransport<TurnOrderMessage>('turn-order', 'host');
      this.hostOrderSession = new TurnOrderHostSession(
        config.roomCode,
        gameSession.players.map((player) => player.name),
        transport,
      );
      this.hostOrderSession.setInitialProfiles07042(
        gameSession.players.map((player) => this.toWireProfile07042(player.id)),
      );
      this.unsubscribeOrder = this.hostOrderSession.subscribe((event) => this.handleHostOrderEvent(event));
      this.hostOrderSession.start();
      return;
    }

    const transport = createBrowserSessionTransport<TurnOrderMessage>('turn-order', config.clientId);
    this.clientOrderSession = new TurnOrderClientSession(
      config.roomCode,
      config.clientId,
      config.seatId,
      transport,
      this.toWireProfile07042(config.seatId),
    );
    this.unsubscribeOrder = this.clientOrderSession.subscribe((event) => this.handleClientOrderEvent(event));
    this.clientOrderSession.start();
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => this.clientOrderSession?.retryJoin(),
    });
  }

  private closeRemoteOrderSession(): void {
    this.unsubscribeOrder?.();
    this.unsubscribeOrder = undefined;
    this.hostOrderSession?.close();
    this.clientOrderSession?.close();
    this.hostOrderSession = undefined;
    this.clientOrderSession = undefined;
    this.waitingResolver = undefined;
    this.remoteClientPromptId = undefined;
  }

  private async runSoloCeremony(): Promise<void> {
    this.pendingCharacterAssignmentsCh02c = this.resolveCharacterAssignmentsCh02c();
    const ids = gameSession.players.map((player) => player.id);
    const order = await this.resolveSoloGroup(ids, 1);
    this.applyFinalOrder(order);
    await this.revealCharactersCh02c(this.pendingCharacterAssignmentsCh02c ?? []);
    this.showFinalOrder(order, false);

    await new Promise<void>((resolve) => {
      this.waitingResolver = resolve;
      if (browserSession.current.cpuSeatIds.length === gameSession.players.length) {
        this.time.delayedCall(1500, resolve);
      }
    });
    this.waitingResolver = undefined;
    this.scene.start('DemoBoardScene');
  }

  private async runHostCeremony(): Promise<void> {
    const session = this.hostOrderSession;
    if (!session) return;

    const expectedRemoteSeats = [1, 2, 3].filter((seatId) => !browserSession.isCpuSeat(seatId));
    this.hidePrimaryButton();

    if (expectedRemoteSeats.length > 0) {
      this.promptText?.setText('📡 CHỜ NGƯỜI CHƠI...');
      this.detailText?.setText(
        `Đang chờ ${expectedRemoteSeats.map((seatId) => `P${seatId + 1}`).join(', ')} hoàn tất avatar và kết nối.`,
      );
      await session.waitForRemoteSeats07042(expectedRemoteSeats);
      await this.pause(420);
    }

    session.lockClaims();
    this.refreshOwnerLabels();
    this.pendingCharacterAssignmentsCh02c = this.resolveCharacterAssignmentsCh02c();

    const remoteSeats = session.claimedSeatIds.map((seatId) => `P${seatId + 1}`).join(', ');
    this.promptText?.setText(expectedRemoteSeats.length > 0 ? '✅ MỌI NGƯỜI ĐÃ KẾT NỐI' : '🤖 CPU ĐÃ SẴN SÀNG');
    this.detailText?.setText(
      remoteSeats
        ? `${remoteSeats} tự điều khiển trên máy của họ. CPU sẽ tự chơi.`
        : 'Không có client remote. CPU sẽ tự đổ và tự đánh như chế độ offline.',
    );
    await this.pause(620);

    const ids = gameSession.players.map((player) => player.id);
    const order = await this.resolveHostGroup(ids, 1);
    this.applyFinalOrder(order);
    session.finalizeOrder(order);
    const characterAssignments = this.pendingCharacterAssignmentsCh02c ?? [];
    session.revealCharactersCh02c(characterAssignments as TurnOrderCharacterAssignmentCh02c[]);
    await this.revealCharactersCh02c(characterAssignments);
    this.showFinalOrder(order, false);

    await new Promise<void>((resolve) => { this.waitingResolver = resolve; });
    this.waitingResolver = undefined;
    session.startMatch();
    this.scene.start('DemoBoardScene');
  }

  private runClientWaitingRoom(): void {
    const config = browserSession.current;
    this.hidePrimaryButton();
    this.promptText?.setText(`📡 P${config.seatId + 1} • ĐANG NỐI HOST...`);
    this.detailText?.setText(`Room ${config.roomCode}. Khi tới lượt P${config.seatId + 1}, nút ĐỔ XÚC XẮC sẽ sáng ngay trên tab này.`);
  }

  private async resolveSoloGroup(ids: number[], depth: number): Promise<number[]> {
    if (ids.length <= 1) return ids;
    const rolls = new Map<number, number>();

    for (const id of ids) {
      const player = gameSession.players[id];
      if (!player) continue;
      this.promptText?.setText(`${player.name} • ĐỔ XÚC XẮC`);
      this.detailText?.setText(depth === 1 ? 'Điểm cao hơn được đi trước.' : 'Hòa điểm! Chỉ nhóm này đổ lại để phân thứ hạng.');
      this.highlight(id);
      const result = await this.waitForSoloRoll(id);
      rolls.set(id, result);
      await this.animateRoll(id, result);
      await this.pause(260);
    }

    return this.resolveTies(ids, rolls, depth, (tied) => this.resolveSoloGroup(tied, depth + 1));
  }

  private async resolveHostGroup(ids: number[], depth: number): Promise<number[]> {
    if (ids.length <= 1) return ids;
    const session = this.hostOrderSession;
    if (!session) return ids;
    const rolls = new Map<number, number>();

    for (const id of ids) {
      const player = gameSession.players[id];
      if (!player) continue;
      const handle = session.beginPrompt(id, depth, depth > 1);
      this.highlight(id);

      let result: number;
      if (handle.remote) {
        this.hidePrimaryButton();
        this.promptText?.setText(`📡 ${player.name} • REMOTE ROLL`);
        this.detailText?.setText(depth === 1
          ? `Đang chờ P${id + 1} bấm xúc xắc trên máy của họ.`
          : `Tie reroll: chỉ P${id + 1} bấm lại trên máy của họ.`);
        result = await handle.result!;
      } else if (browserSession.isCpuSeat(id)) {
        this.hidePrimaryButton();
        this.promptText?.setText(`🤖 ${player.name} • CPU ROLL`);
        this.detailText?.setText('CPU tự đổ xúc xắc.');
        await this.pause(520);
        result = session.resolveHostOwnedPrompt(handle.prompt.promptId);
      } else {
        this.promptText?.setText(`🖥️ ${player.name} • HOST ROLL`);
        this.detailText?.setText(depth === 1
          ? 'Đây là lượt của Host. Bấm xúc xắc để chốt D6.'
          : 'Tie reroll: Host đổ lại.');
        result = await this.waitForHostOwnedRoll(handle.prompt.promptId);
      }

      rolls.set(id, result);
      await this.animateRoll(id, result);
      await this.pause(260);
    }

    return this.resolveTies(ids, rolls, depth, (tied) => this.resolveHostGroup(tied, depth + 1), session);
  }

  private async resolveTies(
    ids: number[],
    rolls: Map<number, number>,
    _depth: number,
    recurse: (tied: number[]) => Promise<number[]>,
    hostSession?: TurnOrderHostSession,
  ): Promise<number[]> {
    const values = [...new Set(rolls.values())].sort((a, b) => b - a);
    const resolved: number[] = [];
    for (const value of values) {
      const tied = ids.filter((id) => rolls.get(id) === value);
      if (tied.length === 1) {
        resolved.push(tied[0]!);
        continue;
      }

      hostSession?.announceTie(tied, value);
      const tiedNames = tied.map((id) => gameSession.players[id]?.name ?? `P${id + 1}`).join(', ');
      this.promptText?.setText(`🤝 HÒA ${value}!`);
      this.detailText?.setText(`${tiedNames} cùng ra ${value}. Chỉ nhóm này đổ lại.`);
      await this.pause(900);
      for (const id of tied) this.valueTexts.get(id)?.setText('↻').setAngle(0);
      resolved.push(...await recurse(tied));
    }
    return resolved;
  }

  private waitForSoloRoll(playerId: number): Promise<number> {
    const isCpu = browserSession.isCpuSeat(playerId);
    this.enterBattleReady = false;
    if (isCpu) {
      this.hidePrimaryButton();
      return new Promise((resolve) => {
        this.time.delayedCall(520, () => resolve(localD6()));
      });
    }

    this.showRollButton('🎲 ĐỔ XÚC XẮC');
    return new Promise((resolve) => {
      this.waitingResolver = () => {
        this.waitingResolver = undefined;
        this.hidePrimaryButton();
        resolve(localD6());
      };
    });
  }

  private waitForHostOwnedRoll(promptId: string): Promise<number> {
    const session = this.hostOrderSession;
    this.enterBattleReady = false;
    this.showRollButton('🎲 HOST ĐỔ XÚC XẮC');
    return new Promise((resolve) => {
      this.waitingResolver = () => {
        this.waitingResolver = undefined;
        this.hidePrimaryButton();
        if (!session) return resolve(1);
        resolve(session.resolveHostOwnedPrompt(promptId));
      };
    });
  }

  private handlePrimaryButton(): void {
    if (this.enterBattleReady) {
      if (browserSession.current.mode === 'client') return;
      sfxController.play('ui_confirm');
      this.waitingResolver?.();
      return;
    }

    if (browserSession.current.mode === 'client') {
      const promptId = this.remoteClientPromptId;
      if (!promptId || !this.clientOrderSession?.canRoll(promptId)) return;
      this.clientOrderSession.submitRoll(promptId);
      this.rollButton?.setFillStyle(0xb8ada1, 1);
      this.rollButtonText?.setText('⏳ HOST ĐANG CHỐT...');
      return;
    }

    this.waitingResolver?.();
  }

  private handleHostOrderEvent(event: TurnOrderEvent): void {
    if (event.kind === 'profile_update') {
      this.applyWireProfile07042(event.profile);
      this.refreshOwnerLabels();
      return;
    }
    if (event.kind === 'profile_sync') {
      event.playerNames.forEach((name, id) => {
        gameSession.setPlayerName(id, name);
        this.nameTexts.get(id)?.setText(gameSession.players[id]?.name ?? name);
      });
      return;
    }
    if (event.kind !== 'status') return;
    if (!this.hostOrderSession?.claimedSeatIds.length) return;
    this.refreshOwnerLabels();
  }

  private handleClientOrderEvent(event: TurnOrderEvent): void {
    if (event.kind === 'status') {
      if (!this.remoteClientPromptId && !this.enterBattleReady) this.detailText?.setText(event.message);
      return;
    }

    if (event.kind === 'profile_sync') {
      event.playerNames.forEach((name, id) => {
        gameSession.setPlayerName(id, name);
        this.nameTexts.get(id)?.setText(gameSession.players[id]?.name ?? name);
      });
      this.refreshOwnerLabels();
      return;
    }

    if (event.kind === 'profile_update') {
      this.applyWireProfile07042(event.profile);
      this.refreshOwnerLabels();
      return;
    }

    if (event.kind === 'prompt') {
      this.remoteClientPromptId = event.prompt.promptId;
      this.enterBattleReady = false;
      this.highlight(event.prompt.playerId);
      const player = gameSession.players[event.prompt.playerId];
      const ownTurn = event.prompt.playerId === browserSession.current.seatId;
      if (ownTurn) {
        this.promptText?.setText(`🎲 TỚI LƯỢT BẠN • ${player?.name ?? `P${event.prompt.playerId + 1}`}`);
        this.detailText?.setText(event.prompt.reroll
          ? 'Bạn đang hòa điểm. Chỉ nhóm hòa đổ lại. Bấm D6 trên tab này.'
          : 'Bấm D6 trên tab này. Kết quả thật sẽ do HOST sinh và gửi lại.');
        this.showRollButton(event.prompt.reroll ? '↻ ĐỔ LẠI D6' : '🎲 ĐỔ XÚC XẮC');
      } else {
        this.hidePrimaryButton();
        this.promptText?.setText(`${player?.name ?? `P${event.prompt.playerId + 1}`} • ĐANG ĐỔ...`);
        this.detailText?.setText(event.prompt.reroll ? 'Đang chờ tie reroll trên tab sở hữu ghế.' : 'Đang chờ HOST/ghế remote khác chốt D6.');
      }
      return;
    }

    if (event.kind === 'result') {
      if (this.remoteClientPromptId === event.promptId) this.remoteClientPromptId = undefined;
      this.hidePrimaryButton();
      void this.animateRoll(event.playerId, event.value);
      return;
    }

    if (event.kind === 'tie_group') {
      const names = event.playerIds.map((id) => gameSession.players[id]?.name ?? `P${id + 1}`).join(', ');
      this.promptText?.setText(`🤝 HÒA ${event.value}!`);
      this.detailText?.setText(`${names} cùng ra ${event.value}. Chỉ nhóm này đổ lại.`);
      this.time.delayedCall(760, () => {
        for (const id of event.playerIds) this.valueTexts.get(id)?.setText('↻').setAngle(0);
      });
      return;
    }

    if (event.kind === 'final_order') {
      this.applyFinalOrder(event.order);
      this.showFinalOrder(event.order, true);
      return;
    }

    if (event.kind === 'character_reveal') {
      void this.revealCharactersCh02c(event.assignments);
      return;
    }

    if (event.kind === 'start_match') {
      this.scene.start('DemoBoardScene');
    }
  }

  private applyFinalOrder(order: number[]): void {
    gameSession.setPlayOrder(order);
    configureInitialPlayOrder(order);
  }

  private showFinalOrder(order: number[], remoteWait: boolean): void {
    this.enterBattleReady = !remoteWait;
    this.remoteClientPromptId = undefined;
    for (const [id, text] of this.valueTexts) {
      text.setAlpha(1).setScale(1).setAngle(0);
      const rank = order.indexOf(id);
      this.rankTexts.get(id)?.setText(rank >= 0 ? `THỨ ${rank + 1}` : '');
    }

    const names = order.map((id, index) => `${index + 1}. ${gameSession.players[id]?.name ?? `P${id + 1}`}`);
    this.promptText?.setText('🏁 THỨ TỰ ĐÃ CHỐT!');
    this.detailText?.setText(remoteWait
      ? `${names.join('   •   ')}\n⏳ Chờ HOST bấm VÀO TRẬN...`
      : names.join('   •   '));

    if (remoteWait) {
      this.hidePrimaryButton();
    } else {
      this.rollButton?.setVisible(true).setFillStyle(0x61b37b, 1);
      this.rollButtonText?.setVisible(true).setText('VÀO TRẬN ▶');
    }
  }

  /** Every participant, including CPU and remote seats, shows the host-authoritative D6 result. */
  private async animateRoll(playerId: number, result: number): Promise<void> {
    const text = this.valueTexts.get(playerId);
    if (!text) return;
    sfxController.play('dice_roll');
    text.setAlpha(1).setScale(1.14).setAngle(-8);

    for (let frame = 0; frame < 7; frame += 1) {
      const face = DICE_FACES[(result + frame * 2 + 1) % DICE_FACES.length] ?? '🎲';
      text.setText(face).setAngle(frame % 2 === 0 ? -9 : 9);
      await this.pause(72);
    }

    text.setText(`🎲 ${result}`).setAngle(0).setScale(1.22);
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  private highlight(playerId: number): void {
    for (const [id, text] of this.valueTexts) {
      text.setAlpha(id === playerId ? 1 : 0.48);
      text.setScale(id === playerId ? 1.08 : 1).setAngle(0);
      this.rankTexts.get(id)?.setText('');
    }
  }

  private toWireProfile07042(playerId: number): TurnOrderProfileWire07042 {
    const player = gameSession.players[playerId];
    const faces: Partial<Record<FaceExpression, string>> = {};
    for (const expression of ['neutral', 'happy', 'angry'] as const) {
      const asset = player?.faces[expression];
      if (asset?.dataUrl) faces[expression] = asset.dataUrl;
    }
    const mode = gameSession.getCharacterSelectionMode(playerId);
    const characterId = gameSession.getCharacterId(playerId);
    const characterChoice = mode === 'random'
      ? { mode: 'random' as const }
      : mode === 'fixed' && characterId
        ? { mode: 'fixed' as const, characterId }
        : undefined;
    return {
      seatId: playerId,
      name: player?.name ?? `Player ${playerId + 1}`,
      faces,
      ...(characterChoice ? { characterChoice } : {}),
    };
  }

  private applyWireProfile07042(profile: TurnOrderProfileWire07042): void {
    if (!Number.isInteger(profile.seatId) || profile.seatId < 0 || profile.seatId > 3) return;
    gameSession.setPlayerName(profile.seatId, profile.name);
    this.nameTexts.get(profile.seatId)?.setText(gameSession.players[profile.seatId]?.name ?? profile.name);
    if (profile.characterChoice?.mode === 'random') {
      gameSession.setCharacterSelection(profile.seatId, 'random');
    } else if (profile.characterChoice?.mode === 'fixed') {
      gameSession.setCharacterSelection(profile.seatId, 'fixed', profile.characterChoice.characterId);
    }
    for (const expression of ['neutral', 'happy', 'angry'] as const) {
      const dataUrl = profile.faces?.[expression];
      if (!dataUrl) continue;
      gameSession.setFace(profile.seatId, expression, {
        dataUrl,
        textureKey: faceTextureKey(profile.seatId, expression),
        originalName: `online-p${profile.seatId + 1}-${expression}.webp`,
      });
    }
  }

  private resolveCharacterAssignmentsCh02c(): CharacterRevealAssignmentCh02c[] {
    for (const player of gameSession.players) {
      if (!gameSession.getCharacterSelectionMode(player.id)) {
        gameSession.setCharacterSelection(player.id, 'random');
      }
    }
    const intents = gameSession.players.map((player) => ({
      playerId: player.id,
      mode: gameSession.getCharacterSelectionMode(player.id) ?? 'random',
      ...(gameSession.getCharacterSelectionMode(player.id) === 'fixed' && player.characterId
        ? { characterId: player.characterId }
        : {}),
    }));
    const salt = `${browserSession.current.roomCode}|${browserSession.current.mode}|character-ch02c`;
    return resolveCharacterAssignmentsCh02c(intents, createPregameCharacterRngCh02c(salt));
  }

  private async revealCharactersCh02c(
    assignments: readonly TurnOrderCharacterAssignmentCh02c[] | readonly CharacterRevealAssignmentCh02c[],
  ): Promise<void> {
    if (!assignments.length) return;
    for (const assignment of assignments) gameSession.setCharacter(assignment.playerId, assignment.characterId);

    const overlay = this.add.container(0, 0).setDepth(1650).setName('character-reveal-ch02c');
    const dimmer = this.add.rectangle(640, 360, 1280, 720, 0x30251f, 0.72);
    const panel = this.add.rectangle(640, 360, 1130, 520, 0xfff9ec, 1).setStrokeStyle(5, 0x5a3c31, 1);
    const title = this.add.text(640, 142, '🎭 NHÂN VẬT ĐÃ CHỐT!', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '38px', fontStyle: 'bold', color: '#3b2a24',
    }).setOrigin(0.5);
    const note = this.add.text(640, 184, 'RANDOM được mở ngay trước khi vào trận.', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#776458',
    }).setOrigin(0.5);
    overlay.add([dimmer, panel, title, note]);

    const revealTexts: Array<{ text: Phaser.GameObjects.Text; assignment: TurnOrderCharacterAssignmentCh02c | CharacterRevealAssignmentCh02c }> = [];
    assignments.forEach((assignment, index) => {
      const x = 220 + index * 280;
      const player = gameSession.players[assignment.playerId];
      const card = this.add.rectangle(x, 365, 235, 275, assignment.source === 'random' ? 0xeee5ff : 0xffffff, 1)
        .setStrokeStyle(4, assignment.source === 'random' ? 0x9c78c4 : PLAYER_COLORS[assignment.playerId] ?? 0x8c6e5d, 1);
      const seat = this.add.text(x, 265, `P${assignment.playerId + 1} · ${player?.name ?? ''}`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#514138',
        fixedWidth: 210, align: 'center',
      }).setOrigin(0.5);
      const value = this.add.text(x, 365,
        assignment.source === 'random' ? '?' : characterDisplayLabelCh02c(assignment.characterId), {
          fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
          fontSize: assignment.source === 'random' ? '66px' : '25px', fontStyle: 'bold', color: '#2f2723',
          align: 'center', fixedWidth: 210, wordWrap: { width: 205 },
        }).setOrigin(0.5);
      const source = this.add.text(x, 465, assignment.source === 'random' ? '🎲 RANDOM' : 'ĐÃ CHỌN', {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#7a685c',
      }).setOrigin(0.5);
      overlay.add([card, seat, value, source]);
      revealTexts.push({ text: value, assignment });
    });

    await this.pause(420);
    for (const item of revealTexts.filter((entry) => entry.assignment.source === 'random')) {
      sfxController.play('ui_confirm');
      const isSecret = item.assignment.characterId === 'secret-baby';
      item.text.setFontSize(isSecret ? 25 : 26).setColor(isSecret ? '#b15b00' : '#2f2723').setText(
        isSecret ? '✨ SECRET! ✨\nEM BÉ BÁ ĐẠO 🍼' : characterDisplayLabelCh02c(item.assignment.characterId),
      );
      await this.pause(isSecret ? 820 : 360);
    }
    await this.pause(760);
    overlay.destroy(true);
  }

  private ownerLabel(playerId: number): string {
    const config = browserSession.current;
    if (config.mode === 'solo') return browserSession.isCpuSeat(playerId) ? '🤖 CPU' : '👤 PLAYER';
    if (config.mode === 'client') return playerId === config.seatId ? '📡 BẠN • REMOTE' : '⏳ HOST / GHẾ KHÁC';
    if (playerId === 0) return '🖥️ HOST';
    return this.hostOrderSession?.hasRemoteSeat(playerId) ? '📡 REMOTE' : '🖥️ HOST';
  }

  private refreshOwnerLabels(): void {
    for (const player of gameSession.players) this.ownerTexts.get(player.id)?.setText(this.ownerLabel(player.id));
  }

  private showRollButton(label: string): void {
    this.rollButton?.setVisible(true).setFillStyle(0xef4545, 1).setScale(1);
    this.rollButtonText?.setVisible(true).setText(label);
  }

  private hidePrimaryButton(): void {
    this.rollButton?.setVisible(false).setScale(1);
    this.rollButtonText?.setVisible(false);
  }

  private pause(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
