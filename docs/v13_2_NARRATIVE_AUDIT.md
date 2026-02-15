# v13.2 Narrative Audit: The Voice of the Coil

## 1. Executive Summary
Current narrative generation (`narrate.ts`) is functional but generic. It distinguishes **Genre** and **Terrain**, but completely ignores **Snake Identity** (Body, Instinct, Affinity, Quirk) during action scenes. This results in ludonarrative dissonance, where a massive "Boulderback" snake is described as "sprinting" or "vanishing like a ghost."

## 2. Missing Interactions (The "Hollow Coil" Problem)

### A. Body Dissonance
- **Issue**: `RUN_TEMPLATES` use words like "sprint," "race," "bolt."
- **Conflict**: A `Boulderback` (Speed -2, Size +4) should "turn and brace" or "trundle," not "sprint."
- **Conflict**: A `Whipcoil` (Speed +4, Size -2) should "blur" or "snap," not "stumble."

### B. Instinct Erasure
- **Issue**: All snakes share the same `FIGHT_TEMPLATES`.
- **Conflict**: A `Cowardly Clever` snake fighting should sound desperate or accidental.
- **Conflict**: A `Bloodrush` snake fighting should sound predatory and eager.
- **Conflict**: A `Noblesse` snake should fight with "disdain" or "technique."

### C. Affinity Blindness
- **Issue**: A `Sun-Touched` snake in a `Desert` gets the same generic "shifting sands" textual flavor as a `Mist-Bound` snake.
- **Opportunity**: `Sun-Touched` in Desert should feel empowered ("drags heat from the sand"), while `Mist-Bound` should feel withered ("scales crack in the dry heat").

## 3. Proposed Solution: The "Trait Weave" System

We will introduce a `TraitTrigger` system in `narrate.ts` that prioritizes specific lines if a snake possesses certain flags or properties.

### Data Structure Spec
```typescript
interface NarrativeTrigger {
    requires: string[]; // e.g., ['Boulderback', 'desert'] or ['high_speed', 'FIGHT']
    text: string[];     // Specific templates
    weight: number;     // Priority over generic lines
}
```

### Planned Content Injection (20+ New Triggers)
1.  **Boulderback + Run**: "Refusing to run, the {snakeName} becomes a living wall against the {terrain}."
2.  **Whipcoil + Fight**: "{snakeName} is a blur of motion, striking before the enemy registers the movement."
3.  **Cowardly + Fight**: "Cornered and panic-stricken, {snakeName} lashes out blindly!"
4.  **Bloodrush + Run**: "{snakeName} retreats, but only to circle back for a better killing angle."
5.  **Sun-Touched + Desert**: "The scorching {terrain} fuels {snakeName}'s inner fire."
6.  **Mist-Bound + River**: "In the {terrain}, {snakeName} dissolves into the water—invisible and everywhere."
7.  **ZOMBIE + Bite**: "{snakeName} tears a chunk of unstable code from the enemy."
8.  **SLAPSTICK + K.O.**: "{snakeName} sees stars—literally—and collapses with a comical wheeze."
9.  **Gilded Hood + Any**: "{snakeName} flares its hood, demanding the {terrain} acknowledge its presence."
10. **Dramatic + Any**: "With a theatrical gasp, {snakeName} executes a maneuver worthy of the archives."
...and more.

## 4. Action Plan
1.  Define `specific_narrative_triggers` in `narrate.ts`.
2.  Update `compileGenreArcs` to check for these triggers before falling back to generic arrays.
3.  Write the content.
