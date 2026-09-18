import { jobById, jobSalary, type JobDefinition } from '../core/jobs';
import type { PlayerState } from '../core/types';

export interface PlayerHudCareer065 {
  employed: boolean;
  title: string;
  icon: string;
  level: number;
  salary: number;
  line1: string;
  line2: string;
}

export function playerHudCareer065(
  player: PlayerState,
  jobs: readonly JobDefinition[],
): PlayerHudCareer065 {
  const job = player.jobStatus === 'employed' ? jobById(jobs, player.jobId) : undefined;
  if (!job) {
    return {
      employed: false,
      title: 'Chưa có nghề',
      icon: '💼',
      level: 0,
      salary: 0,
      line1: '💼 Chưa có nghề',
      line2: '💰 Lương: 0 B$/vòng',
    };
  }

  const level = Math.max(1, Math.min(job.maxLevel, Math.floor(player.jobLevel ?? 1)));
  const salary = jobSalary(job, level);
  return {
    employed: true,
    title: job.title,
    icon: job.icon,
    level,
    salary,
    line1: `💼 ${job.icon} ${job.title} Lv.${level}`,
    line2: `💰 Lương: ${salary} B$/vòng`,
  };
}
