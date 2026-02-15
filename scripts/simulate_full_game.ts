
import { generateSimulation } from '../src/engine/sim';
import { generateNarrative } from '../src/engine/narrate';
import { SnakeDraft, EnvironmentParams } from '../src/engine/types';

async function runSimulation(runId: string, genre: any, draftOrder: any) {
    console.log(`\n=== RUN ${runId}: ${genre} (${draftOrder}) ===`);

    const envParams: EnvironmentParams = {
        climate: 'Standard',
        fauna: 'Standard',
        flora: 'Dense',
        mode: 'SOLO',
        theme: 'MEDIEVAL',
        genre: genre,
        phase: 1
    };

    const playerTeam: SnakeDraft[] = [
        { body: 'Boulderback', instinct: 'Duelist', affinity: 'Stone-Wise', quirk: 'Anxious' },
        { body: 'Whipcoil', instinct: 'Bloodrush', affinity: 'Storm-Hardened', quirk: 'Reckless' }
    ];

    const enemyTeam: SnakeDraft[] = [
        { body: 'Gilded Hood', instinct: 'Scout', affinity: 'Sun-Touched', quirk: 'Dramatic' }
    ];

    const sim = generateSimulation(playerTeam, enemyTeam, envParams);

    // Headless Loop
    while (sim.tick < sim.maxTicks && sim.snakes.some(s => s.alive)) {
        if (sim.isWaitingForChoice) {
            const encounter = sim.events.find(e => e.tick === sim.tick && e.type === 'PENDING_CHOICE');
            if (encounter) {
                // Auto-resolve choice: 50% FIGHT, 25% HIDE, 25% RUN
                const rand = Math.random();
                const choice = rand > 0.5 ? 'FIGHT' : rand > 0.25 ? 'HIDE' : 'RUN';
                sim.handleChoice(encounter.snakeId, choice);
            }
        }
        sim.step();
        sim.tick++;
    }

    const narrative = generateNarrative(sim.events, sim.snakes, envParams);

    console.log("Recap:", narrative.recap);
    narrative.snakeStories.forEach(s => {
        console.log(`\n[${s.name} Story]`);
        console.log(s.story.fullStory);
    });
}

async function main() {
    await runSimulation("1", "NOIR", "SNAKE_FIRST");
    await runSimulation("2", "SLAPSTICK", "ENV_FIRST");
    await runSimulation("3", "ZOMBIE", "SNAKE_FIRST");
}

main().catch(console.error);
