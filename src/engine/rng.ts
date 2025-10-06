import seedrandom, { PRNG } from 'seedrandom';

export interface RNG {
  next(): number; // [0,1)
  int(maxExclusive: number): number; // 0..max-1
}

export class SeededRNG implements RNG {
  private rng: PRNG;
  constructor(seed: string) {
    this.rng = seedrandom(seed, { global: false });
  }
  next(): number {
    return this.rng.quick();
  }
  int(maxExclusive: number): number {
    return Math.floor(this.next() * maxExclusive);
  }
}
