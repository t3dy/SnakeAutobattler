export type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0' | 'v6.0' | 'v7.0' | 'v8.0';
export type GameState = 'landing' | 'mode_select' | 'env_draft' | 'draft' | 'battle' | 'recap';
export type TerrainType = 'forest' | 'desert' | 'river' | 'mountain';
export type Mode = 'SOLO' | 'HOTSEAT_BATTLE' | 'HOTSEAT_COOP';
export type Theme = 'MEDIEVAL' | 'SCIFI';

export type BodyType = string;
export type InstinctType = string;
export type AffinityType = string;
export type QuirkType = string;

export interface EnvironmentParams {
    climate: 'Standard' | 'Arid' | 'Lush' | 'Binary';
    fauna: 'Standard' | 'Hostile' | 'Sparse' | 'Swarm';
    flora: 'Standard' | 'Dense' | 'None' | 'Obsidian';
    mode: Mode;
    theme: Theme;
    version?: EngineVersion;
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
    storyHistory: string[];
}

export type EventType =
    | 'MOVE' | 'ATTACK' | 'DAMAGE' | 'KO' | 'FOOD_EAT' | 'HAZARD_HIT'
    | 'BATTLE_START' | 'BATTLE_END' | 'STORM_ADVANCE' | 'COMBAT_START' | 'COMBAT_EXCHANGE' | 'COMBAT_END' | 'TURNING_POINT' | 'ENTER_TILE' | 'COMBAT_TICK'
    | 'SACRIFICE' | 'FEAT_ACCOMPLISHED' | 'LEVEL_UP' | 'GEAR_EQUIP' | 'ENCOUNTER_CHOICE' | 'ENCOUNTER_RESULT' | 'PHASE_SHIFT'
    | 'PENDING_CHOICE' | 'CHOICE_MADE' | 'CASCADE_START' | 'BEHAVIOR_SHIFT';

export type CauseType = 'STORM' | 'TERRAIN' | 'HAZARD' | 'COMBAT' | 'NONE';
export type ResolveOutcome = 'RUN' | 'HIDE' | 'FIGHT';

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
        resolve?: number;
    };
    cause?: CauseType;
}

export type NarrativeFlag = 'WOUNDED' | 'DOMINANT' | 'WELL_FED' | 'DESPERATE' | 'HEROIC' | 'SCARRED';
