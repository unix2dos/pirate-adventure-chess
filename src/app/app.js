import { createSceneManager } from './scene-manager.js';
import { renderStartScreen } from '../ui/start-screen.js';
import { createGameEngine } from '../core/game-engine.js';
import { getCellMeta } from '../core/board-data.js';
import { createPlayer } from '../core/players.js';
import { renderBoardRenderer } from '../render/board-renderer.js';
import { renderAnimationLayer } from '../render/animation-layer.js';
import { renderGameHud } from '../ui/game-hud.js';
import { renderEventOverlay } from '../ui/event-overlay.js';

const PLAYER_COLORS = ['#ff6b6b', '#4ecdc4', '#ffd166', '#7a9cff'];

function createInitialPlayers(playerConfigs = []) {
  const safeConfigs = playerConfigs.length > 0
    ? playerConfigs
    : [{ name: '你', isAI: false }, { name: '海盗甲', isAI: true }];

  return safeConfigs.map((config, index) => createPlayer({
    id: `crew-${index + 1}`,
    name: config.name || `海盗${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    isAI: Boolean(config.isAI),
  }));
}

function createHudState(engineState, recentTitle = '准备出航') {
  const currentPlayer = engineState.players[engineState.currentPlayerIndex] ?? engineState.players[0];
  const cellMeta = getCellMeta(currentPlayer?.position ?? 1);

  return {
    turnNumber: engineState.turnNumber,
    currentPlayer,
    currentZoneLabel: cellMeta?.zoneLabel ?? '晴空湾',
    currentObjective: cellMeta?.objective ?? '朝宝藏终点冲刺',
    recentEvent: engineState.recentEvent ?? { title: recentTitle },
    crew: engineState.players,
    gameOver: engineState.gameOver,
    pendingEvent: engineState.pendingEvent,
  };
}

function renderGameScene(root, payload = {}) {
  const { engine } = payload;
  let sceneState = payload.state ?? (engine ? createHudState(engine.getState()) : null);

  root.innerHTML = `
    <section data-scene="game" style="position:relative;display:flex;gap:18px;align-items:stretch;min-height:640px;padding:12px;box-sizing:border-box;">
      <div data-role="board-stage" style="position:relative;flex:1;background:#d7f0ff;border-radius:20px;overflow:hidden;min-height:640px;"></div>
      <div data-role="hud-stage" style="width:320px;display:flex;flex-direction:column;"></div>
      <div data-role="event-overlay-stage" style="position:absolute;inset:0;"></div>
    </section>
  `;

  const boardStage = root.querySelector('[data-role="board-stage"]');
  const hudStage = root.querySelector('[data-role="hud-stage"]');
  const overlayStage = root.querySelector('[data-role="event-overlay-stage"]');

  function renderFrame() {
    if (!sceneState) {
      return;
    }

    renderBoardRenderer(boardStage, { state: sceneState });
    renderAnimationLayer(boardStage, { state: sceneState });
    renderGameHud(hudStage, { state: sceneState });

    const pendingEvent = sceneState.pendingEvent?.event;
    if (pendingEvent && engine) {
      renderEventOverlay(overlayStage, {
        event: pendingEvent,
        onResolve(choiceValue) {
          const nextEngineState = engine.resolvePendingEvent(choiceValue);
          sceneState = createHudState(nextEngineState);
          renderFrame();
        },
      });
    } else {
      overlayStage.innerHTML = '';
    }

    const rollButton = hudStage.querySelector('[data-role="roll-action"]');
    if (!rollButton || !engine || sceneState.gameOver || pendingEvent) {
      if (rollButton) {
        rollButton.disabled = Boolean(sceneState.gameOver || pendingEvent);
      }
      return;
    }

    rollButton.addEventListener('click', async () => {
      rollButton.disabled = true;
      const nextEngineState = await engine.takeTurn();
      sceneState = createHudState(
        nextEngineState,
        nextEngineState.gameOver ? '宝藏到手，冲线成功' : '海浪推着船队前进',
      );
      renderFrame();
    });
  }

  renderFrame();
}

export function createApp(root) {
  if (!root) {
    throw new Error('createApp requires a mount element with id="app".');
  }

  const sceneManager = createSceneManager(root, {
    renderStart(mount, { onStart }) {
      renderStartScreen(mount, { onStart });
    },
    renderGame(mount, payload) {
      renderGameScene(mount, payload);
    },
  });

  sceneManager.showStart({
    onStart(config) {
      const players = createInitialPlayers(config?.players ?? []);
      const engine = createGameEngine({
        players,
        rollDice: async () => Math.floor(Math.random() * 6) + 1,
      });

      sceneManager.showGame({
        engine,
        state: createHudState(engine.getState(), '扬帆起航'),
      });
    },
  });

  return sceneManager;
}
