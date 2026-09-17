import type { PlayerState, SpecialHoldLocation } from './types';

export type CareerTrait070Id =
  | 'steady_desk'
  | 'tip_curve'
  | 'hot_kitchen'
  | 'ride_hustle'
  | 'delivery_grind'
  | 'viral_swing'
  | 'specialist'
  | 'doctor_on_call'
  | 'spotlight'
  | 'criminal_record'
  | 'police_badge'
  | 'stunt_risk';

export interface CareerTrait070 {
  id: CareerTrait070Id;
  jobId: string;
  icon: string;
  name: string;
  summary: string;
  releaseFaces?: Partial<Record<SpecialHoldLocation, readonly number[]>>;
}

/**
 * 0.1.70 canonical release baseline.
 *
 * Keep the frozen 0.1.57 helper intact for historical replay guards. Runtime authority
 * from 0.1.70 onward calls this policy instead, so Career Traits can bend the rule
 * without rewriting legacy checkpoints.
 */
export const DEFAULT_RELEASE_FACES_070 = {
  jail: [1, 3, 5] as const,
  hospital: [2, 4, 6] as const,
} as const;

const CAREER_TRAITS_070: readonly CareerTrait070[] = [
  {
    id: 'steady_desk',
    jobId: 'JOB_OFFICE',
    icon: '🗂️',
    name: 'Ổn định',
    summary: 'Nhịp nghề ổn định, dễ giữ việc và tăng lương đều.',
  },
  {
    id: 'tip_curve',
    jobId: 'JOB_BARISTA',
    icon: '☕',
    name: 'Tiền tip',
    summary: 'Lương đầu thấp nhưng đường tăng lương đều và dễ đọc.',
  },
  {
    id: 'hot_kitchen',
    jobId: 'JOB_CHEF',
    icon: '🍳',
    name: 'Bếp nóng',
    summary: 'Lương khá, nhịp thăng hạ cân bằng.',
  },
  {
    id: 'ride_hustle',
    jobId: 'JOB_DRIVER',
    icon: '🚕',
    name: 'Chạy cuốc',
    summary: 'Thu nhập ổn nhưng nguy cơ tụt cấp nhỉnh hơn.',
  },
  {
    id: 'delivery_grind',
    jobId: 'JOB_SHIPPER',
    icon: '📦',
    name: 'Cày đơn',
    summary: 'Thu nhập tăng đều qua từng cấp nghề.',
  },
  {
    id: 'viral_swing',
    jobId: 'JOB_STREAMER',
    icon: '📹',
    name: 'Viral',
    summary: 'Lv.3 bùng nổ nhưng nghề biến động mạnh.',
  },
  {
    id: 'specialist',
    jobId: 'JOB_ENGINEER',
    icon: '🛠️',
    name: 'Chuyên môn',
    summary: 'Lương cao, nguy cơ mất việc thấp.',
  },
  {
    id: 'doctor_on_call',
    jobId: 'JOB_DOCTOR',
    icon: '🩺',
    name: 'Trực cấp cứu',
    summary: 'Ở Bệnh viện, đổ 2 / 4 / 5 / 6 là được xuất viện.',
    releaseFaces: { hospital: [2, 4, 5, 6] as const },
  },
  {
    id: 'spotlight',
    jobId: 'JOB_IDOL',
    icon: '🎤',
    name: 'Nổi tiếng',
    summary: 'Trần lương rất cao nhưng dễ tụt hoặc mất việc.',
  },
  {
    id: 'criminal_record',
    jobId: 'JOB_THIEF',
    icon: '🦹',
    name: 'Tiền án',
    summary: 'Ở Đồn, chỉ đổ 1 / 5 mới được thả.',
    releaseFaces: { jail: [1, 5] as const },
  },
  {
    id: 'police_badge',
    jobId: 'JOB_POLICE',
    icon: '👮',
    name: 'Nghiệp vụ',
    summary: 'Ở Đồn, đổ 1 / 3 / 4 / 5 là được thả.',
    releaseFaces: { jail: [1, 3, 4, 5] as const },
  },
  {
    id: 'stunt_risk',
    jobId: 'JOB_STUNT',
    icon: '🤸',
    name: 'Chấn thương nghề',
    summary: 'Ở Bệnh viện, chỉ đổ 2 / 6 mới được xuất viện.',
    releaseFaces: { hospital: [2, 6] as const },
  },
] as const;

export function careerTraitForJob070(jobId: string | undefined): CareerTrait070 | undefined {
  if (!jobId) return undefined;
  return CAREER_TRAITS_070.find((trait) => trait.jobId === jobId);
}

/**
 * A criminal Job can be cleared the moment the player is arrested. The hold-source
 * Job survives only for the duration of that hold so its release trait cannot vanish.
 */
export function careerTraitJobIdForHold070(player: PlayerState): string | undefined {
  if (player.jobStatus === 'employed' && player.jobId) return player.jobId;
  return player.specialHoldSourceJobId;
}

export function careerReleaseFaces070(
  location: SpecialHoldLocation,
  player: Pick<PlayerState, 'jobId' | 'jobStatus' | 'specialHoldSourceJobId'>,
): readonly number[] {
  const jobId = player.jobStatus === 'employed' && player.jobId
    ? player.jobId
    : player.specialHoldSourceJobId;
  const trait = careerTraitForJob070(jobId);
  return trait?.releaseFaces?.[location] ?? DEFAULT_RELEASE_FACES_070[location];
}

export function careerReleaseSucceeds070(
  location: SpecialHoldLocation,
  roll: number,
  player: Pick<PlayerState, 'jobId' | 'jobStatus' | 'specialHoldSourceJobId'>,
): boolean {
  const face = Math.max(1, Math.min(6, Math.floor(roll)));
  return careerReleaseFaces070(location, player).includes(face);
}

export function careerReleaseRuleLabel070(
  location: SpecialHoldLocation,
  player: Pick<PlayerState, 'jobId' | 'jobStatus' | 'specialHoldSourceJobId'>,
): string {
  const faces = careerReleaseFaces070(location, player).join(' / ');
  const jobId = player.jobStatus === 'employed' && player.jobId
    ? player.jobId
    : player.specialHoldSourceJobId;
  const trait = careerTraitForJob070(jobId);
  const prefix = trait?.releaseFaces?.[location] ? `${trait.icon} ${trait.name} • ` : '';
  return `${prefix}${faces}`;
}

export function allCareerTraits070(): readonly CareerTrait070[] {
  return CAREER_TRAITS_070;
}
