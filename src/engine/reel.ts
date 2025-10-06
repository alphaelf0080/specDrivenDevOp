import type { RNG } from './rng';

export function sampleReelWindow(strip: string[], rows: number, rng: RNG): string[] {
  if (strip.length === 0) return Array(rows).fill('');
  const start = rng.int(strip.length);
  const out: string[] = [];
  for (let r = 0; r < rows; r++) {
    out.push(strip[(start + r) % strip.length]);
  }
  return out;
}
