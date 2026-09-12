export function rollD6(random: () => number = Math.random): number {
  return Math.floor(random() * 6) + 1;
}
