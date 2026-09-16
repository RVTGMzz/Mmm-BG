import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobDepthProfile059, jobSalary, type JobDefinition } from '../core/jobs';

export interface JobRollPickerOptions {
  canRoll?: boolean;
  waitingLabel?: string;
}

export interface JobRollPickerHandle {
  root: Phaser.GameObjects.Container;
  rolled: Promise<void>;
  setWaiting(label?: string): void;
  setReady(label?: string): void;
  close(): void;
}

const JOB_CARD_X_0682 = [-300, 0, 300] as const;
const JOB_CARD_LETTERS_0682 = ['A', 'B', 'C'] as const;
const JOB_CARD_RANGES_0682 = ['🎲 1–2', '🎲 3–4', '🎲 5–6'] as const;

/**
 * Multiplayer-friendly Job Hub overlay.
 *
 * 0.1.68.2 follows the canonical MeMeMe UI contract: the three Job cards stay
 * concise and readable; touch/click/controller confirm or A/B/C keyboard input opens
 * a dedicated detail surface. The overlay never rolls or chooses gameplay outcomes.
 */
export function createJobRollPicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
  options: JobRollPickerOptions = {},
): JobRollPickerHandle {
  if (jobs.length !== 3) throw new Error('Job Roll picker requires exactly 3 offered Jobs.');

  const canRoll = options.canRoll ?? true;
  const root = scene.add.container(640, 360).setDepth(980);
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.72).setInteractive();
  const panel = scene.add.rectangle(0, 0, 960, 540, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
  const title = scene.add.text(0, -224, `💼 ${playerName} • JOB HUB`, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: '30px',
    fontStyle: 'bold',
    color: '#202020',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -184, 'Xúc xắc chọn A / B / C • Chạm nghề hoặc nhấn A để xem chi tiết', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#6d655b',
  }).setOrigin(0.5);
  root.add([backdrop, panel, title, subtitle]);

  const cardBoxes: Phaser.GameObjects.Rectangle[] = [];
  const cardHints: Phaser.GameObjects.Text[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;

  const setCardInteractive = (enabled: boolean): void => {
    for (const box of cardBoxes) {
      if (enabled) box.setInteractive({ useHandCursor: true });
      else box.disableInteractive();
    }
  };

  const restoreRollInteraction = (): void => {
    if (!canRoll || submitted || !root.active) return;
    rollButton.setInteractive({ useHandCursor: true });
  };

  const closeDetail = (): void => {
    if (detailRoot?.active) detailRoot.destroy(true);
    detailRoot = undefined;
    setCardInteractive(true);
    restoreRollInteraction();
  };

  const openDetail = (index: number): void => {
    const job = jobs[index];
    if (!job || !root.active) return;
    closeDetail();
    setCardInteractive(false);
    rollButton.disableInteractive().setScale(1);
    sfxController.play('ui_confirm');

    const profile = jobDepthProfile059(job);
    const risky = job.risk === 'crime';
    const odds = risky
      ? `Tăng cấp ${profile.promotionPercent}% • Tụt ${profile.demotionPercent}% • Vào tù ${profile.jailPercent}%`
      : `Tăng cấp ${profile.promotionPercent}% • Tụt ${profile.demotionPercent}% • Mất việc ${profile.firedPercent}% khi tụt`;

    const detail = scene.add.container(640, 360).setDepth(995);
    detailRoot = detail;
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.78).setInteractive();
    const detailPanel = scene.add.rectangle(0, 0, 720, 430, 0xfffbf3, 1).setStrokeStyle(6, risky ? 0xc34742 : 0x5d4773, 1);
    const detailTitle = scene.add.text(0, -165, `${job.icon} ${job.title}`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const mapping = scene.add.text(0, -118, `${JOB_CARD_LETTERS_0682[index]} • ${JOB_CARD_RANGES_0682[index]}`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#5d4773',
    }).setOrigin(0.5);
    const salaries = scene.add.text(0, -72, `💰 Lv1 ${jobSalary(job, 1)}  •  Lv2 ${jobSalary(job, 2)}  •  Lv3 ${jobSalary(job, 3)} B$/vòng`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const identity = scene.add.text(0, -28, `${profile.riskIcon} ${profile.riskLabel} • ${profile.salaryCurveLabel}`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#4f4740',
    }).setOrigin(0.5);
    const oddsText = scene.add.text(0, 12, odds, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#5d554d',
      fixedWidth: 610,
      align: 'center',
      wordWrap: { width: 610 },
      maxLines: 2,
    }).setOrigin(0.5);
    const special = scene.add.text(0, 68, job.special, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#36312c',
      fixedWidth: 610,
      align: 'center',
      wordWrap: { width: 610 },
      maxLines: 3,
    }).setOrigin(0.5);
    const closeButton = scene.add.rectangle(0, 158, 210, 54, 0x242424, 1)
      .setStrokeStyle(3, 0xffffff, 0.9)
      .setInteractive({ useHandCursor: true });
    const closeText = scene.add.text(0, 158, '← ĐÓNG', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const closeHint = scene.add.text(0, 198, 'Esc / Controller B / A trên nút ĐÓNG', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#756d62',
    }).setOrigin(0.5);

    detail.add([dim, detailPanel, detailTitle, mapping, salaries, identity, oddsText, special, closeButton, closeText, closeHint]);
    closeButton.on('pointerover', () => closeButton.setScale(1.04));
    closeButton.on('pointerout', () => closeButton.setScale(1));
    closeButton.on('pointerdown', () => {
      sfxController.play('ui_confirm');
      closeDetail();
    });
    dim.on('pointerdown', closeDetail);
  };

  jobs.forEach((job, index) => {
    const x = JOB_CARD_X_0682[index] ?? 0;
    const risky = job.risk === 'crime';
    const profile = jobDepthProfile059(job);
    const box = scene.add.rectangle(x, -4, 265, 276, risky ? 0xffc6c1 : 0xffe09a, 1)
      .setStrokeStyle(4, 0x242424, 1)
      .setInteractive({ useHandCursor: true });
    cardBoxes.push(box);

    const letterBadge = scene.add.circle(x - 104, -112, 22, risky ? 0xc34742 : 0x5d4773, 1)
      .setStrokeStyle(3, 0x242424, 1);
    const letter = scene.add.text(x - 104, -112, JOB_CARD_LETTERS_0682[index] ?? '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const range = scene.add.text(x + 22, -112, JOB_CARD_RANGES_0682[index] ?? '🎲', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#5d4773',
    }).setOrigin(0.5);
    const icon = scene.add.text(x, -66, job.icon, { fontSize: '46px' }).setOrigin(0.5);
    const name = scene.add.text(x, -20, job.title, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 235,
      align: 'center',
    }).setOrigin(0.5);
    const salary = scene.add.text(x, 27, `💰 ${jobSalary(job, 1)} / ${jobSalary(job, 2)} / ${jobSalary(job, 3)}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const riskLabel = scene.add.text(x, 65, `${profile.riskIcon} ${profile.riskLabel}`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#4f4740',
    }).setOrigin(0.5);
    const hint = scene.add.text(x, 105, 'CHẠM / A: CHI TIẾT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#6d655b',
    }).setOrigin(0.5);
    cardHints.push(hint);
    root.add([box, letterBadge, letter, range, icon, name, salary, riskLabel, hint]);

    box.on('pointerover', () => {
      box.setStrokeStyle(7, risky ? 0xc34742 : 0x5d4773, 1);
      hint.setText('A / ENTER: MỞ CHI TIẾT').setColor(risky ? '#9e2f2c' : '#5d4773');
    });
    box.on('pointerout', () => {
      box.setStrokeStyle(4, 0x242424, 1);
      hint.setText('CHẠM / A: CHI TIẾT').setColor('#6d655b');
    });
    box.on('pointerdown', () => openDetail(index));
  });

  const diceRule = scene.add.text(0, 154, '1–2 → A     •     3–4 → B     •     5–6 → C', {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#4f4740',
  }).setOrigin(0.5);
  const rollButton = scene.add.rectangle(0, 211, 360, 60, canRoll ? 0xef4545 : 0xb8ada1, 1)
    .setStrokeStyle(4, 0x242424, 1);
  const defaultLabel = canRoll ? '🎲 ĐỔ XÚC XẮC JOB' : (options.waitingLabel ?? `⏳ CHỜ ${playerName} ĐỔ JOB`);
  const rollText = scene.add.text(0, 211, defaultLabel, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: canRoll ? '19px' : '14px',
    fontStyle: 'bold',
    color: '#ffffff',
    fixedWidth: 330,
    align: 'center',
  }).setOrigin(0.5);
  const authorityText = scene.add.text(0, 250, 'HOST quyết định kết quả D6', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#746a60',
  }).setOrigin(0.5);
  root.add([diceRule, rollButton, rollText, authorityText]);

  let resolveRoll!: () => void;
  const rolled = new Promise<void>((resolve) => {
    resolveRoll = resolve;
  });

  const enableRoll = (label = '🎲 ĐỔ XÚC XẮC JOB') => {
    if (!root.active || !canRoll) return;
    submitted = false;
    rollButton.setFillStyle(0xef4545, 1).setInteractive({ useHandCursor: true });
    rollText.setText(label).setFontSize(19);
  };

  const setWaiting = (label = '⏳ ĐÃ BẤM • CHỜ HOST...') => {
    if (!root.active) return;
    closeDetail();
    rollButton.disableInteractive().setFillStyle(0xb8ada1, 1).setScale(1);
    rollText.setText(label).setFontSize(14);
  };

  if (canRoll) enableRoll();

  rollButton.on('pointerover', () => {
    if (canRoll && !submitted && !detailRoot) rollButton.setScale(1.035);
  });
  rollButton.on('pointerout', () => rollButton.setScale(1));
  rollButton.on('pointerdown', () => {
    if (!canRoll || submitted || !root.active || detailRoot) return;
    submitted = true;
    sfxController.play('ui_confirm');
    setWaiting();
    resolveRoll();
  });
  backdrop.on('pointerdown', () => undefined);

  const keyboardHandler = (event: KeyboardEvent): void => {
    if (!root.active) return;
    const key = event.key.toLocaleLowerCase();
    if (key === 'escape') {
      closeDetail();
      return;
    }
    const index = key === 'a' || key === '1' ? 0 : key === 'b' || key === '2' ? 1 : key === 'c' || key === '3' ? 2 : -1;
    if (index >= 0) openDetail(index);
  };
  const controllerBackHandler = (): void => closeDetail();
  scene.input.keyboard?.on('keydown', keyboardHandler);
  scene.events.on('mememe-ui-back', controllerBackHandler);

  return {
    root,
    rolled,
    setWaiting,
    setReady: enableRoll,
    close: () => {
      scene.input.keyboard?.off('keydown', keyboardHandler);
      scene.events.off('mememe-ui-back', controllerBackHandler);
      closeDetail();
      if (root.active) root.destroy(true);
    },
  };
}

/** Legacy single-controller helper retained for older callers/tests. */
export function showJobRollPicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
): Promise<void> {
  if (jobs.length !== 3) return Promise.resolve();
  const picker = createJobRollPicker(scene, playerName, jobs, { canRoll: true });
  return picker.rolled.finally(() => picker.close());
}
