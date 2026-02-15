# v13.1 "Lucid Loop" Recovery Plan

## 1. The Core Objective
"Ensure the player at least sees convincing output."

The simulation is running, but the *feedback loop* is broken. Players are selecting v13.0 and being dropped into a silent, default state without agency. v13.1 will restore **Agency** (Navigation) and **Feedback** (Visuals).

## 2. Structural Repairs

### A. The Navigation Pipeline (`App.tsx`)
**Problem**: `v13.0` bypasses `Mode Select` and `Genre Select`.
**Fix**: 
1. Map `v13.0` explicitly to `setGameState('mode_select')`.
2. Ensure `handleModePick` correctly routes v13.0 to `genre_select` (if desired) or `draft`.
3. Verify `HOTSEAT` and `ENV_FIRST` modes trigger the correct UI blocks.

### B. The Convincing Output Layer (`Arena.tsx` & `CinematicVideo.tsx`)
**Problem**: The "Encounter" pauses the game but hides the context.
**Fix**:
1. **Semi-Transparent Overlay**: Make `CinematicVideo` use `rgba(0,0,0,0.85)` background so the map is faintly visible behind it.
2. **Hit Splashes**: Add a simple CSS animation for "Damage Taken" in the Arena.
3. **Radiance HUD**: Display the "Harmony/Discord" score live.

### C. The Designer's Guarantee (`sim.ts`)
**Problem**: Traits might be "paper tigers" (documented but not coded).
**Fix**:
1. Audit `TraitConsequenceMatrix` against `sim.ts`.
2. Ensure `Boulderback` actually reduces hazard damage.

## 3. Implementation Checklist

### Phase 1: Navigation Logic
- [ ] Refactor `selectVersion` to include `v13.0` in the "Go to Mode Select" block.
- [ ] Update `handleModePick` to route `v13.0` to `genre_select` (Encounter Drama needs Genre).
- [ ] Test the `HOTSEAT_BATTLE` button path.

### Phase 2: Visual Feedback
- [ ] Update `App.css` to handle `CinematicVideo` transparency.
- [ ] Add `RadianceDisplay` component to the `Arena` header.
- [ ] Add CSS keyframes for `damage-flash`.

### Phase 3: The "Convincing" Factor
- [ ] Ensure `narrate.ts` logs to the main battle screen, not just the recap.
- [ ] Verify `Sim.step` emits `DAMAGE` events that `Arena` can render.

*Plan authorized by The High Council.*
