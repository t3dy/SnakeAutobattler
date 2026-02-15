# Snake Autobattler: The Version Chronicles

From a simple terminal-style log to a multi-layered narrative engine, the Snake Autobattler has undergone a rapid evolution. This document tracks the mechanical and narrative logic behind every leap.

## [v1.0] - The Primal Log
*   **Goal**: Establish the core simulation loop (Move -> Eat -> Fight).
*   **Legacy**: Basic grid and snake stats (HP, Venom, Size) were born here.

## [v2.0] - The Identity Spark
*   **Goal**: Give the "units" personality.
*   **Logic**: Introduced the **Drafting System** (Body, Instinct, Affinity, Quirk).
*   **Narrative**: Introduced `generateOriginBio`.

## [v3.0] - The Gift of Sight (Vite/React)
*   **Goal**: Visualization via `Arena.tsx`.

## [v4.0] - The Saga Engine
*   **Goal**: Turn "events" into "stories".
*   **Logic**: Developed the `StoryCompiler` grouping events into **Dramatic Arcs**.

## [v5.0] - Chronicles of Honor & Steel
*   **Goal**: Thematic depth (Medieval/Sci-Fi) and Hot-Seat Multiplayer.

## [v6.0] - The Merchant of Secrets
*   **Goal**: Manual FTL-style agency (Run, Hide, Fight choices).

## [v7.0] - The Ghost in the Scales
*   **Goal**: Surgical causality and autonomous resolve.
*   **Logic**: Decisions are automated based on the snake's **Personality Matrix** (HP + Traits + Trauma).
*   **Narrative**: Added **Causal Cascades** and **Typed Adversity** (Storm vs Combat vs Terrain).

## [v8.0] - The Living Chronicle
*   **Goal**: Cinematic Visual Synthesis.
*   **Logic**: Replaced static emojis with **SVG Snake Morphing** and **Cinematic Camera** (Auto-zoom on encounters).
*   **Atmosphere**: Procedural **Weather Layers** (Rain, Sandstorm, Glitch) driven by climate parameters.

---

## Technical Philosophy: The "Chronicle" Model
Our simulation is built on the principle that **simulation data should dictate narrative weight**. We don't just write a story; we compile a story from the debris of the math. 
*   **Math-to-Myth**: Every HP lost to a hazard is converted into a line of struggle.
*   **Trait-Driven Motion**: In v8.0, a "Reckless" snake's SVG path morphs with more "erratic" transitions.
