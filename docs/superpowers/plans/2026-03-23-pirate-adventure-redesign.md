# Pirate Adventure Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current single-file pirate board game into a Vite-based modular browser game with a child-friendly adventure presentation, same-screen multiplayer support, and a clearer gameplay scene flow.

**Architecture:** Keep the rules engine framework-light and DOM-independent, then layer UI scenes and Canvas rendering on top. Reuse the existing gameplay rules where they are still useful, but move all direct DOM mutations out of core logic and into scene/UI modules so later online multiplayer can attach to the same engine boundary.

**Tech Stack:** Vite, vanilla ES modules, Vitest, jsdom, HTML Canvas, CSS

---

## File Map

### Existing Files To Modify
- `index.html`
  Replace the inline CSS and inline script app with a Vite entry mount and basic document shell.
- `.gitignore`
  Add `node_modules`, build output, coverage output, and local Vite cache paths if they are not already ignored.

### Files To Create
- `package.json`
  Define scripts for dev, build, preview, and test; add Vite and Vitest dependencies.
- `vite.config.js`
  Keep the Vite config minimal for a plain browser app.
- `src/main.js`
  App entry; imports styles, creates the app, mounts root scene.
- `src/app/app.js`
  Creates engine, renderer, scene manager, and shared services.
- `src/app/scene-manager.js`
  Controls transitions between start, play, event overlay, and win scenes.
- `src/core/players.js`
  Player factories and default-player helpers.
- `src/core/board-data.js`
  Route path data, zone metadata, event slot mapping, and helper lookups.
- `src/core/events.js`
  Event catalog and pure event-resolution helpers.
- `src/core/game-engine.js`
  Turn loop, movement, state transitions, event triggering, and win detection.
- `src/render/board-renderer.js`
  Draws the board, zones, route markers, pieces, and highlights to Canvas.
- `src/render/animation-layer.js`
  Visual-only transient effects and animation orchestration.
- `src/ui/start-screen.js`
  Start scene DOM and player setup form behavior.
- `src/ui/game-hud.js`
  Current-turn panel, crew list, recent event area, and primary action dock.
- `src/ui/event-overlay.js`
  Event presentation layer and interactive choice handling.
- `src/ui/win-screen.js`
  Winner celebration and replay flow.
- `src/styles/base.css`
  Tokens, resets, font imports, root colors.
- `src/styles/layout.css`
  Page shell and scene layout.
- `src/styles/components.css`
  Buttons, cards, chips, labels, status blocks.
- `src/styles/scenes.css`
  Start screen, gameplay screen, event overlay, win screen specifics.
- `src/styles/animations.css`
  Entrances, overlay motion, highlight effects.
- `tests/setup/jsdom.js`
  Shared DOM test setup.
- `tests/app/bootstrap.test.js`
  App bootstrap smoke coverage.
- `tests/core/players.test.js`
  Player creation coverage.
- `tests/core/board-data.test.js`
  Board data invariants.
- `tests/core/game-engine.test.js`
  Turn flow, movement, event, and win behavior.
- `tests/ui/start-screen.test.js`
  Player setup to engine config behavior.
- `tests/ui/game-hud.test.js`
  HUD update behavior.
- `tests/ui/event-overlay.test.js`
  Overlay rendering and interactive choice behavior.
- `tests/ui/win-screen.test.js`
  Victory rendering and replay action behavior.

### File Boundary Rules
- `src/core/*` must not call `document.getElementById`, mutate DOM nodes, or depend on Canvas APIs.
- `src/ui/*` must not encode gameplay rules like movement math or event logic.
- `src/render/*` may read state and draw visuals, but must not advance game state.
- `src/app/*` is the composition layer only; keep business rules out of it.

## Task 1: Bootstrap Vite App Shell And Test Harness

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/main.js`
- Create: `src/app/app.js`
- Create: `src/styles/base.css`
- Create: `tests/setup/jsdom.js`
- Create: `tests/app/bootstrap.test.js`
- Modify: `index.html`
- Modify: `.gitignore`

- [ ] **Step 1: Write the failing bootstrap test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/app/bootstrap.test.js`
Expected: FAIL because `package.json`, `vitest`, or `createApp` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
// src/app/app.js
export function createApp(root) {
  root.innerHTML = `
    <main data-scene="start">
      <button data-role="start-adventure">Start</button>
    </main>
  `;
}
```

```js
// src/main.js
import './styles/base.css';
import { createApp } from './app/app.js';

createApp(document.getElementById('app'));
```

Implementation notes:
- Add `type: "module"` and scripts: `dev`, `build`, `preview`, `test`.
- Add dev dependencies: `vite`, `vitest`, `jsdom`.
- Replace the old `index.html` body with `<div id="app"></div>` plus Vite entry script.
- Add `.gitignore` entries for `node_modules/`, `dist/`, `.vite/`, and `coverage/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/app/bootstrap.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js index.html .gitignore src/main.js src/app/app.js src/styles/base.css tests/setup/jsdom.js tests/app/bootstrap.test.js
git commit -m "chore: bootstrap vite app shell"
```

## Task 2: Extract Player And Board Data Modules

**Files:**
- Create: `src/core/players.js`
- Create: `src/core/board-data.js`
- Create: `tests/core/players.test.js`
- Create: `tests/core/board-data.test.js`

- [ ] **Step 1: Write the failing player and board data tests**

```js
import { describe, expect, it } from 'vitest';
import { createPlayer, createDefaultPlayerConfigs } from '../../src/core/players.js';
import { boardPath, getCellMeta, zoneOrder } from '../../src/core/board-data.js';

describe('players', () => {
  it('creates a local player with defaults', () => {
    expect(createPlayer({ id: 0, name: 'You', color: '#ff6b6b' })).toMatchObject({
      id: 0,
      name: 'You',
      position: 1,
      isAI: false,
      skipTurns: 0,
      turtleBuff: 0,
    });
  });

  it('creates default configs for a 1-player game with AI fill enabled', () => {
    expect(createDefaultPlayerConfigs({ count: 1, useAI: true })[1]).toMatchObject({ isAI: true });
  });
});

describe('board data', () => {
  it('exposes 100 route cells with zone metadata', () => {
    expect(boardPath).toHaveLength(100);
    expect(zoneOrder.length).toBeGreaterThan(1);
    expect(getCellMeta(1)).toMatchObject({ index: 1 });
    expect(getCellMeta(100)).toMatchObject({ index: 100 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/core/players.test.js tests/core/board-data.test.js`
Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/players.js
const DEFAULT_NAMES = ['你', '海盗甲', '海盗乙', '海盗丙'];

export function createPlayer({ id, name, color, isAI = false }) {
  return {
    id,
    name,
    color,
    isAI,
    position: 1,
    skipTurns: 0,
    turtleBuff: 0,
  };
}

export function createDefaultPlayerConfigs({ count, useAI }) {
  return Array.from({ length: Math.max(count, 2) }, (_, index) => ({
    name: DEFAULT_NAMES[index] ?? `海盗${index + 1}`,
    isAI: useAI && index > 0,
  }));
}
```

```js
// src/core/board-data.js
export const zoneOrder = ['sunny-bay', 'bubble-strait', 'octopus-cove', 'treasure-run'];
export const boardPath = Array.from({ length: 100 }, (_, index) => ({ index: index + 1 }));
export function getCellMeta(index) {
  return boardPath[index - 1];
}
```

Implementation notes:
- Carry forward current event slot data here later; do not leave event locations buried in UI code.
- Zone metadata should be data, not CSS classes hard-coded into the renderer.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/core/players.test.js tests/core/board-data.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/players.js src/core/board-data.js tests/core/players.test.js tests/core/board-data.test.js
git commit -m "feat: add player and board data modules"
```

## Task 3: Build DOM-Free Game Engine Core

**Files:**
- Create: `src/core/events.js`
- Create: `src/core/game-engine.js`
- Create: `tests/core/game-engine.test.js`

- [ ] **Step 1: Write the failing engine tests**

```js
import { describe, expect, it } from 'vitest';
import { createGameEngine } from '../../src/core/game-engine.js';

describe('game engine', () => {
  it('rotates turns and increments the round after the final player acts', async () => {
    const engine = createGameEngine({
      players: [
        { id: 0, name: 'A', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
        { id: 1, name: 'B', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
      ],
      rollDice: () => 2,
    });

    await engine.takeTurn();
    expect(engine.getState().currentPlayerIndex).toBe(1);

    await engine.takeTurn();
    expect(engine.getState().currentPlayerIndex).toBe(0);
    expect(engine.getState().turnNumber).toBe(2);
  });

  it('applies skip-turn penalties before rolling', async () => {
    const engine = createGameEngine({
      players: [
        { id: 0, name: 'A', position: 10, skipTurns: 1, turtleBuff: 0, isAI: false },
      ],
      rollDice: () => 6,
    });

    await engine.takeTurn();
    expect(engine.getState().players[0].position).toBe(10);
    expect(engine.getState().players[0].skipTurns).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/core/game-engine.test.js`
Expected: FAIL because the engine does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/game-engine.js
export function createGameEngine({ players, rollDice }) {
  const state = {
    players: structuredClone(players),
    currentPlayerIndex: 0,
    turnNumber: 1,
    gameOver: false,
  };

  function getState() {
    return structuredClone(state);
  }

  async function takeTurn() {
    const player = state.players[state.currentPlayerIndex];
    if (player.skipTurns > 0) {
      player.skipTurns -= 1;
      advanceTurn();
      return getState();
    }

    const roll = await rollDice();
    const moveBy = roll + (player.turtleBuff > 0 ? 1 : 0);
    if (player.turtleBuff > 0) player.turtleBuff -= 1;
    player.position = Math.min(100, player.position + moveBy);
    if (player.position >= 100) state.gameOver = true;
    if (!state.gameOver) advanceTurn();
    return getState();
  }

  function advanceTurn() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    if (state.currentPlayerIndex === 0) state.turnNumber += 1;
  }

  return { getState, takeTurn };
}
```

Implementation notes:
- After the minimal engine is green, fold in current event rules from the old `index.html`.
- Model event results as returned payloads such as `{ type: 'overlay', eventId, choices }`.
- Keep randomness injectable with `rollDice` and event-choice resolvers.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/core/game-engine.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/events.js src/core/game-engine.js tests/core/game-engine.test.js
git commit -m "feat: add dom-free game engine"
```

## Task 4: Add Scene Manager And Start Screen

**Files:**
- Create: `src/app/scene-manager.js`
- Create: `src/ui/start-screen.js`
- Create: `tests/ui/start-screen.test.js`
- Modify: `src/app/app.js`

- [ ] **Step 1: Write the failing start-screen test**

```js
import { describe, expect, it } from 'vitest';
import { renderStartScreen } from '../../src/ui/start-screen.js';

describe('start screen', () => {
  it('collects player setup and emits a normalized config payload', () => {
    const root = document.createElement('div');
    let payload = null;

    renderStartScreen(root, {
      onStart(config) {
        payload = config;
      },
    });

    root.querySelector('[data-count="3"]').click();
    root.querySelector('#player-name-0').value = '小船长';
    root.querySelector('[data-role="start-adventure"]').click();

    expect(payload.players).toHaveLength(3);
    expect(payload.players[0].name).toBe('小船长');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ui/start-screen.test.js`
Expected: FAIL because the renderer does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/ui/start-screen.js
export function renderStartScreen(root, { onStart }) {
  let selectedCount = 2;
  root.innerHTML = `
    <section data-scene="start">
      <button data-count="3" type="button">3人</button>
      <input id="player-name-0" value="你" />
      <button data-role="start-adventure" type="button">开始冒险</button>
    </section>
  `;

  root.querySelector('[data-count="3"]').addEventListener('click', () => {
    selectedCount = 3;
  });

  root.querySelector('[data-role="start-adventure"]').addEventListener('click', () => {
    onStart({
      players: Array.from({ length: selectedCount }, (_, index) => ({
        name: index === 0 ? (root.querySelector('#player-name-0').value || '你') : `海盗${index}`,
        isAI: false,
      })),
    });
  });
}
```

Implementation notes:
- Expand the minimal markup into the final bright hero screen after the test is green.
- The start screen should output normalized player config only; app composition creates engine instances later.
- The scene manager should provide `showStart()`, `showGame()`, and `showWin()` APIs instead of letting components directly swap global HTML.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/ui/start-screen.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/scene-manager.js src/ui/start-screen.js src/app/app.js tests/ui/start-screen.test.js
git commit -m "feat: add scene manager and start screen"
```

## Task 5: Add Canvas Board Renderer And Adventure HUD

**Files:**
- Create: `src/render/board-renderer.js`
- Create: `src/render/animation-layer.js`
- Create: `src/ui/game-hud.js`
- Create: `tests/ui/game-hud.test.js`
- Modify: `src/app/app.js`
- Modify: `src/core/board-data.js`

- [ ] **Step 1: Write the failing HUD test**

```js
import { describe, expect, it } from 'vitest';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('shows the current player and primary action label', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      state: {
        turnNumber: 4,
        currentPlayer: { name: '小船长', color: '#ff6b6b' },
        recentEvent: { title: '海豚快线' },
      },
    });

    expect(root.textContent).toContain('小船长');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ui/game-hud.test.js`
Expected: FAIL because the HUD module does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/ui/game-hud.js
export function renderGameHud(root, { state }) {
  root.innerHTML = `
    <aside data-scene="game-hud">
      <div>${state.currentPlayer.name}</div>
      <div>${state.recentEvent?.title ?? '准备出航'}</div>
      <button data-role="roll-action" type="button">掷骰出航</button>
    </aside>
  `;
}
```

Implementation notes:
- After green, replace the placeholder aside with:
  - current player banner
  - sea zone objective card
  - recent encounter card
  - crew strip
  - bottom action dock
- The board renderer should draw a route-based adventure board rather than a plain square grid.
- Keep drawing primitives isolated so later visual restyling does not require engine edits.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/ui/game-hud.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/render/board-renderer.js src/render/animation-layer.js src/ui/game-hud.js src/app/app.js src/core/board-data.js tests/ui/game-hud.test.js
git commit -m "feat: add board renderer and adventure hud"
```

## Task 6: Add Event Overlay And Interactive Event Resolution

**Files:**
- Create: `src/ui/event-overlay.js`
- Create: `tests/ui/event-overlay.test.js`
- Modify: `src/core/events.js`
- Modify: `src/core/game-engine.js`
- Modify: `src/app/app.js`

- [ ] **Step 1: Write the failing event overlay test**

```js
import { describe, expect, it } from 'vitest';
import { renderEventOverlay } from '../../src/ui/event-overlay.js';

describe('event overlay', () => {
  it('renders choices and resolves the selected value', () => {
    const root = document.createElement('div');
    let selected = null;

    renderEventOverlay(root, {
      event: {
        emoji: '⭐',
        title: '许愿星',
        description: '选择前进几格',
        choices: [{ label: '+2格', value: 2 }],
      },
      onResolve(value) {
        selected = value;
      },
    });

    root.querySelector('button').click();
    expect(selected).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ui/event-overlay.test.js`
Expected: FAIL because the overlay module does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/ui/event-overlay.js
export function renderEventOverlay(root, { event, onResolve }) {
  root.innerHTML = `
    <section data-scene="event-overlay">
      <h2>${event.title}</h2>
      <p>${event.description}</p>
      ${event.choices.map((choice, index) => `
        <button data-index="${index}" type="button">${choice.label}</button>
      `).join('')}
    </section>
  `;

  root.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = event.choices[Number(button.dataset.index)];
      onResolve(choice.value);
    });
  });
}
```

Implementation notes:
- Refactor the old event modal behavior into data-driven overlay payloads.
- Non-interactive events should still pass through the overlay module so presentation stays consistent.
- Keep the engine responsible for event consequences; overlay only collects or displays choices.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/ui/event-overlay.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/event-overlay.js src/core/events.js src/core/game-engine.js src/app/app.js tests/ui/event-overlay.test.js
git commit -m "feat: add event overlay flow"
```

## Task 7: Add Victory Screen And Replay Loop

**Files:**
- Create: `src/ui/win-screen.js`
- Create: `tests/ui/win-screen.test.js`
- Modify: `src/app/scene-manager.js`
- Modify: `src/app/app.js`
- Modify: `src/core/game-engine.js`

- [ ] **Step 1: Write the failing win-screen test**

```js
import { describe, expect, it } from 'vitest';
import { renderWinScreen } from '../../src/ui/win-screen.js';

describe('win screen', () => {
  it('renders the winner and invokes replay', () => {
    const root = document.createElement('div');
    let replayed = false;

    renderWinScreen(root, {
      winner: { name: '小船长' },
      ranking: [{ name: '小船长', position: 100 }],
      onReplay() {
        replayed = true;
      },
    });

    expect(root.textContent).toContain('小船长');
    root.querySelector('[data-role="replay"]').click();
    expect(replayed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ui/win-screen.test.js`
Expected: FAIL because the win screen does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
// src/ui/win-screen.js
export function renderWinScreen(root, { winner, ranking, onReplay }) {
  root.innerHTML = `
    <section data-scene="win">
      <h1>${winner.name} 找到宝藏啦！</h1>
      <ol>${ranking.map((player) => `<li>${player.name}</li>`).join('')}</ol>
      <button data-role="replay" type="button">再玩一局</button>
    </section>
  `;

  root.querySelector('[data-role="replay"]').addEventListener('click', onReplay);
}
```

Implementation notes:
- After green, restyle the final scene into a celebration card with flavor text.
- Replay should re-enter the start scene cleanly with no leaked timers or stale overlay state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/ui/win-screen.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/win-screen.js src/app/scene-manager.js src/app/app.js src/core/game-engine.js tests/ui/win-screen.test.js
git commit -m "feat: add victory screen and replay flow"
```

## Task 8: Replace Prototype Styling With Final Phase-1 Visual System

**Files:**
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/scenes.css`
- Create: `src/styles/animations.css`
- Modify: `src/styles/base.css`
- Modify: `src/ui/start-screen.js`
- Modify: `src/ui/game-hud.js`
- Modify: `src/ui/event-overlay.js`
- Modify: `src/ui/win-screen.js`
- Modify: `src/render/board-renderer.js`
- Modify: `tests/app/bootstrap.test.js`

- [ ] **Step 1: Write a failing visual smoke test**

```js
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/app.js';

describe('visual shell', () => {
  it('renders named scene hooks for start, play, overlay, and win flows', () => {
    document.body.innerHTML = '<div id="app"></div>';
    createApp(document.getElementById('app'));

    expect(document.querySelector('[data-scene="start"]')).not.toBeNull();
    expect(document.querySelector('[data-theme="pirate-party"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/app/bootstrap.test.js`
Expected: FAIL because the final scene shell hooks are not present yet.

- [ ] **Step 3: Write minimal implementation**

```css
/* src/styles/base.css */
:root {
  --bg-sky: #89d7ff;
  --bg-sea: #2cb7f3;
  --accent-coral: #ff7c66;
  --accent-lemon: #ffd54d;
  --accent-mint: #73e0a9;
  --ink: #16314a;
}

body {
  margin: 0;
  background: linear-gradient(180deg, var(--bg-sky), var(--bg-sea));
  color: var(--ink);
}
```

Implementation notes:
- Add `data-theme="pirate-party"` to the root scene shell.
- Replace the old dark-blue palette everywhere.
- Use larger buttons, stronger headings, and lighter backgrounds.
- Reduce permanent log prominence; recent event summary belongs in the HUD.
- Make the board feel like a route through islands, not a math board.

- [ ] **Step 4: Run tests and build to verify they pass**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS with Vite production bundle output

- [ ] **Step 5: Commit**

```bash
git add src/styles/base.css src/styles/layout.css src/styles/components.css src/styles/scenes.css src/styles/animations.css src/ui/start-screen.js src/ui/game-hud.js src/ui/event-overlay.js src/ui/win-screen.js src/render/board-renderer.js tests/app/bootstrap.test.js
git commit -m "feat: ship pirate adventure visual redesign"
```

## Task 9: Final Verification And Cleanup

**Files:**
- Modify: `docs/superpowers/specs/2026-03-23-pirate-adventure-redesign-design.md` only if implementation realities require a documented deviation
- Modify: `README.md` only if the repo gains one during implementation

- [ ] **Step 1: Run full automated verification**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 2: Run manual gameplay verification**

Run: `npm run dev`

Manual checklist:
- Start a 1-player game with AI enabled
- Start a 4-player local game
- Finish one complete match
- Trigger at least one interactive event with choices
- Resize the browser during an active game
- Replay from the victory screen

- [ ] **Step 3: Fix only defects found during verification**

```js
// No speculative cleanup here.
// Apply only targeted fixes discovered in Step 1 or Step 2.
```

- [ ] **Step 4: Re-run verification after fixes**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: finalize pirate adventure phase-one rebuild"
```

## Notes For Execution

- Do not port the old `index.html` into one huge `app.js`; preserve the new module boundaries.
- Prefer moving rule constants out of the legacy file in small batches and proving behavior with tests before deleting old code.
- If Canvas rendering tests become too brittle, keep renderer tests at API/smoke level and put rule confidence in engine tests.
- Keep commits small and task-aligned.
- Do not start online multiplayer work in this plan.
