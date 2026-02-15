# Trait Consequence Matrix

This matrix tracks how every personality trait (Quirks, Instincts, Affinities) manifests across the game's three pillars: **Simulation**, **Narrative**, and **Visuals**.

| Trait Name | Pillar: Simulation (Math) | Pillar: Narrative (Prose) | Pillar: Visuals (VFX/SFX) | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| **Anxious** | Speed boost when near enemies; lower Resolve. | "Nervous twitching," "darting eyes." | Shaking animation; "!" emoji. | [ ] Needs Sync |
| **Reckless** | ignore Hazard visibility; high crit chance. | "heedless of danger," "bold sprint." | Red streak; "KRA-PAW!" SFX. | [x] Partial |
| **Cunning** | Stealth bonus; prioritizes ambushes. | "calculating slither," "patient wait." | Shadow aura; "..." whisper SFX. | [x] Full |
| **Brave** | Resolve never drops; +1 damage at low HP. | "Heroic stand," "defiant hiss." | Golden glow; "CLANG!" SFX. | [/] In Progress |
| **River-Blooded** | +2 Speed in Moisture Fields. | "at home in the torrent," "slick scales."| Water ripple trail. | [x] Full |
| **Desert-Born** | +Stamina in Heat Fields. | "sun-soaked skin," "heat-thirst." | Shimmering heat lines. | [x] Full |

## Sync Rules
1. **Adding a Trait?** You MUST fill out all four columns above.
2. **Missing a Column?** It is considered an "Orphan Trait" and will be flagged by the audit script.
3. **Genre Bias**: Use `engine/genres.ts` to modify how these consequences feel (e.g., Slapstick Brave vs. Noir Brave).
