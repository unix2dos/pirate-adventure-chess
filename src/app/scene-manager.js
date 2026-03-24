export function createSceneManager(root, renderers = {}) {
  if (!root) {
    throw new Error('createSceneManager requires a mount root element.');
  }

  let cleanupCurrentScene = null;
  const scenes = {
    start: renderers.renderStart,
    game: renderers.renderGame,
    win: renderers.renderWin,
  };

  function show(sceneName, payload = {}) {
    cleanupCurrentScene?.();
    cleanupCurrentScene = null;
    root.innerHTML = '';
    const renderScene = scenes[sceneName];

    if (typeof renderScene === 'function') {
      cleanupCurrentScene = renderScene(root, payload) ?? null;
      return;
    }

    root.innerHTML = `<main data-scene="${sceneName}"></main>`;
  }

  return {
    showStart(payload = {}) {
      show('start', payload);
    },
    showGame(payload = {}) {
      show('game', payload);
    },
    showWin(payload = {}) {
      show('win', payload);
    },
  };
}
