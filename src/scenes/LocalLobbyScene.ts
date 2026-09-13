import Phaser from 'phaser';
import {
  browserSession,
  generateRoomCode,
  normalizeRoomCode,
} from '../core/browserSession';

function cpuSeatsForMode(mode: string): number[] {
  if (mode === '1p3cpu') return [1, 2, 3];
  if (mode === '2p2cpu') return [2, 3];
  if (mode === '4cpu') return [0, 1, 2, 3];
  return [];
}

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

    this.add.text(228, 73, 'FIRST PLAYTEST • MVP 0.1.16.2', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#202020',
    });

    this.add.text(228, 109, 'Chơi hotseat, test một mình với CPU, hoặc mở 2 tab local.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#6d655b',
    });

    const root = document.createElement('div');
    root.className = 'mememe-lobby';
    const initialRoom = generateRoomCode();
    const broadcastReady = typeof BroadcastChannel !== 'undefined';
    root.innerHTML = `
      <div class="lobby-grid">
        <section class="lobby-card solo-card">
          <div class="lobby-icon">🤖</div>
          <h2>SOLO / CPU TEST</h2>
          <p>Test một mình mà không phải tự bấm cả 4 ghế. CPU này chỉ là bot test, chưa phải AI final.</p>
          <label>CHẾ ĐỘ
            <select id="solo-mode">
              <option value="1p3cpu" selected>1 người + 3 CPU</option>
              <option value="2p2cpu">2 người + 2 CPU</option>
              <option value="hotseat">4 người HOTSEAT</option>
              <option value="4cpu">4 CPU AUTOPLAY</option>
            </select>
          </label>
          <button id="lobby-solo" type="button">SETUP + CHƠI</button>
        </section>

        <section class="lobby-card host-card">
          <div class="lobby-icon">📡</div>
          <h2>HOST 2 TAB</h2>
          <p>Tab này làm host, setup 4 người và quyết định lúc bắt đầu/rematch.</p>
          <label>ROOM CODE
            <input id="host-room" maxlength="8" value="${initialRoom}" />
          </label>
          <button id="lobby-host" type="button" ${broadcastReady ? '' : 'disabled'}>TẠO PHÒNG + SETUP</button>
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
          <button id="lobby-join" type="button" ${broadcastReady ? '' : 'disabled'}>JOIN DEMO</button>
        </section>
      </div>
      <div style="margin-top:12px;padding:10px 14px;border:2px solid #202020;border-radius:14px;background:#fff4d6;font-size:12px;line-height:1.45;font-weight:700;">
        🎯 Test một mình: chọn 1 người + 3 CPU. Muốn stress-test lượt/nhánh/card thì chọn 4 CPU AUTOPLAY rồi ngồi xem cả trận tự chạy.
      </div>
      <p id="lobby-status" class="lobby-status">${broadcastReady
        ? '✅ CPU test + 2-tab local sẵn sàng. Ảnh mặt vẫn là tùy chọn.'
        : '⚠️ Không có BroadcastChannel: CPU/HOTSEAT vẫn chơi bình thường, chỉ tắt 2-tab.'}</p>
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
      const mode = node.querySelector<HTMLSelectElement>('#solo-mode')?.value ?? '1p3cpu';
      const cpuSeatIds = cpuSeatsForMode(mode);
      browserSession.configureSolo(cpuSeatIds);
      this.scene.start('SetupScene');
    });

    node.querySelector<HTMLButtonElement>('#lobby-host')?.addEventListener('click', () => {
      if (!broadcastReady) {
        setStatus('Trình duyệt chưa hỗ trợ 2-tab local. Hãy dùng SOLO / CPU TEST hoặc Chrome/Edge/Firefox mới.', true);
        return;
      }
      const input = node.querySelector<HTMLInputElement>('#host-room');
      const room = normalizeRoomCode(input?.value ?? '') || generateRoomCode();
      browserSession.configureHost(room);
      setStatus(`Host phòng ${room}. Client có thể mở tab khác và JOIN room này.`);
      this.scene.start('SetupScene');
    });

    node.querySelector<HTMLButtonElement>('#lobby-join')?.addEventListener('click', () => {
      if (!broadcastReady) {
        setStatus('Trình duyệt chưa hỗ trợ 2-tab local.', true);
        return;
      }
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
