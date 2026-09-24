import Phaser from 'phaser';
import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';
import { MEMEME_BUILD } from '../buildInfo';
import { browserSession } from '../core/browserSession';
import { configureInitialPlayOrder, configureInitialTargetLaps } from '../core/matchState';
import { gameSession, type FaceExpression } from '../core/session';
import { STARTER_CHARACTERS_V01 } from '../content/core/characters_starter_v01';
import { resolveCharacterFaceCompositeCh02d } from '../core/characterFaceCompositeCh02d';
import { faceTextureKey } from '../systems/faces';
import { FaceCameraCapture07033 } from '../ui/FaceCameraCapture07033';
import { FaceImageEditor } from '../ui/FaceImageEditor';
import {
  prepareForNativePicker07033,
  waitForMobileLandscapeAfterPicker07032,
} from '../ui/mobileLandscape07031';
import {
  bindVisualFoundationModalV01,
  decorateVisualFoundationButtonsV01,
  decorateVisualFoundationPanelV01,
} from '../ui/visualFoundationV01';

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
    const onlineOwnSetup = config.transport === 'online' && config.mode !== 'solo';
    const setupPlayerIds = onlineOwnSetup
      ? [config.seatId]
      : gameSession.players.map((player) => player.id);
    const networkLabel = config.transport === 'online'
      ? (config.mode === 'host' ? '🌐 ONLINE HOST' : `🌐 ONLINE P${config.seatId + 1}`)
      : '📡 LOCAL HOST';
    const mode = config.mode === 'host'
      ? `${networkLabel} • ${config.roomCode}`
      : onlineOwnSetup
        ? `${networkLabel} • ${config.roomCode} • CHỈNH AVATAR CỦA BẠN`
        : cpuCount > 0
          ? `${4 - cpuCount} người • ${cpuCount} CPU`
          : 'HOTSEAT • 4 người';
    this.add.text(72, 91, mode, { fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#756c61' });

    const root = document.createElement('div');
    root.className = `mememe-setup mememe-setup-069${onlineOwnSetup ? ' online-own-profile' : ''}`;
    root.innerHTML = `
      <div class="setup-grid">${setupPlayerIds.map((playerId) => this.playerCardMarkup(playerId)).join('')}</div>
      <div class="setup-footer">
        <button id="setup-back-mode" class="setup-back-button" type="button"${onlineOwnSetup ? ' style="display:none"' : ''}>← CHẾ ĐỘ</button>
        <p class="setup-hint">${onlineOwnSetup ? 'Avatar của bạn • Có thể bỏ qua' : 'Avatar người chơi • Có thể bỏ qua'}</p>
        <button id="start-game" class="start-game-button" type="button">${onlineOwnSetup && config.mode === 'client' ? 'XONG →' : 'TIẾP TỤC →'}</button>
      </div>
      <p id="setup-status" class="setup-status"></p>`;
    const setupDom = this.add.dom(640, 410, root).setOrigin(0.5);
    const node = setupDom.node as HTMLDivElement;
    node.querySelectorAll<HTMLElement>('.face-choice-panel').forEach((panel) => {
      decorateVisualFoundationPanelV01(panel, 'wide');
    });
    decorateVisualFoundationButtonsV01(node, [
      { selector: '.face-choice-grid button', variant: 'secondary', size: 'lg' },
      { selector: '.face-choice-close', variant: 'subtle', size: 'md' },
      { selector: '#setup-back-mode', variant: 'subtle', size: 'sm' },
      { selector: '#start-game', variant: 'primary', size: 'lg' },
    ]);
    this.statusElement = node.querySelector<HTMLParagraphElement>('#setup-status') ?? undefined;

    // CH-02C: sequential Character Select. Approved concept art remains external
    // reference for now; this runtime proof locks selection/Random ownership first.
    const characterRoot = document.createElement('div');
    characterRoot.className = 'mememe-character-select-ch02c';
    const characterEmoji: Record<string, string> = {
      'starter-crybaby': '😭',
      'starter-grumpy': '😠',
      'starter-anxious': '😰',
      'starter-hyper': '🤪',
    };
    characterRoot.innerHTML = `
      <section class="character-select-panel-ch02c">
        <div class="character-select-kicker-ch02c">CHỌN NHÂN VẬT</div>
        <div class="character-select-owner-ch02c" id="character-owner-ch02c"></div>
        <div class="character-card-grid-ch02c">
          ${STARTER_CHARACTERS_V01.map((character) => `
            <button type="button" class="character-card-ch02c" data-character-id="${character.id}">
              <span class="character-face-proof-ch02d" aria-hidden="true">
                <img class="character-face-source-ch02d" alt="" />
                <span class="character-face-proof-label-ch02d">MẶT CỦA BẠN</span>
              </span>
              <span class="character-emoji-ch02c">${characterEmoji[character.id] ?? '🎭'}</span>
              <strong>${character.archetypeLabel}</strong>
              <small>${character.genderPresentation === 'female' ? 'NỮ' : 'NAM'} · ${character.ageBand.min}–${character.ageBand.max}</small>
              <span class="character-passive-ch02c">${character.passiveConcept.label}</span>
            </button>`).join('')}
          <button type="button" class="character-card-ch02c character-random-ch02c" data-character-mode="random">
            <span class="character-emoji-ch02c">🎲</span>
            <strong>RANDOM (?)</strong>
            <small>ÚP KẾT QUẢ TỚI KHI VÀO TRẬN</small>
            <span class="character-passive-ch02c">Có thể có điều bất ngờ…</span>
          </button>
        </div>
        <div class="character-select-summary-ch02c" id="character-summary-ch02c">Chọn một nhân vật hoặc RANDOM (?).</div>
        <div class="character-select-actions-ch02c">
          <button type="button" class="character-back-ch02c">← QUAY LẠI</button>
          <button type="button" class="character-confirm-ch02c" disabled>XÁC NHẬN →</button>
        </div>
      </section>`;
    const characterDom = this.add.dom(640, 370, characterRoot).setOrigin(0.5).setVisible(false);
    decorateVisualFoundationButtonsV01(characterRoot, [
      { selector: '.character-card-ch02c', variant: 'secondary', size: 'md' },
      { selector: '.character-back-ch02c', variant: 'subtle', size: 'md' },
      { selector: '.character-confirm-ch02c', variant: 'primary', size: 'lg' },
    ]);

    for (const cpuSeatId of config.cpuSeatIds) {
      if (!gameSession.getCharacterSelectionMode(cpuSeatId)) {
        gameSession.setCharacterSelection(cpuSeatId, 'random');
      }
    }

    const characterHumanIds = setupPlayerIds.filter((playerId) => !browserSession.isCpuSeat(playerId));
    let characterHumanIndex = 0;
    const characterOwner = characterRoot.querySelector<HTMLElement>('#character-owner-ch02c');
    const characterSummary = characterRoot.querySelector<HTMLElement>('#character-summary-ch02c');
    const characterConfirm = characterRoot.querySelector<HTMLButtonElement>('.character-confirm-ch02c');

    const renderCharacterSelection = (): void => {
      const playerId = characterHumanIds[characterHumanIndex];
      const player = playerId === undefined ? undefined : gameSession.players[playerId];
      if (characterOwner) characterOwner.textContent = player ? `P${player.id + 1} · ${player.name}` : 'CPU / RANDOM';
      const mode = playerId === undefined ? undefined : gameSession.getCharacterSelectionMode(playerId);
      const selectedId = playerId === undefined ? undefined : gameSession.getCharacterId(playerId);
      const faceComposite = player ? resolveCharacterFaceCompositeCh02d(player.faces, 'neutral') : undefined;
      for (const button of characterRoot.querySelectorAll<HTMLButtonElement>('.character-card-ch02c')) {
        const active = button.dataset.characterMode === 'random'
          ? mode === 'random'
          : mode === 'fixed' && button.dataset.characterId === selectedId;
        button.classList.toggle('selected', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        const facePreview = button.querySelector<HTMLImageElement>('.character-face-source-ch02d');
        const showFaceProof = Boolean(active && faceComposite && button.dataset.characterId);
        button.classList.toggle('face-preview-active-ch02d', showFaceProof);
        if (facePreview) {
          if (showFaceProof && faceComposite) {
            facePreview.src = faceComposite.sourceDataUrl;
            facePreview.dataset.sourceKind = faceComposite.sourceKind;
          } else {
            facePreview.removeAttribute('src');
            delete facePreview.dataset.sourceKind;
          }
        }
      }
      if (characterConfirm) characterConfirm.disabled = !mode;
      if (characterSummary) {
        if (mode === 'random') {
          characterSummary.textContent = '🎲 RANDOM đã khóa • Kết quả vẫn úp cho tới lúc reveal.';
        } else if (selectedId) {
          const chosen = STARTER_CHARACTERS_V01.find((character) => character.id === selectedId);
          characterSummary.textContent = chosen
            ? `${chosen.archetypeLabel} • Nội tại: ${chosen.passiveConcept.label}`
            : 'Đã chọn nhân vật.';
        } else {
          characterSummary.textContent = 'Chọn một nhân vật hoặc RANDOM (?).';
        }
      }
    };

    const finishCharacterSelection = (): void => {
      characterDom.setVisible(false);
      if (onlineOwnSetup && config.mode === 'client') {
        this.startGame();
        return;
      }
      rulesDom.setVisible(true);
      selectLaps(gameSession.targetLaps);
    };

    const openCharacterSelection = (): void => {
      setupDom.setVisible(false);
      rulesDom.setVisible(false);
      if (characterHumanIds.length === 0) {
        finishCharacterSelection();
        return;
      }
      const firstMissing = characterHumanIds.findIndex((playerId) => !gameSession.getCharacterSelectionMode(playerId));
      characterHumanIndex = firstMissing >= 0 ? firstMissing : 0;
      characterDom.setVisible(true);
      renderCharacterSelection();
    };

    for (const button of characterRoot.querySelectorAll<HTMLButtonElement>('[data-character-id]')) {
      button.addEventListener('click', () => {
        const playerId = characterHumanIds[characterHumanIndex];
        const characterId = button.dataset.characterId;
        if (playerId === undefined || !characterId) return;
        gameSession.setCharacterSelection(playerId, 'fixed', characterId);
        sfxController.play('ui_confirm');
        renderCharacterSelection();
      });
    }
    characterRoot.querySelector<HTMLButtonElement>('[data-character-mode="random"]')?.addEventListener('click', () => {
      const playerId = characterHumanIds[characterHumanIndex];
      if (playerId === undefined) return;
      gameSession.setCharacterSelection(playerId, 'random');
      sfxController.play('ui_confirm');
      renderCharacterSelection();
    });
    characterRoot.querySelector<HTMLButtonElement>('.character-back-ch02c')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      if (characterHumanIndex > 0) {
        characterHumanIndex -= 1;
        renderCharacterSelection();
        return;
      }
      characterDom.setVisible(false);
      setupDom.setVisible(true);
    });
    characterConfirm?.addEventListener('click', () => {
      const playerId = characterHumanIds[characterHumanIndex];
      if (playerId === undefined || !gameSession.getCharacterSelectionMode(playerId)) return;
      sfxController.play('ui_confirm');
      if (characterHumanIndex < characterHumanIds.length - 1) {
        characterHumanIndex += 1;
        renderCharacterSelection();
        return;
      }
      finishCharacterSelection();
    });

    const rulesRoot = document.createElement('div');
    rulesRoot.className = 'mememe-rule-select mememe-rule-select-069';
    rulesRoot.innerHTML = `
      <section class="rule-select-panel">
        <div class="rule-select-kicker">TRƯỚC KHI VÀO TRẬN</div><h1>CHỌN ĐỘ DÀI</h1>
        <div class="rule-option-grid">${[1,2,3].map((laps) => `<button type="button" class="lap-option rule-option${laps === gameSession.targetLaps ? ' selected' : ''}" data-laps="${laps}" aria-pressed="${laps === gameSession.targetLaps}"><span class="rule-option-number">${laps}</span><strong>${laps} LƯỢT</strong><small>${laps} VÒNG / NGƯỜI</small><span class="rule-option-note">${laps === 1 ? 'NHANH' : laps === 2 ? 'CÂN BẰNG' : 'DÀI'}</span></button>`).join('')}</div>
        <div class="rule-actions"><button type="button" class="rule-back">← QUAY LẠI</button><button type="button" class="rule-confirm">BẮT ĐẦU 🎲</button></div>
      </section>`;
    decorateVisualFoundationButtonsV01(rulesRoot, [
      { selector: '.rule-back', variant: 'subtle', size: 'md' },
      { selector: '.rule-confirm', variant: 'primary', size: 'lg' },
    ]);
    const rulesDom = this.add.dom(640, 360, rulesRoot).setOrigin(0.5).setVisible(false);

    for (const playerId of setupPlayerIds) {
      const player = gameSession.players[playerId];
      if (!player) continue;
      const nameInput = node.querySelector<HTMLInputElement>(`#player-name-${player.id}`);
      nameInput?.addEventListener('input', () => gameSession.setPlayerName(player.id, nameInput.value));

      const batchInput = node.querySelector<HTMLInputElement>(`#face-batch-${player.id}`);
      const oneForAllInput = node.querySelector<HTMLInputElement>(`#face-one-${player.id}`);
      const choiceMenu = node.querySelector<HTMLElement>(`#face-choice-menu-${player.id}`);
      const choiceLauncher = node.querySelector<HTMLButtonElement>(`#face-menu-${player.id}`);
      const ownedModal = choiceMenu && choiceLauncher
        ? bindVisualFoundationModalV01(choiceMenu, choiceLauncher)
        : undefined;
      const closeChoiceMenu = () => ownedModal?.close();
      const openChoiceMenu = () => ownedModal?.open();
      if (ownedModal) this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => ownedModal.destroy());

      node.querySelector<HTMLButtonElement>(`#face-menu-${player.id}`)?.addEventListener('click', openChoiceMenu);
      node.querySelector<HTMLButtonElement>(`#face-choice-close-${player.id}`)?.addEventListener('click', closeChoiceMenu);
      choiceMenu?.addEventListener('pointerdown', (event) => {
        if (event.target === choiceMenu) closeChoiceMenu();
      });

      node.querySelector<HTMLButtonElement>(`#face-library-3-${player.id}`)?.addEventListener('click', () => {
        closeChoiceMenu();
        prepareForNativePicker07033();
        batchInput?.click();
      });
      node.querySelector<HTMLButtonElement>(`#face-library-one-${player.id}`)?.addEventListener('click', () => {
        closeChoiceMenu();
        prepareForNativePicker07033();
        oneForAllInput?.click();
      });

      batchInput?.addEventListener('change', () => {
        void this.handleFaceBatchSelection(node, player.id, batchInput, false);
      });
      oneForAllInput?.addEventListener('change', () => {
        void this.handleFaceBatchSelection(node, player.id, oneForAllInput, true);
      });

      node.querySelector<HTMLButtonElement>(`#face-camera-3-${player.id}`)?.addEventListener('click', () => {
        closeChoiceMenu();
        void this.handleFaceCameraCapture(node, player.id, false);
      });
      node.querySelector<HTMLButtonElement>(`#face-camera-one-${player.id}`)?.addEventListener('click', () => {
        closeChoiceMenu();
        void this.handleFaceCameraCapture(node, player.id, true);
      });

      for (const expression of EXPRESSIONS) {
        const input = node.querySelector<HTMLInputElement>(`#face-${player.id}-${expression.id}`);
        const slotLabel = node.querySelector<HTMLElement>(`#slot-${player.id}-${expression.id}`);
        slotLabel?.addEventListener('pointerdown', () => { prepareForNativePicker07033(); }, { passive: true });
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
      if (onlineOwnSetup) return;
      this.captureNames(node);
      sfxController.play('ui_confirm');
      this.registry.set(PRESERVE_SETUP_REGISTRY_KEY, true);
      this.scene.start('LocalLobbyScene');
    });
    node.querySelector<HTMLButtonElement>('#start-game')?.addEventListener('click', () => {
      if (!this.captureNames(node)) return;
      sfxController.play('ui_confirm');
      openCharacterSelection();
    });
    rulesRoot.querySelector<HTMLButtonElement>('.rule-back')?.addEventListener('click', () => {
      sfxController.play('ui_confirm');
      rulesDom.setVisible(false);
      characterDom.setVisible(true);
      characterHumanIndex = Math.max(0, characterHumanIds.length - 1);
      renderCharacterSelection();
    });
    rulesRoot.querySelector<HTMLButtonElement>('.rule-confirm')?.addEventListener('click', () => this.startGame());
  }

  private playerCardMarkup(playerId: number): string {
    const accent = PLAYER_ACCENTS[playerId];
    const isCpu = browserSession.isCpuSeat(playerId);
    const onlineOwned = browserSession.current.transport === 'online';
    const player = gameSession.players[playerId];
    const displayName = this.preserveSetup
      ? player?.name ?? `Player ${playerId + 1}`
      : isCpu ? `CPU ${playerId + 1}` : player?.name ?? `Player ${playerId + 1}`;
    const faceSlots = EXPRESSIONS.map((expression) => `<label class="face-slot" id="slot-${playerId}-${expression.id}" style="--player-accent:${accent}"><span class="face-emoji">${expression.emoji}</span><img id="preview-${playerId}-${expression.id}" alt="${expression.label}" /><span class="face-label">${expression.label}</span><span class="face-action">Chọn ảnh</span><input id="face-${playerId}-${expression.id}" type="file" accept="image/*" /></label>`).join('');
    const batchActions = `<div class="face-picker-entry">
      <button id="face-menu-${playerId}" class="face-picker-launch" type="button">📷 CHỌN ẢNH</button>
      <input id="face-batch-${playerId}" class="face-hidden-input" type="file" accept="image/*" multiple />
      <input id="face-one-${playerId}" class="face-hidden-input" type="file" accept="image/*" />
    </div>
    <div id="face-choice-menu-${playerId}" class="face-choice-menu vf-modal" tabindex="-1" hidden>
      <section class="face-choice-panel" role="dialog" aria-modal="true" aria-label="Chọn cách tạo avatar">
        <header class="vf-panel__header"><strong>CHỌN CÁCH TẠO AVATAR</strong></header>
        <div class="vf-panel__body"><div class="face-choice-grid">
          <button id="face-library-3-${playerId}" type="button"><span class="face-choice-icon">📚</span><span>3 ẢNH</span></button>
          <button id="face-library-one-${playerId}" type="button"><span class="face-choice-icon">🪄</span><span>1 ẢNH</span></button>
          <button id="face-camera-3-${playerId}" type="button"><span class="face-choice-icon">📷</span><span>CHỤP 3</span></button>
          <button id="face-camera-one-${playerId}" type="button"><span class="face-choice-icon">🤳</span><span>CHỤP 1</span></button>
        </div></div>
        <footer class="vf-panel__footer"><button id="face-choice-close-${playerId}" class="face-choice-close" type="button">ĐÓNG</button></footer>
      </section>
    </div>`;
    const roleRow = `<div class="player-role-row-069">${isCpu
      ? '<span class="cpu-tag-069">CPU</span>'
      : onlineOwned
        ? '<span class="cpu-tag-069">👤 BẠN</span>'
        : '<span class="player-role-placeholder-069" aria-hidden="true">CPU</span>'}</div>`;
    const nameAttrs = onlineOwned ? ' readonly aria-readonly="true"' : '';
    return `<section class="player-setup-card" style="--player-accent:${accent}"><div class="player-card-title"><span class="player-number">P${playerId + 1}${isCpu ? ' 🤖' : ''}</span><input id="player-name-${playerId}" class="player-name-input" value="${displayName}" maxlength="18" aria-label="Tên Player ${playerId + 1}"${nameAttrs} /></div>${roleRow}<div class="face-slots">${faceSlots}</div>${batchActions}</section>`;
  }

  private async handleFaceSelection(root: HTMLDivElement, playerId: number, expression: FaceExpression, input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0]; if (!file) return;
    await waitForMobileLandscapeAfterPicker07032();
    const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression}`);
    const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression}`);
    slot?.classList.add('loading'); this.setStatus('Đang chỉnh ảnh…', false);
    try {
      const expressionMeta = EXPRESSIONS.find((item) => item.id === expression);
      const edited = await FaceImageEditor.open(file, expressionMeta?.label); if (!edited) { this.setStatus('', false); return; }
      gameSession.setFace(playerId, expression, {
        dataUrl: edited.dataUrl,
        compositeSourceDataUrl: edited.compositeSourceDataUrl,
        textureKey: faceTextureKey(playerId, expression),
        originalName: file.name,
      });
      if (preview) preview.src = edited.dataUrl; slot?.classList.add('has-image'); this.setStatus('✓ Đã lưu mặt', false);
    } catch (error) { this.setStatus(error instanceof Error ? error.message : 'Không xử lý được ảnh.', true); }
    finally { slot?.classList.remove('loading'); input.value = ''; }
  }

  private async handleFaceBatchSelection(
    root: HTMLDivElement,
    playerId: number,
    input: HTMLInputElement,
    oneForAll: boolean,
  ): Promise<void> {
    const files = [...(input.files ?? [])];
    if (files.length === 0) return;

    await waitForMobileLandscapeAfterPicker07032();
    this.setStatus(oneForAll ? 'Đang chỉnh 1 ảnh cho cả 3 biểu cảm…' : `Đã nhận ${Math.min(files.length, 3)} ảnh • chỉnh lần lượt trong MeMeMe`, false);

    try {
      if (oneForAll) {
        const edited = await FaceImageEditor.open(files[0], 'Cả 3 biểu cảm');
        if (!edited) { this.setStatus('', false); return; }
        for (const expression of EXPRESSIONS) {
          gameSession.setFace(playerId, expression.id, {
            dataUrl: edited.dataUrl,
            compositeSourceDataUrl: edited.compositeSourceDataUrl,
            textureKey: faceTextureKey(playerId, expression.id),
            originalName: files[0].name,
          });
          const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression.id}`);
          const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression.id}`);
          if (preview) preview.src = edited.dataUrl;
          slot?.classList.add('has-image');
        }
        this.setStatus('✓ Một ảnh đã áp dụng cho cả 3 biểu cảm', false);
        return;
      }

      const selected = files.slice(0, 3);
      for (let index = 0; index < selected.length; index += 1) {
        const expression = EXPRESSIONS[index];
        const file = selected[index];
        this.setStatus(`Đang chỉnh ${index + 1}/${selected.length}: ${expression.label}`, false);
        const edited = await FaceImageEditor.open(file, `${index + 1}/${selected.length} • ${expression.label}`);
        if (!edited) continue;

        gameSession.setFace(playerId, expression.id, {
          dataUrl: edited.dataUrl,
          compositeSourceDataUrl: edited.compositeSourceDataUrl,
          textureKey: faceTextureKey(playerId, expression.id),
          originalName: file.name,
        });
        const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression.id}`);
        const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression.id}`);
        if (preview) preview.src = edited.dataUrl;
        slot?.classList.add('has-image');
      }

      if (selected.length < 3) {
        this.setStatus(`✓ Đã lưu ${selected.length} ảnh. Muốn đủ 3, có thể chạm ô còn thiếu.`, false);
      } else {
        this.setStatus('✓ Đã lưu đủ 3 ảnh • chỉ mở thư viện một lần', false);
      }
    } catch (error) {
      this.setStatus(error instanceof Error ? error.message : 'Không xử lý được bộ ảnh.', true);
    } finally {
      input.value = '';
    }
  }

  private async handleFaceCameraCapture(
    root: HTMLDivElement,
    playerId: number,
    oneForAll: boolean,
  ): Promise<void> {
    this.setStatus('Đang mở camera…', false);

    try {
      const labels = oneForAll ? ['Cả 3 biểu cảm'] : EXPRESSIONS.map((expression) => expression.label);
      const captured = await FaceCameraCapture07033.capture(labels);
      if (!captured || captured.files.length === 0) {
        this.setStatus('', false);
        return;
      }

      if (oneForAll) {
        const file = captured.files[0];
        const edited = await FaceImageEditor.open(file, 'Cả 3 biểu cảm');
        if (!edited) {
          this.setStatus('', false);
          return;
        }
        for (const expression of EXPRESSIONS) {
          gameSession.setFace(playerId, expression.id, {
            dataUrl: edited.dataUrl,
            compositeSourceDataUrl: edited.compositeSourceDataUrl,
            textureKey: faceTextureKey(playerId, expression.id),
            originalName: file.name,
          });
          const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression.id}`);
          const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression.id}`);
          if (preview) preview.src = edited.dataUrl;
          slot?.classList.add('has-image');
        }
        this.setStatus('✓ Ảnh camera đã áp dụng cho cả 3 biểu cảm', false);
        return;
      }

      for (let index = 0; index < captured.files.length && index < EXPRESSIONS.length; index += 1) {
        const expression = EXPRESSIONS[index];
        const file = captured.files[index];
        this.setStatus(`Đang chỉnh ảnh camera ${index + 1}/${captured.files.length}: ${expression.label}`, false);
        const edited = await FaceImageEditor.open(file, `${index + 1}/${captured.files.length} • ${expression.label}`);
        if (!edited) continue;

        gameSession.setFace(playerId, expression.id, {
          dataUrl: edited.dataUrl,
          compositeSourceDataUrl: edited.compositeSourceDataUrl,
          textureKey: faceTextureKey(playerId, expression.id),
          originalName: file.name,
        });
        const preview = root.querySelector<HTMLImageElement>(`#preview-${playerId}-${expression.id}`);
        const slot = root.querySelector<HTMLElement>(`#slot-${playerId}-${expression.id}`);
        if (preview) preview.src = edited.dataUrl;
        slot?.classList.add('has-image');
      }

      this.setStatus('✓ Đã chụp và lưu 3 biểu cảm ngay trong MeMeMe', false);
    } catch (error) {
      this.setStatus(error instanceof Error ? error.message : 'Không dùng được camera.', true);
    }
  }

  private captureNames(root: HTMLDivElement): boolean {
    for (const player of gameSession.players) { const input = root.querySelector<HTMLInputElement>(`#player-name-${player.id}`); if (input) gameSession.setPlayerName(player.id, input.value); }
    if (gameSession.players.some((p) => p.name.trim().length === 0)) { this.setStatus('Nhập tên người chơi.', true); return false; }
    return true;
  }
  private startGame(): void { configureInitialTargetLaps(gameSession.targetLaps); sfxController.play('ui_confirm'); this.scene.start('TurnOrderScene'); }
  private setStatus(message: string, isError: boolean): void { if (!this.statusElement) return; this.statusElement.textContent = message; this.statusElement.classList.toggle('error', isError); }
}
