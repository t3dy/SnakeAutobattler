# Skill: Narrative Architecture

This skill codifies the "Radiant Design" philosophy for the Snake Autobattler Narrative Engine.

## Core Directives
1. **Dynamic Tone Mapping**: All prose must be dispatched through the `GenreDefinition`.
2. **Field-Driven Prose**: Descriptions should sample the local `ScalarField` (e.g., "The air was thick" if Moisture > 0.8).
3. **Causal Chains**: When a trait triggers a behavior shift, the narrative must link the cause (e.g., "Driven by the Storm, the Anxious snake...") instead of listing isolated events.

## File Map
- `engine/narrate.ts`: The primary composer.
- `engine/genres.ts`: The tone and vocabulary registry.
- `components/CinematicVideo.tsx`: The visual interpreter of narrative tags.

## Best Practices
- Avoid "The snake moved to X."
- Prefer "Enveloped in the [Genre: Noir] fog, the snake melded with the [Field: Shadow] shadows."
