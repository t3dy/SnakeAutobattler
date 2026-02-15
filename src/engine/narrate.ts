import { GameEvent, SnakeState, EnvironmentParams, Genre } from './types';
import { NarrativeComposer, BeatContext } from './NarrativeSystem';

// v14.0 The Narrative Skald
// The central composer instance.
export const composer = new NarrativeComposer();

// Legacy generic fallbacks for safety (though Composer has them too)
// We keep them here if needed for direct access, or remove if fully migrated.
// For now, let's trust the composer but keep the functions that call it.

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
        const choice = e.tags[0]; // ESCAPE, STAY_HIDDEN, REVEALED, FIGHT
        const terrainKey = e.terrain || 'forest';
        const terrainDesc = TERRAIN_DESCRIPTORS[terrainKey] || terrainKey;

        // Map choice to Action & EncounterType
        let action = 'RUN';
        let encounterType: any = 'GENERIC'; // Default

        if (choice === 'ESCAPE') {
            action = 'RUN';
            encounterType = 'EVADE';
        }
        if (choice === 'STAY_HIDDEN') {
            action = 'STAY_HIDDEN';
            encounterType = 'AMBUSH'; // Successfully hiding from ambush
        }
        if (choice === 'REVEALED') {
            action = 'STAY_HIDDEN'; // Failed hide
            encounterType = 'AMBUSH';
        }
        if (choice === 'VICTORY' || choice === 'DEFEAT' || choice === 'FIGHT') {
            action = 'FIGHT';
            encounterType = 'CLASH';
        }
        if (choice === 'KO' || (e.tags && e.tags.includes('KO'))) {
            action = 'KO';
            encounterType = 'DEATH';
        }

        const context: BeatContext = {
            seed: 0, // Placeholder
            tick: e.tick,
            phase: e.snapshot?.pacing?.phase || 'KNOWN',
            actLabel: e.snapshot?.pacing?.act || 'RISING',
            snake: snake,
            environment: { terrain: terrainKey },
            encounter: {
                type: encounterType,
                intensity: 50,
                tags: e.tags
            },
            action: action,
            radiance: {
                value: resonance,
                band: resonance > 80 ? 'HIGH' : resonance < 40 ? 'LOW' : 'MID'
            },
            genre: genre, // v14.1 Genre Isolation
            history: {
                usedTemplateIds: [],
                perTemplateCooldowns: {}
            }
        };

        // v14.0: Delegate to Composer
        let text = composer.composeBeat(context);

        // Fallback interpolation if Composer didn't do it (Composer logic handles it, but just in case)
        if (!text) text = `${snake.name} moved through the ${terrainDesc}.`;

        if (resonance < 60) text = `[BLEED] ${text}`;

        arcs.push({ title: choice, story: text });
    });

    // v14.1 Slither Logic: If no encounters occurred, we still want a trait-rich story.
    // We treat the "Slither" as a special beat context.
    if (arcs.length === 0 && snakeEvents.length > 0) {
        const lastMove = [...snakeEvents].reverse().find(e => e.type === 'MOVE');
        const context: BeatContext = {
            seed: 0,
            tick: lastMove?.tick || 0,
            phase: lastMove?.snapshot?.pacing?.phase || 'KNOWN',
            actLabel: lastMove?.snapshot?.pacing?.act || 'OPENING',
            snake: snake,
            environment: { terrain: lastMove?.terrain || 'forest' },
            encounter: {
                type: 'EVADE', // Light encounter type for slithering
                intensity: 10,
                tags: []
            },
            action: 'MOVE',
            radiance: { value: resonance, band: resonance > 80 ? 'HIGH' : resonance < 40 ? 'LOW' : 'MID' },
            genre: genre, // v14.1 Genre Isolation
            history: { usedTemplateIds: [], perTemplateCooldowns: {} }
        };

        // We override the compose logic to look for SLITHER category specifically if we wanted, 
        // but for now let's just use the existing composer and a special "MOVE" action.
        // Actually, let's add a `composeSlither` or similar, or just trust the registry.
        // I added SLITHER category to the composer, so let's use it.

        // Minor modification to Composer needed to handle SLITHER category? 
        // No, I'll just manually call selectTemplate for SLITHER in a new method or use the generic one.
        // Let's keep it simple: just call composeBeat with a specific context.

        const slitherText = composer.composeBeat(context); // This will need the composer to understand MOVE action
        arcs.push({ title: 'THE SLITHER', story: slitherText || `${snake.name} moved through the world.` });
    }

    return {
        fullStory: arcs.map(a => a.story).join(' '),
        arcs: arcs
    };
}
