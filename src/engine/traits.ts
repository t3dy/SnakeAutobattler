import {
    BodyType, InstinctType, AffinityType, QuirkType, Stats, TerrainType
} from './types';

export const BODIES: Record<BodyType, { stats: Partial<Stats>; flags: string[]; description: string }> = {
    'Boulderback Constrictor': {
        stats: { size: 3, speed: -2, agility: 0, venom: 0, camouflage: 0 },
        flags: ['hazard_resist', 'close_quarters', 'avoids_open'],
        description: "A massive, thick-scaled powerhouse designed to crush everything in its path."
    },
    'Shadow Striker': {
        stats: { venom: 3, camouflage: 2, size: -1, speed: 0, agility: 0 },
        flags: ['ambush_from_cover', 'disengage_outnumbered'],
        description: "A slender, darkened hunter that vanishes into the shadows before a lethal strike."
    },
    'Dune Sprinter': {
        stats: { speed: 3, agility: 2, size: -2, venom: 0, camouflage: 0 },
        flags: ['forage_priority', 'hit_and_run'],
        description: "A lightning-fast specialized scout that relies on evasion and rapid movement."
    },
    'River Glider': {
        stats: { agility: 3, speed: 1, venom: -1, size: 0, camouflage: 0 },
        flags: ['water_bonus', 'obstacle_bypass'],
        description: "A sleek, aquatic-adapted predator that moves through currents with effortless grace."
    }
};

export const INSTINCTS: Record<InstinctType, { bias: string; triggers: string[]; description: string }> = {
    'Hunter': {
        bias: 'seeks_enemy',
        triggers: ['combat_seek', 'pursue_advantage'],
        description: "Driven by the thrill of the chase, seeking out rivals at any cost."
    },
    'Scavenger': {
        bias: 'seeks_food',
        triggers: ['food_seek', 'avoid_combat'],
        description: "A survivalist focused on replenishment and avoiding unnecessary strife."
    },
    'Territorial': {
        bias: 'claims_region',
        triggers: ['patrol_zone', 'defend_zone'],
        description: "A stoic defender that establishes control over its chosen domain."
    },
    'Opportunist': {
        bias: 'avoids_risk',
        triggers: ['evaluate_advantage', 'ambush_seek'],
        description: "A clever strategist that only strikes when the odds are in its favor."
    }
};

export const AFFINITIES: Record<AffinityType, { terrain: TerrainType; bonuses: Partial<Stats>; moveCostMod: number; description: string }> = {
    'Forest-Bonded': {
        terrain: 'forest',
        bonuses: { camouflage: 2, agility: 1 },
        moveCostMod: -1,
        description: "Deeply attuned to the whispering leaves and tangled roots of the woods."
    },
    'Desert-Born': {
        terrain: 'desert',
        bonuses: { speed: 2, size: 0 },
        moveCostMod: -1,
        description: "Hardened by the shifting dunes and the relentless, searing heat."
    },
    'River-Blooded': {
        terrain: 'river',
        bonuses: { agility: 2 },
        moveCostMod: -2,
        description: "Connected to the pulse of the water, moving as fluidly as the tides."
    },
    'Stone-Scaled': {
        terrain: 'mountain',
        bonuses: { size: 2, camouflage: 0 },
        moveCostMod: -1,
        description: "Built of the same unyielding granite as the peaks it calls home."
    }
};

export const QUIRKS: Record<QuirkType, { bonuses: Partial<Stats>; behavior: string; penalty?: string; description: string }> = {
    'Reckless': {
        bonuses: { venom: 1 },
        behavior: 'paths_through_hazards',
        penalty: 'hazard_damage_2x',
        description: "Possesses a dangerous disregard for personal safety in pursuit of results."
    },
    'Cautious': {
        bonuses: { agility: 1 },
        behavior: 'strongly_avoids_hazards',
        penalty: 'speed_-1',
        description: "Obsessively calculating, prioritizing safety above all else."
    },
    'Voracious': {
        bonuses: {},
        behavior: 'seeks_food_aggressively',
        penalty: 'feeding_delay',
        description: "Possessed by an unending hunger that overrides all other logic."
    },
    'Paranoid': {
        bonuses: { agility: 1 },
        behavior: 'retreats_sooner',
        penalty: 'camouflage_-1',
        description: "Sees danger in every shadow, always ready to bolt at a moment's notice."
    }
};
