import {
    SnakeState, GameEvent, Cell, Stats, EventType
} from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export class Simulation {
    world: Cell[][];
    snakes: SnakeState[];
    events: GameEvent[] = [];
    tick: number = 0;
    maxTicks: number = 60;

    constructor(world: Cell[][], snakes: SnakeState[]) {
        this.world = world;
        this.snakes = snakes;
    }

    run(): GameEvent[] {
        while (this.tick < this.maxTicks && this.snakes.some(s => s.alive)) {
            this.step();
            this.tick++;
        }
        this.emitGlobal('BATTLE_END', { x: 0, y: 0 }, 'forest', []);
        return this.events;
    }

    step() {
        this.snakes.filter(s => s.alive).forEach(snake => {
            this.updateSnake(snake);
        });
        this.resolveCombat();
    }

    updateSnake(snake: SnakeState) {
        // 1. Evaluate Environment
        const perception = this.perceive(snake);

        // 2. Choose Action (simple AI)
        const move = this.decideMove(snake, perception);

        // 3. Apply Move
        if (move) {
            const oldPos = { ...snake.pos };
            snake.pos = move;
            const cell = this.world[move.y][move.x];

            this.emit(snake, 'MOVE', move, cell.terrain, []);
            this.emit(snake, 'ENTER_TILE', move, cell.terrain, []);

            // 4. Resolve Terrain Interactions
            if (cell.food) {
                this.handleFood(snake, cell);
            }
            if (cell.hazard) {
                this.handleHazard(snake, cell);
            }
        }
    }

    perceive(snake: SnakeState) {
        // Simple 3x3 or radius based perception
        const radius = 2; // could be stat based
        const possibleMoves = [
            { x: snake.pos.x + 1, y: snake.pos.y },
            { x: snake.pos.x - 1, y: snake.pos.y },
            { x: snake.pos.x, y: snake.pos.y + 1 },
            { x: snake.pos.x, y: snake.pos.y - 1 },
        ].filter(m => m.x >= 0 && m.x < 16 && m.y >= 0 && m.y < 12);

        return possibleMoves;
    }

    decideMove(snake: SnakeState, options: { x: number, y: number }[]) {
        // Very basic AI logic based on instincts
        const bias = INSTINCTS[snake.draft.instinct].bias;

        if (bias === 'seeks_food' || snake.hp < 40) {
            const foodTile = options.find(o => this.world[o.y][o.x].food);
            if (foodTile) return foodTile;
        }

        if (bias === 'seeks_enemy') {
            // Find nearest enemy and move toward it
            const enemy = this.snakes.find(s => s.alive && s.team !== snake.team);
            if (enemy) {
                // Move toward enemy logic
                return options[0]; // placeholder
            }
        }

        // Default: Random walk
        return options[Math.floor(Math.random() * options.length)];
    }

    handleFood(snake: SnakeState, cell: Cell) {
        if (!cell.food) return;
        const heal = cell.food.value;
        snake.hp = Math.min(snake.maxHp, snake.hp + heal);
        this.emit(snake, 'FOOD_EAT', snake.pos, cell.terrain, [`recovered_${heal}`, cell.food.kind], heal);
        cell.food = null; // single use
    }

    handleHazard(snake: SnakeState, cell: Cell) {
        if (!cell.hazard) return;
        const damage = cell.hazard.damage;
        snake.hp -= damage;
        this.emit(snake, 'HAZARD_HIT', snake.pos, cell.terrain, [`took_${damage}`, cell.hazard.kind], damage);
        if (snake.hp <= 0) {
            snake.alive = false;
            this.emit(snake, 'KO', snake.pos, cell.terrain, ['health_zero']);
        }
    }

    resolveCombat() {
        // Check if any opposing snakes are in the same or adjacent tiles
        for (const s1 of this.snakes.filter(s => s.alive)) {
            for (const s2 of this.snakes.filter(s => s.alive && s.team !== s1.team)) {
                if (Math.abs(s1.pos.x - s2.pos.x) <= 1 && Math.abs(s1.pos.y - s2.pos.y) <= 1) {
                    this.fight(s1, s2);
                }
            }
        }
    }

    fight(s1: SnakeState, s2: SnakeState) {
        this.emit(s1, 'COMBAT_START', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, [], undefined, s2.id);

        // Simple damage based on size and venom
        const dmg1 = Math.max(1, s1.currentStats.venom + s1.currentStats.size);
        const dmg2 = Math.max(1, s2.currentStats.venom + s2.currentStats.size);

        s2.hp -= dmg1;
        s1.hp -= dmg2;

        this.emit(s1, 'COMBAT_TICK', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, [`hit_${s2.name}_for_${dmg1}`], dmg1, s2.id);
        this.emit(s2, 'COMBAT_TICK', s2.pos, this.world[s2.pos.y][s2.pos.x].terrain, [`hit_${s1.name}_for_${dmg2}`], dmg2, s1.id);

        if (s1.hp <= 0) { s1.alive = false; this.emit(s1, 'KO', s1.pos, 'mountain', []); }
        if (s2.hp <= 0) { s2.alive = false; this.emit(s2, 'KO', s2.pos, 'mountain', []); }
    }

    emit(snake: SnakeState, type: EventType, pos: { x: number, y: number }, terrain: any, tags: string[], amount?: number, targetId?: string) {
        this.events.push({
            id: Math.random().toString(36).substr(2, 9),
            tick: this.tick,
            snakeId: snake.id,
            type,
            pos,
            terrain: terrain as any,
            targetId,
            amount,
            tags,
            snapshot: {
                hp: snake.hp,
                effectiveStats: { ...snake.currentStats },
                aiState: snake.aiState
            }
        });
    }

    emitGlobal(type: EventType, pos: { x: number, y: number }, terrain: any, tags: string[]) {
        this.events.push({
            id: Math.random().toString(36).substr(2, 9),
            tick: this.tick,
            snakeId: 'SYSTEM',
            type,
            pos,
            terrain: terrain as any,
            tags,
            snapshot: {
                hp: 0,
                effectiveStats: { speed: 0, size: 0, venom: 0, agility: 0, camouflage: 0 },
                aiState: 'none'
            }
        });
    }
}
