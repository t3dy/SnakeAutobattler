# GitHub Strategy for Procedural Evolution

To manage the "Multi-Verse" architecture without losing stability, use these precision GitHub techniques.

## 1. Feature Branching (The "Sandbox" Model)
Never develop a new Genre or Field in `main`.
- **Naming**: `feat/zombie-infection`, `fix/noir-shadow-math`.
- **Workflow**: 
    1. `git checkout -b feat/new-genre`
    2. Implement logic.
    3. Run `npm run build`.
    4. `git merge main` into your branch to catch conflicts early.

## 2. Reverting specific Loop Changes (The "Scalpel")
If you like the new *Narrative* but hate the *Combat* changes in a version:
- **Command**: `git checkout <commit_hash_before_change> -- src/engine/sim.ts`
- **Result**: Restores just the simulation logic to a previous state while keeping all other v12.0 changes.

## 3. Cherry-Picking (The "Thief")
If you built a cool VFX system in a failed experiment branch:
- **Command**: `git cherry-pick <commit_hash_of_vfx>`
- **Result**: Port that specific "Radiant Consequence" into your stable branch without bringing the failed experiment's baggage.

## 4. Attaching Scholarship (PDFs)
1. **Upload**: Place PDFs in a `docs/scholarship/` folder in the repo.
2. **Index**: Ask me to create a KI for each PDF.
    - *Example*: "Antigravity, index the PDF `docs/scholarship/PCG_2016.pdf` into KI `PCG_CORE_CONCEPTS`."
3. **Reference**: I will then use that KI as a "Consulting Skill" for all future design requests.
