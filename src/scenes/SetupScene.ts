import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { browserSession } from '../core/browserSession';
import { configureInitialPlayOrder, configureInitialTargetLaps } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import { faceTextureKey } from '../systems/faces';
import { FaceImageEditor } from '../ui/FaceImageEditor';
import {
  tryLockMobileLandscape07031,
  waitForMobileLandscapeAfterPicker07032,
} from '../ui/mobileLandscape07031';

const EXPRESSIONS: Array<{ id: FaceExpression; emoji: string; label: string }> = [
  { id: 'neutral', emoji: '😐', label: 'Bình thường' },
  { id: 'happy', emoji: '😆', label: 'Vui' },
  { id: 'angry', emoji: '😡', label: 'Quạu' },
];
const PLAYER_ACCENTS = ['#ef4545', '#5b8def', '#f2b84b', '#61b37b'];
const PRESERVE_SETUP_REGISTRY_KEY = 'mememe-preserve-setup';

export class SetupScene extends Phaser.Scene {
  private statusElement?: HTMLParagraphElement;
  private preserveSetup = false;

  constructor() { super('SetupScene'); }

  init(data?: { preserve?: boolean }): void {
    this.preserveSetup = Boolean(data?.preserve);
  }

  create(): void {
    bgmController.playMenu();
    if (!this.preserveSetup) {
      gameSession.reset();
      configureInitialPlayOrder(undefined);
      configureInitialTargetLaps(1);
    }
    this.cameras.main.setBackgroundColor('#f4ead7');
    const frame = this.add.graphics();
    frame.fillStyle(0xfffbf3, 1).fillRoundedRect(45, 30, 1190, 660, 32);
    frame.lineStyle(5, 0x202020, 1).strokeRoundedRect(45, 30, 1190, 660, 32);
    this.add.text(72, 54, MEMEME_BUILD.setupHeader, { fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#202020' });

    const config = browserSession.current;
    const cpuCount = config.cpuSeatIds.length;
    const networkLabel = config.transport === 'online' ? '🌐 ONLINE HOST' : '📡 LOCAL HOST';
    const mode = config.mode === 'host' ? `${networkLabel} • ${config.roomCode}` : cpuCount > 0 ? `${4 - cpuCount} người • ${cpuCount} CPU` : 'HOTSEAT • 4 người';
    this.add.text(72, 91, mode, { fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#756c61' });

    const root = document.createElement('div');
    root.className = 'mememe-setup mememe-setup-069';
    root.innerHTML = `
      <div class="setup-grid">${gameSession.players.map((p) => this.playerCardMarkup(p.id)).join('')}</div>
      <div class="setup-footer"><button id="setup-back-mode" class="setup-back-button" type="button">← CHẾ ĐỘ</button><p class="setup-hint">Chạm ảnh để chọn mặt • Có thể bỏ qua</p><button id="start-game" class="start-game-button" type="button">TIẾP TỤC →</button></div>
      <p id="setup-status" class="setup-status"></p>`;
    const setupDom = this.add.dom(640, 410, root).setOrigin(0.5);
    const node = setupDom.node as HTMLDivElement;
    this.statusElement = node.querySelector<HTMLParagraphElement>('#setup-status') ?? undefined;

    const rulesRoot = document.createElement('div');
    rulesRoot.className = 'mememe-rule-select mememe-rule-select-069';
    rulesRoot.innerHTML = `
      <section class="rule-select-panel">
        <div class="rule-select-kicker">TRƯỚC KHI VÀO TRẬN</div><h1>CHỌN ĐỘ DÀI</h1>
        <div class="rule-option-grid">${[1,2,3].map((laps) => `<button type="button" class="lap-option rule-option${laps === gameSession.targetLaps ? ' selected' : ''}" data-laps="${laps}" aria-pressed="${laps === gameSession.targetLaps}"><span class="rule-option-number">${laps}</span><strong>${laps} LƯỢT</strong><small>${laps} VÒNG / NGƯỜI</small><span class="rule-option-note">${laps === 1 ? 'NHANH' : laps === 2 ? 'CÂN BẰNG' : 'DÀI'}</span></button>`).join('')}</div>
        <div class="rule-actions"><button type="button" class="rule-back">← QUAY LẠI</button><button type="button" class="rule-confirm">BẮT ĐẦU 🎲</button></div>
      </section>`;
    const rulesDom = this.add.dom(640, 360, rulesRoot).setOrigin(0.5).setVisible(false);

    for (const player of gameSession.players) {
      const nameInput = node.querySelector<HTMLInputElement>(`#player-name-${player.id}`);
      nameInput?.addEventListener('input', () => gameSession.setPlayerName(player.id, nameInput.value));
      for (const expression of EXPRESSIONS) {
        const input = node.querySelector<HTMLInputElement>(`#face-${player.id}-${expression.id}`);
        const slotLabel = node.querySelector<HTMLElement>(`#slot-${player.id}-${expression.id}`);
        slotLabel?.addEventListener('pointerdown', () => { void tryLockMobileLandscape07031(false); }, { passive: true });
        input?.addEventListener('change', () => {
          void this.handleFaceSelection(node, player.id, expression.id, input);
        });
        const asset = player.faces[expression.id];
        if (asset) {
          const slot = node.querySelector<HTMLElement>(`#slot-${player.id}-${expression.id}`);
          const preview = node.querySelector<HTMLImageElement>(`#preview-${player.id}-${expression.id}`);
          if (preview) preview.src = asset.dataUrl;
          slot?.classList.add('has-image');
        }
      }
    }

    const lapButtons = [...rulesRoot.querySelectorAll<HTMLButtonElement>('[data-laps]')];
    const selectLaps = (value: number) => {
      gameSession.setTargetLaps(value);
      for (const button of lapButtons) {
        const active = Number(button.dataset.laps) === gameSession.targetLaps;
        button.classList.toggle('selected', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
    };
    for (const button of lapButtons) button.addEventListener('click', () => { sfxController.play('ui_confirm'); selectLaps(Number(button.dataset.laps)); });

    node.querySelector<HTMLButtonElement>('#setup-back-mode')?.addEventListener('click', () => {
      this.captureNames(node);
      sfxController.play('ui_confirm');
      this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, true);
      this.scene.start('LocalLobbyScene');
    });
    node.querySelector<HTMLButtonElement>('#start-game')?.addEventListener('click', () => {
      if (!this.captureNames(node)) return;
      sfxController.play('ui_confirm'); setupDom.setVisible(false); rulesDom.setVisible(true); selectLaps(gameSession.targetLaps);
    });
    rulesRoot.querySelector<HTMLButtonElement>('.rule-back')?.addEventListener('click', () => { sfxController.play('ui_confirm'); rulesDom.setVisible(false); setupDom.setVisible(true); });
    rulesRoot.querySelector<HTMLButtonElement>('.rule-confirm')?.addEventListener('click', () => this.startGame());
  }

  private playerCardMarkup(playerId: number): string {
    const accent = PLAYER_ACCENTS[playerId];
    const isCpu = browserSession.isCpuSeat(playerId);
    const player = gameSession.players[playerId];
    const displayName = this.preserveSetup
      ? player?.name ?? `Player ${playerId + 1}`
      : isCpu ? `CPU ${playerId + 1}` : player?.name ?? `Player ${playerId + 1}`;
    const faceSlots = EXPRESSIONS.map((expression) => `<label class="face-slot" id="slot-${playerId}-${expression.id}" style="--player-accent:${accent}"><span class="face-emoji">${expression.emoji}</span><img id="preview-${playerId}-${expression.id}" alt="${expression.label}" /><span class="face-label">${expression.label}</span><span class="face-action">Chọn ảnh</span><input id="face-${playerId}-${expression.id}" type="file" accept="image/*" /></label>`).join('');
    const roleRow = `<div class="player-role-row-069">${isCpu ? '<span class="cpu-tag-069">CPU</span>' : '<span class="player-role-placeholder-069" aria-hidden="true">CPU</span>'}</div>`;
    return `<section class="player-setup-card" style="--player-accent:${accent}"><div class="player-card-title"><span class="player-number">P${playerId + 1}${isCpu ? ' 🤖' : ''}</span><input id="player-name-${playerId}" class="player-name-input" value="${displayName}" maxlength="18" aria-label="Tên Player ${playerId + 1}" /></div>${roleRow}<div class="face-slots">${faceSlots}</div></section>`;
  }

  private async handleFaceSelection(root: HTMLDivElement, playerId: number, expression: FaceExpression, input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0]; if (!file) return;
    await waitForMobileLandscapeAfterPicker07032();
    const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression}`);
    const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression}`);
    slot?.classList.add('loading'); this.setStatus('Đang chỉnh ảnh…', false);
    try {
      const edited = await FaceImageEditor.open(file); if (!edited) { this.setStatus('', false); return; }
      gameSession.setFace(playerId, expression, { dataUrl: edited.dataUrl, textureKey: faceTextureKey(playerId, expression), originalName: file.name });
      if (preview) preview.src = edited.dataUrl; slot?.classList.add('has-image'); this.setStatus('✓ Đã lưu mặt', false);
    } catch (error) { this.setStatus(error instanceof Error ? error.message : 'Không xử lý được ảnh.', true); }
    finally { slot?.classList.remove('loading'); input.value = ''; }
  }

  private captureNames(root: HTMLDivElement): boolean {
    for (const player of gameSession.players) { const input = root.querySelector<HTMLInputElement>(`#player-name-${player.id}`); if (input) gameSession.setPlayerName(player.id, input.value); }
    if (gameSession.players.some((p) => p.name.trim().length === 0)) { this.setStatus('Nhập tên người chơi.', true); return false; }
    return true;
  }
  private startGame(): void { configureInitialTargetLaps(gameSession.targetLaps); sfxController.play('ui_confirm'); this.scene.start('TurnOrderScene'); }
  private setStatus(message: string, isError: boolean): void { if (!this.statusElement) return; this.statusElement.textContent = message; this.statusElement.classList.toggle('error', isError); }
}
