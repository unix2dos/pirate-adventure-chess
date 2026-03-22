import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/app.js';

describe('createApp', () => {
  it('mounts a start scene shell into the provided root node', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById('app');

    createApp(root);

    expect(root.querySelector('[data-scene="start"]')).not.toBeNull();
    expect(root.querySelector('[data-role="start-adventure"]')).not.toBeNull();
  });
});
