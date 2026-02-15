
import { NarrativeComposer, BeatContext } from '../src/engine/NarrativeSystem';
import { SnakeState } from '../src/engine/types';

// Mock Snake
const mockSnake: SnakeState = {
    id: 'snake_1',
    name: 'SNAKE_TEST',
    team: 'player',
    hp: 100, maxHp: 100, pos: { x: 0, y: 0 },
    draft: { body: 'Boulderback', instinct: 'Standard', affinity: 'None', quirk: 'None' },
    baseStats: {} as any, currentStats: {} as any,
    aiState: 'searching', alive: true, inventory: [], statuses: [], flags: [],
    memory: { hazards: [], food: [], enemies: [] },
    evolution: {}, experience: 0, honor: 0, gear: [], scavengeProfit: 0, storyHistory: [], skills: []
};

// Mock Context
const ctx: BeatContext = {
    seed: 12345,
    tick: 100,
    phase: 'KNOWN',
    actLabel: 'RISING',
    snake: mockSnake,
    environment: { terrain: 'forest', fields: {} },
    encounter: { type: 'AMBUSH', intensity: 50, tags: ['NOIR'] },
    action: 'RUN',
    radiance: { value: 50, band: 'MID' },
    history: { usedTemplateIds: [], perTemplateCooldowns: {} }
};

const composer = new NarrativeComposer();
console.log("--- NARRATIVE COMPOSER VERIFICATION ---");
console.log("Scenario: Boulderback RUNNING from AMBUSH in FOREST (Noir)");

for (let i = 0; i < 5; i++) {
    const beat = composer.composeBeat(ctx);
    console.log(`Beat ${i + 1}: ${beat}`);

    // Simulate tick advance for cooldowns
    Object.keys(ctx.history.perTemplateCooldowns).forEach(k => {
        ctx.history.perTemplateCooldowns[k]--;
    });
}

console.log("\n--- SCENARIO 2: SOLDIER CLASH ---");
ctx.snake.draft.instinct = 'Defender';
ctx.snake.draft.body = 'Boulderback';
ctx.encounter.type = 'CLASH';
ctx.action = 'FIGHT';
ctx.history.usedTemplateIds = []; // Reset history
ctx.history.perTemplateCooldowns = {};

for (let i = 0; i < 3; i++) {
    const beat = composer.composeBeat(ctx);
    console.log(`Beat ${i + 1}: ${beat}`);
}
