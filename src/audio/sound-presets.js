function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export const SOUND_PRESETS = {
  dicePress(synth) {
    synth.noise({
      gain: 0.08,
      duration: 0.055,
      filterFrequency: 620,
      playbackRate: 0.75,
    });
    synth.pulse({
      frequency: 180,
      type: 'triangle',
      gain: 0.07,
      duration: 0.09,
      slideTo: 126,
    });
  },

  diceRollTick(synth, { face = 1 } = {}) {
    const normalizedFace = clamp(Number(face) || 1, 1, 6);
    synth.noise({
      gain: 0.045,
      duration: 0.04,
      filterFrequency: 1100 + normalizedFace * 50,
      playbackRate: 1 + normalizedFace * 0.03,
    });
    synth.pulse({
      frequency: 310 + normalizedFace * 20,
      type: 'square',
      gain: 0.032,
      duration: 0.05,
      slideTo: 260 + normalizedFace * 18,
    });
  },

  diceStop(synth, { value = 1 } = {}) {
    const normalizedValue = clamp(Number(value) || 1, 1, 6);
    synth.pulse({
      frequency: 250 + normalizedValue * 24,
      type: 'triangle',
      gain: 0.08,
      duration: 0.11,
      slideTo: 205 + normalizedValue * 16,
    });
    synth.pulse({
      frequency: 520 + normalizedValue * 26,
      type: 'sine',
      gain: 0.04,
      duration: 0.14,
      delay: 0.03,
    });
  },

  stepHop(synth, { stepIndex = 1 } = {}) {
    const variant = (Number(stepIndex) || 1) % 3;
    synth.pulse({
      frequency: 330 + variant * 28,
      type: 'triangle',
      gain: 0.03,
      duration: 0.06,
      slideTo: 270 + variant * 20,
    });
    synth.noise({
      gain: 0.015,
      duration: 0.025,
      filterFrequency: 900,
      playbackRate: 0.82 + variant * 0.05,
    });
  },

  landingBloom(synth, { isEvent = false, isWin = false } = {}) {
    const base = isWin ? 460 : isEvent ? 420 : 370;
    synth.pulse({
      frequency: base,
      type: 'triangle',
      gain: 0.055,
      duration: 0.14,
      slideTo: base - 46,
    });
    synth.pulse({
      frequency: base * 1.6,
      type: 'sine',
      gain: 0.03,
      duration: 0.18,
      delay: 0.025,
    });
  },

  eventSpark(synth) {
    synth.pulse({
      frequency: 740,
      type: 'sine',
      gain: 0.04,
      duration: 0.09,
    });
    synth.pulse({
      frequency: 980,
      type: 'triangle',
      gain: 0.028,
      duration: 0.1,
      delay: 0.04,
    });
  },

  treasureWin(synth) {
    [0, 0.09, 0.2].forEach((delay, index) => {
      synth.pulse({
        frequency: [523, 659, 784][index],
        type: 'triangle',
        gain: 0.045,
        duration: 0.18,
        delay,
      });
    });
    synth.noise({
      gain: 0.02,
      duration: 0.12,
      filterFrequency: 1800,
      playbackRate: 1.2,
      delay: 0.05,
    });
  },
};
