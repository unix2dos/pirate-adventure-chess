import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUND_STORAGE_KEY, createAudioEngine } from '../../src/audio/audio-engine.js';

describe('audio engine', () => {
  let storage;
  let performer;

  beforeEach(() => {
    const values = new Map();
    storage = {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
      removeItem(key) {
        values.delete(key);
      },
    };

    performer = {
      unlock: vi.fn(async () => true),
      playPreset: vi.fn(() => true),
    };
  });

  it('unlocks on first gesture and suppresses playback while muted', async () => {
    const engine = createAudioEngine({ storage, performer });

    engine.playDicePress();
    expect(performer.playPreset).not.toHaveBeenCalled();

    await engine.unlock();
    engine.playDicePress();
    expect(performer.unlock).toHaveBeenCalledTimes(1);
    expect(performer.playPreset).toHaveBeenCalledWith('dicePress', undefined);

    engine.setMuted(true);
    engine.playStepHop({ stepIndex: 1, totalSteps: 4 });
    expect(engine.isMuted()).toBe(true);
    expect(storage.getItem(SOUND_STORAGE_KEY)).toBe('1');
    expect(performer.playPreset).toHaveBeenCalledTimes(1);
  });

  it('hydrates the saved mute preference from storage', () => {
    storage.setItem(SOUND_STORAGE_KEY, '1');

    const engine = createAudioEngine({ storage, performer });

    expect(engine.isMuted()).toBe(true);
  });
});
