import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import { configureInitialPlayOrder, configureInitialTargetLaps } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import { faceTextureKey } from '../systems/faces';
import { FaceImageEditor } from '../ui/FaceImageEditor';

const EXPRESSIONS: Array<{ id: FaceExpression; emoji: string; label: string }> = [
  { id: 'neutral', emoji: '😐', label: 'Bình thường' },
  { id: 'happy', emoji: '😆', label: 'Vui / đắc ý' },
  { id: 'angry', emoji: '😡', label: 'Quạu / mếu' },
];

const PLAYER_ACCENTS = ['#ef4545', '#5b8def', '#f2b84b', '#61b37b'];

// PLAYTEST MVP 0.1.66 was the previous unified-flow baseline. 0.1.67 keeps
// its authoritative targetLaps state and only promotes match length into a
// dedicated pregame rules step.
export class SetupScene extends Phaser.Scene {
  private statusElement?: HTMLParagraphElement;

  constructor() {
    super('SetupScene');
  }

  create(): void {
    bgmController.playMenu();
    gameSession.reset();
    configureInitialPlayOrder(undefined);
    configureInitialTargetLaps(1);
    this.cameras.main.setBackgroundColor('#f4ead7');

    this.add.rectangle(640, 360, 1190, 660, 0xfffbf3, 1).setStrokeStyle(5, 0x202020, 1);

    this.add
      .text(58, 30, 'Me³', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '62px',
        color: '#ef4545',
        stroke: '#191919',
        strokeThickness: 8,
      })
      .setOrigin(0, 0);

    this.add.text(190, 47, 'FACE SETUP • PLAYTEST MVP 0.1.67', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#202020',
    });

    const config = browserSession.current;
    const cpuCount = config.cpuSeatIds.length;
    const mode = config.mode === 'host'
      ? `HOST LOCAL • ROOM ${config.roomCode} • Remote Roll + Remote Job Dice`
      : cpuCount > 0
        ? `SOLO TEST • ${4 - cpuCount} người + ${cpuCount} CPU 🤖`
        : '4 người HOTSEAT → đặt tên → chọn luật chơi → Roll For Order';
    this.add.text(190, 79, mode, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#6d655b',
    });

    const root = document.createElement('div');
    root.className = 'mememe-setup';
    root.innerHTML = `
      <div class="setup-grid">
        ${gameSession.players.map((player) => this.playerCardMarkup(player.id)).join('')}
      </div>
      <div class="setup-footer">
        <div>
          <p class="setup-hint"><strong>Ảnh mặt là tùy chọn.</strong> Chạm ảnh để crop, kéo vị trí, zoom/pinch và xoay trước khi dùng.</p>
          <p class="setup-privacy">🔒 Ảnh gốc chỉ tồn tại trong trình duyệt lúc chỉnh. Khi xác nhận, game tạo sticker runtime 320×320 và ưu tiên nén WebP; không upload ảnh lên server.</p>
        </div>
        <button id="start-game" class="start-game-button" type="button">TIẾP TỤC →</button>
      </div>
      <p id="setup-status" class="setup-status">0.1.67: Face Setup → Chọn luật chơi → Roll For Order.</p>
    `;

    const setupDom = this.add.dom(640, 405, root).setOrigin(0.5);
    const node = setupDom.node as HTMLDivElement;
    this.statusElement = node.querySelector<HTMLParagraphElement>('#setup-status') ?? undefined;

    const rulesRoot = document.createElement('div');
    rulesRoot.className = 'mememe-rule-select';
    rulesRoot.innerHTML = `
      <section class="rule-select-panel">
        <div class="rule-select-kicker">🎮 TRƯỚC KHI VÀO TRẬN</div>
        <h1>CHỌN LUẬT CHƠI</h1>
        <p class="rule-select-copy">Chọn độ dài trận. Mỗi người phải hoàn thành đủ số vòng đã chọn; khi cả bàn hoàn thành, game chốt B$ và xếp hạng.</p>
        <div class="rule-option-grid">
          ${[1, 2, 3].map((laps) => `
            <button type="button" class="lap-option rule-option${laps === 1 ? ' selected' : ''}" data-laps="${laps}" aria-pressed="${laps === 1 ? 'true' : 'false'}">
              <span class="rule-option-number">${laps}</span>
              <strong>${laps} LƯỢT</strong>
              <small>${laps} VÒNG / NGƯỜI</small>
              <span class="rule-option-note">${laps === 1 ? 'Nhanh • phù hợp test' : laps === 2 ? 'Vừa • nhiều biến cố hơn' : 'Dài • đầy đủ hành trình'}</span>
            </button>`).join('')}
        </div>
        <div class="rule-selected-summary">Đang chọn: <strong data-rule-summary>1 LƯỢT • 1 VÒNG / NGƯỜI</strong></div>
        <div class="rule-actions">
          <button type="button" class="rule-back">← QUAY LẠI</button>
          <button type="button" class="rule-confirm">BẮT ĐẦU • ROLL FOR ORDER 🎲</button>
        </div>
      </section>
    `;
    const rulesDom = this.add.dom(640, 360, rulesRoot).setOrigin(0.5).setVisible(false);

    for (const player of gameSession.players) {
      const nameInput = node.querySelector<HTMLInputElement>(`#player-name-${player.id}`);
      nameInput?.addEventListener('input', () => {
        gameSession.setPlayerName(player.id, nameInput.value);
        this.refreshStatus();
      });

      for (const expression of EXPRESSIONS) {
        const input = node.querySelector<HTMLInputElement>(`#face-${player.id}-${expression.id}`);
        input?.addEventListener('change', () => {
          void this.handleFaceSelection(node, player.id, expression.id, input);
        });
      }
    }

    const lapButtons = [...rulesRoot.querySelectorAll<HTMLButtonElement>('[data-laps]')];
    const ruleSummary = rulesRoot.querySelector<HTMLElement>('[data-rule-summary]');
    const selectLaps = (value: number) => {
      gameSession.setTargetLaps(value);
      for (const button of lapButtons) {
        const active = Number(button.dataset.laps) === gameSession.targetLaps;
        button.classList.toggle('selected', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      if (ruleSummary) {
        ruleSummary.textContent = `${gameSession.targetLaps} LƯỢT • ${gameSession.targetLaps} VÒNG / NGƯỜI`;
      }
    };
    for (const button of lapButtons) {
      button.addEventListener('click', () => {
        sfxController.play('ui_confirm');
        selectLaps(Number(button.dataset.laps));
      });
    }

    const startButton = node.querySelector<HTMLButtonElement>('#start-game');
    startButton?.addEventListener('click', () => {
      if (!this.captureNames(node)) return;
      sfxController.play('ui_confirm');
      setupDom.setVisible(false);
      rulesDom.setVisible(true);
      selectLaps(gameSession.targetLaps);
    });

    rulesRoot.querySelector<HTMLButtonElement>('.rule-back')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      rulesDom.setVisible(false);
      setupDom.setVisible(true);
      this.refreshStatus();
    });

    rulesRoot.querySelector<HTMLButtonElement>('.rule-confirm')?.addEventListener('click', () => {
      this.startGame();
    });

    this.refreshStatus();
  }

  private playerCardMarkup(playerId: number): string {
    const accent = PLAYER_ACCENTS[playerId];
    const isCpu = browserSession.isCpuSeat(playerId);
    const faceSlots = EXPRESSIONS.map(
      (expression) => `
        <label class="face-slot" id="slot-${playerId}-${expression.id}" style="--player-accent:${accent}">
          <span class="face-emoji">${expression.emoji}</span>
          <img id="preview-${playerId}-${expression.id}" alt="${expression.label}" />
          <span class="face-label">${expression.label}</span>
          <span class="face-action">+ Ảnh / chỉnh</span>
          <input id="face-${playerId}-${expression.id}" type="file" accept="image/*" />
        </label>
      `,
    ).join('');

    return `
      <section class="player-setup-card" style="--player-accent:${accent}">
        <div class="player-card-title">
          <span class="player-number">P${playerId + 1}${isCpu ? ' 🤖' : ''}</span>
          <input id="player-name-${playerId}" class="player-name-input" value="${isCpu ? `CPU ${playerId + 1}` : `Player ${playerId + 1}`}" maxlength="18" aria-label="Tên Player ${playerId + 1}" />
        </div>
        ${isCpu ? '<div style="font-size:11px;font-weight:800;color:#795796;margin:-2px 0 7px;">CPU TEST • tự điều khiển lượt</div>' : ''}
        <div class="face-slots">${faceSlots}</div>
      </section>
    `;
  }

  private async handleFaceSelection(
    root: HTMLDivElement,
    playerId: number,
    expression: FaceExpression,
    input: HTMLInputElement,
  ): Promise<void> {
    const file = input.files?.[0];
    if (!file) return;

    const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression}`);
    const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression}`);
    slot?.classList.add('loading');
    this.setStatus(`Đang mở trình chỉnh ảnh Player ${playerId + 1}...`, false);

    try {
      const edited = await FaceImageEditor.open(file);
      if (!edited) {
        this.refreshStatus();
        return;
      }

      gameSession.setFace(playerId, expression, {
        dataUrl: edited.dataUrl,
        textureKey: faceTextureKey(playerId, expression),
        originalName: file.name,
      });

      if (preview) preview.src = edited.dataUrl;
      slot?.classList.add('has-image');
      const approxKb = Math.max(1, Math.round((edited.dataUrl.length * 0.75) / 1024));
      this.setStatus(`✓ Sticker P${playerId + 1} ${expression}: 320×320 • ~${approxKb} KB runtime.`, false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không xử lý được ảnh.';
      this.setStatus(message, true);
    } finally {
      slot?.classList.remove('loading');
      input.value = '';
    }
  }

  private captureNames(root: HTMLDivElement): boolean {
    for (const player of gameSession.players) {
      const nameInput = root.querySelector<HTMLInputElement>(`#player-name-${player.id}`);
      if (nameInput) gameSession.setPlayerName(player.id, nameInput.value);
    }

    const hasInvalidName = gameSession.players.some((player) => player.name.trim().length === 0);
    if (hasInvalidName) {
      this.setStatus('Mỗi người chơi cần có tên trước khi chọn luật chơi.', true);
      return false;
    }
    return true;
  }

  private startGame(): void {
    configureInitialTargetLaps(gameSession.targetLaps);
    sfxController.play('ui_confirm');
    this.scene.start('TurnOrderScene');
  }

  private refreshStatus(): void {
    const neutralCount = gameSession.players.filter((player) => Boolean(player.faces.neutral)).length;
    const expressionCount = gameSession.players.reduce((total, player) => total + Object.keys(player.faces).length, 0);
    const cpuCount = browserSession.current.cpuSeatIds.length;

    if (expressionCount === 0) {
      this.setStatus(
        browserSession.current.mode === 'host'
          ? 'Sẵn sàng. Bước tiếp theo chọn luật chơi; sau đó Host chờ tab JOIN cho Remote Roll và Remote Job Dice.'
          : cpuCount > 0
            ? `Sẵn sàng • ${cpuCount} CPU test sẽ tự chơi. Có thể bỏ qua ảnh; bước tiếp theo chọn luật chơi.`
            : 'Sẵn sàng. Bước tiếp theo: chọn trận 1 / 2 / 3 lượt rồi Roll For Order.',
        false,
      );
      return;
    }

    this.setStatus(`Đã có mặt 😐 cho ${neutralCount}/4 • tổng ${expressionCount}/12 ảnh • CPU ${cpuCount}/4 • tiếp theo chọn luật chơi.`, false);
  }

  private setStatus(message: string, isError: boolean): void {
    if (!this.statusElement) return;
    this.statusElement.textContent = message;
    this.statusElement.classList.toggle('error', isError);
  }
}
