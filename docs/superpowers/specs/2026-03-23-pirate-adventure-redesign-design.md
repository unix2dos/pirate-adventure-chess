# Pirate Adventure Redesign

Date: 2026-03-23
Project: `/Users/liuwei/workspace/chess`

## Summary

The current project is a playable prototype with most logic, layout, styling, and UI state packed into a single `index.html`. It proves the ruleset, but it still feels like a demo: the visual language is generic, the information architecture is tool-like, and the game loop lacks a strong sense of journey.

This redesign shifts the game from "roll dice on a 100-cell board" to "guide a pirate crew through a playful treasure adventure." The experience should support local same-screen multiplayer first, while keeping the architecture ready for future online play.

## Product Direction

### Audience
- Children and parents playing together on one screen
- Casual players who want a short local multiplayer game

### Experience Pillars
1. Immediate readability
   The player should understand the goal, the active turn, and the next action within seconds.
2. Story-like progression
   A match should feel like a short adventure through themed seas and islands, not a spreadsheet of positions.
3. Party-level feedback
   Special events should create memorable moments through animation, color, and short readable copy.
4. Low cognitive load
   Rules stay simple; presentation does the heavy lifting.

### Chosen Direction
- Primary mode: adventure-driven board game
- Support mode: local same-screen multiplayer with AI fill-ins
- Future-ready, but not in scope now: online multiplayer

## Problem Statement

The current prototype has three structural weaknesses:

1. Engineering weakness
   HTML, CSS, rendering, rules, state changes, and scene transitions all live in one file. This makes even small UI changes risky and slows future feature work.

2. Visual weakness
   The game uses a dark blue prototype palette, system-feeling controls, and a board that reads as a uniform grid instead of a place worth exploring.

3. UX weakness
   The main interface behaves like a control panel: player list, dice area, log, footer buttons. It communicates status, but not adventure. The result is functional but emotionally flat.

## Goals

- Replace the single-file structure with clear module boundaries
- Redesign the experience around a bright, kid-friendly pirate party aesthetic
- Make the board read as an adventure route with themed landmarks
- Rework the HUD so it supports play instead of resembling a dashboard
- Preserve the existing core rules and event variety where useful
- Improve the sense of anticipation and payoff during special events

## Non-Goals

- Online multiplayer implementation
- Account systems, persistence, or leaderboards
- Deep strategy balancing
- Chapter-based campaign content
- Native mobile app packaging

## Target Experience

Each play session should feel like this:

1. The game opens with a strong invitation to start immediately.
2. Players set up quickly without feeling like they are filling out a form.
3. The board looks like a place: sea lanes, islands, landmarks, and danger zones.
4. Each turn clearly announces whose move it is and what action is available.
5. Landing on a special space produces a clear micro-scene, not just a text notification.
6. The ending feels like a treasure-race payoff, not a plain rank table.

## Visual Design Direction

### Tone
- Bright
- Cheerful
- Cartoonish
- Energetic
- Friendly for children without feeling babyish

### Palette Direction
- Coral orange for emphasis
- Lagoon blue as the primary environment color
- Lemon yellow for rewards and treasure moments
- Mint green for positive route markers
- Warm dark tones only for contrast and overlays

### Layout Direction
- Large central map as the dominant visual
- Clear, chunky action controls
- Reduced information density on the side panel
- Strong shape language: rounded islands, banners, chips, badges, and playful depth

### Anti-Patterns To Avoid
- Dark-blue prototype styling across the full interface
- Thin utility-style controls
- Grid-only board presentation
- Log-heavy interaction design
- Generic centered modal cards for every event
- Any layout that resembles a dashboard or admin panel

## Information Architecture

### Main Scenes

#### 1. Start Screen
Purpose:
Invite players into the game immediately and collect minimal setup data.

Content:
- Big title and hero illustration area
- Brief one-line promise of the adventure
- Player count selector
- Player naming inputs
- AI assist toggle
- Primary "start adventure" action

Requirements:
- Must feel like a game cover, not a settings page
- Must keep setup visible and simple
- Must support 1-4 players with AI filling remaining seats when enabled

#### 2. In-Game Screen
Purpose:
Support smooth turn-taking while keeping the board as the star.

Content:
- Central adventure board
- Right-side adventure HUD
- Bottom action dock

Adventure HUD:
- Current player card
- Short match objective / current sea-zone hint
- Recent event summary
- Compact crew status list

Bottom action dock:
- One dominant action button for rolling / continuing
- Clear turn status
- Secondary access to rules and sound

Requirements:
- The board should take most of the space
- The next action must always be obvious
- Support local pass-and-play with minimal confusion

#### 3. Event Overlay
Purpose:
Turn special spaces into high-feedback moments.

Content:
- Big event icon / character
- Short result headline
- Optional choice buttons for interactive events
- Small supporting line only when needed

Requirements:
- Should feel like a mini-scene layered over the map
- Copy must stay short and child-readable
- Animations should be energetic but brief

#### 4. Victory Screen
Purpose:
Close the match with a celebratory story beat.

Content:
- Winner celebration
- Treasure-race ranking
- Flavor text describing where other players ended
- Replay action

Requirements:
- Must feel like a payoff scene
- Ranking should be easy to scan

## Gameplay Presentation Changes

The ruleset can remain broadly similar for the first iteration, but the presentation should change meaningfully:

- Board spaces should be grouped into themed regions instead of feeling uniformly repeated.
- Events should be renamed or reframed as places and encounters where useful.
- The game should rely less on the persistent text log and more on immediate visual feedback.
- The current player's identity should be visible without reading multiple panels.

### Board Expression
- Keep the 100-step progression under the hood if needed for implementation speed.
- Visually hide the "spreadsheet" feeling by drawing a route through sea regions and landmarks.
- Use landmarks such as ports, reefs, octopus coves, rainbow bridges, carnival islands, and treasure runways.

## Technical Design

### Proposed Structure

```text
index.html
vite.config.js
src/
  main.js
  app/
    app.js
    scene-manager.js
  core/
    board-data.js
    events.js
    game-engine.js
    players.js
  render/
    animation-layer.js
    board-renderer.js
  ui/
    event-overlay.js
    game-hud.js
    start-screen.js
    win-screen.js
  styles/
    base.css
    layout.css
    components.css
    scenes.css
    animations.css
```

### Tooling

- Use Vite for local development, module loading, and production bundling.
- Keep the project framework-light for this phase; do not introduce React or another UI framework unless the scope changes materially later.

### Module Responsibilities

#### `src/main.js`
- Bootstraps the app
- Loads styles and root scene

#### `src/app/app.js`
- Creates shared dependencies
- Wires scenes, engine, renderer, and UI together

#### `src/app/scene-manager.js`
- Owns scene switching between start, play, event overlay, and win states

#### `src/core/game-engine.js`
- Owns turn state, movement rules, win checks, and event triggering flow
- Exposes state changes through a controlled interface instead of direct DOM calls

#### `src/core/events.js`
- Defines event metadata and event effects
- Separates event data from event presentation

#### `src/core/board-data.js`
- Holds the visual route mapping, zone metadata, and event slot assignments

#### `src/core/players.js`
- Defines player state shape and helper functions

#### `src/render/board-renderer.js`
- Draws the map, route, markers, players, highlights, and themed regions

#### `src/render/animation-layer.js`
- Handles transient visual effects such as move pulses, celebration bursts, and overlay emphasis

#### `src/ui/*`
- Owns DOM generation and updates for each scene
- No game-rule decisions inside UI modules

### State Flow

Target state flow for one turn:

1. Scene manager marks gameplay scene as active
2. HUD shows current player and enables the primary action
3. Player triggers roll
4. Game engine computes movement
5. Renderer animates movement
6. If a special space is reached, engine emits event payload
7. Overlay renders the event scene and resolves optional choices
8. Engine applies results
9. HUD refreshes compact status
10. Engine advances turn or transitions to victory

### Architectural Rules

- Core modules must not query the DOM directly
- UI modules must not contain game rule logic
- Rendering should consume state, not own state
- Event content should be data-driven where possible
- Scene transitions should be centralized instead of spread across click handlers

## Error Handling and Resilience

This is still a lightweight browser game, but the redesign should explicitly handle:

- Invalid or empty player names by falling back to defaults
- Re-entrancy on roll actions so players cannot trigger overlapping turns
- Safe no-op behavior for event types that have no valid target
- Resize behavior that preserves board metadata and current match state
- Clear disabled states for unavailable actions

If a future online mode is added, the engine boundary should allow input sources other than the local click handler without rewriting the UI stack.

## Testing Strategy

The redesign should add tests around behavior, not only visuals.

### Unit-Level Targets
- Turn rotation
- Movement limits
- Win detection
- Event effect resolution
- AI fill-in setup logic

### Integration-Level Targets
- Start screen setup produces the expected player configuration
- A full turn updates engine state and visible HUD state coherently
- Interactive events resolve choices correctly
- Victory transition occurs once and only once

### Manual Verification Targets
- Start a 1-player game with AI enabled
- Start a 4-player local game
- Trigger at least one positive, negative, and interactive event
- Resize the browser during play
- Finish a full match and replay

## Phase 1 Scope

This first implementation phase should include:

- Project scaffold move from single-file HTML to module structure
- Start screen redesign
- In-game HUD redesign
- Board renderer redesign with themed route expression
- Event overlay redesign
- Victory screen redesign
- Preservation of current local multiplayer loop

This first phase should not include:

- Networking
- Save/load
- New metagame systems
- Deep event system expansion beyond what supports the new presentation

## Acceptance Criteria

The redesign is successful when:

- The game no longer stores all UI and logic inside one file
- The first screen looks like a game, not a prototype form
- The board reads as an adventure map instead of a plain 10x10 grid
- The active player and primary action are always obvious
- Event moments feel visually special
- A complete same-screen match can be played end to end
- The new structure leaves a clean place to integrate online multiplayer later

## Open Questions Deferred

- Whether online multiplayer should use a server-authoritative model or peer-to-peer transport
- Whether later versions should introduce collectible power-ups or chapter progression
- Whether each board region should gain unique rule modifiers in phase 2
