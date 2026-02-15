import { GameEvent, SnakeState, EnvironmentParams, Genre } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

// v13.2 Narrative Expansion: The Trait Text Registry
// Maps specific constraints (Body, Instinct, Affinity, etc.) to custom flavor text.
export interface TraitTrigger {
    requires: string[]; // e.g., ['Boulderback', 'desert'] or ['high_speed']
    text: string[];
    priority: number; // Higher priority overrides generic text
}

export const TRAIT_TEXT_REGISTRY: TraitTrigger[] = [
    // --- BODY SPECIFIC ---
    {
        requires: ['Boulderback', 'RUN'],
        text: [
            "Refusing to panic, {snakeName} lumbered through the {terrain} like a runaway siege engine.",
            "{snakeName} plowed through obstacles rather than dodging, a juggernaut of scales.",
            "The ground shook as {snakeName} gained momentum, ignoring the {terrain}'s roughness."
        ],
        priority: 10
    },
    {
        requires: ['Whipcoil', 'RUN'],
        text: [
            "{snakeName} became a blur, a ribbon of motion cutting through the {terrain}.",
            "Too fast for the eye to follow, {snakeName} was already gone before the dust settled.",
            "A snap of the tail and {snakeName} flickered away, defying friction."
        ],
        priority: 10
    },
    {
        requires: ['Gilded Hood', 'ANY'],
        text: [
            "{snakeName} flared its hood, demanding the {terrain} acknowledge its presence.",
            "Even in retreat, {snakeName} maintained a regal posture, hissing disdainfully.",
            "The light caught {snakeName}'s scales, turning the moment into a dazzling display."
        ],
        priority: 5
    },

    // --- INSTINCT SPECIFIC ---
    {
        requires: ['Cowardly Clever', 'FIGHT'],
        text: [
            "Cornered and panic-stricken, {snakeName} lashed out blindly at the threat!",
            "{snakeName} shrieked a silent frequency of terror, biting effectively despite the fear.",
            "Fighting only because there was no hole to hide in, {snakeName} struck wildly."
        ],
        priority: 10
    },
    {
        requires: ['Bloodrush', 'RUN'],
        text: [
            "{snakeName} retreated, but only to circle back for a better killing angle.",
            "The withdrawal was tactical; {snakeName} was already visualizing the counter-attack.",
            "Seething with adrenaline, {snakeName} forced itself to pull back from the bloodshed."
        ],
        priority: 10
    },

    // --- AFFINITY CLASHES & SYNERGIES ---
    {
        requires: ['Sun-Touched', 'desert'],
        text: [
            "The scorching sand fueled {snakeName}, heat radiating from its scales like a weapon.",
            "{snakeName} moved through the dunes like liquid glass, perfectly at home in the furnace.",
            "While others withered, {snakeName} drew strength from the merciless sun."
        ],
        priority: 20
    },
    {
        requires: ['Mist-Bound', 'river'],
        text: [
            "In the damp air, {snakeName} dissolved into the mist, becoming invisible and everywhere.",
            "The water was an ally; {snakeName} flowed with the current, striking from the foam.",
            "Fog condensed on {snakeName}'s scales, creating a cloaking field of vapor."
        ],
        priority: 20
    },
    {
        requires: ['Void-Blessed', 'ANY'],
        text: [
            "{snakeName} glitched forward, frames skipping as it defied local physics.",
            "The geometry around {snakeName} seemed to fold unnaturally.",
            "A static hiss accompanied {snakeName}'s movement, a tear in the simulation."
        ],
        priority: 15
    },

    // --- GENRE SPECIFIC (v13.2) ---
    {
        requires: ['ZOMBIE', 'DAMAGE'],
        text: [
            "{snakeName} didn't flinch. Chunks of flesh tore away, but the hunger remained.",
            "The wound leaked grey fluid instead of blood. {snakeName} persisted.",
            "Pain was a distant memory for {snakeName}'s decayed nervous system."
        ],
        priority: 15
    },
    {
        requires: ['SLAPSTICK', 'KO'],
        text: [
            "With a comical WHUMP, {snakeName} flattened into a pancake and drifted away.",
            "Stars circled {snakeName}'s head—literally—before it collapsed with a wheeze.",
            "A sign reading 'OUCH' appeared briefly as {snakeName} was knocked out."
        ],
        priority: 20
    },
    {
        requires: ['NOIR', 'STAY_HIDDEN'],
        text: [
            "\"{terrain} is a good place to die,\" {snakeName} thought, merging with the shadows.",
            "The shadows were long, but {snakeName}'s patience was longer.",
            "Rain or not, {snakeName} knew how to wait out the trouble."
        ],
        priority: 15
    }
];

const GENERIC_RUN = [
    "{snakeName} bolted as the {terrain} whipped past in a blurred streak.",
    "A slip of the scales and a recovery: {snakeName} narrowly keeps the pace.",
    "The chase is on. {terrain} provides no ease for the fleeing heart.",
    "With a desperate leap, {snakeName} clears a jagged {terrain} shard.",
    "Foliage becomes a transient shield for the sprinting {snakeName}."
];

const GENERIC_HIDE = [
    "{snakeName} merges with the shadows of the {terrain}, becoming one with the dark.",
    "Leaf camouflage is perfect; {snakeName} is a ghost in the green.",
    "Freezing under the spotlight of the sun, {snakeName} holds its breath.",
    "A moment of control; even the Jacobson's organ is still.",
    "The predator sniffs close; {snakeName} feels the vibration of death."
];

const GENERIC_FIGHT = [
    "A quick strike duel in the {terrain}; fangs clash with scales.",
    "The grapple is long and agonizing; {snakeName} fights for every inch.",
    "A reversal moment! {snakeName} turns the tide of the struggle.",
    "Skill activation! {snakeName} channels the spirit of the Architect.",
    "Scales break and blood spills on the unforgiving {terrain}."
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
    const draft = snake.draft;

    const stagedEncounters = snakeEvents.filter(e => e.type === 'ENCOUNTER_RESULT');

    stagedEncounters.forEach(e => {
        const choice = e.tags[0]; // ESCAPE, STAY_HIDDEN, REVEALED
        const terrainKey = e.terrain || 'forest';
        const terrainDesc = TERRAIN_DESCRIPTORS[terrainKey] || terrainKey;

        // Build context for the Trait Registry
        const contextFn = (trigger: TraitTrigger) => {
            const reqs = trigger.requires;
            // Check if all requirements are met
            return reqs.every(r => {
                if (r === 'ANY') return true;
                if (r === choice) return true;
                if (r === terrainKey) return true;
                if (r === genre) return true;

                // Check Snake Props
                if (draft.body === r) return true;
                if (draft.instinct === r) return true;
                if (draft.affinity === r) return true;

                // Check Flags? (Optional, if we expose them clearly)
                return false;
            });
        };

        // Find best match
        const matches = TRAIT_TEXT_REGISTRY.filter(contextFn);
        matches.sort((a, b) => b.priority - a.priority); // Highest first

        let templates = GENERIC_RUN;
        if (choice === 'STAY_HIDDEN' || choice === 'REVEALED') templates = GENERIC_HIDE;
        if (choice === 'FIGHT') templates = GENERIC_FIGHT;

        // Override if match found
        if (matches.length > 0) {
            templates = matches[0].text;
        }

        let text = templates[Math.floor(Math.random() * templates.length)];
        text = text.replace(/{snakeName}/g, snake.name).replace(/{terrain}/g, terrainDesc);

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
