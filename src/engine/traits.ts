import {
    BodyType, InstinctType, AffinityType, QuirkType, Stats, TerrainType
} from './types';

export const BODIES: Record<BodyType, { stats: Partial<Stats>; flags: string[]; description: string; strategy: string }> = {
    'Boulderback Constrictor': {
        stats: { size: 3, speed: -2, agility: 0, venom: 0, camouflage: 0 },
        flags: ['hazard_resist', 'close_quarters', 'avoids_open'],
        description: "A massive powerhouse with overlapping, stone-like scales designed to withstand crushing pressure.",
        strategy: "High survivability. Ideal for attrition warfare within mountainous or rocky biomes."
    },
    'Shadow Striker': {
        stats: { venom: 3, camouflage: 2, size: -1, speed: 0, agility: 0 },
        flags: ['ambush_from_cover', 'disengage_outnumbered'],
        description: "Slender and melanistic, its body is built for silent movement and rapid venom injection.",
        strategy: "Glass cannon. Relies on camouflage and alpha-strikes from forest cover."
    },
    'Dune Sprinter': {
        stats: { speed: 3, agility: 2, size: -2, venom: 0, camouflage: 0 },
        flags: ['forage_priority', 'hit_and_run'],
        description: "Lightweight and elongated, with specialized underside scales shaped for sand-gliding.",
        strategy: "Scout archetype. Focuses on gathering food and outrunning threats in open desert."
    },
    'River Glider': {
        stats: { agility: 3, speed: 1, venom: -1, size: 0, camouflage: 0 },
        flags: ['water_bonus', 'obstacle_bypass'],
        description: "Hydrodynamic and muscular, with a paddle-like tail that provides unmatched river speed.",
        strategy: "Mobile disruptor. Can bypass river obstacles and reposition faster than any rival."
    }
};

export const INSTINCTS: Record<InstinctType, { bias: string; triggers: string[]; description: string; strategy: string }> = {
    'Hunter': {
        bias: 'seeks_enemy',
        triggers: ['combat_seek', 'pursue_advantage'],
        description: "Highly sensitive pit organs tuned to detect the thermal signatures of warm-blooded rivals.",
        strategy: "Proactive combat. Will prioritize hunting down enemies over foraging or safety."
    },
    'Scavenger': {
        bias: 'seeks_food',
        triggers: ['food_seek', 'avoid_combat'],
        description: "Equipped with a highly refined Jacobson's organ to track decaying matter over long distances.",
        strategy: "Survival priority. Avoids conflict to focus on food consumption and stat-evolution."
    },
    'Territorial': {
        bias: 'claims_region',
        triggers: ['patrol_zone', 'defend_zone'],
        description: "Displays aggressive musk-gland marking behavior to define its undisputed domain.",
        strategy: "Area control. Will patrol a specific coordinate and attack any intruder on sight."
    },
    'Opportunist': {
        bias: 'avoids_risk',
        triggers: ['evaluate_advantage', 'ambush_seek'],
        description: "Calculated pacing; waits for rivals to be weakened by hazards before striking.",
        strategy: "Reactive combat. Only engages when the opponent is wounded or outnumbered."
    }
};

export const AFFINITIES: Record<AffinityType, { terrain: TerrainType; bonuses: Partial<Stats>; moveCostMod: number; description: string }> = {
    'Forest-Bonded': {
        terrain: 'forest',
        bonuses: { camouflage: 2, agility: 1 },
        moveCostMod: -1,
        description: "Green-mottled scales provide perfect concealment within the dappled forest floor."
    },
    'Desert-Born': {
        terrain: 'desert',
        bonuses: { speed: 2, size: 0 },
        moveCostMod: -1,
        description: "Metabolically optimized for heat, moving faster as the temperature rises."
    },
    'River-Blooded': {
        terrain: 'river',
        bonuses: { agility: 2 },
        moveCostMod: -2,
        description: "Natural buoyancy and fin-like ridges make river travel as effortless as slithering."
    },
    'Stone-Scaled': {
        terrain: 'mountain',
        bonuses: { size: 2, camouflage: 0 },
        moveCostMod: -1,
        description: "Mineral-dense skin mimics the craggy textures of the high-altitude peaks."
    }
};

export const QUIRKS: Record<QuirkType, { bonuses: Partial<Stats>; behavior: string; penalty?: string; description: string }> = {
    'Reckless': {
        bonuses: { venom: 1 },
        behavior: 'paths_through_hazards',
        penalty: 'hazard_damage_2x',
        description: "A hyper-active nervous system that favors offensive bursts over self-preservation."
    },
    'Cautious': {
        bonuses: { agility: 1 },
        behavior: 'strongly_avoids_hazards',
        penalty: 'speed_-1',
        description: "Hyper-vigilant tongue-flicking constanty monitors for vibrations and traps."
    },
    'Voracious': {
        bonuses: {},
        behavior: 'seeks_food_aggressively',
        penalty: 'feeding_delay',
        description: "An evolutionary anomaly resulting in a metabolism that requires constant caloric intake."
    },
    'Paranoid': {
        bonuses: { agility: 1 },
        behavior: 'retreats_sooner',
        penalty: 'camouflage_-1',
        description: "An extreme 'flight' response triggered by even the slightest environmental shift."
    }
};
