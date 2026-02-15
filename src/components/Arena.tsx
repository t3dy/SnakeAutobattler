import React, { useMemo } from 'react';
import { Cell, GameEvent, SnakeState } from '../engine/types';

interface ArenaProps {
    world: Cell[][];
    events: GameEvent[];
    currentTick: number;
    snakes: SnakeState[];
}

const Arena: React.FC<ArenaProps> = ({ world, events, currentTick, snakes }) => {
    const grid = useMemo(() => {
        // Start with the base world terrain
        const displayGrid = world.map(row => row.map(cell => ({
            ...cell,
            emoji: getTerrainEmoji(cell.terrain),
            overlay: null as string | null,
            snakeId: null as string | null,
        })));

        // Apply food/hazards if they haven't been consumed/triggered by this tick
        // In our sim, food/hazards disappear after use. 
        // For simplicity in the visual, we'll just show what's currently in the world object 
        // unless we want to track food depletion per tick (future refinement).
        displayGrid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell.food) cell.emoji = cell.food.kind;
                if (cell.hazard) cell.emoji = cell.hazard.kind;
            });
        });

        // Place snakes at their positions for the current tick
        // We look for the LATEST 'MOVE' or 'ENTER_TILE' event for each snake up to currentTick
        snakes.forEach(snake => {
            const snakeEvents = events.filter(e => e.snakeId === snake.id && e.tick <= currentTick);
            const lastMove = [...snakeEvents].reverse().find(e => e.type === 'MOVE' || e.type === 'ENTER_TILE');

            const pos = lastMove ? lastMove.pos : snake.pos; // fallback to initial pos
            const isAlive = !snakeEvents.some(e => e.type === 'KO');

            if (isAlive && pos.y >= 0 && pos.y < displayGrid.length && pos.x >= 0 && pos.x < displayGrid[0].length) {
                displayGrid[pos.y][pos.x].emoji = snake.team === 'player' ? '🐍' : '👾';
                displayGrid[pos.y][pos.x].snakeId = snake.id;
            }

            // Check for combat/feeding effects at THIS EXACT tick
            const tickEvents = events.filter(e => e.tick === currentTick && e.snakeId === snake.id);
            tickEvents.forEach(e => {
                if (e.type === 'COMBAT_TICK' || e.type === 'COMBAT_START') {
                    displayGrid[e.pos.y][e.pos.x].overlay = '💥';
                }
                if (e.type === 'FOOD_EAT') {
                    displayGrid[e.pos.y][e.pos.x].overlay = '✨';
                }
            });
        });

        return displayGrid;
    }, [world, events, currentTick, snakes]);

    return (
        <div className="arena-grid">
            {grid.map((row, y) => (
                <div key={y} className="arena-row">
                    {row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={`arena-cell ${cell.terrain}`}>
                            <span className="base-emoji">{cell.emoji}</span>
                            {cell.overlay && <span className="effect-overlay">{cell.overlay}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

function getTerrainEmoji(terrain: string): string {
    switch (terrain) {
        case 'forest': return '🌳';
        case 'desert': return '🌵';
        case 'river': return '💧';
        case 'mountain': return '⛰️';
        default: return '·';
    }
}

export default Arena;
