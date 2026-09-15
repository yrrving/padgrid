import type { CategoryId } from '../models/types';

// ─── Shared transport ───────────────────────────────────────────────────────
// All active columns schedule their audio against one shared bar grid, so
// starting a second loop while a first is playing waits for the next bar
// boundary instead of starting instantly out of phase — same "everything
// stays in time" behavior real clip-launcher apps have, and a good, concrete
// thing for the guided tour to point out (see TourStep 'other-column').

const BPM = 96;
const BEATS_PER_BAR = 4;
export const BAR_DUR = (60 / BPM) * BEATS_PER_BAR; // seconds
const LOOKAHEAD = 0.15; // how far ahead (s) we schedule audio each tick
const TICK_MS = 60;

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const buf = c.createBuffer(1, c.sampleRate * 1, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

function noiseBurst(
  c: AudioContext,
  dest: AudioNode,
  time: number,
  dur: number,
  freq: number,
  q: number,
  gain: number
) {
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(filter).connect(g).connect(dest);
  src.start(time);
  src.stop(time + dur + 0.02);
}

function tone(
  c: AudioContext,
  dest: AudioNode,
  time: number,
  dur: number,
  freq: number,
  type: OscillatorType,
  gain: number,
  attack = 0.01
) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + attack);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

// Root note per row (variant) — same pattern index for bass and melodic so
// columns played together stay harmonically related.
const SCALE_ROOTS = [220, 246.94, 261.63, 293.66]; // A3, B3, C4, D4
const PENTATONIC = [0, 2, 4, 7, 9]; // semitone offsets, major pentatonic

function noteFreq(root: number, semitones: number) {
  return root * Math.pow(2, semitones / 12);
}

// One bar's worth of audio for a category, scheduled starting at `barStart`.
type PatternFn = (c: AudioContext, dest: AudioNode, barStart: number, variant: number) => void;

const beatDur = BAR_DUR / BEATS_PER_BAR;

const PATTERNS: Record<CategoryId, PatternFn> = {
  drums: (c, dest, t) => {
    // Kick on 1 & 3, snare-ish noise on 2 & 4, closed hats on every 8th.
    for (let b = 0; b < BEATS_PER_BAR; b++) {
      const beatTime = t + b * beatDur;
      if (b === 0 || b === 2) {
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, beatTime);
        osc.frequency.exponentialRampToValueAtTime(45, beatTime + 0.15);
        const g = c.createGain();
        g.gain.setValueAtTime(0.9, beatTime);
        g.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.22);
        osc.connect(g).connect(dest);
        osc.start(beatTime);
        osc.stop(beatTime + 0.25);
      } else {
        noiseBurst(c, dest, beatTime, 0.14, 1800, 0.7, 0.5);
      }
      noiseBurst(c, dest, beatTime, 0.03, 9000, 2, 0.22);
      noiseBurst(c, dest, beatTime + beatDur / 2, 0.03, 9000, 2, 0.16);
    }
  },
  percussion: (c, dest, t) => {
    // Shaker on every offbeat 8th, a couple of ghost 16ths for texture.
    for (let b = 0; b < BEATS_PER_BAR; b++) {
      const beatTime = t + b * beatDur;
      noiseBurst(c, dest, beatTime + beatDur / 2, 0.05, 6000, 1.2, 0.3);
      noiseBurst(c, dest, beatTime + beatDur * 0.75, 0.03, 7000, 1.5, 0.14);
    }
  },
  bass: (c, dest, t, variant) => {
    const root = SCALE_ROOTS[variant % SCALE_ROOTS.length] / 2;
    tone(c, dest, t, beatDur * 1.8, root, 'triangle', 0.5, 0.01);
    tone(c, dest, t + beatDur * 2, beatDur * 1.8, noteFreq(root, 5), 'triangle', 0.45, 0.01);
  },
  melodic: (c, dest, t, variant) => {
    const root = SCALE_ROOTS[variant % SCALE_ROOTS.length];
    for (let b = 0; b < BEATS_PER_BAR; b++) {
      const semis = PENTATONIC[(b + variant) % PENTATONIC.length];
      tone(c, dest, t + b * beatDur, beatDur * 0.9, noteFreq(root, semis), 'sawtooth', 0.16, 0.005);
    }
  },
  vocal: (c, dest, t, variant) => {
    const root = SCALE_ROOTS[variant % SCALE_ROOTS.length];
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = root;
    const lfo = c.createOscillator();
    lfo.frequency.value = 5;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain).connect(osc.frequency);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = root * 2.2;
    filter.Q.value = 6;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.2);
    g.gain.linearRampToValueAtTime(0.18, t + BAR_DUR - 0.2);
    g.gain.linearRampToValueAtTime(0, t + BAR_DUR);
    osc.connect(filter).connect(g).connect(dest);
    lfo.start(t);
    osc.start(t);
    lfo.stop(t + BAR_DUR + 0.02);
    osc.stop(t + BAR_DUR + 0.02);
  },
  fx: (c, dest, t) => {
    const src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(4000, t + BAR_DUR);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + BAR_DUR * 0.4);
    g.gain.linearRampToValueAtTime(0, t + BAR_DUR);
    src.connect(filter).connect(g).connect(dest);
    src.start(t);
    src.stop(t + BAR_DUR + 0.02);
  },
};

// ─── Column playback management ────────────────────────────────────────────

interface ActiveColumn {
  category: CategoryId;
  variant: number;
  nextBarTime: number;
  gain: GainNode;
}

const active = new Map<number, ActiveColumn>(); // keyed by column index
let anchor: number | null = null; // AudioContext time of the very first bar
let timer: number | null = null;

function nextBoundaryFrom(now: number): number {
  if (anchor === null) return now;
  const bars = Math.ceil((now - anchor) / BAR_DUR - 1e-6);
  return anchor + Math.max(bars, 0) * BAR_DUR;
}

function tick() {
  const c = getCtx();
  const horizon = c.currentTime + LOOKAHEAD;
  for (const col of active.values()) {
    while (col.nextBarTime < horizon) {
      PATTERNS[col.category](c, col.gain, col.nextBarTime, col.variant);
      col.nextBarTime += BAR_DUR;
    }
  }
}

function ensureTransport() {
  if (timer !== null) return;
  timer = window.setInterval(tick, TICK_MS);
}

function stopTransportIfIdle() {
  if (active.size === 0 && timer !== null) {
    window.clearInterval(timer);
    timer = null;
    anchor = null;
  }
}

/** Column volume, 0..1, persists across pad changes within that column. */
const columnVolumes = new Map<number, number>();

export function setColumnVolume(col: number, v: number) {
  columnVolumes.set(col, v);
  const a = active.get(col);
  if (a) a.gain.gain.value = v;
}

export function getColumnVolume(col: number): number {
  return columnVolumes.get(col) ?? 0.8;
}

/** Starts (or switches) the loop playing in a column. Waits for the next
 * shared bar boundary if anything else is already playing; starts instantly
 * if this is the very first sound (there's no grid to sync to yet). */
export function playPad(col: number, category: CategoryId, variant: number) {
  const c = getCtx();
  ensureTransport();
  const now = c.currentTime + 0.02;
  if (anchor === null) anchor = now;
  const startAt = anchor === now ? now : nextBoundaryFrom(now);

  const existing = active.get(col);
  const gain = existing?.gain ?? c.createGain();
  gain.gain.value = getColumnVolume(col);
  if (!existing) gain.connect(masterGain!);

  active.set(col, { category, variant, nextBarTime: startAt, gain });
  return startAt;
}

/** Stops whatever's playing in a column, immediately. */
export function stopColumn(col: number) {
  const a = active.get(col);
  if (!a) return;
  a.gain.disconnect();
  active.delete(col);
  stopTransportIfIdle();
}

export function stopAll() {
  for (const col of Array.from(active.keys())) stopColumn(col);
}

export function isColumnActive(col: number): boolean {
  return active.has(col);
}
