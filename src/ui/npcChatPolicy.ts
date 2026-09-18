export const NPC_CHAT_DURATION_MULTIPLIER = 2.5;

export function npcChatDurationMs(baseDurationMs: number, isNpc: boolean): number {
  const base = Math.max(0, Math.round(baseDurationMs));
  return isNpc ? Math.round(base * NPC_CHAT_DURATION_MULTIPLIER) : base;
}
