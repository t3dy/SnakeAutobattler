import { Cell, TerrainType } from './types';

export function generateWorld(width: number = 16, height: number = 12): Cell[][] {
    const world: Cell[][] = [];
    const terrainTypes: TerrainType[] = ['forest', 'desert', 'river', 'mountain'];

    // Pass 1: Random terrain
    for (let y = 0; y < height; y++) {
        const row: Cell[] = [];
        for (let x = 0; x < width; x++) {
            const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
            row.push({
                terrain,
                food: null,
                hazard: null,
                x,
                y
            });
        }
        world.push(row);
    }

    // Pass 2: Smoothing (simple cellular automata-ish)
    for (let i = 0; i < 2; i++) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const neighbors = [
                    world[y - 1][x].terrain,
                    world[y + 1][x].terrain,
                    world[y][x - 1].terrain,
                    world[y][x + 1].terrain
                ];
                const counts: Record<string, number> = {};
                neighbors.forEach(t => counts[t] = (counts[t] || 0) + 1);
                const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as TerrainType;
                if (Math.random() > 0.3) world[y][x].terrain = mostCommon;
            }
        }
    }

    // Pass 3: Food & Hazards
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = world[y][x];
            const rand = Math.random();
            if (rand < 0.05) {
                cell.food = { kind: Math.random() > 0.5 ? '🍎' : '🐁', value: 15 };
            } else if (rand < 0.10) {
                const hazards = [
                    { kind: '🪤', damage: 10 },
                    { kind: '🕳️', damage: 8 },
                    { kind: '🪨', damage: 12 }
                ];
                cell.hazard = hazards[Math.floor(Math.random() * hazards.length)];
            }
        }
    }

    return world;
}
