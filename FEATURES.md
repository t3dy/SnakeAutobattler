# Snake Autobattler: Feature Guide

This guide explains the mechanics and features across all 8 versions of the Snake Autobattler expedition engine.

## Core Mechanics (Global)
*   **The Drafting System**: 4 components determining base stats and identity.
*   **The Storm**: Arena shrinkage force (Tick 20+).

## Version-Specific Features

### v6.0 Manual Intervention
*   **Manual Choices**: RUN, HIDE, or FIGHT during encounter scenes.

### v7.0 Autonomous Depth
*   **Autonomous Resolve**: The snake's "Will" (Traits + HP) decides the v6.0 choices automatically.
*   **Causal Cascades**: Detects event clusters (e.g., Hazard -> Low HP -> Storm Hit) for connected narration.
*   **Typed Adversity**: Distinguishes between damage from Storm, Hazards, Terrain, and Combat.
*   **Brood Bonds**: Stat bonuses (Agility) for snakes moving as a pack.

### v8.0 Cinematic Chronicle
*   **SVG Snake Morphing**: Fluid, slithering path rendering replacing blocky emojis.
*   **Cinematic Viewport**: Auto-zooms and centers on the active snake during dramatic encounters.
*   **Atmospheric Grading**: CSS-based weather effects (Rain, Glitch) and mood coloring tied to environment parameters.
*   **Parallax Scenery**: Layered backgrounds moving in the "Scene-First" encounter overlays.
