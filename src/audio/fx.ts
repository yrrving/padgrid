import { BAR_DUR } from './constants';

// Master-bus FX — real Web Audio processing, not visual placeholders.
// Each builder wires `input -> ...processing... -> output` and returns a
// `stop()` that tears every node it created back down. Only one of these is
// ever active at a time (see audioEngine.setActiveFx), so each one owns its
// own dry/wet mix internally rather than assuming anything about what else
// might be connected.

export type FxId = 'stutter' | 'flanger' | 'gater' | 'autofilter' | 'delay' | 'reverb';

export interface FxHandle {
  stop: () => void;
}

function noiseImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buf;
}

// A rhythmic on/off gate: a square-wave LFO plus a constant offset, summed
// on the AudioParam itself (multiple nodes feeding one AudioParam add
// together), so the gain swings cleanly between 0 and 1 without any manual
// per-tick scheduling.
function buildGate(ctx: AudioContext, input: AudioNode, output: AudioNode, hz: number): FxHandle {
  const gate = ctx.createGain();
  gate.gain.value = 0;
  const offset = ctx.createConstantSource();
  offset.offset.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = hz;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.5;

  offset.connect(gate.gain);
  lfo.connect(lfoDepth).connect(gate.gain);
  input.connect(gate).connect(output);

  offset.start();
  lfo.start();

  return {
    stop: () => {
      offset.stop();
      lfo.stop();
      input.disconnect(gate);
      gate.disconnect();
      offset.disconnect();
      lfo.disconnect();
      lfoDepth.disconnect();
    },
  };
}

export function buildFx(ctx: AudioContext, id: FxId, input: AudioNode, output: AudioNode): FxHandle {
  switch (id) {
    case 'stutter':
      // Fast 16th-note chop.
      return buildGate(ctx, input, output, 1 / (BAR_DUR / 16));

    case 'gater':
      // Slower 8th-note chop — same technique, lower rate.
      return buildGate(ctx, input, output, 1 / (BAR_DUR / 8));

    case 'autofilter': {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 9;
      filter.frequency.value = 300;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1 / BAR_DUR; // one sweep per bar
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 1600;
      lfo.connect(lfoDepth).connect(filter.frequency);
      input.connect(filter).connect(output);
      lfo.start();
      return {
        stop: () => {
          lfo.stop();
          input.disconnect(filter);
          filter.disconnect();
          lfo.disconnect();
          lfoDepth.disconnect();
        },
      };
    }

    case 'flanger': {
      const delay = ctx.createDelay(0.02);
      delay.delayTime.value = 0.006;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.25;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.004;
      lfo.connect(lfoDepth).connect(delay.delayTime);
      const feedback = ctx.createGain();
      feedback.gain.value = 0.45;
      delay.connect(feedback).connect(delay);
      const dry = ctx.createGain();
      dry.gain.value = 0.6;
      const wet = ctx.createGain();
      wet.gain.value = 0.6;
      input.connect(dry).connect(output);
      input.connect(delay);
      delay.connect(wet).connect(output);
      lfo.start();
      return {
        stop: () => {
          lfo.stop();
          input.disconnect(dry);
          input.disconnect(delay);
          delay.disconnect();
          feedback.disconnect();
          dry.disconnect();
          wet.disconnect();
          lfo.disconnect();
          lfoDepth.disconnect();
        },
      };
    }

    case 'delay': {
      const delay = ctx.createDelay(1);
      delay.delayTime.value = BAR_DUR / 4; // one beat, tempo-synced
      const feedback = ctx.createGain();
      feedback.gain.value = 0.38;
      const dry = ctx.createGain();
      dry.gain.value = 0.75;
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      input.connect(dry).connect(output);
      input.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(wet).connect(output);
      return {
        stop: () => {
          input.disconnect(dry);
          input.disconnect(delay);
          delay.disconnect();
          feedback.disconnect();
          dry.disconnect();
          wet.disconnect();
        },
      };
    }

    case 'reverb': {
      const convolver = ctx.createConvolver();
      convolver.buffer = noiseImpulse(ctx, 2.2, 2.5);
      const dry = ctx.createGain();
      dry.gain.value = 0.7;
      const wet = ctx.createGain();
      wet.gain.value = 0.45;
      input.connect(dry).connect(output);
      input.connect(convolver).connect(wet).connect(output);
      return {
        stop: () => {
          input.disconnect(dry);
          input.disconnect(convolver);
          convolver.disconnect();
          dry.disconnect();
          wet.disconnect();
        },
      };
    }
  }
}
