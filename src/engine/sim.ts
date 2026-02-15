import {
    SnakeState, GameEvent, Cell, Stats, EventType, EnvironmentParams, NarrativeFlag
} from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export class Simulation {
    world: Cell[][];
    snakes: SnakeState[];
    events: GameEvent[] = [];
    tick: number = 0;
    maxTicks: number = 60;
    envParams: EnvironmentParams;
    stormLevel: number = 0;

    constructor(world: Cell[][], snakes: SnakeState[], envParams: EnvironmentParams) {
        this.world = world;
        this.snakes = snakes;
        this.envParams = envParams;
    }

    run(): GameEvent[] {
        while (this.tick < this.maxTicks && this.snakes.some(s => s.alive)) {
            this.step();
            this.tick++;
        }
        this.emitGlobal('BATTLE_END', { x: 0, y: 0 }, 'forest', ['battle_concluded']);
        return this.events;
    }

    step() {
        // 1. Advance The Storm
        if (this.tick > 0 && this.tick % 10 === 0) {
            this.advanceStorm();
        }

        // 2. Update Snakes
        this.snakes.filter(s => s.alive).forEach(snake => {
            this.updateSnake(snake);
        });

        // 3. Resolve Combat (Multi-Phase)
        this.resolveCombat();
    }

    advanceStorm() {
        this.stormLevel++;
        const width = 16;
        const height = 12;

        // Randomly turn outer tiles into severe hazards
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const distToEdge = Math.min(x, width - 1 - x, y, height - 1 - y);
                if (distToEdge < this.stormLevel) {
                    if (Math.random() > 0.3) {
                        this.world[y][x].hazard = { kind: '🌀', damage: 20 };
                    }
                }
            }
        }
        this.emitGlobal('STORM_ADVANCE', { x: 0, y: 0 }, 'desert', [`level_${this.stormLevel}`]);
    }

    updateSnake(snake: SnakeState) {
        // Evaluate flags
        this.updateFlags(snake);

        // Perceive & Decide
        const options = this.perceive(snake);
        const move = this.decideMove(snake, options);

        if (move) {
            snake.pos = move;
            const cell = this.world[move.y][move.x];

            // Record memory
            if (cell.food) snake.memory.food.push({ ...move });
            if (cell.hazard) snake.memory.hazards.push({ ...move });

            this.emit(snake, 'MOVE', move, cell.terrain, []);
            this.emit(snake, 'ENTER_TILE', move, cell.terrain, []);

            if (cell.food) this.handleFood(snake, cell);
            if (cell.hazard) this.handleHazard(snake, cell);
        }
    }

    updateFlags(snake: SnakeState) {
        const flags: NarrativeFlag[] = [];
        if (snake.hp < 30) flags.push('WOUNDED');

        const kos = this.events.filter(e => e.type === 'KO' && e.targetId === snake.id).length;
        // Wait, targetId logic is reversed in KO. Let's look for events where this snake KOs someone.
        const kills = this.events.filter(e => e.type === 'KO' && e.tags.includes(`target_${snake.id}`)).length;
        // We'll refine kill tracking in the resolveCombat

        if (snake.flags.includes('DOMINANT')) flags.push('DOMINANT');
        if (snake.flags.includes('WELL_FED')) flags.push('WELL_FED');

        snake.flags = Array.from(new Set([...snake.flags, ...flags]));
    }

    perceive(snake: SnakeState) {
        const radius = snake.currentStats.agility > 7 ? 3 : 2;
        const options = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = snake.pos.x + dx;
                const ny = snake.pos.y + dy;
                if (nx >= 0 && nx < 16 && ny >= 0 && ny < 12) {
                    options.push({ x: nx, y: ny });
                }
            }
        }
        return options;
    }

    decideMove(snake: SnakeState, options: { x: number, y: number }[]) {
        const bias = INSTINCTS[snake.draft.instinct].bias;
        const quirk = snake.draft.quirk;

        // 1. Spatial Memory Avoidance
        let validOptions = options;
        if (quirk !== 'Reckless') {
            validOptions = options.filter(o => !snake.memory.hazards.some(h => h.x === o.x && h.y === o.y));
        }
        if (validOptions.length === 0) validOptions = options;

        // 2. Goal Seeking
        if (bias === 'seeks_food' || snake.hp < 50) {
            const memoryFood = snake.memory.food.find(f => validOptions.some(o => o.x === f.x && o.y === f.y));
            if (memoryFood) return memoryFood;

            const visibleFood = validOptions.find(o => this.world[o.y][o.x].food);
            if (visibleFood) return visibleFood;
        }

        if (bias === 'seeks_enemy') {
            const enemy = this.snakes.find(s => s.alive && s.team !== snake.team);
            if (enemy) {
                // Move toward logic
                return validOptions.sort((a, b) => {
                    const distA = Math.abs(a.x - enemy.pos.x) + Math.abs(a.y - enemy.pos.y);
                    const distB = Math.abs(b.x - enemy.pos.x) + Math.abs(b.y - enemy.pos.y);
                    return distA - distB;
                })[0];
            }
        }

        return validOptions[Math.floor(Math.random() * validOptions.length)];
    }

    handleFood(snake: SnakeState, cell: Cell) {
        if (!cell.food) return;
        const heal = cell.food.value;
        snake.hp = Math.min(snake.maxHp, snake.hp + heal);

        // Micro-evolution
        if (Math.random() > 0.5) snake.evolution.speed = (snake.evolution.speed || 0) + 1;

        this.emit(snake, 'FOOD_EAT', snake.pos, cell.terrain, [cell.food.kind], heal);
        cell.food = null;
        if (!snake.flags.includes('WELL_FED')) snake.flags.push('WELL_FED');
    }

    handleHazard(snake: SnakeState, cell: Cell) {
        if (!cell.hazard) return;
        let damage = cell.hazard.damage;
        if (snake.draft.quirk === 'Reckless') damage *= 1.5;

        snake.hp -= damage;

        // Micro-evolution
        if (snake.hp > 0 && Math.random() > 0.7) snake.evolution.agility = (snake.evolution.agility || 0) + 1;

        this.emit(snake, 'HAZARD_HIT', snake.pos, cell.terrain, [cell.hazard.kind], damage);
        if (snake.hp <= 0) {
            snake.alive = false;
            this.emit(snake, 'KO', snake.pos, cell.terrain, ['hazard_death']);
        }
    }

    resolveCombat() {
        const pairs: [SnakeState, SnakeState][] = [];
        this.snakes.filter(s => s.alive).forEach(s1 => {
            this.snakes.filter(s => s.alive && s.team !== s1.team).forEach(s2 => {
                if (Math.abs(s1.pos.x - s2.pos.x) <= 1 && Math.abs(s1.pos.y - s2.pos.y) <= 1) {
                    if (!pairs.some(p => (p[0] === s1 && p[1] === s2) || (p[0] === s2 && p[1] === s1))) {
                        pairs.push([s1, s2]);
                    }
                }
            });
        });

        pairs.forEach(([s1, s2]) => this.dramaticFight(s1, s2));
    }

    dramaticFight(s1: SnakeState, s2: SnakeState) {
        this.emit(s1, 'COMBAT_START', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, [`vs_${s2.name}`], undefined, s2.id);

        // Phase 1: Exchange
        const dmg1 = this.calcDmg(s1, s2);
        const dmg2 = this.calcDmg(s2, s1);

        s2.hp -= dmg1;
        s1.hp -= dmg2;
        this.emit(s1, 'COMBAT_EXCHANGE', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, ['exchange_1'], dmg1, s2.id);

        // Phase 2: Turning Point?
        if (s1.alive && s2.alive && Math.random() > 0.6) {
            const shift = (Math.random() - 0.5) * 10;
            this.emit(s1, 'TURNING_POINT', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, [shift > 0 ? 'advantage_s1' : 'advantage_s2'], Math.abs(shift), s2.id);
            if (shift > 0) s2.hp -= 5; else s1.hp -= 5;
        }

        // Phase 3: Resolution
        if (s1.hp <= 0 && s1.alive) {
            s1.alive = false;
            this.emit(s1, 'KO', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, [`slain_by_${s2.name}`], undefined, s2.id);
            s2.flags.push('DOMINANT');
        }
        if (s2.hp <= 0 && s2.alive) {
            s2.alive = false;
            this.emit(s2, 'KO', s2.pos, this.world[s2.pos.y][s2.pos.x].terrain, [`slain_by_${s1.name}`], undefined, s1.id);
            s1.flags.push('DOMINANT');
        }

        if (s1.alive && s2.alive) {
            this.emit(s1, 'COMBAT_END', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, ['stalemate'], undefined, s2.id);
        }
    }

    calcDmg(attacker: SnakeState, defender: SnakeState) {
        let dmg = attacker.currentStats.venom + attacker.currentStats.size;
        dmg += (attacker.evolution.venom || 0);
        if (attacker.flags.includes('DOMINANT')) dmg += 2;
        if (attacker.flags.includes('WOUNDED')) dmg -= 2;
        return Math.max(2, dmg + Math.floor(Math.random() * 5));
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
                aiState: snake.aiState,
                flags: [...snake.flags]
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
                aiState: 'none',
                flags: []
            }
        });
    }
}
