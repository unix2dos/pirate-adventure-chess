import { describe, expect, it } from 'vitest';

describe('createApp', () => {
  it('mounts a start scene shell into the provided root node', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root);

    expect(root.dataset.theme).toBe('pirate-party');
    expect(root.querySelector('[data-scene="start"]')).not.toBeNull();
    expect(root.querySelector('[data-role="start-adventure"]')).not.toBeNull();
  });

  it('throws a descriptive error when the mount node is missing', async () => {
    const { createApp } = await import('../../src/app/app.js');

    expect(() => createApp(null)).toThrow('createApp requires a mount element with id="app".');
  });
});

describe('bootstrap', () => {
  it('mounts the app from the real entrypoint', async () => {
    document.body.innerHTML = '<div id="app"></div>';

    await import('../../src/main.js');

    const root = document.getElementById('app');

    expect(root.dataset.theme).toBe('pirate-party');
    expect(root.querySelector('[data-scene="start"]')).not.toBeNull();
    expect(root.querySelector('[data-role="start-adventure"]')).not.toBeNull();
  });
});
