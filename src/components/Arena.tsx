import React, { useMemo } from 'react';
import { Cell, GameEvent, SnakeState, EnvironmentParams, Theme } from '../engine/types';

interface ArenaProps {
    world: Cell[][];
    events: GameEvent[];
    currentTick: number;
    snakes: SnakeState[];
    params?: EnvironmentParams;
}

const Arena: React.FC<ArenaProps> = ({ world, events, currentTick, snakes, params }) => {
    const isV5 = params?.mode !== undefined;

    const grid = useMemo(() => {
        // 1. Calculate revealed tiles (Fog of War)
        const revealed = new Set<string>();
        if (isV5) {
            snakes.forEach(snake => {
                const snakeEvents = events.filter(e => e.snakeId === snake.id && e.tick <= currentTick);
                // In v5, we reveal tiles we've visited
                snakeEvents.forEach(e => {
                    if (e.pos) revealed.add(`${e.pos.x},${e.pos.y}`);
                });
                // Also reveal current position surroundings
                const lastMove = [...snakeEvents].reverse().find(e => e.type === 'MOVE' || e.type === 'ENTER_TILE');
                const pos = lastMove ? lastMove.pos : snake.pos;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        revealed.add(`${pos.x + dx},${pos.y + dy}`);
                    }
                }
            });
        }

        // 2. Build the display grid
        const displayGrid = world.map((row, y) => row.map((cell, x) => {
            const isRevealed = !isV5 || revealed.has(`${x},${y}`);
            const baseEmoji = getTerrainEmoji(cell.terrain, params?.theme || 'MEDIEVAL');

            // Minesweeper Hint
            let hint = null;
            if (isV5 && isRevealed && !cell.hazard && !cell.food) {
                let hazardCount = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (world[ny]?.[nx]?.hazard) hazardCount++;
                    }
                }
                if (hazardCount > 0) hint = hazardCount.toString();
            }

            return {
                ...cell,
                isRevealed,
                hint,
                emoji: isRevealed ? (cell.food?.kind || cell.hazard?.kind || baseEmoji) : '🌫️',
                overlay: null as string | null,
                snakeId: null as string | null,
            };
        }));

        // 3. Place snakes and overlays
        snakes.forEach(snake => {
            const snakeEvents = events.filter(e => e.snakeId === snake.id && e.tick <= currentTick);
            const lastMove = [...snakeEvents].reverse().find(e => e.type === 'MOVE' || e.type === 'ENTER_TILE');

            const pos = lastMove ? lastMove.pos : snake.pos;
            const isAlive = !snakeEvents.some(e => e.type === 'KO');

            if (isAlive && pos.y >= 0 && pos.y < displayGrid.length && pos.x >= 0 && pos.x < displayGrid[0].length) {
                const teamSymbol = params?.theme === 'SCIFI' ? (snake.team === 'player' ? '🛸' : '👽') : (snake.team === 'player' ? '🛡️' : '👹');
                displayGrid[pos.y][pos.x].emoji = teamSymbol;
                displayGrid[pos.y][pos.x].snakeId = snake.id;
            }

            const tickEvents = events.filter(e => e.tick === currentTick && e.snakeId === snake.id);
            tickEvents.forEach(e => {
                if (e.type === 'COMBAT_START' || e.type === 'HAZARD_HIT') {
                    displayGrid[e.pos.y][e.pos.x].overlay = '💥';
                }
                if (e.type === 'FOOD_EAT' || e.type === 'GEAR_EQUIP') {
                    displayGrid[e.pos.y][e.pos.x].overlay = '✨';
                }
            });
        });

        return displayGrid;
    }, [world, events, currentTick, snakes, params]);

    return (
        <div className="arena-grid">
            {grid.map((row, y) => (
                <div key={y} className="arena-row">
                    {row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={`arena-cell ${cell.terrain} ${!cell.isRevealed ? 'hidden' : ''}`}>
                            <span className="base-emoji">{cell.emoji}</span>
                            {cell.hint && <span className="cell-hint">{cell.hint}</span>}
                            {cell.overlay && <span className="effect-overlay">{cell.overlay}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

function getTerrainEmoji(terrain: string, theme: Theme): string {
    const isSciFi = theme === 'SCIFI';
    switch (terrain) {
        case 'forest': return isSciFi ? '🌵' : '🌳'; // Sci-fi forest is alien cacti?
        case 'desert': return isSciFi ? '🏜️' : '🥪'; // Wait, sandwich? No, desert is 🏜️
        case 'river': return isSciFi ? '⚡' : '💧';
        case 'mountain': return isSciFi ? '🛰️' : '⛰️';
        default: return '·';
    }
}

export default Arena;
