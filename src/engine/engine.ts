import { generateWorld } from './world';
import { Simulation } from './sim';
import { generateNarrative } from './narrate';
import { SnakeDraft, SnakeState, Stats, EnvironmentParams } from './types';
import { BODIES, AFFINITIES, QUIRKS } from './traits';

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
        ...playerDrafts.map((d, i) => createSnake(d, `PlayerSnake_${i}`, 'player', { x: 0, y: Math.floor(i * 4) })),
        ...enemyDrafts.map((d, i) => createSnake(d, `EnemySnake_${i}`, 'enemy', { x: 15, y: Math.floor(i * 4) }))
    ];

    const sim = new Simulation(world, snakes, params);
    const events = sim.run();

    return {
        world,
        events,
        narrative: generateNarrative(events, snakes, params),
        snakes,
        sim // Exposing sim to App.tsx for choice interaction
    };
}

function createSnake(draft: SnakeDraft, name: string, team: 'player' | 'enemy', pos: { x: number, y: number }): SnakeState {
    const baseStats: Stats = { speed: 5, size: 5, venom: 5, agility: 5, camouflage: 5 };

    const body = BODIES[draft.body];
    const affinity = AFFINITIES[draft.affinity];
    const quirk = QUIRKS[draft.quirk];

    const combinedStats = { ...baseStats };
    const apply = (mod: Partial<Stats>) => {
        Object.entries(mod).forEach(([k, v]) => (combinedStats[k as keyof Stats] += v!));
    };

    apply(body.stats);
    apply(affinity.bonuses);
    apply(quirk.bonuses);

    return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        team,
        hp: 100,
        maxHp: 100,
        pos,
        draft,
        baseStats: combinedStats,
        currentStats: { ...combinedStats },
        aiState: 'searching',
        alive: true,
        inventory: [],
        statuses: [],
        flags: [],
        memory: {
            hazards: [],
            food: [],
            enemies: []
        },
        evolution: {},
        experience: 0,
        honor: 0,
        gear: [],
        scavengeProfit: 0
    };
}
