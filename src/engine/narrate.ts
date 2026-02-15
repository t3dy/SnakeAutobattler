import { GameEvent, SnakeState, EnvironmentParams, Theme } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export function generateNarrative(events: GameEvent[], snakes: SnakeState[], params?: EnvironmentParams) {
    const theme = params?.theme || 'MEDIEVAL';
    const recap = generateDramaticRecap(events, snakes, theme);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        bio: generateOriginBio(snake, theme),
        story: compileStoryArcs(events.filter(e => e.snakeId === snake.id), snake, events, theme)
    }));

    return { recap, snakeStories };
}

function generateOriginBio(snake: SnakeState, theme: Theme) {
    const d = snake.draft;
    const prefix = theme === 'SCIFI' ? 'Model' : 'Vested';
    return `${prefix} ${snake.name}: ${BODIES[d.body].description} ${INSTINCTS[d.instinct].description} ${AFFINITIES[d.affinity].description}.`;
}

function generateDramaticRecap(events: GameEvent[], snakes: SnakeState[], theme: Theme) {
    const kos = events.filter(e => e.type === 'KO');
    const phaseShift = events.find(e => e.type === 'PHASE_SHIFT');
    const winners = snakes.filter(s => s.alive && s.team === 'player');

    let story = theme === 'SCIFI'
        ? "The digital arena flickered with the data-ghosts of fallen units. "
        : "The chronicle of this land is written in the shed skin and spilled venom of its champions. ";

    if (phaseShift) {
        story += theme === 'SCIFI'
            ? "Entry into the CLASH protocol forced all sub-routines into a terminal convergence. "
            : "The horn of the Clash sounded, ending the scavenge and demanding blood for the soil. ";
    }

    story += winners.length > 0 ? "Unity prevailed; the brood claims the record." : "The cycle resets, leaving only static and dust.";

    return story;
}

function compileStoryArcs(snakeEvents: GameEvent[], snake: SnakeState, allEvents: GameEvent[], theme: Theme) {
    if (snakeEvents.length === 0) return { fullStory: "A shadow in the undergrowth...", visuals: [{ text: "...", visualPrompt: "Hidden" }] };

    const arcs: { text: string, visualPrompt: string }[] = [];
    const isSciFi = theme === 'SCIFI';

    // 1. Scavenge Arc
    const encounters = snakeEvents.filter(e => e.type === 'ENCOUNTER_RESULT');
    if (encounters.length > 0) {
        const victory = encounters.some(e => e.tags.includes('VICTORY'));
        const text = victory
            ? (isSciFi ? `System override successful. The unit integrated high-value components.` : `By the grace of the Sigil, the serpent claimed the spoils of the ancient altar.`)
            : (isSciFi ? `Critical failure. Ambushed by rogue security bots.` : `The Alchemist's trap was sprung; blood was shed for nothing.`);
        arcs.push({
            text,
            visualPrompt: isSciFi ? "A robotic snake hacking a glowing terminal" : "A knightly snake bowing before a stone altar"
        });
    }

    // 2. Clash Arc
    const fights = snakeEvents.filter(e => e.type === 'COMBAT_START');
    if (fights.length > 0) {
        const text = isSciFi
            ? `Laser-sight locked on targets. The ${snake.name} engaged in multi-threaded combat.`
            : `Fangs bared in the mud of the Clash. The ${snake.name} entered the fray with noble intent.`;
        arcs.push({
            text,
            visualPrompt: isSciFi ? "Two cybernetic snakes fighting with neon energy coils" : "Two giant snakes coiled in a muddy battlefield"
        });
    }

    // 3. Final Fate
    const ko = snakeEvents.find(e => e.type === 'KO');
    if (ko) {
        arcs.push({
            text: isSciFi ? "Unit de-rezzed. Data uploaded to the cloud." : "The knight falls. May his scales line the throne of he who follows.",
            visualPrompt: isSciFi ? "A digital glitch effect in the shape of a snake" : "A broken snake crown resting on a mountain peak"
        });
    } else {
        arcs.push({
            text: isSciFi ? "The ghost remains in the machine." : "He stands as a monolith of the era.",
            visualPrompt: "A majestic snake overlooking a vast, conquered landscape"
        });
    }

    return {
        fullStory: arcs.map(a => a.text).join(' '),
        visuals: arcs
    };
}
