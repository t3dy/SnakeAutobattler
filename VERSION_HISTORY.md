# Snake Autobattler: The Version Chronicles

From a simple terminal-style log to a multi-layered narrative engine, the Snake Autobattler has undergone a rapid evolution. This document tracks the mechanical and narrative logic behind every leap.

## [v1.0] - The Primal Log
*   **Goal**: Establish the core simulation loop (Move -> Eat -> Fight).
*   **Logic**: Pure functional simulation. Narrative was a secondary byproduct, formatted as simple terminal logs.
*   **Legacy**: The 16x12 grid and basic snake stats (HP, Venom, Size) were born here.

## [v2.0] - The Identity Spark
*   **Goal**: Give the "units" personality.
*   **Logic**: Introduced the **Drafting System** (Body, Instinct, Affinity, Quirk).
*   **Narrative Update**: Added `generateOriginBio`, moving from generic "Snake 1" to "The Reckless Aquatic Stalker".

## [v3.0] - The Gift of Sight (Vite/React)
*   **Goal**: Move from abstraction to visualization.
*   **Logic**: Ported the engine to React/Vite. Built the `Arena.tsx` component.
*   **Experiment**: Real-time emoji replay allowed players to see *why* their snake died in a hazard.

## [v4.0] - The Saga Engine
*   **Goal**: Turn "events" into "stories".
*   **Logic**: Developed the `StoryCompiler`. Instead of 1-1 event logging, it grouped events into **Dramatic Arcs** (Exploration, Conflict, Survival).
*   **Improvement**: Snakes gained "Memory" of landmarks.

## [v5.0] - Chronicles of Honor & Steel
*   **Goal**: Thematic depth and multiplayer agency.
*   **Logic**: Introduced **Environment Hub**, **Themes** (Medieval/Sci-Fi), and **Phases** (Scavenge/Clash).
*   **Narrative Update**: Added Lush Prose and "Visual Prompt" synthesis for Recap portraits.

## [v6.0] - The Merchant of Secrets
*   **Goal**: Interactive Agency (FTL-style).
*   **Logic**: Refactored the engine to **Pause** for player input.
*   **New Mechanics**: Run, Hide, Fight choices. Persistent history stacking (every choice is recorded).
*   **Experiment**: Moving away from "watching a movie" to "leading an expedition".

---

## Technical Philosophy: The "Chronicle" Model
Our simulation is built on the principle that **simulation data should dictate narrative weight**. We don't just write a story; we compile a story from the debris of the math. 
*   **Math-to-Myth**: Every HP lost to a hazard is converted into a line of struggle.
*   **Trait-Driven Prose**: A "Reckless" snake in v6.0 doesn't just have stat penalties; the narration describes its "foolish charge".
