import { Cell, TerrainType, EnvironmentParams, Genre } from './types';
import { generateNoiseField, sampleField } from './fields';
import { GENRES } from './genres';

export function generateWorld(
    params: EnvironmentParams = {
        climate: 'Standard', fauna: 'Standard', flora: 'Standard',
        mode: 'SOLO', theme: 'MEDIEVAL', phase: 1, genre: 'NOIR'
    },
    width: number = 16,
    height: number = 12
): Cell[][] {
    const world: Cell[][] = [];
    const genreDef = GENRES[params.genre || 'NOIR'];

    // Phase 1: Generate Noise Fields
    const heatField = generateNoiseField(width, height, 0.2);
    const moistureField = generateNoiseField(width, height, 0.2);
    const elevationField = generateNoiseField(width, height, 0.15);
    const hazardDensityField = generateNoiseField(width, height, 0.3);

    // Phase 2: Derive Terrain from Fields
    const climateBias = params.climate === 'Arid' ? 0.2 : params.climate === 'Lush' ? -0.2 : 0;
    const moistureThreshold = 0.7 + climateBias;
    const heatThreshold = 0.6 - climateBias;

    for (let y = 0; y < height; y++) {
        const row: Cell[] = [];
        for (let x = 0; x < width; x++) {
            const heat = sampleField(heatField, x, y);
            const moisture = sampleField(moistureField, x, y);
            const elevation = sampleField(elevationField, x, y);

            let terrain: TerrainType = 'forest';
            if (elevation > 0.7) terrain = 'mountain';
            else if (moisture > moistureThreshold) terrain = 'river';
            else if (heat > heatThreshold && moisture < 0.3) terrain = 'desert';

            row.push({
                x, y,
                terrain,
                food: null,
                hazard: null,
                treasure: null,
                fields: {
                    heat,
                    moisture,
                    elevation,
                    storm: 0
                }
            });
        }
        world.push(row);
    }

    // Phase 3: Populate Goods & Hazards (Genre & Params-biased)
    const foodRate = (genreDef.specialRules.spawnFoodRate || 1) * (params.flora === 'Dense' ? 2 : params.flora === 'None' ? 0.2 : 1);
    const hazardRate = (genreDef.specialRules.spawnHazardRate || 1) * (params.fauna === 'Hostile' ? 2 : params.fauna === 'Sparse' ? 0.5 : 1);
    const treasureRate = genreDef.specialRules.treasureRate || 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = world[y][x];
            const hazardDensity = sampleField(hazardDensityField, x, y);

            // Food spawning
            if (Math.random() < 0.05 * foodRate && !cell.hazard) {
                cell.food = { kind: Math.random() > 0.5 ? '🍎' : '🐁', value: 15 };
            }

            // Hazard spawning
            if (Math.random() < 0.08 * hazardRate * hazardDensity && !cell.food) {
                const hazards = [
                    { kind: '🪤', damage: 10 },
                    { kind: '🕳️', damage: 8 },
                    { kind: '🪨', damage: 12 }
                ];
                if (params.genre === 'SLAPSTICK') hazards.push({ kind: '🍌', damage: 5 });
                if (params.genre === 'SPY') hazards.push({ kind: '🚨', damage: 15 });

                cell.hazard = hazards[Math.floor(Math.random() * hazards.length)];
            }

            // Treasure spawning
            if (Math.random() < 0.03 * treasureRate && !cell.food && !cell.hazard) {
                cell.treasure = {
                    id: `tr-${Math.random().toString(36).substr(2, 5)}`,
                    type: Math.random() > 0.8 ? 'Artifact' : 'Relic',
                    name: params.genre === 'NOIR' ? 'Lost File' : 'Golden Idol',
                    depth: 0.3 + Math.random() * 0.7,
                    value: 100
                };
            }
        }
    }

    return world;
}
