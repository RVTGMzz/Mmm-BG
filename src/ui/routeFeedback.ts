export interface RouteFeedbackCopy {
  parityLabel: 'CHẴN' | 'LẺ';
  icon: string;
  title: string;
  detail: string;
}

export function routeFeedbackCopy(roll: number, routeLabel?: string): RouteFeedbackCopy {
  const normalized = Math.abs(Math.floor(Number.isFinite(roll) ? roll : 0));
  const even = normalized % 2 === 0;
  const parityLabel = even ? 'CHẴN' : 'LẺ';
  const title = routeLabel?.trim() || (even ? 'HẺM TẮT' : 'PHỐ CHÍNH');
  return {
    parityLabel,
    icon: even ? '↘' : '↗',
    title,
    detail: `Xúc xắc ${normalized} • ${parityLabel} → tự động rẽ`,
  };
}
