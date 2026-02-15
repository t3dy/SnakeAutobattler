import {
    BodyType, InstinctType, AffinityType, QuirkType, Stats, TerrainType
} from './types';

export const BODIES: Record<BodyType, { stats: Partial<Stats>; flags: string[]; description: string; strategy: string; hints: { pro: string, con: string } }> = {
    'Boulderback': {
        stats: { size: 4, speed: -2, agility: 0, venom: 0, camouflage: 0 },
        flags: ['high_defense', 'slow_turns'],
        description: "A ponderous mass of reinforced scales that shrugs off all but the heaviest blows.",
        strategy: "Immovable object. Focus on defensive positioning.",
        hints: { pro: "Massive HP pool.", con: "Cannot outrun the storm." }
    },
    'Whipcoil': {
        stats: { speed: 4, size: -2, agility: 2, venom: 0, camouflage: 0 },
        flags: ['high_speed', 'low_hp'],
        description: "A lightning-fast ribbon of muscle designed for rapid displacement.",
        strategy: "Speed is life. Never stay in one place long enough to get hit.",
        hints: { pro: "Outpaces almost anything.", con: "Single mistakes are fatal." }
    },
    'Gilded Hood': {
        stats: { size: 1, agility: 1, camouflage: -1, venom: 1, speed: 1 },
        flags: ['intimidation_aura', 'regal_posture'],
        description: "Sun-bright scales and a menacing flare that strikes fear into observers.",
        strategy: "Crowd control. Enemies hesitate before striking.",
        hints: { pro: "Reduces threat intensity.", con: "Impossible to hide." }
    },
    'Moss-Skin': {
        stats: { camouflage: 3, size: 0, agility: 1, speed: 0, venom: 0 },
        flags: ['forest_regen', 'photosynthesis'],
        description: "Living moss carpets its hide, harmonizing perfectly with lush environments.",
        strategy: "Sustainability. Heals slowly while in forest tiles.",
        hints: { pro: "Incredible forest stealth.", con: "Vulnerable to heat." }
    },
    'Riverblade': {
        stats: { agility: 3, speed: 1, size: 0, venom: 0, camouflage: 0 },
        flags: ['dash_bonus_in_moisture', 'hydrodynamic'],
        description: "Sleek and sharp-edged, its body cuts through water like a cold scalpel.",
        strategy: "River exploitation. Use water as a transit highway.",
        hints: { pro: "Supreme river speed.", con: "Dry soil chaffs." }
    }
};

export const INSTINCTS: Record<InstinctType, { bias: string; triggers: string[]; description: string; strategy: string; hints: { pro: string, con: string } }> = {
    'Cowardly Clever': {
        bias: 'avoids_combat',
        triggers: ['bonus_to_run', 'bonus_to_hide'],
        description: "Recognizes that survival is the only victory that matters.",
        strategy: "Extreme avoidance. High success chance when running or hiding.",
        hints: { pro: "Rarely dies early.", con: "Low glory and loot." }
    },
    'Bloodrush': {
        bias: 'seeks_enemy',
        triggers: ['combat_scaling', 'kill_frenzy'],
        description: "The scent of iron triggers a state of focused, lethal aggression.",
        strategy: "Aggressive snowball. Becomes stronger with every successful bite.",
        hints: { pro: "Unstoppable late game.", con: "Overextends easily." }
    },
    'Hoarder': {
        bias: 'seeks_treasure',
        triggers: ['treasure_synergy', 'item_finder'],
        description: "An obsessive drive to collect the glittering relics of previous versions.",
        strategy: "Wealth accumulation. Finds better items from treasure nodes.",
        hints: { pro: "Best equipped snakes.", con: "Easily distracted by gold." }
    },
    'Scout': {
        bias: 'explores_map',
        triggers: ['detection_radius', 'hazard_sense'],
        description: "Hyper-sensitive nerves map the environment far beyond visual range.",
        strategy: "Intelligence. Avoids hazards and finds food before others.",
        hints: { pro: "No blind spots.", con: "Not built for direct brawls." }
    },
    'Duelist': {
        bias: 'seeks_duel',
        triggers: ['1v1_bonus', 'honorable_strike'],
        description: "An instinct for single-target elimination and tactical positioning.",
        strategy: "Executioner. Massive bonus against isolated enemies.",
        hints: { pro: "Dominates 1v1 encounters.", con: "Fails vs swarms." }
    }
};

export const AFFINITIES: Record<AffinityType, { terrain: TerrainType | 'any'; bonuses: Partial<Stats>; moveCostMod: number; description: string; hints: { pro: string, con: string } }> = {
    'Sun-Touched': {
        terrain: 'desert',
        bonuses: { speed: 2, size: 1 },
        moveCostMod: -1,
        description: "Infused with solar energy; heat is a stimulant, not a burden.",
        hints: { pro: "Heat scaling.", con: "Lethargic in frost/rivers." }
    },
    'Mist-Bound': {
        terrain: 'river',
        bonuses: { camouflage: 3, agility: 1 },
        moveCostMod: -1,
        description: "Exudes a cold vapor that merges with the morning fog.",
        hints: { pro: "Stealth in moisture.", con: "Visible in bone-dry air." }
    },
    'Stone-Wise': {
        terrain: 'mountain',
        bonuses: { size: 2, agility: 0 },
        moveCostMod: -1,
        description: "The spirit of the high peaks resonates in its heavy, mineralized scales.",
        hints: { pro: "Hazard memory bonus.", con: "Cannot swim easily." }
    },
    'Storm-Hardened': {
        terrain: 'any',
        bonuses: { agility: 2, speed: 1 },
        moveCostMod: 0,
        description: "Tempered by the closing storm until the static is like a heartbeat.",
        hints: { pro: "Resists phase 2 storm.", con: "No biome-specific highs." }
    },
    'Void-Blessed': {
        terrain: 'any',
        bonuses: { camouflage: 2, venom: 2 },
        moveCostMod: 0,
        description: "Marked by the Glitch; its form flickers between logic and chaos.",
        hints: { pro: "Binary interaction bonus.", con: "Unpredictable HP jitter." }
    }
};

export const QUIRKS: Record<QuirkType, { bonuses: Partial<Stats>; behavior: string; penalty?: string; description: string; hints: { pro: string, con: string } }> = {
    'Anxious': {
        bonuses: { speed: 1, agility: 1 },
        behavior: 'faster_reaction',
        penalty: 'stamina_drain',
        description: "A twitchy coil of nerves that reacts before it thinks.",
        hints: { pro: "High evasion.", con: "Tires out quickly." }
    },
    'Reckless': {
        bonuses: { venom: 2 },
        behavior: 'more_crits',
        penalty: 'hazard_risk',
        description: "Disregards safety entirely for a single, devastating strike.",
        hints: { pro: "Critical hit specialist.", con: "Magnetic to hazards." }
    },
    'Lucky': {
        bonuses: {},
        behavior: 'auto_save',
        penalty: 'random_stat_drop',
        description: "Favored by the engine's random variable seed in critical moments.",
        hints: { pro: "Occasional auto-save.", con: "Unreliable base stats." }
    },
    'Dramatic': {
        bonuses: { agility: 1 },
        behavior: 'skill_gain_bonus',
        description: "Every action is a performance; the engine rewards its flair.",
        hints: { pro: "Faster skill unlocking.", con: "Attracts attention." }
    },
    'Curious': {
        bonuses: { camouflage: 1 },
        behavior: 'clue_discovery',
        description: "A drive to poke its head into every crack and shadow.",
        hints: { pro: "Clue discovery boost.", con: "Gets trapped often." }
    }
};
