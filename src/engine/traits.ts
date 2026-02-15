import {
    BodyType, InstinctType, AffinityType, QuirkType, Stats, TerrainType
} from './types';

export const BODIES: Record<BodyType, { stats: Partial<Stats>; flags: string[] }> = {
    'Boulderback Constrictor': {
        stats: { size: 3, speed: -2, agility: 0, venom: 0, camouflage: 0 },
        flags: ['hazard_resist', 'close_quarters', 'avoids_open']
    },
    'Shadow Striker': {
        stats: { venom: 3, camouflage: 2, size: -1, speed: 0, agility: 0 },
        flags: ['ambush_from_cover', 'disengage_outnumbered']
    },
    'Dune Sprinter': {
        stats: { speed: 3, agility: 2, size: -2, venom: 0, camouflage: 0 },
        flags: ['forage_priority', 'hit_and_run']
    },
    'River Glider': {
        stats: { agility: 3, speed: 1, venom: -1, size: 0, camouflage: 0 },
        flags: ['water_bonus', 'obstacle_bypass']
    }
};

export const INSTINCTS: Record<InstinctType, { bias: string; triggers: string[] }> = {
    'Hunter': {
        bias: 'seeks_enemy',
        triggers: ['combat_seek', 'pursue_advantage']
    },
    'Scavenger': {
        bias: 'seeks_food',
        triggers: ['food_seek', 'avoid_combat']
    },
    'Territorial': {
        bias: 'claims_region',
        triggers: ['patrol_zone', 'defend_zone']
    },
    'Opportunist': {
        bias: 'avoids_risk',
        triggers: ['evaluate_advantage', 'ambush_seek']
    }
};

export const AFFINITIES: Record<AffinityType, { terrain: TerrainType; bonuses: Partial<Stats>; moveCostMod: number }> = {
    'Forest-Bonded': {
        terrain: 'forest',
        bonuses: { camouflage: 2, agility: 1 },
        moveCostMod: -1
    },
    'Desert-Born': {
        terrain: 'desert',
        bonuses: { speed: 2, size: 0 },
        moveCostMod: -1
    },
    'River-Blooded': {
        terrain: 'river',
        bonuses: { agility: 2 },
        moveCostMod: -2
    },
    'Stone-Scaled': {
        terrain: 'mountain',
        bonuses: { size: 2, camouflage: 0 },
        moveCostMod: -1
    }
};

export const QUIRKS: Record<QuirkType, { bonuses: Partial<Stats>; behavior: string; penalty?: string }> = {
    'Reckless': {
        bonuses: { venom: 1 },
        behavior: 'paths_through_hazards',
        penalty: 'hazard_damage_2x'
    },
    'Cautious': {
        bonuses: { agility: 1 },
        behavior: 'strongly_avoids_hazards',
        penalty: 'speed_-1'
    },
    'Voracious': {
        bonuses: {},
        behavior: 'seeks_food_aggressively',
        penalty: 'feeding_delay'
    },
    'Paranoid': {
        bonuses: { agility: 1 },
        behavior: 'retreats_sooner',
        penalty: 'camouflage_-1'
    }
};
