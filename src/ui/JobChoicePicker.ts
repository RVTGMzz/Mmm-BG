import Phaser from 'phaser';
import { jobSalary, type JobDefinition } from '../core/jobs';

export function showJobRollPicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
): Promise<void> {
  if (jobs.length !== 3) return Promise.resolve();

  return new Promise((resolve) => {
    const root = scene.add.container(640, 360).setDepth(980);
    const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.7).setInteractive();
    const panel = scene.add.rectangle(0, 0, 960, 520, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
    const title = scene.add.text(0, -214, `💼 ${playerName} • JOB HUB`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '29px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const subtitle = scene.add.text(0, -174, '3 nghề đã được random. Không chọn trực tiếp: đổ xúc xắc để nhận nghề.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#6d655b',
    }).setOrigin(0.5);
    root.add([backdrop, panel, title, subtitle]);

    const ranges = ['🎲 1–2', '🎲 3–4', '🎲 5–6'];
    const xs = [-300, 0, 300];
    jobs.forEach((job, index) => {
      const x = xs[index] ?? 0;
      const risky = job.risk === 'crime';
      const box = scene.add.rectangle(x, 5, 265, 275, risky ? 0xffc6c1 : 0xffe09a, 1)
        .setStrokeStyle(4, 0x242424, 1);
      const range = scene.add.text(x, -105, ranges[index] ?? '🎲', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: risky ? '#9e2f2c' : '#5d4773',
      }).setOrigin(0.5);
      const icon = scene.add.text(x, -64, job.icon, { fontSize: '42px' }).setOrigin(0.5);
      const name = scene.add.text(x, -15, job.title, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#202020',
        fixedWidth: 235,
        align: 'center',
      }).setOrigin(0.5);
      const salary = scene.add.text(x, 38, `💰 ${jobSalary(job, 1)} / ${jobSalary(job, 2)} / ${jobSalary(job, 3)} B$`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#202020',
      }).setOrigin(0.5);
      const salaryLabel = scene.add.text(x, 61, 'Lương qua cổng • Lv.1 / Lv.2 / Lv.3', {
        fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#746a60',
      }).setOrigin(0.5);
      const special = scene.add.text(x, 103, job.special, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#4f4740',
        align: 'center',
        fixedWidth: 225,
        wordWrap: { width: 225 },
      }).setOrigin(0.5);
      root.add([box, range, icon, name, salary, salaryLabel, special]);
    });

    const rollButton = scene.add.rectangle(0, 196, 270, 64, 0xef4545, 1)
      .setStrokeStyle(4, 0x242424, 1)
      .setInteractive({ useHandCursor: true });
    const rollText = scene.add.text(0, 196, '🎲 ĐỔ XÚC XẮC JOB', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    root.add([rollButton, rollText]);

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      root.destroy(true);
      resolve();
    };
    rollButton.on('pointerover', () => rollButton.setScale(1.035));
    rollButton.on('pointerout', () => rollButton.setScale(1));
    rollButton.on('pointerdown', finish);
    backdrop.on('pointerdown', () => undefined);
  });
}
