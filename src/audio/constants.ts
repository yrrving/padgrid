// Shared tempo constants — split out so audioEngine.ts and fx.ts can both
// import them without a circular dependency between the two.
export const BPM = 96;
export const BEATS_PER_BAR = 4;
export const BAR_DUR = (60 / BPM) * BEATS_PER_BAR; // seconds
