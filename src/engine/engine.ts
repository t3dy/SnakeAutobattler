import { generateWorld } from './world';
import { Simulation } from './sim';
import { generateNarrative } from './narrate';
import { SnakeDraft, SnakeState, Stats } from './types';
import { BODIES, AFFINITIES, QUIRKS } from './traits';

export function runBattle(playerTeam: SnakeDraft[], enemyTeam: SnakeDraft[]) {
    const world = generateWorld();
    const snakes: SnakeState[] = [
        ...playerTeam.map((d, i) => createSnake(d, `PlayerSnake_${i}`, 'player', { x: 0, y: Math.floor(i * 4) })),
        ...enemyTeam.map((d, i) => createSnake(d, `EnemySnake_${i}`, 'enemy', { x: 15, y: Math.floor(i * 4) }))
    ];

    const sim = new Simulation(world, snakes);
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
        statuses: []
    };
}
