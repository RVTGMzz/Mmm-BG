import { careerTraitForJob070, DEFAULT_RELEASE_FACES_070 } from '../core/careerTraits070';
import { jobDepthProfile059, jobSalary, type JobDefinition } from '../core/jobs';
import type { SpecialHoldLocation } from '../core/types';

export type CareerTraitTone071 = 'benefit' | 'tradeoff' | 'identity';
export type CareerSalaryBand071 = 'THẤP' | 'VỪA' | 'CAO' | 'RẤT CAO';

export interface CareerBalanceProfile071 {
  salaryBand: CareerSalaryBand071;
  riskLabel: string;
  traitTone: CareerTraitTone071;
  traitLabel: string;
  hudCopy: string;
}

function releaseOverride071(jobId: string): { location: SpecialHoldLocation; faces: readonly number[] } | undefined {
  const trait = careerTraitForJob070(jobId);
  if (!trait?.releaseFaces) return undefined;
  if (trait.releaseFaces.jail) return { location: 'jail', faces: trait.releaseFaces.jail };
  if (trait.releaseFaces.hospital) return { location: 'hospital', faces: trait.releaseFaces.hospital };
  return undefined;
}

export function careerTraitTone071(jobId: string): CareerTraitTone071 {
  const override = releaseOverride071(jobId);
  if (!override) return 'identity';
  const baseline = DEFAULT_RELEASE_FACES_070[override.location].length;
  if (override.faces.length > baseline) return 'benefit';
  if (override.faces.length < baseline) return 'tradeoff';
  return 'identity';
}

export function careerTraitHudCopy071(jobId: string): string {
  const trait = careerTraitForJob070(jobId);
  if (!trait) return '';
  const override = releaseOverride071(jobId);
  if (!override) return `${trait.icon} ${trait.name}`;
  const location = override.location === 'jail' ? 'Đồn' : 'BV';
  return `${trait.icon} ${trait.name} • ${location} ${override.faces.join('/')}`;
}

export function careerTraitDetailCopy071(job: JobDefinition): string {
  const trait = careerTraitForJob070(job.id);
  if (!trait) return job.special;
  return `${trait.icon} ${trait.name}: ${trait.summary}`;
}

export function careerBalanceProfile071(job: JobDefinition): CareerBalanceProfile071 {
  const profile = jobDepthProfile059(job);
  const maxSalary = jobSalary(job, job.maxLevel);
  const salaryBand: CareerSalaryBand071 = maxSalary >= 180
    ? 'RẤT CAO'
    : maxSalary >= 140
      ? 'CAO'
      : maxSalary >= 105
        ? 'VỪA'
        : 'THẤP';
  const trait = careerTraitForJob070(job.id);
  return {
    salaryBand,
    riskLabel: profile.riskLabel,
    traitTone: careerTraitTone071(job.id),
    traitLabel: trait ? `${trait.icon} ${trait.name}` : 'Không có trait',
    hudCopy: careerTraitHudCopy071(job.id),
  };
}

/**
 * 0.1.71 balance guardrails are intentionally descriptive, not a second authority layer.
 * They catch obviously stacked benefit jobs or underpaid penalty jobs while leaving all
 * actual salary/career/release resolution in the existing authoritative core.
 */
export function careerBalanceWarnings071(job: JobDefinition): string[] {
  const warnings: string[] = [];
  const tone = careerTraitTone071(job.id);
  const maxSalary = jobSalary(job, job.maxLevel);

  if (tone === 'benefit' && maxSalary > 145) {
    warnings.push('release benefit + top salary exceeds 0.1.71 budget');
  }
  if (tone === 'tradeoff' && maxSalary < 150) {
    warnings.push('release penalty needs high salary compensation');
  }
  if (job.risk === 'crime' && (job.jailChance <= 0 || maxSalary < 180)) {
    warnings.push('crime career must keep both real arrest risk and premium reward');
  }
  for (let level = 2; level <= job.maxLevel; level += 1) {
    if (jobSalary(job, level) < jobSalary(job, level - 1)) {
      warnings.push('salary curve must not decrease with level');
      break;
    }
  }
  return warnings;
}
