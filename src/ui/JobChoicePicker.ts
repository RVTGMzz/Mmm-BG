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

/**
 * Multiplayer-friendly Job Hub overlay. The controller gets the D6 button while
 * spectators see the exact same A/B/C offer with a waiting label. The overlay does
 * not generate a die result or choose a Job; it only reports the local click.
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
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.7).setInteractive();
  const panel = scene.add.rectangle(0, 0, 960, 540, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
  const title = scene.add.text(0, -224, `💼 ${playerName} • JOB HUB`, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: '29px',
    fontStyle: 'bold',
    color: '#202020',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -184, '3 nghề đã random • Xúc xắc quyết định A / B / C • xem rõ lương và rủi ro trước khi đổ.', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
    color: '#6d655b',
  }).setOrigin(0.5);
  root.add([backdrop, panel, title, subtitle]);

  const letters = ['A', 'B', 'C'];
  const ranges = ['🎲 1–2', '🎲 3–4', '🎲 5–6'];
  const xs = [-300, 0, 300];
  jobs.forEach((job, index) => {
    const x = xs[index] ?? 0;
    const risky = job.risk === 'crime';
    const profile = jobDepthProfile059(job);
    const box = scene.add.rectangle(x, 0, 265, 300, risky ? 0xffc6c1 : 0xffe09a, 1)
      .setStrokeStyle(4, 0x242424, 1);
    const letterBadge = scene.add.circle(x - 104, -116, 22, risky ? 0xc34742 : 0x5d4773, 1)
      .setStrokeStyle(3, 0x242424, 1);
    const letter = scene.add.text(x - 104, -116, letters[index] ?? '?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const range = scene.add.text(x + 18, -119, ranges[index] ?? '🎲', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#5d4773',
    }).setOrigin(0.5);
    const icon = scene.add.text(x, -77, job.icon, { fontSize: '40px' }).setOrigin(0.5);
    const name = scene.add.text(x, -34, job.title, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#202020',
      fixedWidth: 235,
      align: 'center',
    }).setOrigin(0.5);
    const salary = scene.add.text(x, 8, `💰 ${jobSalary(job, 1)} / ${jobSalary(job, 2)} / ${jobSalary(job, 3)} B$`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const salaryLabel = scene.add.text(x, 30, `Lv.1 / Lv.2 / Lv.3 • ${profile.salaryCurveLabel}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#746a60',
    }).setOrigin(0.5);
    const riskLabel = scene.add.text(x, 56, `${profile.riskIcon} ${profile.riskLabel}`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#4f4740',
    }).setOrigin(0.5);
    const odds = job.risk === 'crime'
      ? `⬆ ${profile.promotionPercent}% • ⬇ ${profile.demotionPercent}% • 🚔 ${profile.jailPercent}%`
      : `⬆ ${profile.promotionPercent}% • ⬇ ${profile.demotionPercent}% • 📦 ${profile.firedPercent}% khi tụt`;
    const oddsText = scene.add.text(x, 77, odds, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#5d554d',
      fixedWidth: 235,
      align: 'center',
    }).setOrigin(0.5);
    const special = scene.add.text(x, 111, job.special, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#4f4740',
      align: 'center',
      fixedWidth: 225,
      wordWrap: { width: 225 },
      maxLines: 3,
    }).setOrigin(0.5);
    root.add([box, letterBadge, letter, range, icon, name, salary, salaryLabel, riskLabel, oddsText, special]);
  });

  const diceRule = scene.add.text(0, 172, '1–2 → A     •     3–4 → B     •     5–6 → C', {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: '13px',
    fontStyle: 'bold',
    color: '#4f4740',
  }).setOrigin(0.5);
  const rollButton = scene.add.rectangle(0, 220, 340, 58, canRoll ? 0xef4545 : 0xb8ada1, 1)
    .setStrokeStyle(4, 0x242424, 1);
  const defaultLabel = canRoll ? '🎲 ĐỔ XÚC XẮC JOB' : (options.waitingLabel ?? `⏳ CHỜ ${playerName} ĐỔ JOB`);
  const rollText = scene.add.text(0, 220, defaultLabel, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: canRoll ? '18px' : '14px',
    fontStyle: 'bold',
    color: '#ffffff',
    fixedWidth: 315,
    align: 'center',
  }).setOrigin(0.5);
  const authorityText = scene.add.text(0, 253, 'HOST quyết định D6 authoritative • client không gửi kết quả nghề', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    fontStyle: 'bold',
    color: '#746a60',
  }).setOrigin(0.5);
  root.add([diceRule, rollButton, rollText, authorityText]);

  let submitted = false;
  let resolveRoll!: () => void;
  const rolled = new Promise<void>((resolve) => {
    resolveRoll = resolve;
  });

  const enableRoll = (label = '🎲 ĐỔ XÚC XẮC JOB') => {
    if (!root.active || !canRoll) return;
    submitted = false;
    rollButton.setFillStyle(0xef4545, 1).setInteractive({ useHandCursor: true });
    rollText.setText(label).setFontSize(18);
  };

  const setWaiting = (label = '⏳ ĐÃ BẤM • CHỜ HOST CHỐT D6...') => {
    if (!root.active) return;
    rollButton.disableInteractive().setFillStyle(0xb8ada1, 1).setScale(1);
    rollText.setText(label).setFontSize(13);
  };

  if (canRoll) enableRoll();

  rollButton.on('pointerover', () => {
    if (canRoll && !submitted) rollButton.setScale(1.035);
  });
  rollButton.on('pointerout', () => rollButton.setScale(1));
  rollButton.on('pointerdown', () => {
    if (!canRoll || submitted || !root.active) return;
    submitted = true;
    sfxController.play('ui_confirm');
    setWaiting();
    resolveRoll();
  });
  backdrop.on('pointerdown', () => undefined);

  return {
    root,
    rolled,
    setWaiting,
    setReady: enableRoll,
    close: () => {
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
