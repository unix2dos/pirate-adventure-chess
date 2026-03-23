import { createSceneManager } from './scene-manager.js';
import { renderStartScreen } from '../ui/start-screen.js';

export function createApp(root) {
  if (!root) {
    throw new Error('createApp requires a mount element with id="app".');
  }

  const sceneManager = createSceneManager(root, {
    renderStart(mount, { onStart }) {
      renderStartScreen(mount, { onStart });
    },
  });

  sceneManager.showStart({
    onStart(config) {
      void config;
    },
  });

  return sceneManager;
}
