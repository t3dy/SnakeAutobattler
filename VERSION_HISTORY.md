# Version History: Snake Autobattler

## v1.0 - The Narrative Foundation (Initial Release)
**Objective**: Establish a core simulation loop that generates a text-based account of a snake team's battle.

### Challenges & Solutions
- **Challenge**: Initial `npm install` failures due to file system locking/permissions on the host.
  - **Solution**: Manually scaffolded the project and verified dependencies one-by-one, followed by a clean `npm install --prefer-offline`.
- **Challenge**: GitHub Pages 404 on deployment.
  - **Solution**: Discovered the repository-level setting "Source: GitHub Actions" was not enabled by default. Toggled the setting and corrected the Vite `base` path in `vite.config.ts` to `/SnakeAutobattler/`.
- **Challenge**: 'Permission Denied' errors in GitHub Actions CI during the build step.
  - **Solution**: Explicitly added `chmod +x node_modules/.bin/vite` to the deployment workflow to ensure the binary was executable on the Ubuntu runner.

## v2.0 - Personality & Origin (The Character Update)
**Objective**: Deepen the connection between player draft choices and the resulting story.

### Key Features
- **Origin Bios**: Every snake story now begins with a "Bio" block that summarizes its body type, instinct, and affinity.
- **Personality Commentary**: Injected flavor text into the narrative engine. Events like "Combat" or "Hazard Hits" now look at the snake's `Quirk` or `Body` to determine the prose.
- **Legacy Logic**: Retained the core 60-tick event-driven simulation for consistency.

---

## v3.0 - Visual Terrain (Current Plan)
**Objective**: Add graphical texture to the narrative by representing the environment with emoji-based grid snapshots.

### Proposed Changes
- **Graphic Snapshots**: Instead of just text, the narrator will output a "Snapshot" of the snake's current vicinity using a 5x5 emoji grid (e.g., 🌲🌲🐍🌲🌲).
- **Interactive Log**: A UI toggle to view the "Live Map" of the battle alongside the narrative.
- **Improved AI**: Fine-tune the "Hunter" and "Scavenger" logic to better reflect their descriptions.
