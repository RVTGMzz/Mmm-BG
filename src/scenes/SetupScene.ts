import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import { gameSession, type FaceExpression } from '../core/session';
import { buildFaceSticker, faceTextureKey } from '../systems/faces';

const EXPRESSIONS: Array<{ id: FaceExpression; emoji: string; label: string }> = [
  { id: 'neutral', emoji: '😐', label: 'Bình thường' },
  { id: 'happy', emoji: '😆', label: 'Vui / đắc ý' },
  { id: 'angry', emoji: '😡', label: 'Quạu / mếu' },
];

const PLAYER_ACCENTS = ['#ef4545', '#5b8def', '#f2b84b', '#61b37b'];

export class SetupScene extends Phaser.Scene {
  private statusElement?: HTMLParagraphElement;

  constructor() {
    super('SetupScene');
  }

  create(): void {
    gameSession.reset();
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

    this.add.text(190, 47, 'FACE SETUP • DEMO MVP 0.1.15', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#202020',
    });

    const mode = browserSession.current.mode === 'host'
      ? `HOST LOCAL • ROOM ${browserSession.current.roomCode}`
      : '4 người chơi → tên → biểu cảm → vào demo match 3 vòng';
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
          <p class="setup-hint"><strong>Ảnh 😐 là bắt buộc.</strong> 😆 và 😡 có thể thêm ngay; nếu để trống MVP sẽ dùng mặt 😐 làm fallback.</p>
          <p class="setup-privacy">🔒 Ảnh chỉ được xử lý trong trình duyệt và giữ trong bộ nhớ của phiên chơi này. MVP chưa upload ảnh lên server.</p>
        </div>
        <button id="start-game" class="start-game-button" type="button">VÀO DEMO MATCH 🎲</button>
      </div>
      <p id="setup-status" class="setup-status">Thêm ít nhất một ảnh mặt thường cho cả 4 người.</p>
    `;

    const dom = this.add.dom(640, 405, root).setOrigin(0.5);
    const node = dom.node as HTMLDivElement;
    this.statusElement = node.querySelector<HTMLParagraphElement>('#setup-status') ?? undefined;

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

    const startButton = node.querySelector<HTMLButtonElement>('#start-game');
    startButton?.addEventListener('click', () => {
      this.startGame(node);
    });

    this.refreshStatus();
  }

  private playerCardMarkup(playerId: number): string {
    const accent = PLAYER_ACCENTS[playerId];
    const faceSlots = EXPRESSIONS.map(
      (expression) => `
        <label class="face-slot" id="slot-${playerId}-${expression.id}" style="--player-accent:${accent}">
          <span class="face-emoji">${expression.emoji}</span>
          <img id="preview-${playerId}-${expression.id}" alt="${expression.label}" />
          <span class="face-label">${expression.label}</span>
          <span class="face-action">+ Ảnh</span>
          <input id="face-${playerId}-${expression.id}" type="file" accept="image/*" />
        </label>
      `,
    ).join('');

    return `
      <section class="player-setup-card" style="--player-accent:${accent}">
        <div class="player-card-title">
          <span class="player-number">P${playerId + 1}</span>
          <input id="player-name-${playerId}" class="player-name-input" value="Player ${playerId + 1}" maxlength="18" aria-label="Tên Player ${playerId + 1}" />
        </div>
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
    this.setStatus(`Đang cắt ảnh Player ${playerId + 1} thành sticker...`, false);

    try {
      const dataUrl = await buildFaceSticker(file);
      gameSession.setFace(playerId, expression, {
        dataUrl,
        textureKey: faceTextureKey(playerId, expression),
        originalName: file.name,
      });

      if (preview) preview.src = dataUrl;
      slot?.classList.add('has-image');
      this.refreshStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không xử lý được ảnh.';
      this.setStatus(message, true);
    } finally {
      slot?.classList.remove('loading');
      input.value = '';
    }
  }

  private startGame(root: HTMLDivElement): void {
    for (const player of gameSession.players) {
      const nameInput = root.querySelector<HTMLInputElement>(`#player-name-${player.id}`);
      if (nameInput) gameSession.setPlayerName(player.id, nameInput.value);
    }

    const missingNeutral = gameSession.players.filter((player) => !player.faces.neutral);
    if (missingNeutral.length > 0) {
      this.setStatus(
        `Còn thiếu mặt 😐 của ${missingNeutral.map((player) => `P${player.id + 1}`).join(', ')}.`,
        true,
      );
      return;
    }

    if (!gameSession.isReady()) {
      this.setStatus('Hãy kiểm tra lại tên và ảnh người chơi.', true);
      return;
    }

    this.scene.start('DemoBoardScene');
  }

  private refreshStatus(): void {
    const neutralCount = gameSession.players.filter((player) => Boolean(player.faces.neutral)).length;
    const expressionCount = gameSession.players.reduce(
      (total, player) => total + Object.keys(player.faces).length,
      0,
    );

    if (neutralCount === 4) {
      this.setStatus(`Sẵn sàng! Đã có ${expressionCount}/12 biểu cảm. Có thể vào demo match.`, false);
      return;
    }

    this.setStatus(`Đã có mặt 😐 cho ${neutralCount}/4 người • tổng ${expressionCount}/12 ảnh.`, false);
  }

  private setStatus(message: string, isError: boolean): void {
    if (!this.statusElement) return;
    this.statusElement.textContent = message;
    this.statusElement.classList.toggle('error', isError);
  }
}
