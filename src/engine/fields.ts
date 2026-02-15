import { Cell } from './types';

export function generateNoiseField(width: number, height: number, scale: number = 0.1): number[][] {
    const field: number[][] = [];
    const seed = Math.random();

    for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
            // Simple pseudo-random coherent noise
            const val = (Math.sin(x * scale + seed) + Math.cos(y * scale + seed) + 2) / 4;
            row.push(Math.max(0, Math.min(1, val)));
        }
        field.push(row);
    }
    return field;
}

export function sampleField(field: number[][], x: number, y: number): number {
    if (y < 0 || y >= field.length || x < 0 || x >= field[0].length) return 0;
    return field[y][x];
}

export function getTensionScore(cell: Cell): number {
    // Tension is the intersection of high moisture and high heat, or extreme hazards
    const { heat, moisture, elevation, storm } = cell.fields;
    return (heat * moisture) + storm + (elevation > 0.8 ? 0.3 : 0);
}
