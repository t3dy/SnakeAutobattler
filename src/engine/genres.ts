import { Genre, Stats } from './types';

export interface GenreDefinition {
    id: Genre;
    vfx: string[];
    statModifiers: Partial<Stats>;
    mechanicalTwist: string;
    specialRules: {
        spawnFoodRate: number;
        spawnHazardRate: number;
        treasureRate: number;
        gravityMod: number;
    };
    proseStyle: string;
}

export const GENRES: Record<Genre, GenreDefinition> = {
    SLAPSTICK: {
        id: 'SLAPSTICK',
        vfx: ['bonk', 'confetti', 'stars'],
        statModifiers: { speed: 1, agility: 2 },
        mechanicalTwist: 'High-variance sliding movement. Combat deals knockback instead of bite damage.',
        specialRules: {
            spawnFoodRate: 1.2,
            spawnHazardRate: 1.5, // Lots of rakes/bananas
            treasureRate: 1.0,
            gravityMod: 1.0
        },
        proseStyle: 'Slapstick Comedy'
    },
    ZOMBIE: {
        id: 'ZOMBIE',
        vfx: ['ichor', 'flicker', 'fog'],
        statModifiers: { size: 1, speed: -1, agility: -2 },
        mechanicalTwist: 'Infection logic. Fallen snakes rise again. Scarcity of resources.',
        specialRules: {
            spawnFoodRate: 0.3, // Scarcity
            spawnHazardRate: 2.0,
            treasureRate: 0.8,
            gravityMod: 1.0
        },
        proseStyle: 'Survival Horror'
    },
    NOIR: {
        id: 'NOIR',
        vfx: ['rain', 'shadows', 'smoke'],
        statModifiers: { camouflage: 3, agility: 1 },
        mechanicalTwist: 'Insight points. Clue-hunting grants damage boosts.',
        specialRules: {
            spawnFoodRate: 1.0,
            spawnHazardRate: 1.0,
            treasureRate: 1.2,
            gravityMod: 1.0
        },
        proseStyle: 'Detective Noir'
    },
    SPY: {
        id: 'SPY',
        vfx: ['data', 'scanned', 'laser'],
        statModifiers: { speed: 2, camouflage: 1 },
        mechanicalTwist: 'Hacking terminals to trigger map traps. Security level increases.',
        specialRules: {
            spawnFoodRate: 1.0,
            spawnHazardRate: 1.5,
            treasureRate: 1.5, // Gadgets/terminas
            gravityMod: 1.0
        },
        proseStyle: 'Techno-Intrigue'
    },
    ALIEN: {
        id: 'ALIEN',
        vfx: ['void', 'neon', 'warp'],
        statModifiers: { venom: 3, agility: 3 },
        mechanicalTwist: 'Low gravity. Jumping moves 3 tiles. Genetic mutations grant random traits.',
        specialRules: {
            spawnFoodRate: 1.0,
            spawnHazardRate: 1.0,
            treasureRate: 1.0,
            gravityMod: 0.3 // Low Gravity
        },
        proseStyle: 'Cosmic Horror'
    }
};
