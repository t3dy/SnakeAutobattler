import { GameEvent, SnakeState } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export function generateNarrative(events: GameEvent[], snakes: SnakeState[]) {
    const recap = generateRecap(events, snakes);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        bio: generateOriginBio(snake),
        story: generateSnakeStory(events.filter(e => e.snakeId === snake.id), snake)
    }));

    return { recap, snakeStories };
}

function generateOriginBio(snake: SnakeState) {
    const d = snake.draft;
    return `${BODIES[d.body].description} ${INSTINCTS[d.instinct].description} ${AFFINITIES[d.affinity].description} Notably, it is ${QUIRKS[d.quirk].description.toLowerCase()}`;
}

function generateRecap(events: GameEvent[], snakes: SnakeState[]) {
    const kos = events.filter(e => e.type === 'KO');
    const foodEaten = events.filter(e => e.type === 'FOOD_EAT').length;
    const winners = snakes.filter(s => s.alive && s.team === 'player');

    let intro = "The battle concluded after a series of intense territorial skirmishes. ";
    let result = winners.length > 0 ? "Your team emerged victorious, having dominated the key biomes." : "The rival snakes proved too resilient, claiming the territory for themselves.";

    return `${intro} Total food consumed: ${foodEaten}. Fatalities: ${kos.length}. ${result}`;
}

function generateSnakeStory(events: GameEvent[], snake: SnakeState) {
    if (events.length === 0) return "This snake remained in the shadows, unseen and untouched.";

    const blocks: string[] = [];
    let currentTerrain = '';

    events.forEach((event) => {
        if (event.terrain !== currentTerrain) {
            currentTerrain = event.terrain;
            blocks.push(`Entering the ${event.terrain}, ${snake.name} ${getTerrainVerb(event.terrain, snake)}.`);
        }

        switch (event.type) {
            case 'FOOD_EAT':
                blocks.push(getFoodFlavor(snake, event));
                break;
            case 'HAZARD_HIT':
                blocks.push(getHazardFlavor(snake, event));
                break;
            case 'COMBAT_START':
                blocks.push(getCombatStartFlavor(snake, event));
                break;
            case 'COMBAT_TICK':
                if (event.amount && event.amount > 5) {
                    blocks.push(getCombatTickFlavor(snake, event));
                }
                break;
            case 'RETREAT':
                blocks.push(getRetreatFlavor(snake, event));
                break;
            case 'KO':
                blocks.push(`${snake.name} finally went still, its journey ending in the ${event.terrain}.`);
                break;
        }
    });

    return blocks.join(' ');
}

function getTerrainVerb(terrain: string, snake: SnakeState): string {
    const affinity = snake.draft.affinity;
    if (AFFINITIES[affinity].terrain === terrain) return "felt a surge of power, fully at home in its element";

    switch (terrain) {
        case 'forest': return "slithered through the thick undergrowth";
        case 'desert': return "skimmed across the burning sands";
        case 'river': return "struggled against the cold current";
        case 'mountain': return "carefully navigated the jagged rocks";
        default: return "moved cautiously";
    }
}

function getFoodFlavor(snake: SnakeState, event: GameEvent): string {
    const quirk = snake.draft.quirk;
    if (quirk === 'Voracious') return `Driven by an insatiable hunger, it tore into the ${event.tags[1]} 🍎, barely pausing to breathe.`;
    return `It discovered a ${event.tags[1]} 🍎 and fed, its movements briefly slowing as it digested the meal.`;
}

function getHazardFlavor(snake: SnakeState, event: GameEvent): string {
    const quirk = snake.draft.quirk;
    if (quirk === 'Reckless') return `Ignoring the warning signs, it charged straight into a ${event.tags[1]} ⚠️. The impact was brutal.`;
    if (quirk === 'Cautious') return `Despite its best efforts to stay safe, it was caught by a hidden ${event.tags[1]} ⚠️.`;
    return `It stumbled into a ${event.tags[1]} ⚠️ and was badly hurt.`;
}

function getCombatStartFlavor(snake: SnakeState, event: GameEvent): string {
    const instinct = snake.draft.instinct;
    if (instinct === 'Hunter') return `Scenting an intruder, it coiled and launched an aggressive assault before the rival could react.`;
    if (instinct === 'Territorial') return `A rival dared to enter its domain. It hissed a warning and prepared to defend its ground.`;
    return `A rival was spotted nearby. Combat was unavoidable.`;
}

function getCombatTickFlavor(snake: SnakeState, event: GameEvent): string {
    const body = snake.draft.body;
    if (body === 'Boulderback Constrictor') return `It used its massive weight to crush its foe, scales grinding against scales.`;
    if (body === 'Shadow Striker') return `A flash of movement, followed by the insertion of needle-sharp fangs.`;
    return `It struck hard, dealing significant damage to its foe.`;
}

function getRetreatFlavor(snake: SnakeState, event: GameEvent): string {
    const quirk = snake.draft.quirk;
    if (quirk === 'Paranoid') return `Fearing the worst, it broke off the engagement and vanished into the brush before things could turn fatal.`;
    return `Wounded and weary, it managed to slip away from the confrontation.`;
}
