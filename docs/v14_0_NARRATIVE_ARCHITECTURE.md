# v14.0 Architecture: The Narrative Skald

> "The engine does not just calculate; it speaks. But speech requires grammar."

## 1. The Core Philosophy: Narrative Layering
The current narrative system (v13.2) is a functional collection of templates. It lacks structural integrity. For the next iteration, we will move from **"Templates"** to **"Layered Composition."**

A narrative beat will be constructed by stacking five distinct layers in a strict order:

1.  **Environment Base** (Tone Setter)
2.  **Voice Layer** (Identity Verb Selection)
3.  **Choreography Layer** (Action Skeleton)
4.  **Genre Modifier** (Stylistic Transform)
5.  **Radiance Modifier** (Meta Tone Shift)

### The Layer Stack
| Layer | Responsibility | Example Output |
| :--- | :--- | :--- |
| **I. BIO** | Environment / Atmosphere | "The air was thick with static." |
| **II. ID** | Identity / Voice | "{Snake} [lumbers/darts/glitches]..." |
| **III. ACT** | Choreography | "...rolling sideways to avoid the strike." |
| **IV. GENRE** | Stylistic Wrapper | "Internal Monologue: 'Just another Tuesday.'" |
| **V. META** | Radiance Glitch | "T-The a-air w-was th-thick..." |

## 2. Structural Data Schema

We will replace string arrays with a **Typed Template Registry**.

```typescript
type NarrativeCategory = "IDENTITY" | "ENCOUNTER" | "ENVIRONMENT" | "META";

interface NarrativeTemplate {
    id: string; // UNIQUE_ID
    category: NarrativeCategory;
    trigger: TriggerRule;
    weight: number; // For RNG variance
    priority: number; // For overwrite logic
    template: string;
}

interface TriggerRule {
    trait?: string;      // "BOULDERBACK"
    terrain?: string;    // "forest"
    action?: string;     // "RUN"
    genre?: string;      // "NOIR"
    radianceBand?: 'LOW' | 'MID' | 'HIGH';
}
```

## 3. The Composition Pipeline (NarrativeComposer)

The `NarrativeComposer` class will execute the following pipeline for every beat:

### Phase 1: Selection (Arbitration)
1.  **Query Templates**: Fetch all matching templates for the context.
2.  **Resolve Conflicts**:
    *   *Identity*: If Snake has `Boulderback` AND `Instinct`, select HIGHEST PRIORITY. (Do not stack voices).
    *   *Environment*: Apply `repetitionPenalty`. Do not describe the forest every turn.
    *   *Choreography*: Must match `EncounterType` exactly.

### Phase 2: Assembly
Combination logic:
`Beat = [Environment?] + [Voice(Verb)] + [Choreography(Object)] + [Genre(Wrapper)]`

### Phase 3: Transformation (The Radiance Pass)
Apply regex-based transforms based on Radiance:
*   **Low Radiance**: `s/creates/cr__tes/g`, insert `[ERR]` prefixes.
*   **High Radiance**: Use "Golden" adjectives (`Destined`, `Perfected`).

## 4. Implementation Plan

### Step 1: The Registry Migration
*   Convert current `narrate.ts` arrays into `NarrativeTemplate` objects.
*   Audit coverage using the *Orphan Finder*.

### Step 2: The Composer Class
*   Create `src/engine/NarrativeComposer.ts`.
*   Implement `composeBeat(context: BeatContext): Beat`.

### Step 3: Choreography Mapping
*   Update `Simulation` to emit granular `EncounterType` enums:
    *   `AMBUSH` / `CLASH` / `EVADE` / `RETREAT_SMART` / `RETREAT_PANIC` / `LETHAL`

### Step 4: The 5-Layer Test
*   Create a test suite that logs one beat and shows how each layer modifies it.

## 5. Future Expansion: Missing Beats
*   **Failure Without Death**: Describes HP loss without KO.
*   **Skill Acquisition**: "Brave Deed" unlock moments.
*   **Phase Echoes**: Callbacks to previous runs (Chronicle system integration).
