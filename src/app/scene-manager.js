export function createSceneManager(root, renderers = {}) {
  if (!root) {
    throw new Error('createSceneManager requires a mount root element.');
  }

  const scenes = {
    start: renderers.renderStart,
    game: renderers.renderGame,
    win: renderers.renderWin,
  };

  function show(sceneName, payload = {}) {
    root.innerHTML = '';
    const renderScene = scenes[sceneName];

    if (typeof renderScene === 'function') {
      renderScene(root, payload);
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
