import {
    SnakeState, GameEvent, Cell, Stats, EventType, EnvironmentParams, NarrativeFlag, TerrainType, ResolveOutcome, CauseType, SnakeDraft
} from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';
import { generateNarrative } from './narrate';
import { RadianceEngine } from './radiance';

export class Simulation {
    world: Cell[][]; // Changed from `World` to `Cell[][]` to match original type, as `World` was not defined.
    snakes: SnakeState[];
    events: GameEvent[] = [];
    tick: number = 0;
    maxTicks: number = 60;
    envParams: EnvironmentParams;
    stormLevel: number = 0;
    radianceScore: number = 100; // v13.0 Meta-Metric
    synergyTags: string[] = [];  // v13.0 Active Synergies
    currentEncounterData: any = null; // v13.0 Drama Data
    radiance: RadianceEngine; // v13.0 Verifiable Metric

    constructor(world: Cell[][], snakes: SnakeState[], envParams: EnvironmentParams) {
        this.world = world;
        this.snakes = snakes;
        this.envParams = envParams;
        this.radiance = new RadianceEngine();
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
        this.applyBroodBonds(snakesToUpdate);

        for (const snake of snakesToUpdate) {
            this.updateSnake(snake, isClash);
            if (this.isWaitingForChoice) break; // Pause simulation
        }

        if (!this.isWaitingForChoice) {
            this.handleCombat();

            // v13.0 Verifiable Radiance Update
            // Must run every tick to audit all events (Combat, Movement, Hazards)
            this.radiance.update(this.events.filter(e => e.tick === this.tick), this.snakes);
        }
    }

    // updateRadiance() { // Removed as per instruction
    //     // v13.0: Calculate systemic drift. 
    //     // Drift occurs if many snakes are alive but none are eating or fighting, 
    //     // or if traits are triggered but have no narrative impact (simulated).
    //     let delta = 0;
    //     const activeSnakes = this.snakes.filter(s => s.alive);

    //     // Reward action, penalize stagnation
    //     const totalActivity = activeSnakes.reduce((acc, s) => acc + s.flags.length, 0);
    //     if (totalActivity === 0) delta -= 1;
    //     else delta += 0.5;

    //     // Synergy Bonus
    //     if (this.synergyTags.length > 0) delta += 1;

    //     this.radianceScore = Math.max(0, Math.min(200, this.radianceScore + delta));

    //     // Registry of 100 Improvements (Systemic representative)
    //     if (this.tick % 10 === 0 && this.radianceScore > 150) {
    //         this.emitGlobal('SYSTEM_RESONANCE', { x: 8, y: 8 }, 'forest', ['RESONANT_FLUX', 'v13_decadal_boost']);
    //     }
    // }

    applyBroodBonds(snakes: SnakeState[]) {
        snakes.forEach(s1 => {
            const nearbyAllies = snakes.filter(s2 =>
                s1.id !== s2.id &&
                s1.team === s2.team &&
                Math.abs(s1.pos.x - s2.pos.x) <= 2 &&
                Math.abs(s1.pos.y - s2.pos.y) <= 2
            );

            if (nearbyAllies.length > 0) {
                // Broad Bond: Boost Speed/Agility when near allies
                s1.currentStats.agility = s1.baseStats.agility + 2;
                if (!s1.statuses.includes('Bonded')) s1.statuses.push('Bonded');
            } else {
                s1.currentStats.agility = s1.baseStats.agility;
                s1.statuses = s1.statuses.filter(st => st !== 'Bonded');
            }
        });
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
        // Update Radiance Contract (Simulated Harmony)
        this.radiance.update(this.events.filter(e => e.tick === this.tick), this.snakes); // Used this.tick instead of this.currentTick

        // The following lines were part of the instruction but seem misplaced in advanceStorm and are commented out.
        // this.currentTick++;
        // return { events: this.events.slice(startEventCount) };

        this.stormLevel++;
        const width = this.world[0].length;
        const height = this.world.length;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const distToEdge = Math.min(x, width - 1 - x, y, height - 1 - y);
                if (distToEdge < this.stormLevel) {
                    if (Math.random() > 0.3) {
                        this.world[y][x].hazard = { kind: '🌀', damage: 20 };
                        // We will check for storm cause in handleHazard by kind
                    }
                }
            }
        }
        this.emitGlobal('STORM_ADVANCE', { x: 0, y: 0 }, 'desert', [`level_${this.stormLevel}`]);
    }

    updateSnake(snake: SnakeState, isClash: boolean) {
        this.applyFields(snake);
        this.applyGenreEffects(snake);
        this.applyBodyTraits(snake);

        this.updateFlags(snake);
        const options = this.perceive(snake);
        const move = this.decideMove(snake, options, isClash);

        if (move) {
            // v13.0 TripChance Check
            if (snake.currentStats.speed > 3 && (Math.random() < 0.1)) {
                this.emit(snake, 'SYSTEM_RESONANCE', move, this.world[move.y][move.x].terrain, ['TRIP_CHANCE', 'Slide Whistle!']);
                snake.hp -= 5;
            }

            snake.pos = move;
            const cell = this.world[move.y][move.x];

            // Environmental SFX triggers
            if (cell.terrain === 'forest') this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['LEAF_BURST']);
            if (cell.terrain === 'desert') this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['SAND_SLIP']);
            if (cell.terrain === 'mountain') this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['PEBBLE_PING']);
            if (cell.terrain === 'river') this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['SPLASH_SKID']);

            // Personality Glows
            if (snake.hp > 80) this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['BLUSH_GLOW']);
            if (snake.hp < 30) this.emit(snake, 'SYSTEM_RESONANCE', move, cell.terrain, ['SWEAT_DROP']);

            // Digging Logic (Treasure Mode)
            if (cell.treasure && (this.envParams.mode === 'TREASURE_EXPEDITION')) {
                this.handleDigging(snake, cell);
            }

            // v7.0 Storm Pressure tracking
            if (cell.hazard?.kind === '🌀') {
                snake.evolution['storm_ticks'] = (snake.evolution['storm_ticks'] || 0) + 1;
                if (snake.evolution['storm_ticks'] > 2 && !snake.flags.includes('DESPERATE')) {
                    snake.flags.push('DESPERATE');
                    this.emit(snake, 'BEHAVIOR_SHIFT', snake.pos, cell.terrain, ['DESPERATE', 'Driven by the Storm']);
                }
            } else {
                snake.evolution['storm_ticks'] = 0;
            }

            if (this.envParams.mode && Math.random() < 0.1 && !cell.food && !cell.hazard) {
                this.triggerEncounter(snake, cell);
            }

            if (cell.food) {
                snake.memory.food.push({ ...move });
                this.handleFood(snake, cell);
            }
            if (cell.hazard) {
                snake.memory.hazards.push({ ...move });
                this.handleHazard(snake, cell);
                this.checkCascade(snake);
            }

            this.emit(snake, 'MOVE', move, cell.terrain, []);
            this.emit(snake, 'ENTER_TILE', move, cell.terrain, []);
        }
    }

    applyFields(snake: SnakeState) {
        const cell = this.world[snake.pos.y][snake.pos.x];
        const { heat, moisture, elevation } = cell.fields;

        // Environmental Stat Modifiers
        if (heat > 0.7) snake.currentStats.speed = Math.max(1, snake.baseStats.speed - 1);
        if (moisture > 0.7) snake.currentStats.agility = Math.max(1, snake.baseStats.agility - 1);
        if (elevation > 0.8) snake.currentStats.camouflage = snake.baseStats.camouflage + 2;
    }

    applyGenreEffects(snake: SnakeState) {
        const genre = this.envParams.genre;
        if (genre === 'ZOMBIE') {
            if (this.tick % 10 === 0) snake.hp -= 2; // Constant decay
        }
        if (genre === 'SLAPSTICK' && Math.random() < 0.05) {
            this.emit(snake, 'FEAT_ACCOMPLISHED', snake.pos, this.world[snake.pos.y][snake.pos.x].terrain, ['SLIP_UP', 'Comical Slide!']);
            // Forced movement logic would go here
        }
    }

    applyBodyTraits(snake: SnakeState) {
        const bodyFlags = BODIES[snake.draft.body].flags;
        const cell = this.world[snake.pos.y][snake.pos.x];

        // Radiant Trait Sync: Boulderback Constrictor, Shadow Striker, Dune Sprinter, River Glider, Clockwork Coil

        if (bodyFlags.includes('ambush_from_cover')) {
            if (cell.fields.elevation > 0.6 || cell.terrain === 'forest') {
                if (!snake.statuses.includes('AMBUSH_READY')) {
                    snake.statuses.push('AMBUSH_READY');
                    this.emit(snake, 'BEHAVIOR_SHIFT', snake.pos, cell.terrain, ['AMBUSH_READY', 'Coiled in Shadows']);
                }
            } else {
                snake.statuses = snake.statuses.filter(s => s !== 'AMBUSH_READY');
            }
        }
    }
    handleDigging(snake: SnakeState, cell: Cell) {
        if (!cell.treasure) return;
        const digSpeed = 0.1 * (snake.currentStats.size / 5);
        cell.treasure.depth -= digSpeed;

        if (cell.treasure.depth <= 0) {
            const treasure = cell.treasure;
            this.emit(snake, 'FEAT_ACCOMPLISHED', snake.pos, cell.terrain, ['TREASURE_EXCAVATED', treasure.name]);
            if (treasure.item) {
                snake.inventory.push(treasure.item.name);
                if (treasure.item.traitBonus) {
                    Object.entries(treasure.item.traitBonus).forEach(([stat, val]) => {
                        (snake.baseStats as any)[stat] += val;
                    });
                }
            }
            cell.treasure = null;
        } else {
            this.emit(snake, 'MOVE', snake.pos, cell.terrain, ['DIGGING', `${Math.round(cell.treasure.depth * 100)}% left`]);
        }
    }

    triggerEncounter(snake: SnakeState, cell: Cell) {
        this.isWaitingForChoice = true;

        // Pack Encounter Metadata for the Cinematic
        this.currentEncounterData = {
            snakeId: snake.id,
            threatType: cell.hazard ? 'HAZARD' : cell.treasure ? 'TREASURE' : 'MYSTERY',
            threatIntensity: cell.hazard ? cell.hazard.damage : 50,
            terrainContext: cell.terrain,
            hazardModifiers: cell.hazard ? [cell.hazard.kind] : [],
            resolutionFormula: "Success = f(Speed, Stealth, HP)"
        };

        this.pendingChoiceEvent = this.emit(snake, 'PENDING_CHOICE', snake.pos, cell.terrain, ['drama_staged', JSON.stringify(this.currentEncounterData)]);
    }

    calculateResolve(snake: SnakeState, cell: Cell): ResolveOutcome {
        const hpPerc = snake.hp / snake.maxHp;
        const quirk = snake.draft.quirk;
        const instinct = snake.draft.instinct;

        if (quirk === 'Reckless' || instinct === 'Hunter') { // Fixed Aggressive to Hunter
            if (hpPerc > 0.3) return 'FIGHT';
            return Math.random() > 0.5 ? 'FIGHT' : 'HIDE';
        }

        if (quirk === 'Cautious' || hpPerc < 0.4) { // Fixed Cunning to Cautious
            return 'HIDE';
        }

        return 'RUN';
    }

    calculateSuccessChance(choice: ResolveOutcome, snake: SnakeState, cell: Cell): number {
        const stats = snake.currentStats;
        let base = 50;

        if (choice === 'RUN') base += stats.speed * 10;
        if (choice === 'HIDE') base += stats.camouflage * 10;
        if (choice === 'FIGHT') base += (stats.venom + stats.size) * 5;

        // Health modifier
        base *= (snake.hp / snake.maxHp);

        return Math.max(5, Math.min(95, base));
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
                if (this.envParams.version === 'v10.0' && Math.random() < 0.3) {
                    const skill = 'Shadow Blend';
                    if (!snake.skills.includes(skill)) snake.skills.push(skill);
                }
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

                if (this.envParams.version === 'v10.0') {
                    const skills = ['Venom Spit', 'Crushing Coil', 'Sharp Fangs'];
                    const skill = skills[Math.floor(Math.random() * skills.length)];
                    if (!snake.skills.includes(skill)) snake.skills.push(skill);
                }
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
        const isDesperate = snake.flags.includes('DESPERATE');
        const isScarred = snake.flags.includes('SCARRED');

        let validOptions = options;

        // Scarred snakes move slower/more cautiously
        if (isScarred) {
            validOptions = options.filter(o => !snake.memory.hazards.some(h => h.x === o.x && h.y === o.y));
        } else if (quirk !== 'Reckless') {
            validOptions = options.filter(o => !snake.memory.hazards.some(h => h.x === o.x && h.y === o.y));
        }

        if (validOptions.length === 0) validOptions = options;

        // Desperate snakes move toward the center regardless of bias
        if (isDesperate) {
            const centerX = 8;
            const centerY = 6;
            return validOptions.sort((a, b) => {
                const distA = Math.abs(a.x - centerX) + Math.abs(a.y - centerY);
                const distB = Math.abs(b.x - centerX) + Math.abs(b.y - centerY);
                return distA - distB;
            })[0];
        }

        const goalBias = isClash ? 'seeks_enemy' : bias;

        // Radiant Trait: Territorial Patrol
        if (goalBias === 'claims_region') {
            const home = snake.evolution['home_pos'] ? { x: snake.evolution['home_pos_x'], y: snake.evolution['home_pos_y'] } : null;
            if (!home) {
                snake.evolution['home_pos_x'] = snake.pos.x;
                snake.evolution['home_pos_y'] = snake.pos.y;
            } else {
                const distToHome = Math.abs(snake.pos.x - home.x) + Math.abs(snake.pos.y - home.y);
                if (distToHome > 3) {
                    return validOptions.sort((a, b) => {
                        const dA = Math.abs(a.x - home.x) + Math.abs(a.y - home.y);
                        const dB = Math.abs(b.x - home.x) + Math.abs(b.y - home.y);
                        return dA - dB;
                    })[0];
                }
            }
        }

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
        this.emit(snake, 'FOOD_EAT', snake.pos, cell.terrain, [cell.food.kind], heal, undefined, 'NONE');
        cell.food = null;
    }

    handleHazard(snake: SnakeState, cell: Cell) {
        if (!cell.hazard) return;
        let damage = cell.hazard.damage;

        // Radiant Trait: Boulderback Resistance
        if (BODIES[snake.draft.body].flags.includes('hazard_resist')) {
            damage = Math.floor(damage * 0.5);
        }

        if (snake.draft.quirk === 'Reckless') damage *= 1.5;
        snake.hp -= damage;

        // Behavioral Growth: Hazard Survival
        snake.evolution['hazards_hit'] = (snake.evolution['hazards_hit'] || 0) + 1;
        if (snake.evolution['hazards_hit'] >= 2 && !snake.flags.includes('SCARRED')) {
            snake.flags.push('SCARRED');
            this.emit(snake, 'BEHAVIOR_SHIFT', snake.pos, cell.terrain, ['SCARRED', 'Gained Hazard Resistance']);
        }

        this.emit(snake, 'HAZARD_HIT', snake.pos, cell.terrain, [cell.hazard.kind], damage, undefined, cell.hazard.kind === '🌀' ? 'STORM' : 'HAZARD');
        if (snake.hp <= 0) {
            snake.alive = false;
            this.emit(snake, 'KO', snake.pos, cell.terrain, ['hazard_death'], undefined, undefined, cell.hazard.kind === '🌀' ? 'STORM' : 'HAZARD');
        }
    }

    handleCombat() {
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
        pairs.forEach(([s1, s2]) => this.resolveCombat(s1, s2));
    }

    resolveCombat(s1: SnakeState, s2: SnakeState) {
        const genre = this.envParams.genre;
        const isSlapstick = genre === 'SLAPSTICK';
        const isZombie = genre === 'ZOMBIE';

        // Simultaneous or sequential? Let's go sequential for now
        const fight = (attacker: SnakeState, defender: SnakeState) => {
            let damage = Math.max(2, attacker.currentStats.venom + attacker.currentStats.size - defender.currentStats.agility);

            // Radiant Trait: Shadow Striker Alpha Strike
            if (attacker.statuses.includes('AMBUSH_READY')) {
                damage *= 2;
                attacker.statuses = attacker.statuses.filter(s => s !== 'AMBUSH_READY');
                this.emit(attacker, 'FEAT_ACCOMPLISHED', attacker.pos, this.world[attacker.pos.y][attacker.pos.x].terrain, ['ALPHA_STRIKE', 'Lethal Ambush']);
            }

            if (isSlapstick) {
                damage = 2;
                this.applyKnockback(defender, attacker);
                defender.lastDamageTick = this.tick; // v13.1 Visual Feedback
                this.emit(defender, 'DAMAGE', defender.pos, this.world[defender.pos.y][defender.pos.x].terrain, ['BONK!', 'Comical Knockback']);
            } else {
                defender.hp -= damage;
                defender.lastDamageTick = this.tick; // v13.1 Visual Feedback
                this.emit(defender, 'DAMAGE', defender.pos, this.world[defender.pos.y][defender.pos.x].terrain, [damage.toString(), isZombie ? 'Infected Bite!' : 'Bite']);
            }

            if (defender.hp <= 0) {
                defender.alive = false;
                this.emit(defender, 'KO', defender.pos, this.world[defender.pos.y][defender.pos.x].terrain, [genre]);
            }
        };

        fight(s1, s2);
        if (s2.alive) fight(s2, s1);
    }

    applyKnockback(target: SnakeState, attacker: SnakeState) {
        const dx = target.pos.x - attacker.pos.x;
        const dy = target.pos.y - attacker.pos.y;
        const nx = Math.max(0, Math.min(this.world[0].length - 1, target.pos.x + dx));
        const ny = Math.max(0, Math.min(this.world.length - 1, target.pos.y + dy));
        target.pos = { x: nx, y: ny };
    }

    checkCascade(snake: SnakeState) {
        const recentAdversity = this.events.filter(e =>
            e.snakeId === snake.id &&
            e.tick >= this.tick - 3 &&
            (e.cause === 'HAZARD' || e.cause === 'STORM' || e.cause === 'COMBAT')
        );

        if (recentAdversity.length >= 2) {
            this.emit(snake, 'CASCADE_START', snake.pos, this.world[snake.pos.y][snake.pos.x].terrain, ['adversity_cluster'], undefined, undefined, 'NONE');
        }
    }

    emit(snake: SnakeState, type: EventType, pos: { x: number, y: number }, terrain: TerrainType, tags: string[], amount?: number, targetId?: string, cause: CauseType = 'NONE'): GameEvent {
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
            cause,
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

import { generateWorld } from './world';

export function generateSimulation(playerDrafts: SnakeDraft[], enemyDrafts: SnakeDraft[], envParams: EnvironmentParams, p2Team: SnakeDraft[] = []) {
    const world = generateWorld(envParams);
    const snakes: SnakeState[] = [
        ...playerDrafts.map((d, i) => createSnake(`Blue-${i}`, 'player', d, i)),
        ...p2Team.map((d, i) => createSnake(`Green-${i}`, 'player', d, i + playerDrafts.length)),
        ...enemyDrafts.map((d, i) => createSnake(`Red-${i}`, 'enemy', d, i))
    ];

    return new Simulation(world, snakes, envParams);
}

function createSnake(name: string, team: 'player' | 'enemy', draft: SnakeDraft, index: number): SnakeState {
    const bodyStats = BODIES[draft.body].stats;
    const affinityBonuses = AFFINITIES[draft.affinity].bonuses;
    const quirkBonuses = QUIRKS[draft.quirk].bonuses;

    const baseStats: Stats = {
        speed: (bodyStats.speed || 0) + (affinityBonuses.speed || 0) + (quirkBonuses.speed || 0),
        size: (bodyStats.size || 0) + (affinityBonuses.size || 0) + (quirkBonuses.size || 0),
        venom: (bodyStats.venom || 0) + (affinityBonuses.venom || 0) + (quirkBonuses.venom || 0),
        agility: (bodyStats.agility || 0) + (affinityBonuses.agility || 0) + (quirkBonuses.agility || 0),
        camouflage: (bodyStats.camouflage || 0) + (affinityBonuses.camouflage || 0) + (quirkBonuses.camouflage || 0)
    };

    return {
        id: `${team}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        team,
        hp: 100,
        maxHp: 100,
        pos: { x: index * 2 + 2, y: team === 'player' ? 2 : 10 },
        draft,
        baseStats,
        currentStats: { ...baseStats },
        aiState: 'searching',
        alive: true,
        inventory: [],
        statuses: [],
        flags: [],
        memory: { hazards: [], food: [], enemies: [] },
        evolution: {},
        experience: 0,
        honor: 0,
        gear: [],
        scavengeProfit: 0,
        storyHistory: [],
        skills: []
    }
}
