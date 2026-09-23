import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobSalary, type JobDefinition } from '../core/jobs';

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

const JOB_CARD_X_070421 = [-286, 0, 286] as const;
const JOB_CARD_LETTERS_070421 = ['A', 'B', 'C'] as const;
const JOB_CARD_RANGES_070421 = ['1–2', '3–4', '5–6'] as const;
const JOB_FONT_070421 = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

function roundedPanel070421(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  stroke: number,
  radius = 24,
  shadow = true,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y);
  if (shadow) {
    const shade = scene.add.graphics();
    shade.fillStyle(0x3e2b25, 0.22);
    shade.fillRoundedRect(-width / 2, -height / 2 + 8, width, height, radius);
    root.add(shade);
  }
  const panel = scene.add.graphics();
  panel.fillStyle(fill, 1);
  panel.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  panel.lineStyle(4, stroke, 1);
  panel.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  root.add(panel);
  return root;
}

/**
 * Canonical Job Hub.
 *
 * The hub is intentionally glanceable: three compact cards, one salary line and
 * one detail action. Selection still comes only from the authoritative Job D6.
 */
export function createJobRollPicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
  options: JobRollPickerOptions = {},
): JobRollPickerHandle {
  if (jobs.length !== 3) throw new Error('Job Roll picker requires exactly 3 offered Jobs.');

  const canRoll = options.canRoll ?? true;
  const root = scene.add.container(640, 360).setDepth(980).setName('job-hub-modal');
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.7).setInteractive();

  const shell = roundedPanel070421(scene, 0, 0, 950, 516, 0xfff8ec, 0x4b332b, 28);
  const headerBand = scene.add.graphics();
  headerBand.fillStyle(0xffd76c, 1);
  headerBand.fillRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });
  headerBand.lineStyle(2, 0xe5a839, 1);
  headerBand.strokeRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });

  const title = scene.add.text(-414, -211, '💼 JOB HUB', {
    fontFamily: JOB_FONT_070421,
    fontSize: '27px',
    fontStyle: 'bold',
    color: '#3d2924',
  }).setOrigin(0, 0.5);
  const player = scene.add.text(414, -211, playerName, {
    fontFamily: JOB_FONT_070421,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#6c5146',
  }).setOrigin(1, 0.5);
  const subtitle = scene.add.text(0, -151, 'Đổ xúc xắc để chọn nghề', {
    fontFamily: JOB_FONT_070421,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#574239',
  }).setOrigin(0.5);

  root.add([backdrop, shell, headerBand, title, player, subtitle]);

  const cardHits: Phaser.GameObjects.Rectangle[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;

  const setCardInteractive = (enabled: boolean): void => {
    for (const hit of cardHits) {
      if (enabled) hit.setInteractive({ useHandCursor: true });
      else hit.disableInteractive();
    }
  };

  const restoreHubVisuals = (): void => {
    if (!root.active) return;
    root.setVisible(true).setAlpha(1);
    const restore = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) object.setVisible(true).setAlpha(1);
      if (object instanceof Phaser.GameObjects.Container) {
        for (const child of object.list) restore(child);
      }
    };
    restore(root);
  };

  const restoreRollInteraction = (): void => {
    if (!canRoll || submitted || !root.active) return;
    rollHit.setInteractive({ useHandCursor: true });
  };

  const closeDetail = (): void => {
    if (detailRoot?.active) detailRoot.destroy(true);
    detailRoot = undefined;
    restoreHubVisuals();
    setCardInteractive(true);
    restoreRollInteraction();
  };

  const openDetail = (index: number): void => {
    const job = jobs[index];
    if (!job || !root.active) return;
    closeDetail();
    setCardInteractive(false);
    rollHit.disableInteractive();
    sfxController.play('ui_confirm');

    const risky = job.risk === 'crime';
    const detail = scene.add.container(640, 360).setDepth(995).setName('job-detail-modal');
    detailRoot = detail;
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.78).setInteractive();
    const detailShell = roundedPanel070421(
      scene,
      0,
      0,
      748,
      352,
      risky ? 0xfff1ee : 0xfff8ec,
      risky ? 0xb8423d : 0x6f5a91,
      26,
    );
    const detailKicker = scene.add.text(0, -132, risky ? '⚠ NGHỀ RỦI RO' : 'XEM NGHỀ', {
      fontFamily: JOB_FONT_070421,
      fontSize: '13px',
      fontStyle: 'bold',
      color: risky ? '#a63330' : '#716554',
    }).setOrigin(0.5);
    const detailTitle = scene.add.text(0, -87, `${job.icon}  ${job.title}`, {
      fontFamily: JOB_FONT_070421,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 650,
      align: 'center',
    }).setOrigin(0.5);
    const salaries = scene.add.text(
      0,
      -35,
      `LƯƠNG / VÒNG   Lv1 ${jobSalary(job, 1)}   •   Lv2 ${jobSalary(job, 2)}   •   Lv3 ${jobSalary(job, 3)} B$`,
      {
        fontFamily: JOB_FONT_070421,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#5c4439',
        fixedWidth: 650,
        align: 'center',
      },
    ).setOrigin(0.5);
    const divider = scene.add.rectangle(0, 0, 620, 2, risky ? 0xefb8b3 : 0xd8cab9, 1);
    const special = scene.add.text(0, 42, job.special, {
      fontFamily: JOB_FONT_070421,
      fontSize: '16px',
      color: '#43352e',
      fixedWidth: 610,
      align: 'center',
      wordWrap: { width: 610, useAdvancedWrap: true },
      maxLines: 3,
      lineSpacing: 4,
    }).setOrigin(0.5);

    const closeShadow = scene.add.graphics();
    closeShadow.fillStyle(0x3e2b25, 0.24);
    closeShadow.fillRoundedRect(-112, 115, 224, 56, 18);
    const closeFace = scene.add.graphics();
    closeFace.fillStyle(0x4b332b, 1);
    closeFace.fillRoundedRect(-112, 109, 224, 56, 18);
    closeFace.lineStyle(3, 0x2f211d, 1);
    closeFace.strokeRoundedRect(-112, 109, 224, 56, 18);
    const closeText = scene.add.text(0, 137, '← ĐÓNG', {
      fontFamily: JOB_FONT_070421,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const closeHit = scene.add.rectangle(0, 137, 224, 56, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    detail.add([
      dim,
      detailShell,
      detailKicker,
      detailTitle,
      salaries,
      divider,
      special,
      closeShadow,
      closeFace,
      closeText,
      closeHit,
    ]);

    closeHit.on('pointerdown', () => {
      sfxController.play('ui_confirm');
      closeDetail();
    });
    dim.on('pointerdown', closeDetail);
  };

  jobs.forEach((job, index) => {
    const x = JOB_CARD_X_070421[index] ?? 0;
    const risky = job.risk === 'crime';

    const card = roundedPanel070421(
      scene,
      x,
      0,
      250,
      230,
      risky ? 0xffe2dc : 0xfff1bf,
      risky ? 0xb8423d : 0x5f4a40,
      22,
    );

    const badge = scene.add.graphics();
    badge.fillStyle(risky ? 0xb8423d : 0x6f5a91, 1);
    badge.fillRoundedRect(x - 105, -96, 42, 28, 12);
    const letter = scene.add.text(x - 84, -82, JOB_CARD_LETTERS_070421[index] ?? '?', {
      fontFamily: JOB_FONT_070421,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const range = scene.add.text(x + 82, -82, `🎲 ${JOB_CARD_RANGES_070421[index] ?? ''}`, {
      fontFamily: JOB_FONT_070421,
      fontSize: '15px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#5c477c',
    }).setOrigin(0.5);

    const icon = scene.add.text(x, -44, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '39px',
    }).setOrigin(0.5);
    const name = scene.add.text(x, 0, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 220,
      align: 'center',
    }).setOrigin(0.5);
    const salary = scene.add.text(
      x,
      39,
      `${jobSalary(job, 1)}  •  ${jobSalary(job, 2)}  •  ${jobSalary(job, 3)} B$`,
      {
        fontFamily: JOB_FONT_070421,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#5a463d',
        fixedWidth: 220,
        align: 'center',
      },
    ).setOrigin(0.5);
    const salaryLabel = scene.add.text(x, 63, 'LƯƠNG Lv1 • Lv2 • Lv3', {
      fontFamily: JOB_FONT_070421,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#8b7569',
    }).setOrigin(0.5);

    const detailPill = scene.add.graphics();
    detailPill.fillStyle(risky ? 0xffbbb4 : 0xe5d8ff, 1);
    detailPill.fillRoundedRect(x - 82, 79, 164, 32, 14);
    const hint = scene.add.text(x, 95, 'XEM CHI TIẾT', {
      fontFamily: JOB_FONT_070421,
      fontSize: '11px',
      fontStyle: 'bold',
      color: risky ? '#8c2f2a' : '#5c477c',
    }).setOrigin(0.5);
    const hit = scene.add.rectangle(x, 0, 250, 230, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    cardHits.push(hit);

    root.add([card, badge, letter, range, icon, name, salary, salaryLabel, detailPill, hint, hit]);

    hit.on('pointerover', () => {
      scene.tweens.killTweensOf(card);
      scene.tweens.add({ targets: card, scaleX: 1.025, scaleY: 1.025, duration: 100 });
    });
    hit.on('pointerout', () => {
      scene.tweens.killTweensOf(card);
      scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
    });
    hit.on('pointerdown', () => openDetail(index));
  });

  const rollShadow = scene.add.graphics();
  rollShadow.fillStyle(0x7b4f1e, 0.35);
  rollShadow.fillRoundedRect(-178, 190, 356, 62, 20);
  const rollFace = scene.add.graphics();
  rollFace.fillStyle(canRoll ? 0xffc94d : 0xc7baaa, 1);
  rollFace.fillRoundedRect(-178, 184, 356, 62, 20);
  rollFace.lineStyle(4, 0x4b332b, 1);
  rollFace.strokeRoundedRect(-178, 184, 356, 62, 20);
  const defaultLabel = canRoll ? '🎲 ĐỔ XÚC XẮC' : (options.waitingLabel ?? `⏳ CHỜ ${playerName}`);
  const rollText = scene.add.text(0, 215, defaultLabel, {
    fontFamily: JOB_FONT_070421,
    fontSize: canRoll ? '19px' : '14px',
    fontStyle: 'bold',
    color: '#3d2924',
    fixedWidth: 326,
    align: 'center',
  }).setOrigin(0.5);
  const rollHit = scene.add.rectangle(0, 215, 356, 62, 0xffffff, 0.001);
  root.add([rollShadow, rollFace, rollText, rollHit]);

  let resolveRoll!: () => void;
  const rolled = new Promise<void>((resolve) => {
    resolveRoll = resolve;
  });

  const enableRoll = (label = '🎲 ĐỔ XÚC XẮC') => {
    if (!root.active || !canRoll) return;
    submitted = false;
    rollFace.clear();
    rollFace.fillStyle(0xffc94d, 1);
    rollFace.fillRoundedRect(-178, 184, 356, 62, 20);
    rollFace.lineStyle(4, 0x4b332b, 1);
    rollFace.strokeRoundedRect(-178, 184, 356, 62, 20);
    rollHit.setInteractive({ useHandCursor: true });
    rollText.setText(label).setFontSize(19).setColor('#3d2924');
  };

  const setWaiting = (label = '⏳ ĐÃ BẤM • CHỜ HOST...') => {
    if (!root.active) return;
    closeDetail();
    rollHit.disableInteractive();
    rollFace.clear();
    rollFace.fillStyle(0xc7baaa, 1);
    rollFace.fillRoundedRect(-178, 184, 356, 62, 20);
    rollFace.lineStyle(4, 0x6c5b50, 1);
    rollFace.strokeRoundedRect(-178, 184, 356, 62, 20);
    rollText.setText(label).setFontSize(14).setColor('#5b4e46');
  };

  if (canRoll) enableRoll();

  rollHit.on('pointerdown', () => {
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
  scene.input.keyboard?.on('keydown', keyboardHandler);

  return {
    root,
    rolled,
    setWaiting,
    setReady: enableRoll,
    close: () => {
      scene.input.keyboard?.off('keydown', keyboardHandler);
      closeDetail();
      if (root.active) root.destroy(true);
    },
  };
}

/** Legacy helper retained for older callers/tests. */
export function showJobRollPicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
): Promise<void> {
  if (jobs.length !== 3) return Promise.resolve();
  const picker = createJobRollPicker(scene, playerName, jobs, { canRoll: true });
  return picker.rolled.finally(() => picker.close());
}
