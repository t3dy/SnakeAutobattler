# Snake Autobattler: Feature Guide

This guide explains the mechanics and features across all 6 versions of the Snake Autobattler expedition engine.

## Core Mechanics (Global)
*   **Drafting System**: Every snake is built from 4 components:
    *   **Body**: Base HP and Size.
    *   **Instinct**: Combat bias (Aggressive vs Defensive).
    *   **Affinity**: Elemental/Terrain bonuses (Aquatic, Desert, etc.).
    *   **Quirk**: Random personality modifiers (Reckless, Cunning).
*   **The Storm**: The arena shrinks over time (Tick 20+), dealing massive hazard damage to those on the edges.

## Version-Specific Features

### v2.0 Identity Features
*   **GenerateOriginBio**: Uses logic to write a unique back-story for your snake based on its starting traits.

### v3.0 & v4.0 Narrative Features
*   **Visual Replay**: A grid-based rendering of the simulation using emojis.
*   **Story Compiler**: Groups tick-by-tick events into "Dramatic Arcs" (e.g., *The Thirst for Growth*, *The Final Stand*).
*   **Memory System**: Snakes remember where they found food or hit hazards, influencing their future pathfinding.

### v5.0 Theme & Multiplayer
*   **Thematic Overlays**:
    *   **⚔️ Medieval**: Honor points, gear salvage, and chivalric prose.
    *   **🔫 Sci-Fi**: Power grids, terminal hacking, and tactical hardware data.
*   **Hot-Seat Battle**: Two players draft squads and compete for dominance in the same arena.

### v6.0 Incident Response
*   **Scene-First Simulation**: The simulation pauses when a "Narrative Node" is hit.
*   **Manual Intervention**: Players must manually choose **RUN**, **HIDE**, or **FIGHT**.
*   **Persistent Stacking**: Every manual choice is logged into the `storyHistory`, creating a cohesive chronicle of agency.
