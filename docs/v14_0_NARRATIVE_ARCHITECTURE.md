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

## 2. Structural Data Schema (v2.0 - Strict)

We will use explicit types to enforce the 5-layer model.

```typescript
export type NarrativeLayer = "BIO" | "ID" | "ACT" | "GENRE" | "META";

export type NarrativeCategory = 
    | "ENVIRONMENT"   // BIO: Atmosphere
    | "IDENTITY"      // ID: Voice
    | "CHOREOGRAPHY"  // ACT: Action Structure
    | "GENRE_WRAPPER" // GENRE: Frame
    | "META_TONE";    // META: Glitch/Shift

export type EncounterType = "AMBUSH" | "CLASH" | "EVADE" | "RETREAT_SMART" | "RETREAT_PANIC" | "LETHAL" | "FAILURE_NO_DEATH" | "SKILL_ACQUIRED" | "PHASE_ECHO";

export type TriggerRule = {
    // Logic Ops
    any?: TriggerRule[];
    all?: TriggerRule[];
    not?: TriggerRule;
    
    // Context Matchers
    trait?: string;
    terrain?: string;
    phase?: "KNOWN" | "UNKNOWN";
    action?: "RUN" | "HIDE" | "FIGHT" | "DIG" | "HACK";
    encounterType?: EncounterType;
    genre?: string;
    radianceBand?: "LOW" | "MID" | "HIGH";
    
    // Pacing Matchers
    actLabel?: "OPENING" | "RISING" | "CRISIS" | "CLIMAX" | "AFTERMATH";
    minTick?: number;
    maxTick?: number;
};

export interface NarrativeTemplate {
    id: string;
    layer: NarrativeLayer;
    category: NarrativeCategory;
    trigger: TriggerRule;
    
    priority: number; // Deterministic tie-break
    weight: number;   // RNG variance within priority
    
    cooldown?: number; // Beats before reuse
    oncePer?: "BEAT" | "ACT" | "PHASE" | "EXPEDITION";
    
    template: string;
}
```

## 3. The Composition Pipeline (NarrativeComposer)

### The BeatContext Contract
The composer expects a fully computed fact sheet:
```typescript
interface BeatContext {
    seed: number;
    tick: number;
    phase: "KNOWN" | "UNKNOWN";
    snake: SnakeState;
    environment: { terrain: string; fields: any };
    encounter: { type: EncounterType; intensity: number };
    radiance: { value: number; band: "LOW" | "MID" | "HIGH" };
    history: {
        usedTemplateIds: string[];
        perTemplateCooldowns: Record<string, number>;
    };
}
```

### Arbitration Rules (Grammar)
1.  **BIO**: Optional. Throttled (e.g., max 1 per 5 beats).
2.  **ID**: EXACTLY ONE per beat. Priority: Trait > Instinct > Body > Neutral.
3.  **ACT**: MANDATORY. Must match `EncounterType`.
4.  **GENRE**: Optional wrapper.
5.  **META**: Transform pass only.

### Output Structure
The final beat is assembled as:
`[BIO] [ID + ACT] [GENRE] [META]`

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
