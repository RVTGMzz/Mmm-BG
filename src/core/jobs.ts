import type { PlayerState } from './types';

export type JobRisk = 'normal' | 'crime';

export interface JobDefinition {
  id: string;
  title: string;
  icon: string;
  risk: JobRisk;
  maxLevel: number;
  salaryByLevel: number[];
  special: string;
  promotionChance: number;
  demotionChance: number;
  firedOnDemotionChance: number;
  jailChance: number;
}

export type JobCareerOutcome = 'promoted' | 'demoted' | 'steady' | 'fired' | 'jailed';

export interface JobCareerResolution {
  outcome: JobCareerOutcome;
  jobId: string;
  previousLevel: number;
  level: number;
  title: string;
  summary: string;
}

function clampChance(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function drawUniqueJobOffer(
  jobs: readonly JobDefinition[],
  random: () => number,
  count = 3,
): JobDefinition[] {
  const pool = [...jobs];
  const offer: JobDefinition[] = [];
  const wanted = Math.min(Math.max(0, Math.floor(count)), pool.length);

  while (offer.length < wanted && pool.length > 0) {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    const [picked] = pool.splice(index, 1);
    if (picked) offer.push(picked);
  }
  return offer;
}

export function jobSalary(job: JobDefinition, level: number | undefined): number {
  const normalized = Math.max(1, Math.min(job.maxLevel, Math.floor(level ?? 1)));
  const raw = job.salaryByLevel[normalized - 1] ?? job.salaryByLevel.at(-1) ?? 0;
  return Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
}

export function jobOfferIndexForRoll(roll: number): number {
  const normalized = Math.max(1, Math.min(6, Math.floor(roll)));
  return Math.floor((normalized - 1) / 2);
}

export function applyJobSelection(player: PlayerState, job: JobDefinition): void {
  player.jobId = job.id;
  player.jobLevel = 1;
  player.jobStatus = 'employed';
}

export function clearJob(player: PlayerState): void {
  delete player.jobId;
  delete player.jobLevel;
  player.jobStatus = 'unemployed';
}

export function resolveCareerCheck(
  player: PlayerState,
  job: JobDefinition,
  random: () => number,
): JobCareerResolution {
  const previousLevel = Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1)));

  if (job.risk === 'crime' && random() < clampChance(job.jailChance)) {
    player.jobStatus = 'jailed';
    return {
      outcome: 'jailed',
      jobId: job.id,
      previousLevel,
      level: previousLevel,
      title: `${job.icon} BỊ TÓM!`,
      summary: `${player.name} làm ${job.title} và dính biến cố vào tù. Hiệu ứng tù sâu hơn sẽ được nối ở milestone sau.`,
    };
  }

  const careerRoll = random();
  const promote = clampChance(job.promotionChance);
  const demote = clampChance(job.demotionChance);

  if (careerRoll < promote && previousLevel < job.maxLevel) {
    const level = previousLevel + 1;
    player.jobLevel = level;
    player.jobStatus = 'employed';
    return {
      outcome: 'promoted',
      jobId: job.id,
      previousLevel,
      level,
      title: `${job.icon} THĂNG CẤP!`,
      summary: `${player.name}: ${job.title} Lv.${previousLevel} → Lv.${level}. Lương qua cổng: ${jobSalary(job, previousLevel)} → ${jobSalary(job, level)} B$.`,
    };
  }

  if (careerRoll >= 1 - demote) {
    const fired = job.risk !== 'crime' && random() < clampChance(job.firedOnDemotionChance);
    if (fired) {
      clearJob(player);
      return {
        outcome: 'fired',
        jobId: job.id,
        previousLevel,
        level: 0,
        title: '📦 BỊ SA THẢI!',
        summary: `${player.name} bị sa thải khỏi nghề ${job.title}. Lần sau qua Job Hub sẽ đổ xúc xắc nhận nghề mới.`,
      };
    }

    const level = Math.max(1, previousLevel - 1);
    player.jobLevel = level;
    player.jobStatus = 'employed';
    return {
      outcome: 'demoted',
      jobId: job.id,
      previousLevel,
      level,
      title: `${job.icon} GIẢM CẤP`,
      summary: `${player.name}: ${job.title} Lv.${previousLevel} → Lv.${level}. Lương qua cổng: ${jobSalary(job, previousLevel)} → ${jobSalary(job, level)} B$.`,
    };
  }

  player.jobStatus = 'employed';
  return {
    outcome: 'steady',
    jobId: job.id,
    previousLevel,
    level: previousLevel,
    title: `${job.icon} GIỮ VỮNG`,
    summary: `${player.name} vẫn giữ ${job.title} Lv.${previousLevel} • lương ${jobSalary(job, previousLevel)} B$/cổng.`,
  };
}

export function jobById(jobs: readonly JobDefinition[], id: string | undefined): JobDefinition | undefined {
  if (!id) return undefined;
  return jobs.find((job) => job.id === id);
}
