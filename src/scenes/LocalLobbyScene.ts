import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { browserSession, generateRoomCode, normalizeRoomCode } from '../core/browserSession';

const PRESERVE_SETUP_REGISTRY_KEY = 'mememe-preserve-setup';

function cpuSeatsForMode(mode: string): number[] {
  if (mode === '1p3cpu') return [1, 2, 3];
  if (mode === '2p2cpu') return [2, 3];
  if (mode === '4cpu') return [0, 1, 2, 3];
  return [];
}

export class LocalLobbyScene extends Phaser.Scene {
  constructor() { super('LocalLobbyScene'); }

  create(): void {
    bgmController.playMenu();
    this.cameras.main.setBackgroundColor('#f4ead7');
    const frame = this.add.graphics();
    frame.fillStyle(0xfffbf3, 1).fillRoundedRect(105, 55, 1070, 610, 32);
    frame.lineStyle(5, 0x202020, 1).strokeRoundedRect(105, 55, 1070, 610, 32);

    const root = document.createElement('div');
    root.className = 'mememe-lobby mememe-lobby-069';
    const initialRoom = generateRoomCode();
    const broadcastReady = typeof BroadcastChannel !== 'undefined';
    root.innerHTML = `
      <header class="lobby-head-069">
        <h1>CHỌN CÁCH CHƠI</h1>
        <span>${MEMEME_BUILD.lobbyHeader}</span>
      </header>
      <div class="lobby-grid">
        <section class="lobby-card solo-card">
          <div class="lobby-icon">🎮</div><h2>CHƠI NHANH</h2><p>Một máy • người + CPU</p>
          <label>CHẾ ĐỘ<select id="solo-mode"><option value="1p3cpu" selected>1 người + 3 CPU</option><option value="2p2cpu">2 người + 2 CPU</option><option value="hotseat">4 người HOTSEAT</option><option value="4cpu">4 CPU AUTOPLAY</option></select></label>
          <button id="lobby-solo" type="button">CHƠI</button>
        </section>
        <section class="lobby-card host-card">
          <div class="lobby-icon">📡</div><h2>TẠO PHÒNG</h2><p>Host local • 2 tab</p>
          <label>MÃ PHÒNG<input id="host-room" maxlength="8" value="${initialRoom}" /></label>
          <button id="lobby-host" type="button" ${broadcastReady ? '' : 'disabled'}>TẠO PHÒNG</button>
        </section>
        <section class="lobby-card join-card">
          <div class="lobby-icon">🛰️</div><h2>VÀO PHÒNG</h2><p>Nhập code • chọn ghế</p>
          <label>MÃ PHÒNG<input id="join-room" maxlength="8" placeholder="ME12AB" /></label>
          <label>GHẾ<select id="join-seat"><option value="1">P2</option><option value="2">P3</option><option value="3">P4</option></select></label>
          <button id="lobby-join" type="button" ${broadcastReady ? '' : 'disabled'}>VÀO PHÒNG</button>
        </section>
      </div>
      <p id="lobby-status" class="lobby-status">${broadcastReady ? '' : '⚠️ 2-tab không khả dụng trên trình duyệt này.'}</p>`;

    const dom = this.add.dom(640, 370, root).setOrigin(0.5);
    const node = dom.node as HTMLDivElement;
    const status = node.querySelector<HTMLParagraphElement>('#lobby-status');
    const setStatus = (message: string, error = false) => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('error', error);
    };
    const consumePreserveSetup = () => {
      const preserve = this.registry.get(PRESERVE_SETUP_REGISTRY_KEY) === true;
      this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, false);
      return preserve;
    };

    node.querySelector<HTMLButtonElement>('#lobby-solo')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      const mode = node.querySelector<HTMLSelectElement>('#solo-mode')?.value ?? '1p3cpu';
      browserSession.configureSolo(cpuSeatsForMode(mode));
      this.scene.start('SetupScene', { preserve: consumePreserveSetup() });
    });
    node.querySelector<HTMLButtonElement>('#lobby-host')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      if (!broadcastReady) return setStatus('2-tab chưa khả dụng.', true);
      const input = node.querySelector<HTMLInputElement>('#host-room');
      const room = normalizeRoomCode(input?.value ?? '') || generateRoomCode();
      browserSession.configureHost(room);
      setStatus(`Phòng ${room} đã sẵn sàng.`);
      this.scene.start('SetupScene', { preserve: consumePreserveSetup() });
    });
    node.querySelector<HTMLButtonElement>('#lobby-join')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      if (!broadcastReady) return setStatus('2-tab chưa khả dụng.', true);
      const room = normalizeRoomCode(node.querySelector<HTMLInputElement>('#join-room')?.value ?? '');
      const seatId = Number(node.querySelector<HTMLSelectElement>('#join-seat')?.value ?? 1);
      if (!room) return setStatus('Nhập mã phòng.', true);
      try {
        browserSession.configureClient(room, seatId);
        this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, false);
        this.scene.start('TurnOrderScene');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });
  }
}
