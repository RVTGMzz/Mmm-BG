import Phaser from 'phaser';
import {
  browserSession,
  generateRoomCode,
  normalizeRoomCode,
} from '../core/browserSession';

export class LocalLobbyScene extends Phaser.Scene {
  constructor() {
    super('LocalLobbyScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#f4ead7');
    this.add.rectangle(640, 360, 1120, 610, 0xfffbf3, 1).setStrokeStyle(5, 0x202020, 1);

    this.add
      .text(80, 55, 'Me³', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '68px',
        color: '#ef4545',
        stroke: '#191919',
        strokeThickness: 8,
      })
      .setOrigin(0, 0);

    this.add.text(228, 73, 'DEMO SESSION • MVP 0.1.15', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#202020',
    });

    this.add.text(228, 109, 'Demo 3 vòng: chơi hotseat trên một máy hoặc mở 2 tab cùng trình duyệt để chia ghế.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#6d655b',
    });

    const root = document.createElement('div');
    root.className = 'mememe-lobby';
    const initialRoom = generateRoomCode();
    root.innerHTML = `
      <div class="lobby-grid">
        <section class="lobby-card solo-card">
          <div class="lobby-icon">🎲</div>
          <h2>SOLO / HOTSEAT</h2>
          <p>Setup đủ 4 người, bấm bắt đầu rồi chơi demo 3 vòng trên một máy.</p>
          <button id="lobby-solo" type="button">CHƠI DEMO SOLO</button>
        </section>

        <section class="lobby-card host-card">
          <div class="lobby-icon">📡</div>
          <h2>HOST 2 TAB</h2>
          <p>Tab này làm host, setup 4 người và quyết định lúc bắt đầu/rematch.</p>
          <label>ROOM CODE
            <input id="host-room" maxlength="8" value="${initialRoom}" />
          </label>
          <button id="lobby-host" type="button">TẠO PHÒNG + SETUP</button>
        </section>

        <section class="lobby-card join-card">
          <div class="lobby-icon">🛰️</div>
          <h2>JOIN 2 TAB</h2>
          <p>Client bỏ qua face setup, chọn P2/P3/P4 rồi chờ host bấm bắt đầu.</p>
          <label>ROOM CODE
            <input id="join-room" maxlength="8" placeholder="VD: ME12AB" />
          </label>
          <label>GHẾ
            <select id="join-seat">
              <option value="1">P2</option>
              <option value="2">P3</option>
              <option value="3">P4</option>
            </select>
          </label>
          <button id="lobby-join" type="button">JOIN DEMO</button>
        </section>
      </div>
      <p id="lobby-status" class="lobby-status">Luật demo tạm: 3 vòng, B$ cao nhất thắng. Hai tab vẫn chỉ chạy local cùng origin, chưa phải online internet.</p>
    `;

    const dom = this.add.dom(640, 408, root).setOrigin(0.5);
    const node = dom.node as HTMLDivElement;
    const status = node.querySelector<HTMLParagraphElement>('#lobby-status');

    const setStatus = (message: string, error = false) => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('error', error);
    };

    node.querySelector<HTMLButtonElement>('#lobby-solo')?.addEventListener('click', () => {
      browserSession.configureSolo();
      this.scene.start('SetupScene');
    });

    node.querySelector<HTMLButtonElement>('#lobby-host')?.addEventListener('click', () => {
      const input = node.querySelector<HTMLInputElement>('#host-room');
      const room = normalizeRoomCode(input?.value ?? '') || generateRoomCode();
      browserSession.configureHost(room);
      setStatus(`Host phòng ${room}. Client có thể mở tab khác và JOIN room này.`);
      this.scene.start('SetupScene');
    });

    node.querySelector<HTMLButtonElement>('#lobby-join')?.addEventListener('click', () => {
      const roomInput = node.querySelector<HTMLInputElement>('#join-room');
      const seatInput = node.querySelector<HTMLSelectElement>('#join-seat');
      const room = normalizeRoomCode(roomInput?.value ?? '');
      const seatId = Number(seatInput?.value ?? 1);

      if (!room) {
        setStatus('Nhập room code từ tab host trước nhé.', true);
        return;
      }

      try {
        browserSession.configureClient(room, seatId);
        this.scene.start('DemoBoardScene');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });
  }
}
