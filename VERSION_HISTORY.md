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

## v3.0 - Animated Replay (The Visual Update)
**Objective**: Represent the simulation world graphically using a dynamic emoji-based grid.

### Key Features
- **Watch Replay**: A new playback system that moves through the 60-tick simulation at a controllable pace.
- **Emoji Arena**: A 16x12 grid that visualizes biomes (🌳🌵💧⛰️), snacks (🍎🐁), and hazards (⚠️).
- **Snake Tracking**: Custom emojis for player (🐍) and enemy (👾) snakes, following their exact path from the event log.
- **Micro-Animations**: Event-specific overlays like combat sparks (💥) and healing sparkles (✨) that appear in real-time on the grid.
