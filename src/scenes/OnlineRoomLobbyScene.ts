import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { browserSession } from '../core/browserSession';
import {
  closeOnlineRoom0704,
  heartbeatOnlineLobby0704,
  kickOnlinePlayer0703,
  leaveOnlineRoom0703,
  setOnlineReady0703,
  startOnlineMatch0703,
  updateOnlineSettings0703,
  type OnlineLobbyState0703,
} from '../core/onlineLobby0703';
import { gameSession } from '../core/session';

export class OnlineRoomLobbyScene extends Phaser.Scene {
  private root?: HTMLDivElement;
  private state?: OnlineLobbyState0703;
  private enteringMatch = false;
  private polling = false;
  private exitingRoom = false;
  private lobbyDom?: Phaser.GameObjects.DOMElement;
  private heartbeatTimer?: Phaser.Time.TimerEvent;

  constructor() { super('OnlineRoomLobbyScene'); }

  create(): void {
    bgmController.playMenu();
    this.cameras.main.setBackgroundColor('#f4ead7');
    this.add.rectangle(640, 360, 1130, 630, 0xfffbf3, 1).setStrokeStyle(5, 0x202020, 1);

    const root = document.createElement('div');
    root.className = 'online-room-lobby';
    root.innerHTML = `
      <header class="online-room-head">
        <div><span class="online-kicker">ONLINE ROOM</span><h1>PHÒNG <strong id="online-room-code"></strong></h1></div>
        <button id="online-copy-code" type="button">📋 COPY MÃ</button>
      </header>
      <div class="online-room-columns">
        <section class="online-room-panel">
          <h2>NGƯỜI CHƠI</h2>
          <div id="online-roster" class="online-roster"></div>
        </section>
        <section class="online-room-panel settings-panel">
          <h2>CÀI ĐẶT PHÒNG</h2>
          <label><input id="room-camera" type="checkbox" /> 📷 Cho phép Camera Call</label>
          <label><input id="room-voice" type="checkbox" /> 🎤 Cho phép Voice Chat</label>
          <label><input id="room-cpu" type="checkbox" /> 🤖 Tự lấp ghế trống bằng CPU</label>
          <p class="online-room-note">Camera/Mic vẫn OFF mặc định. Mỗi người tự bật nếu phòng cho phép.</p>
          <div class="online-ready-box">
            <button id="online-ready" type="button">✅ SẴN SÀNG</button>
            <button id="online-start" type="button">▶ BẮT ĐẦU</button>
          </div>
        </section>
      </div>
      <footer class="online-room-footer">
        <button id="online-leave" type="button">← RỜI PHÒNG</button>
        <p id="online-room-status">Đang đồng bộ phòng...</p>
      </footer>`;
    this.root = root;
    this.lobbyDom = this.add.dom(640, 360, root).setOrigin(0.5);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupLobbyUi07042());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupLobbyUi07042());

    const config = browserSession.current;
    root.querySelector<HTMLElement>('#online-room-code')!.textContent = config.roomCode;

    root.querySelector<HTMLButtonElement>('#online-copy-code')?.addEventListener('click', async () => {
      sfxController.play('ui_confirm');
      try {
        await navigator.clipboard.writeText(config.roomCode);
        this.setStatus(`Đã copy mã ${config.roomCode}.`);
      } catch {
        this.setStatus(`Mã phòng: ${config.roomCode}`);
      }
    });

    const updateSettings = async () => {
      if (config.mode !== 'host' || !this.root) return;
      try {
        this.state = await updateOnlineSettings0703(config.roomCode, config.hostToken, {
          cameraAllowed: this.root.querySelector<HTMLInputElement>('#room-camera')?.checked ?? false,
          voiceAllowed: this.root.querySelector<HTMLInputElement>('#room-voice')?.checked ?? false,
          cpuFill: this.root.querySelector<HTMLInputElement>('#room-cpu')?.checked ?? true,
        });
        this.render();
        this.setStatus('Cài đặt đã đổi • Ready của mọi người được reset.');
      } catch (error) {
        this.setStatus(error instanceof Error ? error.message : String(error), true);
      }
    };
    for (const id of ['#room-camera', '#room-voice', '#room-cpu']) {
      root.querySelector<HTMLInputElement>(id)?.addEventListener('change', () => { void updateSettings(); });
    }

    root.querySelector<HTMLButtonElement>('#online-ready')?.addEventListener('click', async () => {
      const me = this.localPlayer();
      if (!me) return;
      sfxController.play('ui_confirm');
      try {
        this.state = await setOnlineReady0703(
          config.roomCode,
          !me.ready,
          config.mode === 'host'
            ? { clientId: 'host', hostToken: config.hostToken }
            : { clientId: config.clientId, reconnectToken: config.reconnectToken },
        );
        this.render();
      } catch (error) {
        this.setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });

    root.querySelector<HTMLButtonElement>('#online-start')?.addEventListener('click', async () => {
      if (config.mode !== 'host') return;
      sfxController.play('ui_confirm');
      try {
        this.state = await startOnlineMatch0703(config.roomCode, config.hostToken);
        this.render();
        this.enterMatchIfStarted();
      } catch (error) {
        this.setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });

    root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-kick-seat]');
      if (!button || config.mode !== 'host') return;
      const seatId = Number(button.dataset.kickSeat);
      if (!Number.isInteger(seatId)) return;
      sfxController.play('ui_confirm');
      void kickOnlinePlayer0703(config.roomCode, config.hostToken, seatId)
        .then((state) => { this.state = state; this.render(); })
        .catch((error) => this.setStatus(error instanceof Error ? error.message : String(error), true));
    });

    root.querySelector<HTMLButtonElement>('#online-leave')?.addEventListener('click', async () => {
      if (this.exitingRoom) return;
      this.exitingRoom = true;
      sfxController.play('ui_confirm');
      try {
        if (config.mode === 'host') {
          await closeOnlineRoom0704(config.roomCode, config.hostToken);
        } else {
          await leaveOnlineRoom0703(config.roomCode, config.clientId, config.reconnectToken);
        }
      } catch {
        // Leaving the local scene must remain possible even if the network is already gone.
      }
      this.cleanupLobbyUi07042();
      this.scene.start('LocalLobbyScene');
    });

    void this.refresh();
    this.heartbeatTimer = this.time.addEvent({ delay: 3000, loop: true, callback: () => { void this.refresh(); } });
  }

  private async refresh(): Promise<void> {
    if (this.polling || this.enteringMatch || this.exitingRoom) return;
    this.polling = true;
    try {
      const config = browserSession.current;
      this.state = await heartbeatOnlineLobby0704(
        config.roomCode,
        config.mode === 'host'
          ? { clientId: 'host', hostToken: config.hostToken }
          : { clientId: config.clientId, reconnectToken: config.reconnectToken },
      );

      if (this.state.closed && !this.state.started) {
        const copy = this.state.closeReason === 'host_timeout'
          ? 'Host mất kết nối quá 60 giây • phòng đã đóng.'
          : 'Host đã rời phòng • phòng đã đóng.';
        this.setStatus(copy, true);
        this.scheduleLobbyExit0704(1600);
        return;
      }

      if (config.mode === 'client') {
        const me = this.state.players.find((player) => player.clientId === config.clientId);
        if (!me && !this.state.started) {
          this.setStatus('Ghế của bạn đã hết thời gian giữ hoặc bạn đã bị Host mời khỏi phòng.', true);
          this.scheduleLobbyExit0704(1600);
          return;
        }
      }

      this.render();
      this.enterMatchIfStarted();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mất kết nối lobby.';
      this.setStatus(message, true);
      if (/thiết bị khác|player_not_found|Phòng online đã đóng/i.test(message)) {
        this.scheduleLobbyExit0704(1800);
      }
    } finally {
      this.polling = false;
    }
  }

  private scheduleLobbyExit0704(delay: number): void {
    if (this.exitingRoom) return;
    this.exitingRoom = true;
    this.time.delayedCall(delay, () => {
      this.cleanupLobbyUi07042();
      this.scene.start('LocalLobbyScene');
    });
  }

  private cleanupLobbyUi07042(): void {
    this.heartbeatTimer?.remove(false);
    this.heartbeatTimer = undefined;
    this.lobbyDom?.destroy();
    this.lobbyDom = undefined;
    this.root?.remove();
    this.root = undefined;
  }

  private localPlayer() {
    const config = browserSession.current;
    return this.state?.players.find((player) => player.clientId === (config.mode === 'host' ? 'host' : config.clientId));
  }

  private render(): void {
    if (!this.root || !this.state) return;
    const config = browserSession.current;
    const state = this.state;
    const roomCode = this.root.querySelector<HTMLElement>('#online-room-code');
    if (roomCode) roomCode.textContent = state.roomCode || config.roomCode;
    const bySeat = new Map(state.players.map((player) => [player.seatId, player]));
    const roster = this.root.querySelector<HTMLElement>('#online-roster');
    if (roster) {
      roster.innerHTML = Array.from({ length: 4 }, (_, seatId) => {
        const player = bySeat.get(seatId);
        const cpuPending = !player && state.settings.cpuFill && seatId > 0;
        const title = player?.name ?? (cpuPending ? `CPU ${seatId + 1}` : 'Đang trống');
        const badge = seatId === 0 ? '👑 HOST' : player ? 'NGƯỜI CHƠI' : cpuPending ? '🤖 CPU KHI START' : 'TRỐNG';
        const presenceCopy = player?.presence === 'online'
          ? '🟢 ONLINE'
          : player?.presence === 'reconnecting'
            ? '🟡 ĐANG KẾT NỐI LẠI'
            : player?.presence === 'disconnected'
              ? '⚪ MẤT KẾT NỐI'
              : '';
        const ready = player ? (player.ready ? '✅ READY' : '⏳ CHƯA READY') : (cpuPending ? '✅ AUTO' : '—');
        const kick = config.mode === 'host' && seatId > 0 && player
          ? `<button type="button" class="online-kick" data-kick-seat="${seatId}">KICK</button>`
          : '';
        const presenceClass = player ? `presence-${player.presence}` : '';
        return `<div class="online-player-row ${player ? 'occupied' : ''} ${presenceClass}">
          <span class="online-seat">P${seatId + 1}</span>
          <div><strong>${this.escape(title)}</strong><small>${badge}${presenceCopy ? ` • ${presenceCopy}` : ''}</small></div>
          <span class="online-ready-state">${ready}</span>${kick}
        </div>`;
      }).join('');
    }

    const camera = this.root.querySelector<HTMLInputElement>('#room-camera');
    const voice = this.root.querySelector<HTMLInputElement>('#room-voice');
    const cpu = this.root.querySelector<HTMLInputElement>('#room-cpu');
    if (camera) { camera.checked = state.settings.cameraAllowed; camera.disabled = config.mode !== 'host' || state.started; }
    if (voice) { voice.checked = state.settings.voiceAllowed; voice.disabled = config.mode !== 'host' || state.started; }
    if (cpu) { cpu.checked = state.settings.cpuFill; cpu.disabled = config.mode !== 'host' || state.started; }

    const me = this.localPlayer();
    const readyButton = this.root.querySelector<HTMLButtonElement>('#online-ready');
    if (readyButton) {
      readyButton.disabled = !me || state.started;
      readyButton.textContent = me?.ready ? '↩ BỎ READY' : '✅ SẴN SÀNG';
    }
    const startButton = this.root.querySelector<HTMLButtonElement>('#online-start');
    if (startButton) {
      startButton.style.display = config.mode === 'host' ? '' : 'none';
      startButton.disabled = !state.canStart || state.started;
      startButton.textContent = state.canStart ? '▶ BẮT ĐẦU' : '🔒 CHỜ READY';
    }

    if (!state.started) {
      const humanCount = state.players.length;
      const onlineCount = state.players.filter((player) => player.presence === 'online').length;
      const requirement = state.settings.cpuFill
        ? 'Mọi người phải Online + Ready.'
        : 'Tắt CPU: cần đủ 4 người Online + Ready.';
      this.setStatus(`${humanCount}/4 người • ${onlineCount} online • giữ ghế mất kết nối 60s • ${requirement}`);
    }
  }

  private enterMatchIfStarted(): void {
    if (!this.state?.started || this.enteringMatch) return;
    this.enteringMatch = true;
    const state = this.state;
    browserSession.setCpuSeatIds(state.cpuSeatIds);
    gameSession.reset();
    for (let seatId = 0; seatId < 4; seatId += 1) {
      const human = state.players.find((player) => player.seatId === seatId);
      gameSession.setPlayerName(seatId, human?.name ?? (state.cpuSeatIds.includes(seatId) ? `CPU ${seatId + 1}` : `Player ${seatId + 1}`));
    }
    sfxController.play('ui_confirm');
    this.cleanupLobbyUi07042();
    // Every online human owns their own avatar setup. CPU seats are never edited here.
    this.scene.start('SetupScene', { preserve: true });
  }

  private setStatus(message: string, error = false): void {
    const node = this.root?.querySelector<HTMLParagraphElement>('#online-room-status');
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', error);
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char);
  }
}
