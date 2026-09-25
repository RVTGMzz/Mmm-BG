import Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobSalary, type JobDefinition } from '../core/jobs';
import { nextJobHubFocus070423, type JobHubFocus, type JobHubNavKey } from './jobHubFocus070423';
import { PAD_EVENT_070424 } from './steamDeckController070424';
import type { PadAction070424 } from './steamDeckPadPolicy070424';
import { JOB_HUB_VF06, jobCardPaletteVf06 } from './visualFoundationJobVf06';

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

  const shell = roundedPanel070421(
    scene,
    0,
    0,
    950,
    516,
    JOB_HUB_VF06.shell,
    JOB_HUB_VF06.cocoa,
    JOB_HUB_VF06.radius,
  );
  const headerBand = scene.add.graphics();
  headerBand.fillStyle(JOB_HUB_VF06.butter, 1);
  headerBand.fillRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });
  headerBand.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.72);
  headerBand.strokeRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });

  const title = scene.add.text(-414, -211, '💼 JOB HUB', {
    fontFamily: JOB_FONT_070421,
    fontSize: '27px',
    fontStyle: 'bold',
    color: '#4a302a',
  }).setOrigin(0, 0.5);
  const player = scene.add.text(414, -211, playerName, {
    fontFamily: JOB_FONT_070421,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#765047',
  }).setOrigin(1, 0.5);
  const subtitlePlate = scene.add.graphics();
  subtitlePlate.fillStyle(JOB_HUB_VF06.creamHighlight, 0.98);
  subtitlePlate.fillRoundedRect(-166, -169, 332, 38, 17);
  subtitlePlate.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.3);
  subtitlePlate.strokeRoundedRect(-166, -169, 332, 38, 17);

  const subtitle = scene.add.text(0, -150, 'Đổ xúc xắc để chọn nghề', {
    fontFamily: JOB_FONT_070421,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#574239',
  }).setOrigin(0.5);

  root.add([backdrop, shell, headerBand, title, player, subtitlePlate, subtitle]);

  const cardHits: Phaser.GameObjects.Rectangle[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;
  // Keyboard focus is a real in-game selection, not the OS mouse pointer.
  // An active player starts on ROLL and can finish the entire Job flow with Enter.
  let focused: JobHubFocus = canRoll ? 'roll' : 0;
  let renderKeyboardFocus = (): void => undefined;

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
    renderKeyboardFocus();
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
    renderKeyboardFocus(); // The detail sheet owns the focus until it closes.
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.78).setInteractive();
    const detailPalette = jobCardPaletteVf06(index, risky);
    const detailShell = roundedPanel070421(
      scene,
      0,
      0,
      748,
      352,
      risky ? 0xfff1ee : JOB_HUB_VF06.shell,
      risky ? detailPalette.strong : JOB_HUB_VF06.cocoa,
      26,
    );
    const detailKicker = scene.add.text(0, -132, risky ? '⚠ NGHỀ RỦI RO' : 'XEM NGHỀ', {
      fontFamily: JOB_FONT_070421,
      fontSize: '13px',
      fontStyle: 'bold',
      color: risky ? '#a63330' : '#716554',
    }).setOrigin(0.5);
    const detailIconWell = scene.add.graphics();
    detailIconWell.fillStyle(detailPalette.soft, 1);
    detailIconWell.fillCircle(0, -96, 38);
    detailIconWell.lineStyle(3, detailPalette.accent, 0.9);
    detailIconWell.strokeCircle(0, -96, 38);
    const detailIcon = scene.add.text(0, -96, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '46px',
    }).setOrigin(0.5);
    const detailTitle = scene.add.text(0, -43, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 650,
      align: 'center',
    }).setOrigin(0.5);
    const salaries = scene.add.text(
      0,
      2,
      `LƯƠNG / VÒNG   Lv1 ${jobSalary(job, 1)}   •   Lv2 ${jobSalary(job, 2)}   •   Lv3 ${jobSalary(job, 3)} Bimport Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobSalary, type JobDefinition } from '../core/jobs';
import { nextJobHubFocus070423, type JobHubFocus, type JobHubNavKey } from './jobHubFocus070423';
import { PAD_EVENT_070424 } from './steamDeckController070424';
import type { PadAction070424 } from './steamDeckPadPolicy070424';
import { JOB_HUB_VF06, jobCardPaletteVf06 } from './visualFoundationJobVf06';

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

  const shell = roundedPanel070421(
    scene,
    0,
    0,
    950,
    516,
    JOB_HUB_VF06.shell,
    JOB_HUB_VF06.cocoa,
    JOB_HUB_VF06.radius,
  );
  const headerBand = scene.add.graphics();
  headerBand.fillStyle(JOB_HUB_VF06.butter, 1);
  headerBand.fillRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });
  headerBand.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.72);
  headerBand.strokeRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });

  const title = scene.add.text(-414, -211, '💼 JOB HUB', {
    fontFamily: JOB_FONT_070421,
    fontSize: '27px',
    fontStyle: 'bold',
    color: '#4a302a',
  }).setOrigin(0, 0.5);
  const player = scene.add.text(414, -211, playerName, {
    fontFamily: JOB_FONT_070421,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#765047',
  }).setOrigin(1, 0.5);
  const subtitlePlate = scene.add.graphics();
  subtitlePlate.fillStyle(JOB_HUB_VF06.creamHighlight, 0.98);
  subtitlePlate.fillRoundedRect(-166, -169, 332, 38, 17);
  subtitlePlate.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.3);
  subtitlePlate.strokeRoundedRect(-166, -169, 332, 38, 17);

  const subtitle = scene.add.text(0, -150, 'Đổ xúc xắc để chọn nghề', {
    fontFamily: JOB_FONT_070421,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#574239',
  }).setOrigin(0.5);

  root.add([backdrop, shell, headerBand, title, player, subtitlePlate, subtitle]);

  const cardHits: Phaser.GameObjects.Rectangle[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;
  // Keyboard focus is a real in-game selection, not the OS mouse pointer.
  // An active player starts on ROLL and can finish the entire Job flow with Enter.
  let focused: JobHubFocus = canRoll ? 'roll' : 0;
  let renderKeyboardFocus = (): void => undefined;

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
    renderKeyboardFocus();
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
    renderKeyboardFocus(); // The detail sheet owns the focus until it closes.
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.78).setInteractive();
    const detailPalette = jobCardPaletteVf06(index, risky);
    const detailShell = roundedPanel070421(
      scene,
      0,
      0,
      748,
      352,
      risky ? 0xfff1ee : JOB_HUB_VF06.shell,
      risky ? detailPalette.strong : JOB_HUB_VF06.cocoa,
      26,
    );
    const detailKicker = scene.add.text(0, -132, risky ? '⚠ NGHỀ RỦI RO' : 'XEM NGHỀ', {
      fontFamily: JOB_FONT_070421,
      fontSize: '13px',
      fontStyle: 'bold',
      color: risky ? '#a63330' : '#716554',
    }).setOrigin(0.5);
    const detailIconWell = scene.add.graphics();
    detailIconWell.fillStyle(detailPalette.soft, 1);
    detailIconWell.fillCircle(0, -96, 38);
    detailIconWell.lineStyle(3, detailPalette.accent, 0.9);
    detailIconWell.strokeCircle(0, -96, 38);
    const detailIcon = scene.add.text(0, -96, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '46px',
    }).setOrigin(0.5);
    const detailTitle = scene.add.text(0, -43, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 650,
      align: 'center',
    }).setOrigin(0.5);
    const salaries = scene.add.text(
      0,
,
      {
        fontFamily: JOB_FONT_070421,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#5c4439',
        fixedWidth: 650,
        align: 'center',
      },
    ).setOrigin(0.5);
    const divider = scene.add.rectangle(0, 29, 620, 2, risky ? 0xefb8b3 : 0xd8cab9, 1);
    const special = scene.add.text(0, 67, job.special, {
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
      detailIconWell,
      detailIcon,
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
    const cardPalette = jobCardPaletteVf06(index, risky);

    const card = roundedPanel070421(
      scene,
      x,
      0,
      250,
      230,
      cardPalette.fill,
      JOB_HUB_VF06.cocoa,
      22,
    );

    const topAccent = scene.add.graphics();
    topAccent.fillStyle(cardPalette.accent, 1);
    topAccent.fillRoundedRect(x - 113, -103, 226, 11, { tl: 8, tr: 8, bl: 4, br: 4 });

    const badge = scene.add.graphics();
    badge.fillStyle(cardPalette.strong, 1);
    badge.fillRoundedRect(x - 105, -96, 42, 28, 12);
    const letter = scene.add.text(x - 84, -82, JOB_CARD_LETTERS_070421[index] ?? '?', {
      fontFamily: JOB_FONT_070421,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const rangePill = scene.add.graphics();
    rangePill.fillStyle(JOB_HUB_VF06.creamHighlight, 0.96);
    rangePill.fillRoundedRect(x + 48, -96, 70, 28, 12);
    rangePill.lineStyle(1.5, cardPalette.accent, 0.72);
    rangePill.strokeRoundedRect(x + 48, -96, 70, 28, 12);
    const range = scene.add.text(x + 83, -82, `🎲 ${JOB_CARD_RANGES_070421[index] ?? ''}`, {
      fontFamily: JOB_FONT_070421,
      fontSize: '15px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#4f615e',
    }).setOrigin(0.5);

    const iconWellShadow = scene.add.graphics();
    iconWellShadow.fillStyle(JOB_HUB_VF06.cocoa, 0.12);
    iconWellShadow.fillCircle(x, -35, JOB_HUB_VF06.iconWellRadius + 3);
    iconWellShadow.setPosition(0, 4);
    const iconWell = scene.add.graphics();
    iconWell.fillStyle(JOB_HUB_VF06.creamHighlight, 1);
    iconWell.fillCircle(x, -39, JOB_HUB_VF06.iconWellRadius);
    iconWell.lineStyle(3, cardPalette.accent, 0.82);
    iconWell.strokeCircle(x, -39, JOB_HUB_VF06.iconWellRadius);
    const icon = scene.add.text(x, -39, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '50px',
    }).setOrigin(0.5);
    const name = scene.add.text(x, 12, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 220,
      align: 'center',
    }).setOrigin(0.5);
    const salary = scene.add.text(
      x,
      51,
      `Lv1 ${jobSalary(job, 1)}  •  Lv2 ${jobSalary(job, 2)}  •  Lv3 ${jobSalary(job, 3)} Bimport Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobSalary, type JobDefinition } from '../core/jobs';
import { nextJobHubFocus070423, type JobHubFocus, type JobHubNavKey } from './jobHubFocus070423';
import { PAD_EVENT_070424 } from './steamDeckController070424';
import type { PadAction070424 } from './steamDeckPadPolicy070424';
import { JOB_HUB_VF06, jobCardPaletteVf06 } from './visualFoundationJobVf06';

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

  const shell = roundedPanel070421(
    scene,
    0,
    0,
    950,
    516,
    JOB_HUB_VF06.shell,
    JOB_HUB_VF06.cocoa,
    JOB_HUB_VF06.radius,
  );
  const headerBand = scene.add.graphics();
  headerBand.fillStyle(JOB_HUB_VF06.butter, 1);
  headerBand.fillRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });
  headerBand.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.72);
  headerBand.strokeRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });

  const title = scene.add.text(-414, -211, '💼 JOB HUB', {
    fontFamily: JOB_FONT_070421,
    fontSize: '27px',
    fontStyle: 'bold',
    color: '#4a302a',
  }).setOrigin(0, 0.5);
  const player = scene.add.text(414, -211, playerName, {
    fontFamily: JOB_FONT_070421,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#765047',
  }).setOrigin(1, 0.5);
  const subtitlePlate = scene.add.graphics();
  subtitlePlate.fillStyle(JOB_HUB_VF06.creamHighlight, 0.98);
  subtitlePlate.fillRoundedRect(-166, -169, 332, 38, 17);
  subtitlePlate.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.3);
  subtitlePlate.strokeRoundedRect(-166, -169, 332, 38, 17);

  const subtitle = scene.add.text(0, -150, 'Đổ xúc xắc để chọn nghề', {
    fontFamily: JOB_FONT_070421,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#574239',
  }).setOrigin(0.5);

  root.add([backdrop, shell, headerBand, title, player, subtitlePlate, subtitle]);

  const cardHits: Phaser.GameObjects.Rectangle[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;
  // Keyboard focus is a real in-game selection, not the OS mouse pointer.
  // An active player starts on ROLL and can finish the entire Job flow with Enter.
  let focused: JobHubFocus = canRoll ? 'roll' : 0;
  let renderKeyboardFocus = (): void => undefined;

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
    renderKeyboardFocus();
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
    renderKeyboardFocus(); // The detail sheet owns the focus until it closes.
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.78).setInteractive();
    const detailPalette = jobCardPaletteVf06(index, risky);
    const detailShell = roundedPanel070421(
      scene,
      0,
      0,
      748,
      352,
      risky ? 0xfff1ee : JOB_HUB_VF06.shell,
      risky ? detailPalette.strong : JOB_HUB_VF06.cocoa,
      26,
    );
    const detailKicker = scene.add.text(0, -132, risky ? '⚠ NGHỀ RỦI RO' : 'XEM NGHỀ', {
      fontFamily: JOB_FONT_070421,
      fontSize: '13px',
      fontStyle: 'bold',
      color: risky ? '#a63330' : '#716554',
    }).setOrigin(0.5);
    const detailIconWell = scene.add.graphics();
    detailIconWell.fillStyle(detailPalette.soft, 1);
    detailIconWell.fillCircle(0, -96, 38);
    detailIconWell.lineStyle(3, detailPalette.accent, 0.9);
    detailIconWell.strokeCircle(0, -96, 38);
    const detailIcon = scene.add.text(0, -96, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '46px',
    }).setOrigin(0.5);
    const detailTitle = scene.add.text(0, -43, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 650,
      align: 'center',
    }).setOrigin(0.5);
    const salaries = scene.add.text(
      0,
      2,
      `LƯƠNG / VÒNG   Lv1 ${jobSalary(job, 1)}   •   Lv2 ${jobSalary(job, 2)}   •   Lv3 ${jobSalary(job, 3)} Bimport Phaser from 'phaser';
import { sfxController } from '../audio/sfxController';
import { jobSalary, type JobDefinition } from '../core/jobs';
import { nextJobHubFocus070423, type JobHubFocus, type JobHubNavKey } from './jobHubFocus070423';
import { PAD_EVENT_070424 } from './steamDeckController070424';
import type { PadAction070424 } from './steamDeckPadPolicy070424';
import { JOB_HUB_VF06, jobCardPaletteVf06 } from './visualFoundationJobVf06';

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

  const shell = roundedPanel070421(
    scene,
    0,
    0,
    950,
    516,
    JOB_HUB_VF06.shell,
    JOB_HUB_VF06.cocoa,
    JOB_HUB_VF06.radius,
  );
  const headerBand = scene.add.graphics();
  headerBand.fillStyle(JOB_HUB_VF06.butter, 1);
  headerBand.fillRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });
  headerBand.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.72);
  headerBand.strokeRoundedRect(-451, -236, 902, 74, { tl: 21, tr: 21, bl: 12, br: 12 });

  const title = scene.add.text(-414, -211, '💼 JOB HUB', {
    fontFamily: JOB_FONT_070421,
    fontSize: '27px',
    fontStyle: 'bold',
    color: '#4a302a',
  }).setOrigin(0, 0.5);
  const player = scene.add.text(414, -211, playerName, {
    fontFamily: JOB_FONT_070421,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#765047',
  }).setOrigin(1, 0.5);
  const subtitlePlate = scene.add.graphics();
  subtitlePlate.fillStyle(JOB_HUB_VF06.creamHighlight, 0.98);
  subtitlePlate.fillRoundedRect(-166, -169, 332, 38, 17);
  subtitlePlate.lineStyle(2, JOB_HUB_VF06.cocoaSoft, 0.3);
  subtitlePlate.strokeRoundedRect(-166, -169, 332, 38, 17);

  const subtitle = scene.add.text(0, -150, 'Đổ xúc xắc để chọn nghề', {
    fontFamily: JOB_FONT_070421,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#574239',
  }).setOrigin(0.5);

  root.add([backdrop, shell, headerBand, title, player, subtitlePlate, subtitle]);

  const cardHits: Phaser.GameObjects.Rectangle[] = [];
  let detailRoot: Phaser.GameObjects.Container | undefined;
  let submitted = false;
  // Keyboard focus is a real in-game selection, not the OS mouse pointer.
  // An active player starts on ROLL and can finish the entire Job flow with Enter.
  let focused: JobHubFocus = canRoll ? 'roll' : 0;
  let renderKeyboardFocus = (): void => undefined;

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
    renderKeyboardFocus();
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
    renderKeyboardFocus(); // The detail sheet owns the focus until it closes.
    const dim = scene.add.rectangle(0, 0, 1280, 720, 0x17120f, 0.78).setInteractive();
    const detailPalette = jobCardPaletteVf06(index, risky);
    const detailShell = roundedPanel070421(
      scene,
      0,
      0,
      748,
      352,
      risky ? 0xfff1ee : JOB_HUB_VF06.shell,
      risky ? detailPalette.strong : JOB_HUB_VF06.cocoa,
      26,
    );
    const detailKicker = scene.add.text(0, -132, risky ? '⚠ NGHỀ RỦI RO' : 'XEM NGHỀ', {
      fontFamily: JOB_FONT_070421,
      fontSize: '13px',
      fontStyle: 'bold',
      color: risky ? '#a63330' : '#716554',
    }).setOrigin(0.5);
    const detailIconWell = scene.add.graphics();
    detailIconWell.fillStyle(detailPalette.soft, 1);
    detailIconWell.fillCircle(0, -96, 38);
    detailIconWell.lineStyle(3, detailPalette.accent, 0.9);
    detailIconWell.strokeCircle(0, -96, 38);
    const detailIcon = scene.add.text(0, -96, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '46px',
    }).setOrigin(0.5);
    const detailTitle = scene.add.text(0, -43, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 650,
      align: 'center',
    }).setOrigin(0.5);
    const salaries = scene.add.text(
      0,
,
      {
        fontFamily: JOB_FONT_070421,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#5c4439',
        fixedWidth: 650,
        align: 'center',
      },
    ).setOrigin(0.5);
    const divider = scene.add.rectangle(0, 29, 620, 2, risky ? 0xefb8b3 : 0xd8cab9, 1);
    const special = scene.add.text(0, 67, job.special, {
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
      detailIconWell,
      detailIcon,
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
    const cardPalette = jobCardPaletteVf06(index, risky);

    const card = roundedPanel070421(
      scene,
      x,
      0,
      250,
      230,
      cardPalette.fill,
      JOB_HUB_VF06.cocoa,
      22,
    );

    const topAccent = scene.add.graphics();
    topAccent.fillStyle(cardPalette.accent, 1);
    topAccent.fillRoundedRect(x - 113, -103, 226, 11, { tl: 8, tr: 8, bl: 4, br: 4 });

    const badge = scene.add.graphics();
    badge.fillStyle(cardPalette.strong, 1);
    badge.fillRoundedRect(x - 105, -96, 42, 28, 12);
    const letter = scene.add.text(x - 84, -82, JOB_CARD_LETTERS_070421[index] ?? '?', {
      fontFamily: JOB_FONT_070421,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const rangePill = scene.add.graphics();
    rangePill.fillStyle(JOB_HUB_VF06.creamHighlight, 0.96);
    rangePill.fillRoundedRect(x + 48, -96, 70, 28, 12);
    rangePill.lineStyle(1.5, cardPalette.accent, 0.72);
    rangePill.strokeRoundedRect(x + 48, -96, 70, 28, 12);
    const range = scene.add.text(x + 83, -82, `🎲 ${JOB_CARD_RANGES_070421[index] ?? ''}`, {
      fontFamily: JOB_FONT_070421,
      fontSize: '15px',
      fontStyle: 'bold',
      color: risky ? '#9e2f2c' : '#4f615e',
    }).setOrigin(0.5);

    const iconWellShadow = scene.add.graphics();
    iconWellShadow.fillStyle(JOB_HUB_VF06.cocoa, 0.12);
    iconWellShadow.fillCircle(x, -35, JOB_HUB_VF06.iconWellRadius + 3);
    iconWellShadow.setPosition(0, 4);
    const iconWell = scene.add.graphics();
    iconWell.fillStyle(JOB_HUB_VF06.creamHighlight, 1);
    iconWell.fillCircle(x, -39, JOB_HUB_VF06.iconWellRadius);
    iconWell.lineStyle(3, cardPalette.accent, 0.82);
    iconWell.strokeCircle(x, -39, JOB_HUB_VF06.iconWellRadius);
    const icon = scene.add.text(x, -39, job.icon, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '50px',
    }).setOrigin(0.5);
    const name = scene.add.text(x, 12, job.title, {
      fontFamily: JOB_FONT_070421,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#32241f',
      fixedWidth: 220,
      align: 'center',
    }).setOrigin(0.5);
    const salary = scene.add.text(
      x,
,
      {
        fontFamily: JOB_FONT_070421,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#5a463d',
        fixedWidth: 220,
        align: 'center',
      },
    ).setOrigin(0.5);
    const detailPill = scene.add.graphics();
    detailPill.fillStyle(cardPalette.soft, 1);
    detailPill.fillRoundedRect(x - 82, 78, 164, 34, 14);
    detailPill.lineStyle(2, cardPalette.accent, 0.66);
    detailPill.strokeRoundedRect(x - 82, 78, 164, 34, 14);
    const hint = scene.add.text(x, 95, 'XEM CHI TIẾT', {
      fontFamily: JOB_FONT_070421,
      fontSize: '11px',
      fontStyle: 'bold',
      color: risky ? '#8c2f2a' : '#4a5d58',
    }).setOrigin(0.5);
    const hit = scene.add.rectangle(x, 0, 250, 230, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    cardHits.push(hit);

    root.add([
      card,
      topAccent,
      badge,
      letter,
      rangePill,
      range,
      iconWellShadow,
      iconWell,
      icon,
      name,
      salary,
      detailPill,
      hint,
      hit,
    ]);

    hit.on('pointerover', () => {
      scene.tweens.killTweensOf(card);
      scene.tweens.add({ targets: card, scaleX: 1.025, scaleY: 1.025, duration: 100 });
    });
    hit.on('pointerout', () => {
      scene.tweens.killTweensOf(card);
      scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
    });
    hit.on('pointerover', () => {
      focused = index as 0 | 1 | 2;
      renderKeyboardFocus();
    });
    hit.on('pointerdown', () => {
      focused = index as 0 | 1 | 2;
      openDetail(index);
    });
  });

  const rollShadow = scene.add.graphics();
  rollShadow.fillStyle(0x7b4f1e, 0.35);
  rollShadow.fillRoundedRect(-178, 190, 356, 62, 20);
  const rollFace = scene.add.graphics();
  rollFace.fillStyle(canRoll ? JOB_HUB_VF06.butter : 0xc7baaa, 1);
  rollFace.fillRoundedRect(-178, 184, 356, 62, 20);
  rollFace.lineStyle(4, JOB_HUB_VF06.cocoa, 1);
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

  // An always-visible focus outline makes the default ENTER action obvious.
  // It wraps one target at a time and never requires an actual mouse cursor.
  const focusRing = scene.add.graphics().setName('job-hub-keyboard-focus-070423');
  const focusHint = scene.add.text(
    0, 151,
    canRoll
      ? '← → / D-PAD: CHỌN  •  ENTER / A: XEM, ĐỔ  •  ESC / B: QUAY LẠI'
      : '← → / D-PAD: XEM NGHỀ  •  ENTER / A: CHI TIẾT',
    {
      fontFamily: JOB_FONT_070421, fontSize: '12px',
      fontStyle: 'bold', color: '#69534b', align: 'center',
    },
  ).setOrigin(0.5);
  root.add([focusRing, focusHint]);

  renderKeyboardFocus = (): void => {
    focusRing.clear();
    if (!root.active || !root.visible || submitted || detailRoot?.active) {
      focusRing.setVisible(false);
      return;
    }
    if (focused === 'roll' && (!canRoll || !rollHit.input?.enabled)) {
      focusRing.setVisible(false);
      return;
    }
    focusRing.setVisible(true);
    const x = focused === 'roll' ? 0 : JOB_CARD_X_070421[focused];
    const y = focused === 'roll' ? 215 : 0;
    const width = focused === 'roll' ? 368 : 262;
    const height = focused === 'roll' ? 76 : 242;
    focusRing.lineStyle(5, JOB_HUB_VF06.aqua, 1);
    focusRing.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 23);
  };
  rollHit.on('pointerover', () => {
    if (!canRoll) return;
    focused = 'roll';
    renderKeyboardFocus();
  });

  let resolveRoll!: () => void;
  const rolled = new Promise<void>((resolve) => {
    resolveRoll = resolve;
  });

  const enableRoll = (label = '🎲 ĐỔ XÚC XẮC') => {
    if (!root.active || !canRoll) return;
    submitted = false;
    rollFace.clear();
    rollFace.fillStyle(JOB_HUB_VF06.butter, 1);
    rollFace.fillRoundedRect(-178, 184, 356, 62, 20);
    rollFace.lineStyle(4, JOB_HUB_VF06.cocoa, 1);
    rollFace.strokeRoundedRect(-178, 184, 356, 62, 20);
    rollHit.setInteractive({ useHandCursor: true });
    rollText.setText(label).setFontSize(19).setColor('#3d2924');
    focused = 'roll';
    renderKeyboardFocus();
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
    renderKeyboardFocus();
  };

  if (canRoll) enableRoll();
  else renderKeyboardFocus();

  // Pointer and keyboard share one guarded action. The active Job Hub is
  // the sole owner of the roll input; spectators and open details cannot roll.
  const submitRoll = (): void => {
    if (!canRoll || submitted || !root.active || !root.visible || detailRoot?.active || !rollHit.input?.enabled) return;
    submitted = true;
    sfxController.play('ui_confirm');
    setWaiting();
    resolveRoll();
  };
  rollHit.on('pointerdown', submitRoll);
  backdrop.on('pointerdown', () => undefined);

  const keyboardHandler = (event: KeyboardEvent): void => {
    if (!root.active || !root.visible) return;
    const key = event.key.toLocaleLowerCase();
    const consume = (): void => {
      event.preventDefault();
      event.stopPropagation();
    };

    // Detail sheet: Enter/Space closes it, restoring keyboard focus to the
    // chosen career card. Escape and Backspace work as a second way back.
    if (detailRoot?.active) {
      if (key === 'escape' || key === 'backspace' || key === 'enter' || key === ' ' || event.code === 'Space') {
        consume();
        if (!event.repeat) closeDetail();
      }
      return;
    }

    if (key === 'escape' || key === 'backspace') {
      consume();
      focused = canRoll ? 'roll' : 0;
      renderKeyboardFocus();
      return;
    }

    const directions: Record<string, JobHubNavKey> = {
      arrowleft: 'left', arrowright: 'right',
      arrowup: 'up', arrowdown: 'down',
    };
    const direction = key === 'tab'
      ? (event.shiftKey ? 'shift-tab' : 'tab')
      : directions[key];
    if (direction) {
      consume();
      focused = nextJobHubFocus070423(focused, direction, canRoll);
      renderKeyboardFocus();
      return;
    }

    // Existing quick keys remain useful: A/B/C or 1/2/3 open a career sheet.
    const index = key === 'a' || key === '1' ? 0
      : key === 'b' || key === '2' ? 1
        : key === 'c' || key === '3' ? 2 : -1;
    if (index >= 0) {
      consume();
      if (event.repeat) return;
      focused = index as 0 | 1 | 2;
      openDetail(index);
      return;
    }

    if (key === 'enter' || key === ' ' || event.code === 'Space') {
      consume();
      if (event.repeat) return;
      if (focused === 'roll') {
        // The default focus makes ENTER / SPACE an immediate dice roll without
        // first moving an OS cursor to the button.
        submitRoll();
      } else {
        openDetail(focused);
      }
    }
  };
  // Controller shares the exact keyboard focus and guarded authoritative roll.
  // No synthesized browser key: doing that can advance an inherited cinematic.
  const padHandler = (action: PadAction070424): void => {
    if (!root.active || !root.visible) return;
    if (detailRoot?.active) {
      if (action === 'confirm' || action === 'back') closeDetail();
      return;
    }
    if (action === 'back') {
      focused = canRoll ? 'roll' : 0;
      renderKeyboardFocus();
      return;
    }
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      focused = nextJobHubFocus070423(focused, action, canRoll);
      renderKeyboardFocus();
      return;
    }
    if (action !== 'confirm' || submitted) return;
    if (focused === 'roll') submitRoll();
    else openDetail(focused);
  };
  scene.events.on(PAD_EVENT_070424, padHandler);
  scene.input.keyboard?.on('keydown', keyboardHandler);

  return {
    root,
    rolled,
    setWaiting,
    setReady: enableRoll,
    close: () => {
      scene.input.keyboard?.off('keydown', keyboardHandler);
      scene.events.off(PAD_EVENT_070424, padHandler);
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
