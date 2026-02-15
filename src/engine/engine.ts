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
        mode: 'SOLO', theme: 'MEDIEVAL'
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
    const baseStats: Stats = {
        speed: BODIES[draft.body].stats.speed + INSTINCTS[draft.instinct].stats.speed,
        size: BODIES[draft.body].stats.size + AFFINITIES[draft.affinity].stats.size,
        venom: INSTINCTS[draft.instinct].stats.venom + QUIRKS[draft.quirk].stats.venom,
        agility: AFFINITIES[draft.affinity].stats.agility + BODIES[draft.body].stats.agility,
        camouflage: QUIRKS[draft.quirk].stats.camouflage + AFFINITIES[draft.affinity].stats.camouflage
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
        storyHistory: []
    }
}
