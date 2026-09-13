import Phaser from 'phaser';
import { DemoBoardScene } from './DemoBoardScene';

export class PlaytestDemoBoardScene extends DemoBoardScene {
  private guideObjects: Phaser.GameObjects.GameObject[] = [];

  create(): void {
    super.create();

    const badge = this.add
      .text(1218, 690, 'PLAYTEST 0.1.16', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#6d655b',
        backgroundColor: '#fffaf0',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(1, 1)
      .setDepth(680);

    const helpButton = this.add
      .text(1218, 610, '?  CÁCH CHƠI', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#795796',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setDepth(680)
      .setInteractive({ useHandCursor: true });

    helpButton.on('pointerdown', () => this.showPlaytestGuide());

    this.add
      .text(1218, 646, 'Tip: Lá Bài dùng trước khi đổ xúc xắc', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#756d62',
      })
      .setOrigin(1, 0.5)
      .setDepth(680);

    this.input.keyboard?.on('keydown-H', () => {
      if (this.guideObjects.length === 0) this.showPlaytestGuide();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.input.keyboard) this.input.keyboard.enabled = true;
      for (const object of this.guideObjects) object.destroy();
      this.guideObjects = [];
    });

    void badge;
  }

  private showPlaytestGuide(): void {
    if (this.guideObjects.length > 0) return;
    if (this.input.keyboard) this.input.keyboard.enabled = false;

    const blocker = this.add
      .rectangle(640, 360, 1280, 720, 0x202020, 0.78)
      .setDepth(900)
      .setInteractive();

    const panel = this.add
      .rectangle(640, 360, 760, 500, 0xfffbf3, 1)
      .setStrokeStyle(5, 0x202020, 1)
      .setDepth(901);

    const title = this.add
      .text(640, 155, '🎲 CÁCH CHƠI NHANH', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#202020',
      })
      .setOrigin(0.5)
      .setDepth(902);

    const body = this.add
      .text(
        360,
        215,
        [
          '1. Tới lượt mình → bấm ĐỔ XÚC XẮC.',
          '2. Trước khi đổ, có thể bấm LÁ BÀI nếu đang cầm bài.',
          '3. Ô LÁ BÀI: tự rút bài. Ô TIN TỨC: sự kiện tự kích hoạt.',
          '4. Gặp ngã rẽ: người đang chơi chọn đường đi.',
          '5. Demo kéo dài 3 vòng / 12 lượt. B$ cao nhất thắng.',
          '6. Nếu hai người bằng tiền khi hết demo → đồng hạng.',
          '',
          'Hotseat: 4 người dùng chung máy.',
          '2 Tab: host giữ trận; client chỉ điều khiển đúng ghế đã join.',
        ].join('\n'),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '17px',
          color: '#403a34',
          lineSpacing: 8,
          wordWrap: { width: 560 },
        },
      )
      .setOrigin(0, 0)
      .setDepth(902);

    const note = this.add
      .text(640, 510, 'Luật thắng 3 vòng chỉ là luật playtest tạm, chưa phải luật MeMeMe final.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#795796',
      })
      .setOrigin(0.5)
      .setDepth(902);

    const closeButton = this.add
      .rectangle(640, 565, 220, 52, 0xef4545, 1)
      .setStrokeStyle(3, 0x202020, 1)
      .setDepth(903)
      .setInteractive({ useHandCursor: true });

    const closeText = this.add
      .text(640, 565, 'HIỂU RỒI, CHƠI! ✨', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(904);

    closeButton.on('pointerdown', () => this.hidePlaytestGuide());
    blocker.on('pointerdown', () => undefined);

    this.guideObjects = [blocker, panel, title, body, note, closeButton, closeText];
  }

  private hidePlaytestGuide(): void {
    for (const object of this.guideObjects) object.destroy();
    this.guideObjects = [];
    if (this.input.keyboard) this.input.keyboard.enabled = true;
  }
}
