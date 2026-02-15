# Radiant Design: Orphan Trait Dashboard

This dashboard tracks traits that are defined in the drafting system but lack mechanical or narrative consequences in the game loop.

## ⚠️ Current Orphan Traits
*Generated on: 2026-02-14*

| Trait Name | Status: Simulation | Status: Narrative | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Boulderback Constrictor** | [ ] MISSING | [ ] MISSING | Add `hazard_resist` logic to `sim.ts`. |
| **Shadow Striker** | [ ] MISSING | [ ] MISSING | Add `camouflage` alpha-strike logic. |
| **Dune Sprinter** | [ ] MISSING | [ ] MISSING | Add `Desert` speed bonus to `sim.ts`. |
| **River Glider** | [ ] MISSING | [ ] MISSING | Add `Water` bonus to `sim.ts`. |
| **Clockwork Coil** | [ ] MISSING | [ ] MISSING | Add `Binary` field interaction. |
| **Hunter** | [ ] MISSING | [ ] MISSING | Implement `seeks_enemy` bias. |
| **Scavenger** | [ ] MISSING | [ ] MISSING | Implement `seeks_food` bias. |
| **Territorial** | [ ] MISSING | [ ] MISSING | Implement `patrol_zone` logic. |
| **Opportunist** | [ ] MISSING | [ ] MISSING | Implement `evaluate_advantage`. |
| **Thunder-Clap** | [ ] MISSING | [ ] MISSING | Implement `stun_on_hiss` in combat. |
| **Forest-Bonded** | [ ] MISSING | [ ] MISSING | Implement `Forest` stealth. |
| **Stone-Scaled** | [ ] MISSING | [ ] MISSING | Implement `Mountain` size bonus. |
| **Void-Hearted** | [ ] MISSING | [ ] MISSING | Implement `any` terrain versatility. |
| **Cautious** | [ ] MISSING | [ ] MISSING | Implement `avoids_hazards` in AI. |
| **Voracious** | [ ] MISSING | [ ] MISSING | Implement `feeding_delay` logic. |
| **Paranoid** | [ ] MISSING | [ ] MISSING | Implement `retreats_sooner` logic. |
| **Glitchy-Tail** | [ ] MISSING | [ ] MISSING | Implement `random_teleport`. |

## ✅ Radiant Traits (Fully Integrated)
- **Reckless**: Integrated into `sim.ts` (double damage) and `narrate.ts`.
- **Desert-Born**: Partially integrated via environment params.
- **River-Blooded**: Partially integrated.

---
*Use the `add-trait` workflow to clear these orphans.*
