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
    for (let y = 0; y < height; y++) {
        const row: Cell[] = [];
        for (let x = 0; x < width; x++) {
            const heat = sampleField(heatField, x, y);
            const moisture = sampleField(moistureField, x, y);
            const elevation = sampleField(elevationField, x, y);
            const hazardDensity = sampleField(hazardDensityField, x, y);

            let terrain: TerrainType = 'forest';
            if (elevation > 0.7) terrain = 'mountain';
            else if (moisture > 0.7) terrain = 'river';
            else if (heat > 0.6 && moisture < 0.3) terrain = 'desert';

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

    // Phase 3: Populate Goods & Hazards (Genre-biased)
    const foodRate = genreDef.specialRules.spawnFoodRate;
    const hazardRate = genreDef.specialRules.spawnHazardRate;
    const treasureRate = genreDef.specialRules.treasureRate;

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
                if (params.genre === 'SLAPSTICK') hazards.push({ kind: '🍌', damage: 5 }); // Banana peel
                if (params.genre === 'SPY') hazards.push({ kind: '🚨', damage: 15 }); // Laser alarm

                cell.hazard = hazards[Math.floor(Math.random() * hazards.length)];
            }

            // Treasure spawning (v11/v12 Exclusive)
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
