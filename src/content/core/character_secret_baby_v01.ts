import type { CharacterDefinition, CharacterPassiveTrigger } from '../../core/characterSystem';

export const SECRET_BABY_CHARACTER_ID = 'secret-baby' as const;
export const SECRET_BABY_RANDOM_CHANCE = 0.05;

export interface SecretBabyPassiveConcept {
  id: string;
  label: string;
  trigger: CharacterPassiveTrigger;
  designIntent: string;
  live: false;
}

export interface SecretBabyCharacterDefinition extends CharacterDefinition {
  id: typeof SECRET_BABY_CHARACTER_ID;
  secret: true;
  randomOnly: true;
  directSelectable: false;
  randomChance: typeof SECRET_BABY_RANDOM_CHANCE;
  archetypeLabel: 'EM BÉ BÁ ĐẠO';
  agePresentation: 'infant';
  passiveConcept: SecretBabyPassiveConcept;
}

/**
 * CH-02B secret Character.
 *
 * This definition is deliberately absent from the normal starter roster.
 * It may only enter a match through the HOST-authoritative RANDOM batch.
 * The 5% chance applies per RANDOM slot; the batch is capped at one Secret Baby.
 */
export const SECRET_BABY_V01: SecretBabyCharacterDefinition = {
  id: SECRET_BABY_CHARACTER_ID,
  displayNameKey: 'character.secret.baby.name',
  secret: true,
  randomOnly: true,
  directSelectable: false,
  randomChance: SECRET_BABY_RANDOM_CHANCE,
  archetypeLabel: 'EM BÉ BÁ ĐẠO',
  agePresentation: 'infant',
  presentationTags: [
    'age:infant',
    'style:baby-crawl',
    'silhouette:crawling',
    'prop:pacifier',
    'energy:bossy-chaos',
    'rarity:secret',
    'selection:random-only',
  ],
  reactionProfileId: 'reaction.secret.baby.v01',
  passiveIds: ['passive.secret.baby.cosmic-darling'],
  poseSetId: 'pose.secret.baby.v01',
  passiveConcept: {
    id: 'passive.secret.baby.cosmic-darling',
    label: 'BÉ CƯNG CỦA VŨ TRỤ',
    trigger: 'money_loss',
    designIntent: 'Passive Secret phải mạnh hơn starter nhưng không bảo đảm thắng. Hướng đầu: một lớp bảo kê/giảm cú xấu đáng kể theo nhịp giới hạn; con số và tần suất chưa khóa.',
    live: false,
  },
};

export function isSecretBabyCharacterId(id: string | undefined): boolean {
  return id === SECRET_BABY_CHARACTER_ID;
}
