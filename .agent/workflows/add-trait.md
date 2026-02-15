---
description: How to add a personality trait with total loop consequence
---
# Workflow: Adding a Game Mechanic (e.g., Trait, Skill)

To ensure that every new addition has "Radiant Consequences" across the narrative, simulation, and visuals, follow these steps:

1. **Codify the Metric**
   - Add the new trait/metric to `engine/types.ts`.
   - Update `engine/traits.ts` with descriptive metadata and hints.

2. **Simulate the Consequence**
   - Update `Simulation.applyFields()` or `Simulation.applyGenreEffects()` in `sim.ts`.
   - Ensure the logic interacts with the 4 scalar fields (Heat, Moisture, Elevation, Storm).

3. **Narrate the Impact**
   - Create a specialized case for the trait in `engine/narrate.ts`.
   - Use the `ProseFactory` to ensure the description matches the current `Genre`.

4. **Visualize the Event**
   - Add a new `VFX` tag to the `GenreDefinition` in `genres.ts`.
   - Update `CinematicVideo.tsx` with an SVG animation or text-based sound effect for this trait's activation.

5. **Verify the Sequence**
   // turbo
   - Run `npm run build` to ensure type safety.
   - Run a 10-tick "Dry Run" in the terminal using `node` or `vitest` to verify the state transitions.
