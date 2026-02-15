# RADIANT DIAGNOSTICS: SYSTEM AUDIT v13.0

> **SEVERITY**: CRITICAL
> **STATUS**: GAME LOOP FRACTURED
> **AUDITORS**: The High Council of Designers

## 1. EXECUTIVE SUMMARY (The Problem)
**Reporter**: User "Operator"
**Symptom**: "Buttons for choosing modes don't work." / "Lack of convincing output."
**Root Cause**: The `v13.0` architecture was deployed with a "Happy Path" bias. The state machine in `App.tsx` does not correctly route `v13.0` through the necessary setup phases (`Mode`, `Genre`, `Draft Order`), defaulting it aggressively to `Draft` mode and bypassing critical simulation parameters.

---

## 2. DESIGNER REPORTS

### 🏂 SIDEWINDER | UX & State Navigator
**Status**: 🔴 FAILED
**Report**:
My analysis of the Navigation Grid (`App.tsx`) reveals a fatal mapping error in the `selectVersion` protocol.
-   **The Glitch**: When `v13.0` is selected, the switch statement falls through to `default`, triggering `setGameState('draft')` instantly.
-   **The Consequence**: The player NEVER sees `Mode Selection` or `Genre Flux`. We are locking them into a `SOLO` / `NOIR` (default state) loop without their consent.
-   **Navigation Dead Ends**:
    -   If a player wants to play `HOTSEAT`, they cannot.
    -   `GameStage` enum (the new v13 meta-state) is not being synced with `GameState` (the legacy UI state). We have two brains fighting for control of the steering wheel.
**Recommendation**: 
Refactor `selectVersion` to route `v13.0` through the full `Mode Select` -> `Genre Select` pipeline.

### ⚔️ BLACK MAMBA | Combat & Simulation Lead
**Status**: 🟠 UNSTABLE
**Report**:
The Simulation Loop (`sim.ts`) is running, but "Convincing Output" is lacking because the "Encounter" pauses are... too perfect.
-   **The Glitch**: We pause for `PENDING_CHOICE`, but the `CinematicVideo` overlay is disjointed. It clears the screen, removing the context of *where* the snake is.
-   **Visual Disconnect**: The Arena renders the *map*, then the Cinematic renders a *clean video*, then we return. There is no visual bridge.
**Recommendation**:
The Arena should remain visible *behind* the Cinematic overlay (blurred) to maintain spatial permanence.

### ⚪ BALL PYTHON | Traits Curator
**Status**: 🟡 ORPHANED
**Report**:
I have reviewed `TraitConsequenceMatrix.ts`.
-   **Finding**: While we Audit the traits, the `sim.ts` doesn't actually *check* the matrix during runtime. The matrix is a documentation artifact, not a code contract.
-   **The Risk**: If I add 'Stone-Wise' to the matrix, but forget `sim.ts`, the code doesn't warn me. This is why the user feels the mechanics aren't "working together".
**Recommendation**:
Inject the Matrix into the Simulation. `sim.ts` should query `Matrix[trait].sim` to verify effects exist.

### 👁️ EMERALD BOA | Radiance Auditor
**Status**: 🟢 COMPLIANT (But Isolated)
**Report**:
The Radiance Contract is holding. `radiance.ts` is calculating drift.
-   **The Issue**: The player *cannot see* the Radiance Score during the draft or battle. It is hidden in the `ChronicleArchive` (post-game).
-   **Feedback Loop**: A metric you cannot see is a metric you cannot master.
**Recommendation**:
Add a live `RadianceFlux` gauge to the HUD.

---

## 3. RECOVERY PLAN: v13.1 "Lucid Loop"

### Step 1: Unify the State Machine
We must kill the implicit `else` in `selectVersion`. explicit routing for `v13.0`.
```typescript
// TARGET LOGIC
if (version === 'v13.0') {
    setGameState('mode_select'); // START THE JOURNEY PROPERLY
}
```

### Step 2: The "Convincing Output" Pass
-   **Visual**: Add "Impact Frames" to the Arena when damage occurs.
-   **Text**: `narrate.ts` needs to output to the *Battle Screen* log, not just the recap.
-   **UI**: Show the `Radiance` value next to the Turn Timer.

### Step 3: Deep Verification
-   We will manually trace the `HOTSEAT` flow to ensure p2 controls work.
-   We will verify `Genre` actually changes the prose style.

*Signed,*
*The Council*
