import baseNewsJson from './news_mvp_demo.json';
import partyNewsJson from './news_party_024.json';
import type { NewsDefinition } from '../../core/news';

const base = baseNewsJson as NewsDefinition[];
const extras = partyNewsJson as NewsDefinition[];

export const NEWS_CATALOG: NewsDefinition[] = [
  ...base.map((entry) =>
    entry.effect.type === 'money_delta_all'
      ? { ...entry, dropWeight: entry.dropWeight * 0.5 }
      : { ...entry },
  ),
  ...extras.map((entry) => ({ ...entry })),
];
