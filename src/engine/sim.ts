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

    isWaitingForChoice: boolean = false;
    pendingChoiceEvent: GameEvent | null = null;

    run(): GameEvent[] {
        // In v6.0, run() only continues if not waiting for choice
        while (this.tick < this.maxTicks && this.snakes.some(s => s.alive) && !this.isWaitingForChoice) {
            this.step();
            if (!this.isWaitingForChoice) this.tick++;
        }
        if (!this.snakes.some(s => s.alive) || this.tick >= this.maxTicks) {
            this.emitGlobal('BATTLE_END', { x: 0, y: 0 }, 'forest', ['battle_concluded']);
        }
        return this.events;
    }

    step() {
        const isV5 = this.envParams.mode !== undefined; // mode select was v5.0
        const isV6 = this.envParams.mode === 'SOLO' || this.envParams.mode === 'HOTSEAT_BATTLE'; // v6.0 applies to all main modes
        const phaseTick = 30;

        if (this.tick === phaseTick && isV5) {
            this.emitGlobal('PHASE_SHIFT', { x: 8, y: 6 }, 'mountain', ['clash_begins']);
        }

        const isClash = isV5 && this.tick >= phaseTick;

        if (this.tick > 0 && (this.tick % (isClash ? 5 : 10) === 0)) {
            this.advanceStorm();
        }

        const snakesToUpdate = this.snakes.filter(s => s.alive);
        for (const snake of snakesToUpdate) {
            this.updateSnake(snake, isClash);
            if (this.isWaitingForChoice) break; // Pause simulation
        }

        if (!this.isWaitingForChoice) {
            this.resolveCombat();
        }
    }

    // New API for external choice injection
    handleChoice(snakeId: string, choice: 'RUN' | 'HIDE' | 'FIGHT') {
        const snake = this.snakes.find(s => s.id === snakeId);
        if (!snake || !this.isWaitingForChoice) return;

        this.isWaitingForChoice = false;
        this.emit(snake, 'CHOICE_MADE', snake.pos, this.world[snake.pos.y][snake.pos.x].terrain, [choice]);

        // Resolve the choice logic
        this.resolveEncounterChoice(snake, choice);
    }

    advanceStorm() {
        this.stormLevel++;
        const width = this.world[0].length;
        const height = this.world.length;

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

    updateSnake(snake: SnakeState, isClash: boolean) {
        this.updateFlags(snake);
        const options = this.perceive(snake);
        const move = this.decideMove(snake, options, isClash);

        if (move) {
            snake.pos = move;
            const cell = this.world[move.y][move.x];

            if (this.envParams.mode && Math.random() < 0.1 && !cell.food && !cell.hazard) {
                this.triggerEncounter(snake, cell);
            }

            if (cell.food) snake.memory.food.push({ ...move });
            if (cell.hazard) snake.memory.hazards.push({ ...move });

            this.emit(snake, 'MOVE', move, cell.terrain, []);
            this.emit(snake, 'ENTER_TILE', move, cell.terrain, []);

            if (cell.food) this.handleFood(snake, cell);
            if (cell.hazard) this.handleHazard(snake, cell);
        }
    }

    triggerEncounter(snake: SnakeState, cell: Cell) {
        // In v6.0, we pause and wait for player input
        this.isWaitingForChoice = true;
        this.emit(snake, 'PENDING_CHOICE', snake.pos, cell.terrain, ['encounter']);
    }

    resolveEncounterChoice(snake: SnakeState, choice: 'RUN' | 'HIDE' | 'FIGHT') {
        const cell = this.world[snake.pos.y][snake.pos.x];
        const theme = this.envParams.theme;
        let outcome = '';

        if (choice === 'RUN') {
            outcome = theme === 'SCIFI' ? 'The unit engaged thrusters, escaping the logic gate.' : 'He turned tail, slithering into the deep crevices.';
            this.emit(snake, 'ENCOUNTER_RESULT', snake.pos, cell.terrain, ['ESCAPE', outcome]);
        } else if (choice === 'HIDE') {
            const roll = Math.random() * 20 + snake.currentStats.agility;
            if (roll > 15) {
                outcome = theme === 'SCIFI' ? 'Stealth protocols held. The threat passed over.' : 'Shadows became his armor; the danger did not see him.';
                this.emit(snake, 'ENCOUNTER_RESULT', snake.pos, cell.terrain, ['STAY_HIDDEN', outcome]);
            } else {
                outcome = theme === 'SCIFI' ? 'Cloaking failed! Forced into an immediate engagement.' : 'The stones rolled under his weight, revealing his presence!';
                snake.hp -= 20;
                this.emit(snake, 'ENCOUNTER_RESULT', snake.pos, cell.terrain, ['REVEALED', outcome]);
            }
        } else {
            // FIGHT
            const roll = Math.random() * 20 + (snake.currentStats.venom + snake.currentStats.size);
            if (roll > 20) {
                snake.experience += 30;
                snake.scavengeProfit += 100;
                outcome = theme === 'SCIFI' ? 'Core Overload victory! Salvaged high-tier hardware.' : 'A roar echoed in the glade. The foe was vanquished, its gold claimed.';
                this.emit(snake, 'ENCOUNTER_RESULT', snake.pos, cell.terrain, ['VICTORY', outcome]);
            } else {
                snake.hp -= 30;
                outcome = theme === 'SCIFI' ? 'Hardware damage sustained. Retreating with sub-optimal data.' : 'The battle was a calamity. He crawled away, broken and shamed.';
                this.emit(snake, 'ENCOUNTER_RESULT', snake.pos, cell.terrain, ['DEFEAT', outcome]);
            }
        }
        if (outcome) snake.storyHistory.push(outcome);
    }

    updateFlags(snake: SnakeState) {
        const flags: NarrativeFlag[] = [];
        if (snake.hp < 30) flags.push('WOUNDED');
        if (snake.flags.includes('DOMINANT')) flags.push('DOMINANT');
        if (snake.flags.includes('WELL_FED')) flags.push('WELL_FED');
        snake.flags = Array.from(new Set([...snake.flags, ...flags]));
    }

    perceive(snake: SnakeState) {
        const radius = 1;
        const options = [];
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = snake.pos.x + dx;
                const ny = snake.pos.y + dy;
                if (nx >= 0 && nx < this.world[0].length && ny >= 0 && ny < this.world.length) {
                    options.push({ x: nx, y: ny });
                }
            }
        }
        return options;
    }

    decideMove(snake: SnakeState, options: { x: number, y: number }[], isClash: boolean) {
        const bias = INSTINCTS[snake.draft.instinct].bias;
        const quirk = snake.draft.quirk;

        let validOptions = options;
        if (quirk !== 'Reckless') {
            validOptions = options.filter(o => !snake.memory.hazards.some(h => h.x === o.x && h.y === o.y));
        }
        if (validOptions.length === 0) validOptions = options;

        const goalBias = isClash ? 'seeks_enemy' : bias;

        if (goalBias === 'seeks_food' || snake.hp < 50) {
            const memoryFood = snake.memory.food.find(f => validOptions.some(o => o.x === f.x && o.y === f.y));
            if (memoryFood) return memoryFood;
            const visibleFood = validOptions.find(o => this.world[o.y][o.x].food);
            if (visibleFood) return visibleFood;
        }

        if (goalBias === 'seeks_enemy') {
            const enemy = this.snakes.find(s => s.alive && s.team !== snake.team);
            if (enemy) {
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
        this.emit(snake, 'FOOD_EAT', snake.pos, cell.terrain, [cell.food.kind], heal);
        cell.food = null;
    }

    handleHazard(snake: SnakeState, cell: Cell) {
        if (!cell.hazard) return;
        let damage = cell.hazard.damage;
        if (snake.draft.quirk === 'Reckless') damage *= 1.5;
        snake.hp -= damage;
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
        const dmg1 = this.calcDmg(s1, s2);
        const dmg2 = this.calcDmg(s2, s1);
        s2.hp -= dmg1;
        s1.hp -= dmg2;
        this.emit(s1, 'COMBAT_EXCHANGE', s1.pos, this.world[s1.pos.y][s1.pos.x].terrain, ['exchange_1'], dmg1, s2.id);

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
        return Math.max(2, dmg + Math.floor(Math.random() * 5));
    }

    emit(snake: SnakeState, type: EventType, pos: { x: number, y: number }, terrain: TerrainType, tags: string[], amount?: number, targetId?: string): GameEvent {
        const event: GameEvent = {
            id: Math.random().toString(36).substr(2, 9),
            tick: this.tick,
            snakeId: snake.id,
            type,
            pos,
            terrain,
            targetId,
            amount,
            tags,
            snapshot: {
                hp: snake.hp,
                effectiveStats: { ...snake.currentStats },
                aiState: snake.aiState,
                flags: [...snake.flags]
            }
        };
        this.events.push(event);
        return event;
    }

    emitGlobal(type: EventType, pos: { x: number, y: number }, terrain: TerrainType, tags: string[]) {
        this.events.push({
            id: Math.random().toString(36).substr(2, 9),
            tick: this.tick,
            snakeId: 'SYSTEM',
            type,
            pos,
            terrain,
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
