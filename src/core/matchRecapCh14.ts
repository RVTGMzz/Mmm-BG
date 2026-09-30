import jobsJson from '../content/core/jobs_mvp.json';
import { STARTER_CHARACTERS_V01 } from '../content/core/characters_starter_v01';
import { SECRET_BABY_V01 } from '../content/core/character_secret_baby_v01';
import type { JobDefinition } from './jobs';
import type { MatchEvent, MatchState } from './matchState';

const JOBS_CH14 = jobsJson as JobDefinition[];

export interface MatchRecapPlayerCh14 {
  playerId: number;
  name: string;
  finalMoney: number;
  moneyDelta: number;
  jobLabel: string;
  characterLabel: string;
  miniGameWins: number;
  miniGamePlays: number;
  cardsUsed: number;
  cardsTargeted: number;
  newsAffected: number;
  jailEntries: number;
  hospitalEntries: number;
  passiveActivations: number;
  lotteryAmount: number;
  salaryAmount: number;
  award: string;
}

export interface MatchRecapMomentCh14 {
  seq: number;
  icon: string;
  text: string;
  type: string;
}

export interface MatchRecapCh14 {
  players: MatchRecapPlayerCh14[];
  moments: MatchRecapMomentCh14[];
}

function idsFromEventCh14(event: MatchEvent): number[] {
  return String(event.data.affectedPlayerIds ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 0);
}

function numericCh14(value: string | number | boolean | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function characterLabelCh14(id: string | undefined): string {
  if (!id) return 'CHƯA CHỌN';
  const starter = STARTER_CHARACTERS_V01.find((entry) => entry.id === id);
  if (starter) return starter.archetypeLabel;
  if (id === SECRET_BABY_V01.id) return SECRET_BABY_V01.archetypeLabel;
  return id.toUpperCase();
}

function jobLabelCh14(id: string | undefined): string {
  if (!id) return 'CHƯA CÓ VIỆC';
  const job = JOBS_CH14.find((entry) => entry.id === id);
  return job ? `${job.icon} ${job.title}` : id;
}

function playerNameCh14(match: MatchState, playerId: number | undefined): string {
  if (playerId === undefined) return 'MMM';
  return match.players.find((entry) => entry.id === playerId)?.name ?? `P${playerId + 1}`;
}

function compactCopyCh14(value: unknown, fallback: string): string {
  const copy = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!copy) return fallback;
  return copy.length <= 62 ? copy : `${copy.slice(0, 59)}…`;
}

function momentCandidateCh14(match: MatchState, event: MatchEvent): (MatchRecapMomentCh14 & { score: number }) | undefined {
  const actor = playerNameCh14(match, event.actorId);
  if (event.type === 'ready_pass' && event.data.finishLocked === true) {
    return { seq:event.seq, type:event.type, score:100, icon:'🏁',
      text:`${actor} cán đích với ${numericCh14(event.data.resultMoney)} B$.` };
  }
  if (event.type === 'special_hold') {
    const hospital = event.data.location === 'hospital';
    return { seq:event.seq, type:event.type, score:94, icon:hospital ? '🏥' : '🚔',
      text:`${actor} ${hospital ? 'nhập viện' : 'bị giữ tại Đồn'}.` };
  }
  if (event.type === 'lottery') {
    return { seq:event.seq, type:event.type, score:90, icon:'🎰',
      text:`${actor} trúng +${numericCh14(event.data.amount)} B$ từ Xổ số.` };
  }
  if (event.type === 'minigame_reward' && numericCh14(event.data.rank) === 1) {
    const sourceSeq = numericCh14(event.data.sourceEventSeq);
    const source = match.eventLog.find((candidate) => candidate.seq === sourceSeq && candidate.type === 'minigame_tile');
    const title = compactCopyCh14(source?.data.title, 'Mini Game').replace(/^MINI GAME\s*[•·-]?\s*/iu, '');
    return { seq:event.seq, type:event.type, score:88, icon:'🥇',
      text:`${actor} thắng ${title} (+${numericCh14(event.data.amount)} B$).` };
  }
  if (event.type === 'card_play') {
    const targetId = numericCh14(event.data.targetId);
    const target = targetId >= 0 ? playerNameCh14(match, targetId) : '';
    return { seq:event.seq, type:event.type, score:78, icon:'🃏',
      text:`${actor} dùng ${compactCopyCh14(event.data.title, 'Lá Bài')}${target ? ` lên ${target}` : ''}.` };
  }
  if (event.type === 'news') {
    return { seq:event.seq, type:event.type, score:72, icon:'📰',
      text:compactCopyCh14(event.data.title, 'Một TIN TỨC làm cả bàn chao đảo.') };
  }
  if (event.type === 'job_selected') {
    return { seq:event.seq, type:event.type, score:66, icon:'💼',
      text:`${actor} nhận việc ${compactCopyCh14(event.data.jobTitle, 'mới')}.` };
  }
  if (event.type === 'character_passive') {
    return { seq:event.seq, type:event.type, score:62, icon:'✨',
      text:`${actor}: ${compactCopyCh14(event.data.title, 'nội tại kích hoạt')}.` };
  }
  if (event.type === 'board_shuffle') {
    return { seq:event.seq, type:event.type, score:58, icon:'🔀',
      text:`Bàn cờ biến đổi ở vòng ${numericCh14(event.data.lap)}.` };
  }
  return undefined;
}

function chooseMomentsCh14(match: MatchState): MatchRecapMomentCh14[] {
  const candidates = match.eventLog
    .map((event) => momentCandidateCh14(match, event))
    .filter((entry): entry is MatchRecapMomentCh14 & { score:number } => Boolean(entry))
    .sort((left, right) => right.score - left.score || left.seq - right.seq);

  const perType = new Map<string, number>();
  const picked: Array<MatchRecapMomentCh14 & { score:number }> = [];
  for (const candidate of candidates) {
    const count = perType.get(candidate.type) ?? 0;
    if (count >= 2) continue;
    picked.push(candidate);
    perType.set(candidate.type, count + 1);
    if (picked.length >= 8) break;
  }
  return picked.sort((left, right) => left.seq - right.seq)
    .map(({ score: _score, ...entry }) => entry);
}

function awardForPlayerCh14(
  player: MatchRecapPlayerCh14,
  all: readonly MatchRecapPlayerCh14[],
): string {
  const maxMoney = Math.max(...all.map((entry) => entry.finalMoney));
  const maxWins = Math.max(...all.map((entry) => entry.miniGameWins));
  const maxHolds = Math.max(...all.map((entry) => entry.jailEntries + entry.hospitalEntries));
  const maxDrama = Math.max(...all.map((entry) => entry.newsAffected + entry.cardsTargeted));
  const minDelta = Math.min(...all.map((entry) => entry.moneyDelta));

  if (player.finalMoney === maxMoney) return '💰 ĐẠI GIA';
  if (player.miniGameWins > 0 && player.miniGameWins === maxWins) return '🎮 VUA MINI GAME';
  if (player.jailEntries + player.hospitalEntries > 0
      && player.jailEntries + player.hospitalEntries === maxHolds) {
    return player.hospitalEntries >= player.jailEntries ? '🏥 KHÁCH QUEN BỆNH VIỆN' : '🚔 KHÁCH QUEN ĐỒN';
  }
  if (player.newsAffected + player.cardsTargeted > 0
      && player.newsAffected + player.cardsTargeted === maxDrama) return '🎭 THÁNH DRAMA';
  if (player.moneyDelta < 0 && player.moneyDelta === minDelta) return '🌧️ ĐEN NHẤT VÁN';
  if (player.lotteryAmount > 0) return '🎰 THẦN TÀI';
  if (player.passiveActivations > 0) return '✨ NỘI TẠI LÊN TIẾNG';
  if (player.cardsUsed > 0) return '🃏 TAY CHƠI BÀI';
  return '🏁 BỀN BỈ TỚI CUỐI';
}

export function buildMatchRecapCh14(match: MatchState): MatchRecapCh14 {
  const base: MatchRecapPlayerCh14[] = match.players.map((player) => {
    const actorEvents = match.eventLog.filter((event) => event.actorId === player.id);
    const miniRewards = actorEvents.filter((event) => event.type === 'minigame_reward');
    const holds = actorEvents.filter((event) => event.type === 'special_hold');
    return {
      playerId: player.id,
      name: player.name,
      finalMoney: player.money,
      moneyDelta: player.money - match.startingMoney,
      jobLabel: jobLabelCh14(player.jobStatus === 'employed' ? player.jobId : undefined),
      characterLabel: characterLabelCh14(player.characterId),
      miniGameWins: miniRewards.filter((event) => numericCh14(event.data.rank) === 1).length,
      miniGamePlays: miniRewards.length,
      cardsUsed: actorEvents.filter((event) => event.type === 'card_play').length,
      cardsTargeted: match.eventLog.filter((event) =>
        event.type === 'card_play'
        && numericCh14(event.data.targetId) === player.id
        && event.actorId !== player.id).length,
      newsAffected: match.eventLog.filter((event) =>
        event.type === 'news' && idsFromEventCh14(event).includes(player.id)).length,
      jailEntries: holds.filter((event) => event.data.location === 'jail').length,
      hospitalEntries: holds.filter((event) => event.data.location === 'hospital').length,
      passiveActivations: actorEvents.filter((event) => event.type === 'character_passive').length,
      lotteryAmount: actorEvents.filter((event) => event.type === 'lottery')
        .reduce((sum, event) => sum + Math.max(0, numericCh14(event.data.amount)), 0),
      salaryAmount: actorEvents.filter((event) => event.type === 'ready_pass')
        .reduce((sum, event) => sum + Math.max(0, numericCh14(event.data.salaryAmount ?? event.data.amount)), 0),
      award: '',
    };
  });

  const players = base.map((entry) => ({ ...entry, award: awardForPlayerCh14(entry, base) }));
  return { players, moments: chooseMomentsCh14(match) };
}
