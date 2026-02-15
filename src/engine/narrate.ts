import { GameEvent, SnakeState, EnvironmentParams, Genre } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

const RUN_TEMPLATES = [
    "{snakeName} bolted as the {terrain} whipped past in a blurred streak.",
    "A slip of the scales and a recovery: {snakeName} narrowly keeps the pace.",
    "The chase is on. {terrain} provides no ease for the fleeing heart.",
    "With a desperate leap, {snakeName} clears a jagged {terrain} shard.",
    "Foliage becomes a transient shield for the sprinting {snakeName}.",
    "{snakeName} races toward the storm's edge, heat rising from the {terrain}.",
    "The enemy closing in, {snakeName} feels the breath of the pursuer.",
    "A moment of false safety in the {terrain} before the sprint resumes.",
    "A lucky branch snap distracts the threat; {snakeName} seizes the gap.",
    "Collapsing into a bush, {snakeName} vanishes from the {terrain} view."
];

const HIDE_TEMPLATES = [
    "{snakeName} merges with the shadows of the {terrain}, becoming one with the dark.",
    "Leaf camouflage is perfect; {snakeName} is a ghost in the green.",
    "Freezing under the spotlight of the sun, {snakeName} holds its breath.",
    "A moment of control; even the Jacobson's organ is still.",
    "The predator sniffs close; {snakeName} feels the vibration of death.",
    "A tail twitch almost gives {snakeName} away in the silent {terrain}.",
    "The enemy is distracted; {snakeName} remains a statue in the mud.",
    "A sudden gust almost reveals the coil; {snakeName} holds fast.",
    "Camouflage shimmers as {snakeName} tunes into the {terrain} frequency.",
    "A near sneeze moment—{snakeName} suppresses the urge with a tight coil."
];

const FIGHT_TEMPLATES = [
    "A quick strike duel in the {terrain}; fangs clash with scales.",
    "The grapple is long and agonizing; {snakeName} fights for every inch.",
    "A reversal moment! {snakeName} turns the tide of the struggle.",
    "Skill activation! {snakeName} channels the spirit of the Architect.",
    "A knockback slam sends {snakeName} reeling against the {terrain}.",
    "The final lunge is silent, deadly, and perfectly timed.",
    "Scales break and blood spills on the unforgiving {terrain}.",
    "A phase-shift blink! {snakeName} flickers in and out of the world.",
    "A stunned pause as both combatants recalibrate their resolve.",
    "A double-hit exchange leaves {snakeName} gasping for air."
];

const TERRAIN_DESCRIPTORS: Record<string, string> = {
    'forest': 'twisting branches and damp leaves',
    'desert': 'shifting sands and scorched heat',
    'river': 'surging currents and slick stones',
    'mountain': 'jagged peaks and thin air'
};

export function generateNarrative(events: GameEvent[], snakes: SnakeState[], params?: EnvironmentParams) {
    const genre = params?.genre || 'NOIR';
    const resonance = events.some(e => e.type === 'SYSTEM_RESONANCE') ? 150 : 100;

    const recap = generateGenreRecap(events, snakes, genre, resonance);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        bio: generateGenreBio(snake, genre),
        story: compileGenreArcs(events.filter(e => e.snakeId === snake.id), snake, genre, resonance)
    }));

    return { recap, snakeStories };
}

function generateGenreBio(snake: SnakeState, genre: Genre) {
    switch (genre) {
        case 'SLAPSTICK': return `${snake.name} is a rubbery specimen often found slipping on its own tail.`;
        case 'ZOMBIE': return `${snake.name} is a pallid survivor dragging its decayed scales through the mud.`;
        case 'NOIR': return `${snake.name} is a cynical coil who's seen too much rain and too little justice.`;
        case 'SPY': return `${snake.name} is an elite undercover operative with digital scales.`;
        case 'ALIEN': return `${snake.name} is an ethereal entity phasing through the local data.`;
        default: return `${snake.name} is a standard biological unit.`;
    }
}

function generateGenreRecap(events: GameEvent[], snakes: SnakeState[], genre: Genre, resonance: number) {
    const isCorrupted = resonance < 40;
    const isResonant = resonance > 160;
    if (isCorrupted) return "ERR: NARRATIVE_BUFFER_OVERFLOW. The timeline is fraying.";
    if (isResonant) return "The simulation has reached perfect harmony. A legendary archive entry.";

    const survivors = snakes.filter(s => s.alive);
    return survivors.length > 0 ? "The expedition concludes. The coil remains." : "The void claims all. The chronicle ends.";
}

function compileGenreArcs(snakeEvents: GameEvent[], snake: SnakeState, genre: Genre, resonance: number) {
    const arcs: any[] = [];

    const stagedEncounters = snakeEvents.filter(e => e.type === 'ENCOUNTER_RESULT');

    stagedEncounters.forEach(e => {
        const choice = e.tags[0]; // ESCAPE, STAY_HIDDEN, REVEALED
        const terrainKey = e.terrain || 'forest';
        const terrainDesc = TERRAIN_DESCRIPTORS[terrainKey] || terrainKey;

        let templates = RUN_TEMPLATES;
        if (choice === 'STAY_HIDDEN' || choice === 'REVEALED') templates = HIDE_TEMPLATES;
        if (choice === 'FIGHT') templates = FIGHT_TEMPLATES;

        let text = templates[Math.floor(Math.random() * templates.length)];
        text = text.replace('{snakeName}', snake.name).replace('{terrain}', terrainDesc);

        if (resonance < 60) text = `[BLEED] ${text}`;

        arcs.push({ title: choice, story: text });
    });

    // Fallback if no encounters
    if (arcs.length === 0 && snakeEvents.length > 0) {
        arcs.push({ title: 'THE SLITHER', story: `${snake.name} moved through the world, a silent line of intent.` });
    }

    return {
        fullStory: arcs.map(a => a.story).join(' '),
        arcs: arcs
    };
}
