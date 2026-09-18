import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { browserSession, generateRoomCode, normalizeRoomCode } from '../core/browserSession';
import { MEMEME_ONLINE_BASE_URL } from '../core/onlineTransport0702';
import {
  createOnlineRoom0703,
  joinOnlineRoom0703,
} from '../core/onlineLobby0703';

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
          <div class="lobby-icon">🖥️</div><h2>LOCAL 2-TAB</h2><p>Cùng máy • test nhiều tab</p>
          <label>MÃ PHÒNG<input id="local-room" maxlength="8" value="${initialRoom}" /></label>
          <label>GHẾ KHI JOIN<select id="local-seat"><option value="1">P2</option><option value="2">P3</option><option value="3">P4</option></select></label>
          <div class="lobby-actions"><button id="lobby-local-host" type="button" ${broadcastReady ? '' : 'disabled'}>TẠO LOCAL</button><button id="lobby-local-join" type="button" ${broadcastReady ? '' : 'disabled'}>VÀO</button></div>
        </section>
        <section class="lobby-card join-card online-card">
          <div class="lobby-icon">🌐</div><h2>ONLINE</h2><p>Khác máy • qua Internet</p>
          <label>TÊN CỦA BẠN<input id="online-name" maxlength="18" value="Player" /></label>
          <label>MÃ PHÒNG<input id="online-room" maxlength="8" placeholder="ME12AB" /></label>
          <div class="online-host-options">
            <label><input id="online-camera" type="checkbox" /> 📷 Cho phép Camera Call</label>
            <label><input id="online-voice" type="checkbox" /> 🎤 Cho phép Voice Chat</label>
            <label><input id="online-cpu" type="checkbox" checked /> 🤖 Tự lấp ghế trống bằng CPU</label>
          </div>
          <div class="lobby-actions"><button id="lobby-online-host" type="button">TẠO ONLINE</button><button id="lobby-online-join" type="button">VÀO</button></div>
        </section>
      </div>
      <p id="lobby-status" class="lobby-status">${broadcastReady ? '' : '⚠️ Local 2-tab không khả dụng trên trình duyệt này.'}</p>`;

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

    node.querySelector<HTMLButtonElement>('#lobby-local-host')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      if (!broadcastReady) return setStatus('Local 2-tab chưa khả dụng.', true);
      const room = normalizeRoomCode(node.querySelector<HTMLInputElement>('#local-room')?.value ?? '') || generateRoomCode();
      browserSession.configureHost(room);
      setStatus(`Local ${room} đã sẵn sàng.`);
      this.scene.start('SetupScene', { preserve: consumePreserveSetup() });
    });

    node.querySelector<HTMLButtonElement>('#lobby-local-join')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      if (!broadcastReady) return setStatus('Local 2-tab chưa khả dụng.', true);
      const room = normalizeRoomCode(node.querySelector<HTMLInputElement>('#local-room')?.value ?? '');
      const seatId = Number(node.querySelector<HTMLSelectElement>('#local-seat')?.value ?? 1);
      if (!room) return setStatus('Nhập mã phòng local.', true);
      try {
        browserSession.configureClient(room, seatId);
        this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, false);
        this.scene.start('TurnOrderScene');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });

    node.querySelector<HTMLButtonElement>('#lobby-online-host')?.addEventListener('click', async () => {
      sfxController.play('ui_confirm');
      const button = node.querySelector<HTMLButtonElement>('#lobby-online-host');
      if (button) button.disabled = true;
      setStatus('🌐 Đang tạo phòng online...');
      try {
        const hostName = node.querySelector<HTMLInputElement>('#online-name')?.value ?? 'Host';
        const room = await createOnlineRoom0703(hostName, {
          cameraAllowed: node.querySelector<HTMLInputElement>('#online-camera')?.checked ?? false,
          voiceAllowed: node.querySelector<HTMLInputElement>('#online-voice')?.checked ?? false,
          cpuFill: node.querySelector<HTMLInputElement>('#online-cpu')?.checked ?? true,
        });
        browserSession.configureOnlineHost(room.roomCode, room.hostToken, MEMEME_ONLINE_BASE_URL);
        const input = node.querySelector<HTMLInputElement>('#online-room');
        if (input) input.value = room.roomCode;
        setStatus(`✅ Phòng online ${room.roomCode} đã tạo.`);
        this.scene.start('OnlineRoomLobbyScene', { hostName });
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Không tạo được phòng online.', true);
        if (button) button.disabled = false;
      }
    });

    node.querySelector<HTMLButtonElement>('#lobby-online-join')?.addEventListener('click', async () => {
      sfxController.play('ui_confirm');
      const button = node.querySelector<HTMLButtonElement>('#lobby-online-join');
      const room = normalizeRoomCode(node.querySelector<HTMLInputElement>('#online-room')?.value ?? '');
      const displayName = node.querySelector<HTMLInputElement>('#online-name')?.value ?? 'Người chơi';
      if (!room) return setStatus('Nhập mã phòng online.', true);
      if (button) button.disabled = true;
      setStatus(`🌐 Đang vào phòng ${room}...`);
      try {
        const joined = await joinOnlineRoom0703(room, displayName);
        browserSession.configureOnlineClient(
          joined.roomCode,
          joined.seatId,
          MEMEME_ONLINE_BASE_URL,
          joined.clientId,
          joined.reconnectToken,
        );
        this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, false);
        this.scene.start('OnlineRoomLobbyScene');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Không vào được phòng online.', true);
        if (button) button.disabled = false;
      }
    });
  }
}
