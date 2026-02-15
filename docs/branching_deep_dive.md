# Deep Dive: Branching & Micro-Reverts for Design Experiments

When you are experimenting with "risky" changes (like changing the base combat math or adding a chaotic genre), your git history is your "Save State" system.

## 1. The "What If?" Branch
**Objective**: Test a massive change without breaking your stable game.
**Example**: You want to see if removing 'Health' and replacing it with 'Segments' (like classic Snake) works.
```bash
git checkout -b experiment/segment-based-hp
```
*If it fails*: `git checkout main` and delete the branch. No harm done.
*If it works*: `git merge experiment/segment-based-hp` into main.

## 2. Micro-Reverts (The Eraser)
**Objective**: You added 10 things in a session, but the *Sim Logic* is buggy. You want to keep the *Narrative* but reset the *Sim*.
**Example**:
```bash
git checkout HEAD~1 -- src/engine/sim.ts
```
This command says: "Go back one commit, grab ONLY `sim.ts`, and overwrite my current version of it." This is surgical; it doesn't touch your new traits in `traits.ts` or prose in `narrate.ts`.

## 3. Stashing (The "Wait, I have an idea")
**Objective**: You're mid-refactor but found a bug in the Landing Page you need to fix NOW.
```bash
git stash             # Saves your messy work to a hidden pile
git checkout main      # Go to stable
# Fix bug...
git commit -m "Fix logo"
git checkout <branch>
git stash pop         # Brings your messy work back exactly where you left it
```

## 4. GitHub Issues as Trackers
**Strategy**: Create an issue for every Trait group (e.g., "The Cunning/Anxious Synergy").
- **Commit Body**: Use `Addresses #12` in your commit message.
- **Result**: GitHub will show a timeline of every combat tweak, prose update, and bugfix related to that trait in one thread.
