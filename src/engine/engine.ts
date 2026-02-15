import { SnakeState, SnakeDraft, Stats, EnvironmentParams } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';
import { generateWorld } from './world';
import { Simulation } from './sim';
import { generateNarrative } from './narrate';

export function runBattle(
    playerDrafts: SnakeDraft[],
    enemyDrafts: SnakeDraft[],
    params: EnvironmentParams = {
        climate: 'Standard', fauna: 'Standard', flora: 'Standard',
        mode: 'SOLO', theme: 'MEDIEVAL', phase: 1, genre: 'NOIR'
    }
) {
    const world = generateWorld(params);
    const snakes: SnakeState[] = [
        ...playerDrafts.map((d, i) => createSnake(`Blue-${i}`, 'player', d, i)),
        ...enemyDrafts.map((d, i) => createSnake(`Red-${i}`, 'enemy', d, i))
    ];

    const sim = new Simulation(world, snakes, params);
    const events = sim.run();

    return {
        world,
        events,
        narrative: generateNarrative(events, snakes, params),
        snakes,
        sim
    };
}

function createSnake(name: string, team: 'player' | 'enemy', draft: SnakeDraft, index: number): SnakeState {
    const bodyStats = BODIES[draft.body].stats;
    const affinityBonuses = AFFINITIES[draft.affinity].bonuses;
    const quirkBonuses = QUIRKS[draft.quirk].bonuses;

    const baseStats: Stats = {
        speed: (bodyStats.speed || 0) + (affinityBonuses.speed || 0) + (quirkBonuses.speed || 0),
        size: (bodyStats.size || 0) + (affinityBonuses.size || 0) + (quirkBonuses.size || 0),
        venom: (bodyStats.venom || 0) + (affinityBonuses.venom || 0) + (quirkBonuses.venom || 0),
        agility: (bodyStats.agility || 0) + (affinityBonuses.agility || 0) + (quirkBonuses.agility || 0),
        camouflage: (bodyStats.camouflage || 0) + (affinityBonuses.camouflage || 0) + (quirkBonuses.camouflage || 0)
    };

    return {
        id: `${team}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        team,
        hp: 100,
        maxHp: 100,
        pos: { x: index * 2 + 2, y: team === 'player' ? 2 : 10 },
        draft,
        baseStats,
        currentStats: { ...baseStats },
        aiState: 'searching',
        alive: true,
        inventory: [],
        statuses: [],
        flags: [],
        memory: { hazards: [], food: [], enemies: [] },
        evolution: {},
        experience: 0,
        honor: 0,
        gear: [],
        scavengeProfit: 0,
        storyHistory: [],
        skills: []
    }
}
