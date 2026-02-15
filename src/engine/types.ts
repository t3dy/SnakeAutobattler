export type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0';
export type GameState = 'landing' | 'mode_select' | 'env_draft' | 'draft' | 'battle' | 'recap';
export type TerrainType = 'forest' | 'desert' | 'river' | 'mountain';
export type Mode = 'SOLO' | 'HOTSEAT_BATTLE' | 'HOTSEAT_COOP';
export type Theme = 'MEDIEVAL' | 'SCIFI';

// Restoring missing types needed by other files
export type BodyType = string;
export type InstinctType = string;
export type AffinityType = string;
export type QuirkType = string;

export interface EnvironmentParams {
    climate: string;
    fauna: string;
    flora: string;
    mode?: Mode;
    theme?: Theme;
}

export interface Cell {
    terrain: TerrainType;
    food: { kind: string, value: number } | null;
    hazard: { kind: string, damage: number } | null;
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

export interface SnakeDraft {
    body: string;
    instinct: string;
    affinity: string;
    quirk: string;
}

export interface SnakeState {
    id: string;
    name: string;
    team: 'player' | 'enemy';
    hp: number;
    maxHp: number;
    pos: { x: number, y: number };
    draft: SnakeDraft;
    baseStats: Stats;
    currentStats: Stats;
    aiState: 'searching' | 'attacking' | 'fleeing' | 'eating' | 'hunting';
    alive: boolean;
    inventory: string[];
    statuses: string[];
    flags: NarrativeFlag[];
    memory: {
        hazards: { x: number, y: number }[];
        food: { x: number, y: number }[];
        enemies: string[];
    };
    evolution: Record<string, number>;
    experience: number;
    honor: number;
    gear: string[];
    scavengeProfit: number;
}

export type EventType =
    | 'MOVE' | 'ATTACK' | 'DAMAGE' | 'KO' | 'FOOD_EAT' | 'HAZARD_HIT'
    | 'BATTLE_START' | 'BATTLE_END' | 'STORM_ADVANCE' | 'COMBAT_START' | 'COMBAT_EXCHANGE' | 'COMBAT_END' | 'TURNING_POINT' | 'ENTER_TILE' | 'COMBAT_TICK'
    | 'SACRIFICE' | 'FEAT_ACCOMPLISHED' | 'LEVEL_UP' | 'GEAR_EQUIP' | 'ENCOUNTER_CHOICE' | 'ENCOUNTER_RESULT' | 'PHASE_SHIFT';

export interface GameEvent {
    id: string;
    tick: number;
    snakeId: string;
    type: EventType;
    pos: { x: number, y: number };
    terrain: TerrainType;
    targetId?: string;
    amount?: number;
    tags: string[];
    snapshot: {
        hp: number;
        effectiveStats: Stats;
        aiState: string;
        flags: NarrativeFlag[];
    };
}

export type NarrativeFlag = 'WOUNDED' | 'DOMINANT' | 'WELL_FED' | 'DESPERATE' | 'HEROIC';
