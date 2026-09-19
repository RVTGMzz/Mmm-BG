import { browserSession } from '../core/browserSession';
import type { LocalTransportAdapter, LocalTransportMessage } from '../core/localTransport';
import { createBrowserSessionTransport } from '../core/onlineTransport0702';
import { gameSession } from '../core/session';

type MediaPeer07043 = {
  clientId: string;
  seatId: number;
  name: string;
};

type MediaSignalPayload07043 = {
  from: string;
  to: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type MediaMessage07043 =
  | { kind: 'media_hello'; peer: MediaPeer07043 }
  | { kind: 'media_roster'; peers: MediaPeer07043[] }
  | { kind: 'media_signal'; signal: MediaSignalPayload07043 }
  | { kind: 'media_bye'; clientId: string };

type PeerRuntime07043 = {
  descriptor: MediaPeer07043;
  pc: RTCPeerConnection;
  pendingCandidates: RTCIceCandidateInit[];
  remoteStream?: MediaStream;
  offerStarted: boolean;
};

const RTC_CONFIG_07043: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

function safeText07043(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[char] ?? char);
}

class OnlineGroupMedia07043 {
  private transport?: LocalTransportAdapter<MediaMessage07043>;
  private unsubscribe?: () => void;
  private unsubscribeConnection?: () => void;
  private root?: HTMLDivElement;
  private roster = new Map<string, MediaPeer07043>();
  private peers = new Map<string, PeerRuntime07043>();
  private readonly repairTimers07047 = new Map<string, number>();
  private localStream?: MediaStream;
  private cameraOn = false;
  private micOn = false;
  private announceTimer?: number;
  private status = '';

  start(): void {
    this.stop();
    const config = browserSession.current;
    if (!browserSession.isOnline || (!config.cameraAllowed && !config.voiceAllowed)) return;
    if (typeof RTCPeerConnection === 'undefined') return;

    const me: MediaPeer07043 = {
      clientId: config.clientId,
      seatId: config.seatId,
      name: gameSession.players[config.seatId]?.name ?? `P${config.seatId + 1}`,
    };
    this.roster.set(me.clientId, me);
    this.transport = createBrowserSessionTransport<MediaMessage07043>('media', config.clientId);
    this.unsubscribe = this.transport.subscribe((message) => this.handleMessage(message));
    if (this.transport.subscribeConnection) {
      this.unsubscribeConnection = this.transport.subscribeConnection((state) => {
        if (state === 'open') {
          this.status = '';
          this.announce();
          this.reconcileRoster();
        } else if (state === 'reconnecting') {
          this.status = 'Đang nối lại camera/voice…';
          this.renderRoster();
        }
      });
    }
    this.createUi();
    if (!this.transport.subscribeConnection) this.announce();
    this.announceTimer = window.setInterval(() => this.announce(), 3500);
  }

  stop(): void {
    const config = browserSession.current;
    if (this.transport && browserSession.isOnline) {
      try {
        const payload: MediaMessage07043 = { kind: 'media_bye', clientId: config.clientId };
        if (config.mode === 'host') this.transport.send(payload);
        else this.transport.send(payload, 'host');
      } catch {}
    }
    if (this.announceTimer !== undefined) window.clearInterval(this.announceTimer);
    this.announceTimer = undefined;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.unsubscribeConnection?.();
    this.unsubscribeConnection = undefined;
    this.transport?.close();
    this.transport = undefined;
    for (const timer of this.repairTimers07047.values()) window.clearTimeout(timer);
    this.repairTimers07047.clear();
    for (const peer of this.peers.values()) {
      peer.pc.onconnectionstatechange = null;
      peer.pc.close();
    }
    this.peers.clear();
    for (const track of this.localStream?.getTracks() ?? []) track.stop();
    this.localStream = undefined;
    this.cameraOn = false;
    this.micOn = false;
    this.roster.clear();
    this.root?.remove();
    this.root = undefined;
    this.status = '';
  }

  private announce(): void {
    const transport = this.transport;
    if (!transport) return;
    const config = browserSession.current;
    const me: MediaPeer07043 = {
      clientId: config.clientId,
      seatId: config.seatId,
      name: gameSession.players[config.seatId]?.name ?? `P${config.seatId + 1}`,
    };
    this.roster.set(me.clientId, me);
    if (config.mode === 'host') {
      this.broadcastRoster();
      this.reconcileRoster();
    } else {
      transport.send({ kind: 'media_hello', peer: me }, 'host');
    }
  }

  private handleMessage(message: LocalTransportMessage<MediaMessage07043>): void {
    const config = browserSession.current;
    const payload = message.payload;

    if (config.mode === 'host') {
      if (payload.kind === 'media_hello') {
        if (message.from !== payload.peer.clientId || payload.peer.seatId <= 0 || payload.peer.seatId > 3) return;
        this.roster.set(payload.peer.clientId, { ...payload.peer });
        this.reconcileRoster();
        this.broadcastRoster();
        return;
      }
      if (payload.kind === 'media_bye') {
        if (message.from !== payload.clientId) return;
        this.removePeer(payload.clientId);
        this.roster.delete(payload.clientId);
        this.broadcastRoster();
        return;
      }
      if (payload.kind === 'media_signal') {
        const signal = payload.signal;
        if (signal.from !== message.from) return;
        if (signal.to === config.clientId) {
          void this.applySignal(signal);
        } else if (this.roster.has(signal.to)) {
          this.transport?.send(payload, signal.to);
        }
      }
      return;
    }

    if (message.from !== 'host') return;
    if (payload.kind === 'media_roster') {
      this.roster = new Map(payload.peers.map((peer) => [peer.clientId, { ...peer }]));
      this.reconcileRoster();
      return;
    }
    if (payload.kind === 'media_signal' && payload.signal.to === config.clientId) {
      void this.applySignal(payload.signal);
    }
  }

  private broadcastRoster(): void {
    if (browserSession.current.mode !== 'host') return;
    const peers = [...this.roster.values()].sort((a, b) => a.seatId - b.seatId);
    this.transport?.send({ kind: 'media_roster', peers });
    this.renderRoster();
  }

  private reconcileRoster(): void {
    const me = browserSession.current.clientId;
    for (const clientId of [...this.peers.keys()]) {
      if (!this.roster.has(clientId)) this.removePeer(clientId);
    }
    for (const descriptor of this.roster.values()) {
      if (descriptor.clientId === me) continue;
      this.ensurePeer(descriptor);
    }
    this.renderRoster();
  }

  private ensurePeer(descriptor: MediaPeer07043): PeerRuntime07043 | undefined {
    const existing = this.peers.get(descriptor.clientId);
    if (existing) {
      existing.descriptor = { ...descriptor };
      return existing;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG_07043);
    const runtime: PeerRuntime07043 = {
      descriptor: { ...descriptor },
      pc,
      pendingCandidates: [],
      offerStarted: false,
    };
    this.peers.set(descriptor.clientId, runtime);

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      this.sendSignal(descriptor.clientId, { candidate: event.candidate.toJSON() });
    };
    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? runtime.remoteStream ?? new MediaStream();
      if (!event.streams[0] && !stream.getTracks().includes(event.track)) stream.addTrack(event.track);
      runtime.remoteStream = stream;
      event.track.onmute = () => this.renderRoster();
      event.track.onunmute = () => this.renderRoster();
      event.track.onended = () => this.renderRoster();
      this.renderRoster();
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.clearPeerRepair07047(descriptor.clientId);
        this.status = '';
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.status = `Đang nối lại media P${descriptor.seatId + 1}…`;
        this.schedulePeerRepair07047(descriptor.clientId, 250);
      } else if (pc.connectionState === 'disconnected') {
        this.status = `Media P${descriptor.seatId + 1} chập chờn, đang tự phục hồi…`;
        this.schedulePeerRepair07047(descriptor.clientId, 1800);
      }
      this.renderRoster();
    };

    const localSeat = browserSession.current.seatId;
    if (localSeat < descriptor.seatId) {
      window.setTimeout(() => { void this.makeOffer(descriptor.clientId); }, 140 + descriptor.seatId * 35);
    }
    return runtime;
  }

  private async makeOffer(clientId: string): Promise<void> {
    const peer = this.peers.get(clientId);
    if (!peer || peer.offerStarted || peer.pc.signalingState !== 'stable') return;
    peer.offerStarted = true;
    try {
      this.ensureTransceivers(peer.pc);
      await this.syncTracksToPeer(peer);
      const offer = await peer.pc.createOffer();
      await peer.pc.setLocalDescription(offer);
      if (peer.pc.localDescription) this.sendSignal(clientId, { description: peer.pc.localDescription.toJSON() });
    } catch (error) {
      peer.offerStarted = false;
      this.status = error instanceof Error ? error.message : 'Không tạo được media offer.';
      this.renderRoster();
    }
  }

  private ensureTransceivers(pc: RTCPeerConnection): void {
    const kinds = new Set(pc.getTransceivers().map((item) => item.receiver.track.kind));
    if (!kinds.has('video')) pc.addTransceiver('video', { direction: 'sendrecv' });
    if (!kinds.has('audio')) pc.addTransceiver('audio', { direction: 'sendrecv' });
  }

  private async applySignal(signal: MediaSignalPayload07043): Promise<void> {
    const descriptor = this.roster.get(signal.from);
    if (!descriptor) return;
    const peer = this.ensurePeer(descriptor);
    if (!peer) return;

    try {
      if (signal.description) {
        await peer.pc.setRemoteDescription(signal.description);
        for (const candidate of peer.pendingCandidates.splice(0)) await peer.pc.addIceCandidate(candidate);
        if (signal.description.type === 'offer') {
          await this.syncTracksToPeer(peer);
          const answer = await peer.pc.createAnswer();
          await peer.pc.setLocalDescription(answer);
          if (peer.pc.localDescription) this.sendSignal(signal.from, { description: peer.pc.localDescription.toJSON() });
        }
      } else if (signal.candidate) {
        if (peer.pc.remoteDescription) await peer.pc.addIceCandidate(signal.candidate);
        else peer.pendingCandidates.push(signal.candidate);
      }
    } catch (error) {
      this.status = error instanceof Error ? error.message : 'Lỗi WebRTC.';
      this.renderRoster();
    }
  }

  private sendSignal(
    to: string,
    data: Pick<MediaSignalPayload07043, 'description' | 'candidate'>,
  ): void {
    const config = browserSession.current;
    const payload: MediaMessage07043 = {
      kind: 'media_signal',
      signal: { from: config.clientId, to, ...data },
    };
    if (config.mode === 'host') this.transport?.send(payload, to);
    else this.transport?.send(payload, 'host');
  }

  private async syncTracksToPeer(peer: PeerRuntime07043): Promise<void> {
    const video = this.localStream?.getVideoTracks()[0] ?? null;
    const audio = this.localStream?.getAudioTracks()[0] ?? null;
    for (const transceiver of peer.pc.getTransceivers()) {
      const kind = transceiver.receiver.track.kind;
      if (kind === 'video') await transceiver.sender.replaceTrack(video);
      else if (kind === 'audio') await transceiver.sender.replaceTrack(audio);
    }
  }

  private async setLocalMedia(nextCamera: boolean, nextMic: boolean): Promise<void> {
    const config = browserSession.current;
    nextCamera = config.cameraAllowed && nextCamera;
    nextMic = config.voiceAllowed && nextMic;

    let nextStream: MediaStream | undefined;
    try {
      if (nextCamera || nextMic) {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Thiết bị không hỗ trợ camera/micro trên trình duyệt này.');
        nextStream = await navigator.mediaDevices.getUserMedia({
          video: nextCamera ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } } : false,
          audio: nextMic ? { echoCancellation: true, noiseSuppression: true } : false,
        });
      }

      const previous = this.localStream;
      this.localStream = nextStream;
      this.cameraOn = nextCamera;
      this.micOn = nextMic;
      await Promise.all([...this.peers.values()].map((peer) => this.syncTracksToPeer(peer)));
      for (const track of previous?.getTracks() ?? []) track.stop();
      this.status = '';
    } catch (error) {
      for (const track of nextStream?.getTracks() ?? []) track.stop();
      this.status = error instanceof Error ? error.message : 'Không mở được camera/micro.';
    }
    this.renderRoster();
  }

  private clearPeerRepair07047(clientId: string): void {
    const timer = this.repairTimers07047.get(clientId);
    if (timer !== undefined) window.clearTimeout(timer);
    this.repairTimers07047.delete(clientId);
  }

  private schedulePeerRepair07047(clientId: string, delay: number): void {
    if (this.repairTimers07047.has(clientId)) return;
    const timer = window.setTimeout(() => {
      this.repairTimers07047.delete(clientId);
      const current = this.peers.get(clientId);
      if (current?.pc.connectionState === 'connected') return;
      const descriptor = this.roster.get(clientId);
      if (!descriptor) {
        this.removePeer(clientId);
        return;
      }
      this.removePeer(clientId);
      this.ensurePeer(descriptor);
      this.renderRoster();
    }, delay);
    this.repairTimers07047.set(clientId, timer);
  }

  private removePeer(clientId: string): void {
    this.clearPeerRepair07047(clientId);
    const peer = this.peers.get(clientId);
    if (peer) {
      peer.pc.onconnectionstatechange = null;
      peer.pc.close();
    }
    this.peers.delete(clientId);
  }

  private createUi(): void {
    const config = browserSession.current;
    const root = document.createElement('div');
    root.className = 'mememe-group-media-07043';
    root.innerHTML = `
      <div class="group-media-head">
        <strong>📹 NHÓM</strong>
        <span class="group-media-status"></span>
      </div>
      <div class="group-media-peers"></div>
      <div class="group-media-controls">
        <button type="button" data-media-camera ${config.cameraAllowed ? '' : 'disabled'}>📷 CAMERA OFF</button>
        <button type="button" data-media-mic ${config.voiceAllowed ? '' : 'disabled'}>🎙️ MIC OFF</button>
      </div>`;
    root.querySelector<HTMLButtonElement>('[data-media-camera]')?.addEventListener('click', () => {
      void this.setLocalMedia(!this.cameraOn, this.micOn);
    });
    root.querySelector<HTMLButtonElement>('[data-media-mic]')?.addEventListener('click', () => {
      void this.setLocalMedia(this.cameraOn, !this.micOn);
    });
    document.body.appendChild(root);
    this.root = root;
    this.renderRoster();
  }

  private renderRoster(): void {
    if (!this.root) return;
    const config = browserSession.current;
    const status = this.root.querySelector<HTMLElement>('.group-media-status');
    if (status) status.textContent = this.status || 'Camera/Mic do từng người tự bật';

    const peersRoot = this.root.querySelector<HTMLElement>('.group-media-peers');
    if (!peersRoot) return;
    peersRoot.replaceChildren();

    for (const descriptor of [...this.roster.values()].sort((a, b) => a.seatId - b.seatId)) {
      const card = document.createElement('div');
      card.className = 'group-media-peer';
      const media = document.createElement('div');
      media.className = 'group-media-frame';

      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      const own = descriptor.clientId === config.clientId;
      video.muted = own;

      const stream = own ? this.localStream : this.peers.get(descriptor.clientId)?.remoteStream;
      if (stream) {
        video.srcObject = stream;
        void video.play().catch(() => undefined);
      }
      const hasVideo = Boolean(stream?.getVideoTracks().some((track) => track.readyState === 'live' && !track.muted));
      if (hasVideo) video.classList.add('has-video');

      const fallback = document.createElement('div');
      fallback.className = 'group-media-avatar';
      const face = gameSession.getFace(descriptor.seatId, 'neutral');
      if (face?.dataUrl) {
        const image = document.createElement('img');
        image.src = face.dataUrl;
        image.alt = '';
        fallback.appendChild(image);
      } else {
        fallback.textContent = `P${descriptor.seatId + 1}`;
      }

      const label = document.createElement('div');
      label.className = 'group-media-label';
      label.innerHTML = `<b>P${descriptor.seatId + 1}</b> ${safeText07043(descriptor.name)}${own ? ' • BẠN' : ''}`;

      media.append(fallback, video, label);
      card.appendChild(media);
      peersRoot.appendChild(card);
    }

    const camera = this.root.querySelector<HTMLButtonElement>('[data-media-camera]');
    const mic = this.root.querySelector<HTMLButtonElement>('[data-media-mic]');
    if (camera) {
      camera.disabled = !config.cameraAllowed;
      camera.textContent = config.cameraAllowed ? (this.cameraOn ? '📷 CAMERA ON' : '📷 CAMERA OFF') : '📷 HOST TẮT CAMERA';
      camera.classList.toggle('active', this.cameraOn);
    }
    if (mic) {
      mic.disabled = !config.voiceAllowed;
      mic.textContent = config.voiceAllowed ? (this.micOn ? '🎙️ MIC ON' : '🎙️ MIC OFF') : '🎙️ HOST TẮT MIC';
      mic.classList.toggle('active', this.micOn);
    }
  }
}

export const onlineGroupMedia07043 = new OnlineGroupMedia07043();
