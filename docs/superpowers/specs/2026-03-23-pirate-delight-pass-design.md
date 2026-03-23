# Pirate Delight Pass

Date: 2026-03-23
Project: `/Users/liuwei/workspace/chess`

## Summary

This pass adds a focused delight layer to the existing pirate board game without changing rules, AI behavior, or board progression. The product direction is "party-like for kids and families, but still readable on repeated play."

The chosen direction is:
- Lead with the energy of option A: obvious celebration, stage-like reveals, and stronger payoff in key moments
- Keep some restraint from option B: the interface should not become noisy between turns
- Use a stable pattern with 2 to 3 light variations per moment, not full randomness

## Approved Experience Direction

### Audience Fit
- Children and parents playing together on one screen
- Casual local players who should understand the game immediately

### Emotional Goal
- High-energy highlights during big moments
- Calm readability during normal play
- Repeated rounds should still feel fresh, not repetitive or exhausting

### Delight Principle
Only three moments receive major amplification:
1. Dice roll and landing
2. Event reveal overlay
3. Victory celebration

Everything else should stay comparatively quiet so the highlights remain special.

## Goals

- Make rolling the dice feel more like a party-table game action
- Make event overlays feel like surprise cards being revealed on stage
- Make the win screen feel like a short finale rather than a static results page
- Preserve turn clarity and overall pace
- Keep sound, reduced-motion behavior, and mute controls working cleanly

## Non-Goals

- No changes to win conditions, event rules, or AI decisions
- No redesign of the start screen in this pass
- No persistent progression, unlock systems, or extra game modes
- No heavy particle systems or long cinematic sequences

## Chosen Approach

### 1. Dice And Landing: "Party Burst, Then Clear Result"

The dice action should feel tactile and celebratory, but resolve quickly. The core pattern is fixed:
- press feedback
- short roll flourish
- target cell pre-highlight
- landing flash
- immediate readable result

Variation policy:
- rotate 2 to 3 short host-style callouts
- rotate 2 to 3 accent color treatments or glow intensities
- rotate 2 to 3 stop/landing sound flavors

Constraints:
- the roll sequence should not meaningfully extend a turn
- the board must stay readable while effects play
- AI turns should still feel brisk

### 2. Event Overlay: "Surprise Card Reveal"

The current overlay should become a short reveal moment instead of a plain modal card. It should feel like a party host announcing what happened on the route.

Changes:
- stronger reveal entrance
- richer badge/card framing
- clearer headline hierarchy
- more playful, concise copy
- more responsive choice buttons

Variation policy:
- 2 to 3 reveal intros
- 2 to 3 decorative card treatments tied to event tone or event id
- 2 to 3 short audio stingers

Constraints:
- event text remains short and child-readable
- keyboard focus and screen-reader behavior remain intact
- overlay should never delay resolving the event after the player acts

### 3. Victory Screen: "Finale Once, Not Forever"

The win screen is the loudest moment in the experience and should feel rewarding on first view while still tolerable across several rounds.

Changes:
- champion spotlight framing for the winner
- celebratory color burst / confetti-like accents
- staggered ranking entrance
- stronger replay button treatment
- 2 to 3 short winner taglines

Constraints:
- celebration fires once per win screen, not as an endless spectacle
- rankings stay easy to scan
- replay remains the clearest next action

## Module Responsibilities

### [src/app/app.js](/Users/liuwei/workspace/chess/src/app/app.js)
- Own the orchestration of delight variants during turn flow
- Select a stable variant set for roll, landing, event, and win moments
- Keep animation timing bounded and independent from game rules

### [src/ui/game-hud.js](/Users/liuwei/workspace/chess/src/ui/game-hud.js)
- Present roll-stage copy, emphasis labels, and stronger dice action states
- Surface short celebratory callouts without turning the HUD into a permanent animation zone

### [src/ui/event-overlay.js](/Users/liuwei/workspace/chess/src/ui/event-overlay.js)
- Upgrade the event overlay into a fast, readable reveal card
- Apply per-event variant styling and copy treatment

### [src/ui/win-screen.js](/Users/liuwei/workspace/chess/src/ui/win-screen.js)
- Render the finale treatment, ranking entrance, and replay emphasis

### [src/audio/audio-engine.js](/Users/liuwei/workspace/chess/src/audio/audio-engine.js)
### [src/audio/sound-presets.js](/Users/liuwei/workspace/chess/src/audio/sound-presets.js)
- Add controlled variant support for roll, landing, reveal, and win sounds
- Keep mute and unlock behavior unchanged

### [src/styles/animations.css](/Users/liuwei/workspace/chess/src/styles/animations.css)
### [src/styles/components.css](/Users/liuwei/workspace/chess/src/styles/components.css)
### [src/styles/scenes.css](/Users/liuwei/workspace/chess/src/styles/scenes.css)
- Add the visual motion language for the three highlight moments
- Preserve `prefers-reduced-motion` as a hard fallback

## Variant System

The delight system should not be fully random.

Policy:
- each highlight moment uses one primary choreography
- each moment gets 2 to 3 lightweight variants
- variants can be chosen by turn count, event id, or deterministic rotation
- avoid large mood swings between consecutive turns

Rationale:
- stable enough to test and tune
- varied enough to reduce repetition fatigue
- preserves a consistent identity for the game

## Accessibility And Performance Requirements

- `prefers-reduced-motion: reduce` continues to disable non-essential animation
- mute toggle remains effective for all new sounds
- overlay remains keyboard-focusable and screen-reader readable
- all delight additions degrade gracefully if audio is unavailable
- avoid heavy visual effects that could hurt frame rate on modest hardware

## Validation Checklist

- A normal human turn still feels fast
- An AI turn does not feel delayed by spectacle
- Dice, overlay, and win states each feel more exciting than the baseline
- Repeated rounds show small variation without feeling random or chaotic
- Sound and motion settings still work correctly
- The experience feels more like a party board game, not a dashboard with extra animation

## Risks And Guardrails

### Risk: Too much noise between turns
Guardrail:
- keep strong effects limited to the three approved moments

### Risk: Longer turns
Guardrail:
- cap animation additions to short bursts and keep existing sequence timings tight

### Risk: Audio fatigue
Guardrail:
- add variation, keep cues short, and respect mute state at all times

### Risk: Win screen overwhelms readability
Guardrail:
- keep the winner obvious and the ranking list structurally simple
