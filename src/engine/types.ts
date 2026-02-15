export type TerrainType = 'forest' | 'desert' | 'river' | 'mountain';

export type Climate = 'Tropical' | 'Arid' | 'Alpine' | 'Standard';
export type Density = 'High' | 'Sparse' | 'Standard';

export interface EnvironmentParams {
    climate: Climate;
    fauna: Density; // Food density
    flora: Density; // Forest density
}

export interface Cell {
    terrain: TerrainType;
    food: { kind: string; value: number } | null;
    hazard: { kind: string; damage: number } | null;
    x: number;
    y: number;
}

export interface Stats {
    speed: number;
    size: number;
    venom: number;
    agility: number;
    camouflage: number;
}

export type BodyType = 'Boulderback Constrictor' | 'Shadow Striker' | 'Dune Sprinter' | 'River Glider';
export type InstinctType = 'Hunter' | 'Scavenger' | 'Territorial' | 'Opportunist';
export type AffinityType = 'Forest-Bonded' | 'Desert-Born' | 'River-Blooded' | 'Stone-Scaled';
export type QuirkType = 'Reckless' | 'Cautious' | 'Voracious' | 'Paranoid';

export interface SnakeDraft {
    body: BodyType;
    instinct: InstinctType;
    affinity: AffinityType;
    quirk: QuirkType;
}

export type NarrativeFlag = 'WOUNDED' | 'DOMINANT' | 'PANICKED' | 'WELL_FED' | 'SCARRED';

export interface SnakeState {
    id: string;
    name: string;
    team: 'player' | 'enemy';
    hp: number;
    maxHp: number;
    pos: { x: number; y: number };
    draft: SnakeDraft;
    baseStats: Stats;
    currentStats: Stats;
    aiState: 'searching' | 'engaging' | 'retreating' | 'patrolling' | 'feeding';
    alive: boolean;
    inventory: any[];
    statuses: string[];
    flags: NarrativeFlag[];
    memory: {
        hazards: { x: number; y: number }[];
        food: { x: number; y: number }[];
        enemies: { x: number; y: number }[];
    };
    evolution: Partial<Stats>;
}

export type EventType =
    | 'MOVE' | 'ENTER_TILE' | 'FOOD_FOUND' | 'FOOD_EAT'
    | 'HAZARD_SPOTTED' | 'HAZARD_HIT' | 'COMBAT_START'
    | 'COMBAT_EXCHANGE' | 'TURNING_POINT' | 'COMBAT_END' | 'RETREAT' | 'KO'
    | 'STATUS_GAIN' | 'STATUS_LOSE' | 'CLAIM_TERRITORY'
    | 'PATROL' | 'AMBUSH' | 'DISCOVER' | 'TRACKING' | 'BATTLE_END'
    | 'STORM_ADVANCE';

export interface GameEvent {
    id: string;
    tick: number;
    snakeId: string;
    type: EventType;
    pos: { x: number; y: number };
    terrain: TerrainType;
    targetId?: string | null;
    amount?: number | null;
    tags: string[];
    snapshot: {
        hp: number;
        effectiveStats: Stats;
        aiState: string;
        flags: NarrativeFlag[];
    };
}
