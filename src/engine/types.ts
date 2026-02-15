export type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0' | 'v6.0' | 'v7.0' | 'v8.0' | 'v10.0' | 'v11.0' | 'v12.0' | 'v13.0';

export enum GameStage {
    Draft = 'DRAFT',
    Simulation = 'SIMULATION',
    CinematicEncounter = 'CINEMATIC_ENCOUNTER',
    PhaseTransition = 'PHASE_TRANSITION',
    ExpeditionSummary = 'EXPEDITION_SUMMARY'
}

export type GameState = 'landing' | 'mode_select' | 'genre_select' | 'env_draft' | 'draft' | 'battle' | 'recap' | 'ledger' | 'pre_phase' | 'cinematic_video' | 'radiant_toy' | 'hall_of_designers' | 'resonance_tuner' | 'genre_flux';
export type TerrainType = 'forest' | 'desert' | 'river' | 'mountain';
export type Mode = 'SOLO' | 'HOTSEAT_BATTLE' | 'HOTSEAT_COOP' | 'TREASURE_EXPEDITION';
export type Theme = 'MEDIEVAL' | 'SCIFI';
export type Genre = 'SLAPSTICK' | 'ZOMBIE' | 'NOIR' | 'SPY' | 'ALIEN';

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
    genre: Genre;
    version?: EngineVersion;
    phase: number;
    seed?: number;
}

export interface Cell {
    x: number;
    y: number;
    terrain: TerrainType;
    hazard: { kind: string, damage: number } | null;
    food: { kind: string, value: number } | null;
    treasure?: Treasure | null;
    fields: {
        heat: number;
        moisture: number;
        elevation: number;
        storm: number;
    };
}

export interface Treasure {
    id: string;
    type: 'Relic' | 'Grimoire' | 'Artifact';
    name: string;
    depth: number; // 0-1, higher = longer to dig
    value: number;
    item?: Item;
}

export interface Encounter {
    snakeId: string;
    threatType: 'HAZARD' | 'COMBAT' | 'MYSTERY' | 'TREASURE';
    threatIntensity: number; // 0-100
    terrainContext: TerrainType;
    hazardModifiers: string[];
    resolutionFormula: string; // Dynamic hint for Skald
}

export interface Item {
    name: string;
    effect: string;
    traitBonus?: Partial<Stats>;
    skillUnlock?: string;
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
    name?: string; // v13.0 User Identity
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
    skills: string[];
}

export type EventType =
    | 'MOVE' | 'ATTACK' | 'DAMAGE' | 'KO' | 'FOOD_EAT' | 'HAZARD_HIT'
    | 'BATTLE_START' | 'BATTLE_END' | 'STORM_ADVANCE' | 'COMBAT_START' | 'COMBAT_EXCHANGE' | 'COMBAT_END' | 'TURNING_POINT' | 'ENTER_TILE' | 'COMBAT_TICK'
    | 'SACRIFICE' | 'FEAT_ACCOMPLISHED' | 'LEVEL_UP' | 'GEAR_EQUIP' | 'ENCOUNTER_CHOICE' | 'ENCOUNTER_RESULT' | 'PHASE_SHIFT'
    | 'PENDING_CHOICE' | 'CHOICE_MADE' | 'CASCADE_START' | 'BEHAVIOR_SHIFT'
    | 'SYSTEM_RESONANCE' | 'GENRE_BLEED' | 'RADIANCE_FLUX';

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
