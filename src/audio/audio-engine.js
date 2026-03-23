import { SOUND_PRESETS } from './sound-presets.js';

export const SOUND_STORAGE_KEY = 'pirate-party-sound-muted';

function safeStorageGet(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(storage, key, value) {
  try {
    storage?.setItem?.(key, value);
  } catch {
    // Ignore persistence failures.
  }
}

export function createWebAudioPerformer({
  AudioContextCtor = globalThis.AudioContext ?? globalThis.webkitAudioContext,
} = {}) {
  let context = null;
  let masterGain = null;
  let noiseBuffer = null;

  function ensureContext() {
    if (!AudioContextCtor) {
      return null;
    }

    if (!context) {
      context = new AudioContextCtor();
      masterGain = context.createGain();
      masterGain.gain.value = 0.22;
      masterGain.connect(context.destination);
    }

    return context;
  }

  function getNoiseBuffer() {
    const ctx = ensureContext();
    if (!ctx) {
      return null;
    }

    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const channel = noiseBuffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
      }
    }

    return noiseBuffer;
  }

  function createEnvelope({ gain = 0.05, attack = 0.005, duration = 0.1, release = duration * 0.8, time = 0 }) {
    const ctx = ensureContext();
    if (!ctx || !masterGain) {
      return null;
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(gain, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(duration, release));
    gainNode.connect(masterGain);
    return gainNode;
  }

  function pulse({
    frequency = 440,
    type = 'sine',
    gain = 0.05,
    duration = 0.1,
    slideTo = null,
    delay = 0,
  } = {}) {
    const ctx = ensureContext();
    if (!ctx || !masterGain) {
      return false;
    }

    const time = ctx.currentTime + delay;
    const gainNode = createEnvelope({ gain, duration, time });
    if (!gainNode) {
      return false;
    }

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), time + duration);
    }
    oscillator.connect(gainNode);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
    return true;
  }

  function noise({
    gain = 0.03,
    duration = 0.05,
    filterFrequency = 1200,
    playbackRate = 1,
    delay = 0,
  } = {}) {
    const ctx = ensureContext();
    const buffer = getNoiseBuffer();
    if (!ctx || !masterGain || !buffer) {
      return false;
    }

    const time = ctx.currentTime + delay;
    const gainNode = createEnvelope({ gain, duration, time });
    if (!gainNode) {
      return false;
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFrequency, time);
    filter.Q.setValueAtTime(1.4, time);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, time);
    source.connect(filter);
    filter.connect(gainNode);
    source.start(time);
    source.stop(time + duration + 0.02);
    return true;
  }

  async function unlock() {
    const ctx = ensureContext();
    if (!ctx) {
      return false;
    }

    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      await ctx.resume();
    }

    return true;
  }

  function playPreset(name, options) {
    const preset = SOUND_PRESETS[name];
    if (!preset) {
      return false;
    }

    preset({ pulse, noise }, options);
    return true;
  }

  return {
    unlock,
    playPreset,
  };
}

export function createAudioEngine({
  storage = globalThis.localStorage,
  performer = createWebAudioPerformer(),
} = {}) {
  let unlocked = false;
  let muted = safeStorageGet(storage, SOUND_STORAGE_KEY) === '1';

  async function unlock() {
    const result = await performer.unlock();
    unlocked = Boolean(result);
    return unlocked;
  }

  function canPlay() {
    return unlocked && !muted;
  }

  function playPreset(name, options) {
    if (!canPlay()) {
      return false;
    }

    return performer.playPreset(name, options);
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    safeStorageSet(storage, SOUND_STORAGE_KEY, muted ? '1' : '0');
  }

  return {
    unlock,
    isMuted() {
      return muted;
    },
    setMuted,
    playDicePress() {
      return playPreset('dicePress');
    },
    playDiceRollTick(options) {
      return playPreset('diceRollTick', options);
    },
    playDiceStop(options) {
      return playPreset('diceStop', options);
    },
    playStepHop(options) {
      return playPreset('stepHop', options);
    },
    playLandingBloom(options) {
      return playPreset('landingBloom', options);
    },
    playEventSpark(options) {
      return playPreset('eventSpark', options);
    },
    playTreasureWin(options) {
      return playPreset('treasureWin', options);
    },
  };
}
