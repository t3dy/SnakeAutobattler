import { Cell, TerrainType, EnvironmentParams } from './types';

export function generateWorld(
    params: EnvironmentParams = {
        climate: 'Standard', fauna: 'Standard', flora: 'Standard',
        mode: 'SOLO', theme: 'MEDIEVAL'
    },
    width: number = 16,
    height: number = 12
): Cell[][] {
    const world: Cell[][] = [];
    const terrainTypes: TerrainType[] = ['forest', 'desert', 'river', 'mountain'];

    // Weighted generation based on Climate
    const getWeightedTerrain = (): TerrainType => {
        const weights: Record<TerrainType, number> = {
            'forest': 1, 'desert': 1, 'river': 1, 'mountain': 1
        };

        if (params.climate === 'Tropical') {
            weights.river = 4;
            weights.forest = 3;
            weights.desert = 0.5;
        } else if (params.climate === 'Arid') {
            weights.desert = 5;
            weights.mountain = 2;
            weights.river = 0.2;
        } else if (params.climate === 'Alpine') {
            weights.mountain = 4;
            weights.river = 1;
            weights.forest = 2;
        }

        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight;
        for (const [t, w] of Object.entries(weights)) {
            if (r < w) return t as TerrainType;
            r -= w;
        }
        return 'forest';
    };

    // Pass 1: Weighted terrain
    for (let y = 0; y < height; y++) {
        const row: Cell[] = [];
        for (let x = 0; x < width; x++) {
            row.push({
                terrain: getWeightedTerrain(),
                food: null,
                hazard: null,
                x,
                y
            });
        }
        world.push(row);
    }

    // Pass 2: Smoothing
    for (let i = 0; i < 3; i++) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const neighbors = [];
                if (y > 0) neighbors.push(world[y - 1][x].terrain);
                if (y < height - 1) neighbors.push(world[y + 1][x].terrain);
                if (x > 0) neighbors.push(world[y][x - 1].terrain);
                if (x < width - 1) neighbors.push(world[y][x + 1].terrain);

                const counts: Record<string, number> = {};
                neighbors.forEach(t => counts[t] = (counts[t] || 0) + 1);
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                if (sorted.length > 0 && Math.random() > 0.4) {
                    world[y][x].terrain = sorted[0][0] as TerrainType;
                }
            }
        }
    }

    // Pass 3: Food & Hazards
    const foodChance = params.fauna === 'High' ? 0.08 : params.fauna === 'Sparse' ? 0.02 : 0.04;
    const floraMod = params.flora === 'Dense' ? 1.5 : params.flora === 'Barren' ? 0.5 : 1.0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = world[y][x];
            let currentFoodChance = foodChance;
            if (cell.terrain === 'forest') currentFoodChance *= floraMod;

            if (Math.random() < currentFoodChance) {
                cell.food = { kind: Math.random() > 0.5 ? '🍎' : '🐁', value: 15 };
            } else if (Math.random() < 0.08) {
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
