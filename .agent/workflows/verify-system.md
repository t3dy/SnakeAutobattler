---
description: System-wide verification for new game mechanics
---
# Workflow: System-Wide Verification

Before merging any new trait, genre, or field interaction, run this "Radiant Audit."

## 1. Static Type Audit
// turbo
- Run `npm run build`
- Ensure the trait exists in `engine/types.ts` and `engine/traits.ts`.

## 2. Orphan Audit
// turbo
- Run `node scripts/find_orphans.js`
- Verify that the trait has entries in:
    - `sim.ts` (Mechanical Logic)
    - `narrate.ts` (Prose Mapping)
    - `CinematicVideo.tsx` (Visual Tags)

## 3. Interaction Dry-Run
- Start a local dev server (`npm run dev`).
- Select the trait in the drafting screen.
- Verify the "Hints" (Pros/Cons) are displayed.
- Run a battle and check the `Recap` for specific prose triggers.

## 4. Genre Stress Test
- Test the trait across two opposing Genres (e.g., SLAPSTICK vs ZOMBIE).
- Ensure the `ProseComposer` doesn't leak vocabulary between genres.

## 5. Documentation Sync
- Update `docs/trait_consequence_matrix.md` with the implementation status.
- Link the commit to a GitHub Issue tagged `#trait-consequence`.
