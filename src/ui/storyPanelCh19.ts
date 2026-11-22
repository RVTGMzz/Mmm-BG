import Phaser from 'phaser';
import { SHOPS_CH19 } from '../core/shopTilesCh19';
import type { MatchState } from '../core/matchState';
import { followRevealCh19, openRevealCh19 } from './cardArtCh19';
import { PARTY_BUST_IDS_CH19, partyTextCh19, PARTY_INK_CH19 } from './partyKitCh19';
import { publicAssetUrl } from './publicAssetUrl';

/**
 * CH-19 tile stories. Landing on a money / shop / exit-fee tile opens a comic
 * panel over the blurred board: a painted scene of what just happened, the
 * player's Character standing in front of it (normal / happy / angry), a speech
 * bubble with the story and a stamped M$ amount. Cards are a big card, News is a
 * TV, tiles are a comic panel with your Character in it. Presentation only.
 */

export type MoodCh19 = 'neutral' | 'happy' | 'angry';
export const POSE_MOODS_CH19: MoodCh19[] = ['neutral', 'happy', 'angry'];
export const poseKeyCh19 = (bust: string, mood: MoodCh19) => `pose-ch19-${bust}-${mood}`;
const storyKey = (id: string) => `story-ch19-${id}`;

export const STORIES_CH19 = {
  'gain-1': { title: 'TÚI ÁO CŨ', line: 'Lục túi áo khoác cũ, bất ngờ thấy tờ tiền bị bỏ quên!' },
  'gain-2': { title: 'TRÚNG GIẢI NÉM VÒNG', line: 'Ném một phát trúng ngay, chủ quầy đành trao thưởng.' },
  'gain-3': { title: 'TIỀN TIP HẬU HĨNH', line: 'Khách quá hài lòng nên bo thêm một khoản kha khá.' },
  'gain-4': { title: 'HOÀN TIỀN NGÂN HÀNG', line: 'Ngân hàng báo có tiền hoàn về tài khoản. Vui ghê!' },
  'loss-1': { title: 'TRẠM THU PHÍ', line: 'Kẹt ngay trạm thu phí, đành móc ví trả tiền qua trạm.' },
  'loss-2': { title: 'HẢI ÂU CƯỚP VÍ', line: 'Một con hải âu sà xuống, cuỗm luôn bánh mì lẫn ví tiền!' },
  'loss-3': { title: 'TÓC HỎNG GIÁ CAO', line: 'Kiểu tóc thì thảm họa, hóa đơn thì cao ngất.' },
  'loss-4': { title: 'GIÓ LỐC BẤT NGỜ', line: 'Một cơn gió lật ngược ô, tiền trong túi bay tứ tung.' },
  'jail-fee': { title: 'NỘP PHẠT Ở ĐỒN', line: 'Ra khỏi Đồn phải ghé quầy nộp phạt trước đã.' },
  'hospital-fee': { title: 'ĐÓNG VIỆN PHÍ', line: 'Xuất viện rồi, giờ tới màn thanh toán viện phí.' },
  lottery: { title: 'XỔ SỐ', line: 'Vé số trong tay, tim đập thình thịch...' },
} as const;
export type StoryIdCh19 = keyof typeof STORIES_CH19;

export function preloadStoryPanelCh19(scene: Phaser.Scene): void {
  for (const bust of Object.values(PARTY_BUST_IDS_CH19)) {
    for (const mood of POSE_MOODS_CH19) {
      if (!scene.textures.exists(poseKeyCh19(bust, mood))) scene.load.image(poseKeyCh19(bust, mood), publicAssetUrl(`assets/ui/ch19/poses/${bust}-${mood}.webp`));
    }
  }
  for (const id of Object.keys(STORIES_CH19)) {
    if (!scene.textures.exists(storyKey(id))) scene.load.image(storyKey(id), publicAssetUrl(`assets/ui/ch19/stories/${id}.webp`));
  }
}

type Model = { kind: string; eventSeq: number; tileType?: string; amount?: number; actorId?: number; title: string; description: string; eyebrow: string };
type Runtime = { presentation?: { currentModel?: Model }; match?: MatchState };

export function installStoryPanelCh19(scene: Phaser.Scene, characterIdOf: (playerId: number) => string | undefined): void {
  const tick = () => {
    for (const o of scene.children.list) {
      if (!(o instanceof Phaser.GameObjects.Container) || !o.active || o.name !== 'presentation-landing-card-ch1713') continue;
      if (followRevealCh19(o) || o.getData('ch19-story-skip')) continue;
      const runtime = scene as unknown as Runtime;
      const model = runtime.presentation?.currentModel;
      const story = model ? storyFor(model, runtime.match) : undefined;
      if (!model || !story) { o.setData('ch19-story-skip', true); continue; }
      buildStory(scene, o, model, story, characterIdOf(model.actorId ?? -1));
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
}

type Story = { picture?: string; place: string; title: string; line: string; amount: number; colour: number };

function storyFor(model: Model, match: MatchState | undefined): Story | undefined {
  const event = match?.eventLog.find((e) => e.seq === model.eventSeq);
  const amount = Number(model.amount ?? 0);
  // shop of the day: the shop's own building is the scene
  const shopName = event?.type === 'shop_event' ? String(event.data.shopName ?? '') : '';
  if (shopName) {
    const shop = SHOPS_CH19.find((s) => s.name === shopName);
    return {
      picture: shop ? `island-prop-ch19-${shop.building}` : undefined,
      place: `${shop?.icon ?? '🏪'} ${shopName}`,
      title: model.title,
      line: model.description.replace(/^[+−-]\s?\d+\s?[BM]\$\s?·\s?/, ''),
      amount,
      colour: shop ? Number.parseInt(shop.colour.slice(1), 16) : 0xf2549c,
    };
  }
  if (model.kind !== 'tile_land' || model.tileType !== 'money' || !amount) return undefined;
  const contentId = String(event?.data.contentId ?? '');
  const pick = (id: StoryIdCh19, place: string, colour: number): Story => ({ picture: storyKey(id), place, title: STORIES_CH19[id].title, line: STORIES_CH19[id].line, amount, colour });
  if (contentId.startsWith('JAIL_EXIT')) return pick('jail-fee', '🚓 ĐƯỜNG RA ĐỒN', 0x3f6fd8);
  if (contentId.startsWith('HOSPITAL_EXIT')) return pick('hospital-fee', '🏥 ĐƯỜNG RA BỆNH VIỆN', 0xf0524a);
  const n = (model.eventSeq % 4) + 1;
  return amount > 0 ? pick(`gain-${n}` as StoryIdCh19, '💰 Ô TIỀN THƯỞNG', 0x2fae6a) : pick(`loss-${n}` as StoryIdCh19, '💸 Ô MẤT TIỀN', 0xf0524a);
}

function buildStory(scene: Phaser.Scene, root: Phaser.GameObjects.Container, model: Model, story: Story, characterId: string | undefined): void {
  const st = openRevealCh19(scene, root, 0.5);
  const mood: MoodCh19 = story.amount > 0 ? 'happy' : story.amount < 0 ? 'angry' : 'neutral';

  // comic panel: the scene of the story, slightly tilted, ink border and a white frame
  const PW = 660, PH = 371, PX = 90, PY = -96;
  const panel = scene.add.container(PX, PY).setAngle(-1.5);
  const frame = scene.add.graphics();
  frame.fillStyle(0x10143a, 0.35).fillRect(-PW / 2 - 8, -PH / 2 + 2, PW + 28, PH + 28);
  frame.fillStyle(PARTY_INK_CH19, 1).fillRect(-PW / 2 - 18, -PH / 2 - 18, PW + 36, PH + 36);
  frame.fillStyle(0xffffff, 1).fillRect(-PW / 2 - 12, -PH / 2 - 12, PW + 24, PH + 24);
  frame.fillStyle(PARTY_INK_CH19, 1).fillRect(-PW / 2 - 3, -PH / 2 - 3, PW + 6, PH + 6);
  frame.fillStyle(story.colour, 1).fillRect(-PW / 2, -PH / 2, PW, PH);
  panel.add(frame);
  if (story.picture && scene.textures.exists(story.picture)) {
    const img = scene.add.image(0, 0, story.picture);
    const isBuilding = story.picture.startsWith('island-prop');
    if (isBuilding) {
      // a building sits on a sunny backdrop instead of filling the panel
      const sky = scene.add.graphics();
      for (let i = 0; i < 8; i++) sky.fillStyle(0xffffff, 0.05 + i * 0.02).fillCircle(0, 40, 360 - i * 40);
      panel.add(sky);
      img.setScale(Math.min((PW * 0.62) / img.width, (PH * 0.9) / img.height)).setY(8);
    } else {
      img.setDisplaySize(PW, PH);
    }
    panel.add(img);
  }
  // place tab on the panel's top edge
  const tab = scene.add.container(-PW / 2 + 150, -PH / 2 - 14);
  const tg = scene.add.graphics();
  tg.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-140, -22, 280, 44, 22);
  tg.fillStyle(story.colour, 1).fillRoundedRect(-136, -18, 272, 36, 18);
  tab.add(tg);
  tab.add(partyTextCh19(scene, 0, 0, story.place, { size: 18, fill: '#ffffff', strokeWidth: 4, shadow: false }));
  panel.add(tab);
  st.add(panel);

  // the stamped M$ amount on the panel's top-right corner
  const stamp = scene.add.container(PX + PW / 2 - 40, PY - PH / 2 + 30).setAngle(10);
  const good = story.amount >= 0;
  const sg = scene.add.graphics();
  sg.fillStyle(PARTY_INK_CH19, 1).fillCircle(0, 0, 76);
  sg.fillStyle(good ? 0x2fae6a : 0xf0524a, 1).fillCircle(0, 0, 70);
  sg.lineStyle(4, 0xffffff, 0.9).strokeCircle(0, 0, 58);
  stamp.add(sg);
  stamp.add(partyTextCh19(scene, 0, -2, `${good ? '+' : '−'}${Math.abs(story.amount)}`, { size: 40, fill: '#ffffff', strokeWidth: 6, shadow: false }));
  stamp.add(partyTextCh19(scene, 0, 34, 'M$', { size: 20, fill: '#ffe066', strokeWidth: 4, shadow: false }));
  st.add(stamp);

  // speech bubble under the panel, its tail pointing at the Character
  const bubble = scene.add.container(110, 210);
  const bg = scene.add.graphics();
  const BW = 640, BH = 118;
  bg.fillStyle(PARTY_INK_CH19, 1).fillRoundedRect(-BW / 2 - 5, -BH / 2 - 5, BW + 10, BH + 10, 30);
  bg.fillTriangle(-BW / 2 + 10, -10, -BW / 2 - 60, 6, -BW / 2 + 10, 30);
  bg.fillStyle(0xffffff, 1).fillRoundedRect(-BW / 2, -BH / 2, BW, BH, 26);
  bg.fillTriangle(-BW / 2 + 12, -4, -BW / 2 - 46, 7, -BW / 2 + 12, 24);
  bubble.add(bg);
  bubble.add(partyTextCh19(scene, -BW / 2 + 28, -30, story.title, { size: 28, fill: '#' + story.colour.toString(16).padStart(6, '0'), stroke: '#ffffff', strokeWidth: 3, align: 'left', shadow: false }).setOrigin(0, 0.5));
  bubble.add(partyTextCh19(scene, -BW / 2 + 28, 18, story.line, { size: 21, fill: '#1f2340', stroke: '#ffffff', strokeWidth: 2, align: 'left', wrap: BW - 56, shadow: false }).setOrigin(0, 0.5));
  st.add(bubble);

  // the Character in front, knee-up, with the matching face
  const bust = characterId ? PARTY_BUST_IDS_CH19[characterId] : undefined;
  const key = bust ? poseKeyCh19(bust, mood) : undefined;
  let pose: Phaser.GameObjects.Image | undefined;
  if (key && scene.textures.exists(key)) {
    pose = scene.add.image(-420, 372, key).setOrigin(0.5, 1);
    pose.setScale(520 / pose.height);
    st.add(pose);
  }

  // motion: panel slams in, the stamp thumps down, the Character pops up and reacts
  panel.setScale(0.6).setAlpha(0);
  scene.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 380, ease: 'Back.easeOut' });
  bubble.setAlpha(0).setY(240);
  scene.tweens.add({ targets: bubble, alpha: 1, y: 210, duration: 300, delay: 350, ease: 'Cubic.easeOut' });
  stamp.setScale(2.4).setAlpha(0);
  scene.tweens.add({
    targets: stamp, scale: 1, alpha: 1, duration: 260, delay: 700, ease: 'Quad.easeIn',
    onComplete: () => scene.cameras.getCamera('canonical-ui-0561')?.shake(140, 0.004),
  });
  if (pose) {
    const y = pose.y;
    pose.setY(y + 260);
    scene.tweens.add({ targets: pose, y, duration: 420, delay: 120, ease: 'Back.easeOut' });
    if (mood === 'happy') scene.tweens.add({ targets: pose, y: y - 26, duration: 230, delay: 640, yoyo: true, repeat: 2, ease: 'Quad.easeOut' });
    if (mood === 'angry') scene.tweens.add({ targets: pose, x: pose.x + 9, duration: 55, delay: 640, yoyo: true, repeat: 7 });
  }
  void model;
}
