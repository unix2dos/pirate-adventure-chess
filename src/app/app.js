import { createSceneManager } from './scene-manager.js';
import { renderStartScreen } from '../ui/start-screen.js';
import { createGameEngine } from '../core/game-engine.js';
import { getCellMeta } from '../core/board-data.js';
import { createPlayer } from '../core/players.js';
import { renderBoardRenderer } from '../render/board-renderer.js';
import { renderAnimationLayer } from '../render/animation-layer.js';
import { renderGameHud } from '../ui/game-hud.js';
import { renderEventOverlay } from '../ui/event-overlay.js';
import { renderWinScreen } from '../ui/win-screen.js';

const PLAYER_COLORS = ['#ff6b6b', '#4ecdc4', '#ffd166', '#7a9cff'];
const TURN_ANIMATION_MS = {
  rollStep: 84,
  moveStep: 180,
  landingPause: 320,
  settlePause: 220,
  skipPause: 280,
};

function hasOwnOverride(overrides, key) {
  return Object.prototype.hasOwnProperty.call(overrides, key);
}

function wait(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function buildDiceSequence(finalValue) {
  const cycle = [1, 5, 2, 6, 3, 4];
  const normalized = Math.min(6, Math.max(1, Number(finalValue) || 1));
  const startIndex = cycle.indexOf(normalized);
  const sequence = [];

  for (let index = 0; index < 6; index += 1) {
    sequence.push(cycle[(startIndex + index + 1) % cycle.length]);
  }

  sequence.push(normalized);
  return sequence;
}

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

function createHudState(engineState, recentTitle = '准备出航', overrides = {}) {
  const crew = hasOwnOverride(overrides, 'crew') ? overrides.crew : engineState.players;
  const currentPlayer = hasOwnOverride(overrides, 'currentPlayer')
    ? overrides.currentPlayer
    : crew[engineState.currentPlayerIndex] ?? crew[0];
  const cellMeta = getCellMeta(currentPlayer?.position ?? 1);

  return {
    turnNumber: hasOwnOverride(overrides, 'turnNumber') ? overrides.turnNumber : engineState.turnNumber,
    currentPlayer,
    currentZoneLabel: cellMeta?.zoneLabel ?? '晴空湾',
    currentObjective: cellMeta?.objective ?? '朝宝藏终点冲刺',
    recentEvent: hasOwnOverride(overrides, 'recentEvent')
      ? overrides.recentEvent
      : engineState.recentEvent ?? { title: recentTitle },
    crew,
    gameOver: hasOwnOverride(overrides, 'gameOver') ? overrides.gameOver : engineState.gameOver,
    pendingEvent: hasOwnOverride(overrides, 'pendingEvent') ? overrides.pendingEvent : engineState.pendingEvent,
    animation: hasOwnOverride(overrides, 'animation') ? overrides.animation : null,
  };
}

function createRanking(engineState) {
  return engineState.players
    .map((player, index) => ({ ...player, index }))
    .sort((left, right) => {
      if (right.position !== left.position) {
        return right.position - left.position;
      }

      return left.index - right.index;
    })
    .map(({ index, ...player }) => player);
}

function createWinPayload(engineState, onReplay) {
  const ranking = createRanking(engineState);

  return {
    winner: ranking[0] ?? engineState.players[engineState.currentPlayerIndex],
    ranking,
    onReplay,
  };
}

function renderGameScene(root, payload = {}) {
  const { engine, onWin } = payload;
  let sceneState = payload.state ?? (engine ? createHudState(engine.getState()) : null);
  let isAnimatingTurn = false;

  root.innerHTML = `
    <section data-scene="game" class="scene-shell game-scene">
      <div class="game-layout">
        <div data-role="board-stage" class="board-stage-shell">
          <div data-role="hud-stage" class="hud-stage-shell"></div>
        </div>
      </div>
      <div data-role="event-overlay-stage" class="overlay-layer"></div>
    </section>
  `;

  const boardStage = root.querySelector('[data-role="board-stage"]');
  const hudStage = root.querySelector('[data-role="hud-stage"]');
  const overlayStage = root.querySelector('[data-role="event-overlay-stage"]');

  async function playTurnSequence(turnStartState, nextEngineState) {
    const action = nextEngineState.lastAction;
    if (!action) {
      sceneState = createHudState(nextEngineState);
      renderFrame();
      if (nextEngineState.gameOver && typeof onWin === 'function') {
        onWin(nextEngineState);
      }
      return;
    }

    const displayCrew = structuredClone(turnStartState.players);
    const displayPlayer = displayCrew.find(({ id }) => id === action.playerId)
      ?? displayCrew[turnStartState.currentPlayerIndex]
      ?? displayCrew[0];

    if (action.type === 'skip') {
      sceneState = createHudState(turnStartState, '这一回合先休息一下', {
        crew: displayCrew,
        currentPlayer: displayPlayer,
        pendingEvent: null,
        gameOver: false,
        recentEvent: { title: `${displayPlayer.name} 这回合暂停一下` },
        animation: {
          phase: 'skip',
          playerId: action.playerId,
          activeCell: action.to,
          landedCell: action.to,
          trail: [],
        },
      });
      renderFrame();
      await wait(TURN_ANIMATION_MS.skipPause);
      sceneState = createHudState(nextEngineState);
      renderFrame();
      return;
    }

    for (const face of buildDiceSequence(action.roll)) {
      sceneState = createHudState(turnStartState, '骰子正在空中翻滚', {
        crew: displayCrew,
        currentPlayer: displayPlayer,
        pendingEvent: null,
        gameOver: false,
        recentEvent: { title: `${displayPlayer.name} 正在摇骰子…` },
        animation: {
          phase: 'rolling',
          playerId: action.playerId,
          diceValue: face,
          rollValue: action.roll,
          activeCell: action.from,
          trail: [],
        },
      });
      renderFrame();
      await wait(TURN_ANIMATION_MS.rollStep);
    }

    const trail = [];
    for (const step of action.trail ?? []) {
      displayPlayer.position = step;
      trail.push(step);
      sceneState = createHudState(turnStartState, '航线亮起来了', {
        crew: displayCrew,
        currentPlayer: displayPlayer,
        pendingEvent: null,
        gameOver: false,
        recentEvent: { title: `${displayPlayer.name} 前进 ${trail.length} / ${action.trail.length} 格` },
        animation: {
          phase: 'moving',
          playerId: action.playerId,
          diceValue: action.roll,
          rollValue: action.roll,
          activeCell: step,
          trail: [...trail],
        },
      });
      renderFrame();
      await wait(TURN_ANIMATION_MS.moveStep);
    }

    sceneState = createHudState(nextEngineState, nextEngineState.recentEvent?.title ?? '顺利停稳', {
      crew: displayCrew,
      currentPlayer: displayPlayer,
      pendingEvent: null,
      gameOver: false,
      recentEvent: nextEngineState.pendingEvent
        ? { title: `掷出 ${action.roll} 点，落在 ${nextEngineState.pendingEvent.event.title}` }
        : nextEngineState.recentEvent ?? { title: `掷出 ${action.roll} 点，顺利停稳` },
      animation: {
        phase: 'landing',
        playerId: action.playerId,
        diceValue: action.roll,
        rollValue: action.roll,
        activeCell: action.to,
        landedCell: action.to,
        trail: action.trail ?? [],
      },
    });
    renderFrame();
    await wait(TURN_ANIMATION_MS.landingPause);

    if (nextEngineState.gameOver && typeof onWin === 'function') {
      onWin(nextEngineState);
      return;
    }

    sceneState = createHudState(nextEngineState, nextEngineState.recentEvent?.title ?? '海浪推着船队前进', {
      animation: {
        phase: 'result',
        playerId: action.playerId,
        diceValue: action.roll,
        rollValue: action.roll,
        activeCell: action.to,
        landedCell: action.to,
        trail: action.trail ?? [],
      },
    });
    renderFrame();

    if (nextEngineState.pendingEvent) {
      return;
    }

    await wait(TURN_ANIMATION_MS.settlePause);
    sceneState = createHudState(
      nextEngineState,
      nextEngineState.gameOver ? '宝藏到手，冲线成功' : '海浪推着船队前进',
    );
    renderFrame();
  }

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
          if (nextEngineState.gameOver && typeof onWin === 'function') {
            onWin(nextEngineState);
            return;
          }

          sceneState = createHudState(nextEngineState);
          renderFrame();
        },
      });
    } else {
      overlayStage.innerHTML = '';
    }

    const rollButton = hudStage.querySelector('[data-role="roll-action"]');
    const isMotionPhase = Boolean(sceneState.animation?.phase && sceneState.animation.phase !== 'idle');
    if (!rollButton || !engine || sceneState.gameOver || pendingEvent || isAnimatingTurn || isMotionPhase) {
      if (rollButton) {
        rollButton.disabled = Boolean(sceneState.gameOver || pendingEvent || isAnimatingTurn || isMotionPhase);
      }
      return;
    }

    rollButton.disabled = false;

    rollButton.addEventListener('click', async () => {
      rollButton.disabled = true;
      isAnimatingTurn = true;
      const turnStartState = engine.getState();
      const nextEngineState = await engine.takeTurn();
      await playTurnSequence(turnStartState, nextEngineState);
      isAnimatingTurn = false;
      if (sceneState && !sceneState.gameOver && !sceneState.pendingEvent) {
        renderFrame();
      }
    }, { once: true });
  }

  renderFrame();
}

export function createApp(root) {
  if (!root) {
    throw new Error('createApp requires a mount element with id="app".');
  }

  root.dataset.theme = 'pirate-party';

  const sceneManager = createSceneManager(root, {
    renderStart(mount, { onStart }) {
      renderStartScreen(mount, { onStart });
    },
    renderGame(mount, payload) {
      renderGameScene(mount, payload);
    },
    renderWin(mount, payload) {
      renderWinScreen(mount, payload);
    },
  });

  function showStartScene() {
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
          onWin(engineState) {
            sceneManager.showWin(createWinPayload(engineState, showStartScene));
          },
        });
      },
    });
  }

  showStartScene();

  return sceneManager;
}
