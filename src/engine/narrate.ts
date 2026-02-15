import { GameEvent, SnakeState } from './types';

export function generateNarrative(events: GameEvent[], snakes: SnakeState[]) {
    const recap = generateRecap(events, snakes);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        story: generateSnakeStory(events.filter(e => e.snakeId === snake.id), snake)
    }));

    return { recap, snakeStories };
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

    events.forEach((event, i) => {
        // Group by terrain shifts or major events
        if (event.terrain !== currentTerrain) {
            currentTerrain = event.terrain;
            blocks.push(`Entering the ${event.terrain}, ${snake.name} ${getTerrainVerb(event.terrain, snake)}.`);
        }

        switch (event.type) {
            case 'FOOD_EAT':
                blocks.push(`It discovered a ${event.tags[1]} 🍎 and fed hungrily, recovering some vitality.`);
                break;
            case 'HAZARD_HIT':
                blocks.push(`Disaster struck! It stumbled into a ${event.tags[1]} ⚠️ and was badly hurt.`);
                break;
            case 'COMBAT_START':
                blocks.push(`A rival was spotted nearby. Combat was unavoidable.`);
                break;
            case 'COMBAT_TICK':
                // Only log every few ticks or major damage
                if (event.amount && event.amount > 5) {
                    blocks.push(`It struck hard, dealing significant damage to its foe.`);
                }
                break;
            case 'RETREAT':
                blocks.push(`Wounded and weary, it managed to slip away from the confrontation.`);
                break;
            case 'KO':
                blocks.push(`The struggle proved too much. ${snake.name} finally went still.`);
                break;
            case 'TURNING_POINT':
                blocks.push(`A moment of desperation! ${snake.name} surged with a final burst of energy.`);
                break;
        }
    });

    return blocks.join(' ');
}

function getTerrainVerb(terrain: string, snake: SnakeState): string {
    const affinity = snake.draft.affinity;
    if (affinity.includes(terrain.split('-')[0])) return "felt right at home";

    switch (terrain) {
        case 'forest': return "slithered through the thick undergrowth";
        case 'desert': return "skimmed across the burning sands";
        case 'river': return "struggled against the cold current";
        case 'mountain': return "carefully navigated the jagged rocks";
        default: return "moved cautiously";
    }
}
