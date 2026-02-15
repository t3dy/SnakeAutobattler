import { generateWorld } from './world';
import { Simulation } from './sim';
import { generateNarrative } from './narrate';
import { SnakeDraft, SnakeState, Stats, EnvironmentParams } from './types';
import { BODIES, AFFINITIES, QUIRKS } from './traits';

export function runBattle(
    playerTeam: SnakeDraft[],
    enemyTeam: SnakeDraft[],
    envParams: EnvironmentParams = { climate: 'Standard', fauna: 'Standard', flora: 'Standard' }
) {
    const world = generateWorld(envParams);
    const snakes: SnakeState[] = [
        ...playerTeam.map((d, i) => createSnake(d, `PlayerSnake_${i}`, 'player', { x: 0, y: Math.floor(i * 4) })),
        ...enemyTeam.map((d, i) => createSnake(d, `EnemySnake_${i}`, 'enemy', { x: 15, y: Math.floor(i * 4) }))
    ];

    const sim = new Simulation(world, snakes, envParams);
    const events = sim.run();

    return {
        world,
        events,
        narrative: generateNarrative(events, snakes),
        snakes
    };
}

function createSnake(draft: SnakeDraft, name: string, team: 'player' | 'enemy', pos: { x: number, y: number }): SnakeState {
    const baseStats: Stats = { speed: 5, size: 5, venom: 5, agility: 5, camouflage: 5 };

    // Apply trait modifiers
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
        evolution: {
            speed: 0,
            size: 0,
            venom: 0,
            agility: 0,
            camouflage: 0
        }
    };
}
