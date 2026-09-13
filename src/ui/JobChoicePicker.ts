import Phaser from 'phaser';
import type { JobDefinition } from '../core/jobs';

export function showJobChoicePicker(
  scene: Phaser.Scene,
  playerName: string,
  jobs: readonly JobDefinition[],
): Promise<string | undefined> {
  if (jobs.length === 0) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    const root = scene.add.container(640, 360).setDepth(980);
    const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.66).setInteractive();
    const panel = scene.add.rectangle(0, 0, 920, 455, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
    const title = scene.add.text(0, -178, `💼 ${playerName} • CHỌN JOB`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '29px',
      fontStyle: 'bold',
      color: '#202020',
    }).setOrigin(0.5);
    const subtitle = scene.add.text(0, -140, 'Job Hub rút ngẫu nhiên 3 nghề từ pool 10. Chọn 1 nghề để bắt đầu ở Lv.1.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#6d655b',
    }).setOrigin(0.5);
    root.add([backdrop, panel, title, subtitle]);

    let settled = false;
    const finish = (jobId?: string) => {
      if (settled) return;
      settled = true;
      root.destroy(true);
      resolve(jobId);
    };

    const xs = jobs.length === 1 ? [0] : jobs.length === 2 ? [-180, 180] : [-285, 0, 285];
    jobs.forEach((job, index) => {
      const x = xs[index] ?? 0;
      const risky = job.risk === 'crime';
      const box = scene.add.rectangle(x, 30, 250, 245, risky ? 0xffc6c1 : 0xffe09a, 1)
        .setStrokeStyle(4, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const icon = scene.add.text(x, -53, job.icon, { fontSize: '42px' }).setOrigin(0.5);
      const name = scene.add.text(x, -4, job.title, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#202020',
        fixedWidth: 220,
        align: 'center',
      }).setOrigin(0.5);
      const detail = scene.add.text(x, 62,
        risky
          ? `Lv.1 → Lv.${job.maxLevel}\n⚠️ Nghề nguy hiểm\nCó nguy cơ dính biến cố đặc biệt`
          : `Lv.1 → Lv.${job.maxLevel}\n📈 Có thể thăng / hạ cấp\n📦 Khi tụt cấp có thể mất việc`,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#4f4740',
          align: 'center',
          lineSpacing: 5,
          fixedWidth: 218,
        },
      ).setOrigin(0.5);
      const choose = scene.add.text(x, 127, 'CHỌN NGHỀ', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: risky ? '#c84b47' : '#795796',
        padding: { x: 12, y: 7 },
      }).setOrigin(0.5);
      box.on('pointerover', () => box.setScale(1.025));
      box.on('pointerout', () => box.setScale(1));
      box.on('pointerdown', () => finish(job.id));
      root.add([box, icon, name, detail, choose]);
    });

    backdrop.on('pointerdown', () => undefined);
  });
}
