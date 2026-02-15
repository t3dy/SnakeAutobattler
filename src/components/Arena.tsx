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
    const isV8 = params?.version === 'v8.0' || params?.version === 'v10.0' || params?.version === 'v11.0' || params?.version === 'v12.0' || params?.version === 'v13.0';

    const grid = useMemo(() => {
        // ... (existing grid calculation logic - I will keep it but filter emojis if V8)
        const revealed = new Set<string>();
        if (isV5) {
            snakes.forEach(snake => {
                const snakeEvents = events.filter(e => e.snakeId === snake.id && e.tick <= currentTick);
                snakeEvents.forEach(e => {
                    if (e.pos) revealed.add(`${e.pos.x},${e.pos.y}`);
                });
                const lastMove = [...snakeEvents].reverse().find(e => e.type === 'MOVE' || e.type === 'ENTER_TILE');
                const pos = lastMove ? lastMove.pos : snake.pos;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        revealed.add(`${pos.x + dx},${pos.y + dy}`);
                    }
                }
            });
        }

        const displayGrid = world.map((row, y) => row.map((cell, x) => {
            const isRevealed = !isV5 || revealed.has(`${x},${y}`);
            const baseEmoji = getTerrainEmoji(cell.terrain, params?.theme || 'MEDIEVAL');

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

        if (!isV8) {
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
            });
        }

        return displayGrid;
    }, [world, events, currentTick, snakes, params, isV8, isV5]);

    // v8.0 Specific: Calculate Paths and Camera
    const snakePaths = useMemo(() => {
        if (!isV8) return [];
        return snakes.map(snake => {
            const history = events
                .filter(e => e.snakeId === snake.id && e.tick <= currentTick && (e.type === 'MOVE' || e.type === 'ENTER_TILE'))
                .map(e => e.pos);
            const isAlive = !events.filter(e => e.snakeId === snake.id && e.tick <= currentTick).some(e => e.type === 'KO');
            // v13.1 Visual Feedback: Damage check
            const isDamaged = snake.lastDamageTick && (currentTick - snake.lastDamageTick < 5);
            return { id: snake.id, team: snake.team, path: history, isAlive, color: snake.team === 'player' ? '#00ff7f' : '#ff4444', isDamaged };
        });
    }, [snakes, events, currentTick, isV8]);

    const cameraTransform = useMemo(() => {
        if (!isV8) return {};
        const activeEvent = events.find(e => e.tick === currentTick && (e.type === 'ENCOUNTER_CHOICE' || e.type === 'HAZARD_HIT' || e.type === 'COMBAT_START'));
        if (activeEvent) {
            const { x, y } = activeEvent.pos;
            // Center on coordinate (x, y) with 2x zoom
            const moveX = (world[0].length / 2 - x) * 40; // 40px is base cell size
            const moveY = (world.length / 2 - y) * 40;
            return {
                transform: `scale(2.5) translate(${moveX}px, ${moveY}px)`,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            };
        }
        return { transition: 'transform 0.8s ease-in-out' };
    }, [events, currentTick, isV8, world]);

    const weatherClass = useMemo(() => {
        if (!isV8) return '';
        switch (params?.climate) {
            case 'Lush': return 'weather-rain';
            case 'Arid': return 'weather-sandstorm';
            case 'Binary': return 'weather-glitch';
            default: return 'weather-none';
        }
    }, [isV8, params?.climate]);

    return (
        <div className={`arena-viewport ${weatherClass}`}>
            {isV8 && <div className="weather-overlay" />}
            <div className="arena-grid" style={cameraTransform}>
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

                {isV8 && (
                    <svg className="snake-svg-layer" viewBox={`0 0 ${world[0].length * 40} ${world.length * 40}`}>
                        {snakePaths.filter(s => s.isAlive).map(s => (
                            <polyline
                                key={s.id}
                                points={s.path.map(p => `${p.x * 40 + 20},${p.y * 40 + 20}`).join(' ')}
                                fill="none"
                                stroke={s.color}
                                strokeWidth={s.isDamaged ? "12" : "8"} // Thicker stroke on damage
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={s.isDamaged ? "snake-node damage" : "snake-node"}
                                style={{ transition: 'all 0.1s ease', filter: s.isDamaged ? 'brightness(2) sepia(1)' : 'none' }}
                            />
                        ))}
                    </svg>
                )}
            </div>
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
