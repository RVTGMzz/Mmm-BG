import type { CharacterDefinition, CharacterPassiveTrigger } from '../../core/characterSystem';

export type StarterCharacterArchetype =
  | 'crybaby'
  | 'grumpy'
  | 'anxious'
  | 'hyper';

export interface StarterPassiveConcept {
  id: string;
  label: string;
  trigger: CharacterPassiveTrigger;
  designIntent: string;
  /** CH-02A is design data only. No authoritative resolver consumes this yet. */
  live: false;
}

export interface StarterCharacterDefinition extends CharacterDefinition {
  archetype: StarterCharacterArchetype;
  archetypeLabel: string;
  ageBand: {
    min: number;
    max: number;
  };
  styleDirection: string;
  bodyLanguage: readonly string[];
  reactionDirection: readonly string[];
  passiveConcept: StarterPassiveConcept;
}

/**
 * CH-02A starter cast.
 *
 * These are the four foundational personality archetypes approved for the
 * first Character Select proof. Personal character names, gender presentation
 * and final art are intentionally not locked here.
 *
 * Age/style are presentation direction only. Gameplay may never infer a
 * passive from age, gender or demographic tags.
 */
export const STARTER_CHARACTERS_V01: readonly StarterCharacterDefinition[] = [
  {
    id: 'starter-crybaby',
    displayNameKey: 'character.starter.crybaby.name',
    archetype: 'crybaby',
    archetypeLabel: 'KHÓC NHÈ',
    ageBand: { min: 55, max: 65 },
    styleDirection: 'Có gu, hơi màu mè, nhiều phụ kiện; silhouette mềm nhưng rất sân khấu.',
    bodyLanguage: [
      'ôm ngực hoặc ôm ví khi sốc',
      'chấm nước mắt / ngửa mặt than trời',
      'mừng quá mức khi được an ủi hoặc nhận thưởng',
    ],
    reactionDirection: [
      'mất tiền hoặc dính phạt thì phản ứng cảm xúc rất lớn',
      'được thưởng thì chuyển trạng thái cực nhanh sang sung sướng',
      'drama thiên về than thở hơn là tấn công người khác',
    ],
    presentationTags: [
      'age:55-65',
      'style:expressive-accessories',
      'silhouette:soft-theatrical',
      'energy:melodramatic',
    ],
    reactionProfileId: 'reaction.starter.crybaby.v01',
    passiveIds: ['passive.starter.crybaby.comfort-aftershock'],
    poseSetId: 'pose.starter.crybaby.v01',
    passiveConcept: {
      id: 'passive.starter.crybaby.comfort-aftershock',
      label: 'ĐƯỢC DỖ',
      trigger: 'money_loss',
      designIntent: 'Sau một cú thiệt hại đáng kể, có cơ hội nhận một lợi ích an ủi nhỏ. Ngưỡng và giá trị chưa khóa.',
      live: false,
    },
  },
  {
    id: 'starter-grumpy',
    displayNameKey: 'character.starter.grumpy.name',
    archetype: 'grumpy',
    archetypeLabel: 'CAU CÓ',
    ageBand: { min: 40, max: 50 },
    styleDirection: 'Chỉnh tề, sắc cạnh, màu gọn; silhouette thẳng và hơi khó gần.',
    bodyLanguage: [
      'khoanh tay / chống nạnh',
      'nhíu mày, liếc ngang',
      'chỉ tay hoặc quay phắt khi bị nhắm tới',
    ],
    reactionDirection: [
      'phản ứng ngắn, sắc và khó chịu khi bị target',
      'ít than vãn, thiên về đáp trả',
      'khi thắng vẫn giữ vẻ đắc ý hơn là reo hò',
    ],
    presentationTags: [
      'age:40-50',
      'style:sharp-tailored',
      'silhouette:upright-angular',
      'energy:confrontational',
    ],
    reactionProfileId: 'reaction.starter.grumpy.v01',
    passiveIds: ['passive.starter.grumpy.push-back'],
    poseSetId: 'pose.starter.grumpy.v01',
    passiveConcept: {
      id: 'passive.starter.grumpy.push-back',
      label: 'ĐỪNG CHỌC TUI',
      trigger: 'card_played',
      designIntent: 'Có lợi ích phản ứng khi bị người chơi khác nhắm trực tiếp. Cơ chế counter cụ thể chưa khóa.',
      live: false,
    },
  },
  {
    id: 'starter-anxious',
    displayNameKey: 'character.starter.anxious.name',
    archetype: 'anxious',
    archetypeLabel: 'LO LẮNG',
    ageBand: { min: 28, max: 35 },
    styleDirection: 'Neat/planner-core, nhiều túi nhỏ và vật dụng; silhouette gọn nhưng luôn có cảm giác chuẩn bị quá kỹ.',
    bodyLanguage: [
      'ôm đồ hoặc kiểm tra vật dụng',
      'nhìn quanh trước khi hành động',
      'co vai / cắn môi / thở phào rõ rệt',
    ],
    reactionDirection: [
      'panic thường đến trước khi kết quả thật sự xấu',
      'được an toàn thì thở phào mạnh',
      'ưa phản ứng kiểu dự phòng, cân nhắc và tự trấn an',
    ],
    presentationTags: [
      'age:28-35',
      'style:planner-core',
      'silhouette:compact-prepared',
      'energy:cautious',
    ],
    reactionProfileId: 'reaction.starter.anxious.v01',
    passiveIds: ['passive.starter.anxious.plan-ahead'],
    poseSetId: 'pose.starter.anxious.v01',
    passiveConcept: {
      id: 'passive.starter.anxious.plan-ahead',
      label: 'LO XA',
      trigger: 'turn_start',
      designIntent: 'Nhận lợi thế nhỏ từ việc chuẩn bị hoặc biết trước một lựa chọn/rủi ro. Cách reveal cụ thể chưa khóa.',
      live: false,
    },
  },
  {
    id: 'starter-hyper',
    displayNameKey: 'character.starter.hyper.name',
    archetype: 'hyper',
    archetypeLabel: 'TĂNG ĐỘNG',
    ageBand: { min: 18, max: 24 },
    styleDirection: 'Streetwear/sporty, màu sáng, sticker và phụ kiện chuyển động; silhouette nghiêng, bật, luôn có momentum.',
    bodyLanguage: [
      'nhảy / nghiêng người / không đứng yên',
      'tay chân mở rộng khi vui',
      'phản ứng nối tiếp rất nhanh, nhiều pose chuyển động',
    ],
    reactionDirection: [
      'vui quá mức với Mini Game và movement',
      'chuyển cảm xúc nhanh, reaction ngắn và dồn dập',
      'thua cũng dễ bật lại thành trạng thái muốn chơi tiếp',
    ],
    presentationTags: [
      'age:18-24',
      'style:street-sporty',
      'silhouette:dynamic-leaning',
      'energy:restless-playful',
    ],
    reactionProfileId: 'reaction.starter.hyper.v01',
    passiveIds: ['passive.starter.hyper.keep-moving'],
    poseSetId: 'pose.starter.hyper.v01',
    passiveConcept: {
      id: 'passive.starter.hyper.keep-moving',
      label: 'KHÔNG NGỒI YÊN',
      trigger: 'minigame_start',
      designIntent: 'Có lợi thế nhỏ gắn với Mini Game, movement hoặc chuỗi hành động. Hiệu ứng gameplay chưa khóa.',
      live: false,
    },
  },
];

export function getStarterCharacterV01(id: string): StarterCharacterDefinition | undefined {
  return STARTER_CHARACTERS_V01.find((character) => character.id === id);
}

export function starterCharacterArchetypesV01(): StarterCharacterArchetype[] {
  return STARTER_CHARACTERS_V01.map((character) => character.archetype);
}
