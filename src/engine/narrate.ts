import { GameEvent, SnakeState, EnvironmentParams, Theme, CauseType } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export function generateNarrative(events: GameEvent[], snakes: SnakeState[], params?: EnvironmentParams) {
    const theme = params?.theme || 'MEDIEVAL';
    const recap = generateSurgicalRecap(events, snakes, theme);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        bio: generateOriginBio(snake, theme),
        story: compileCausalArcs(events.filter(e => e.snakeId === snake.id), snake, events, theme)
    }));

    return { recap, snakeStories };
}

function generateOriginBio(snake: SnakeState, theme: Theme) {
    const d = snake.draft;
    const prefix = theme === 'SCIFI' ? 'Model' : 'Vested';
    return `${prefix} ${snake.name}: ${BODIES[d.body].description} ${INSTINCTS[d.instinct].description} ${AFFINITIES[d.affinity].description}.`;
}

function generateSurgicalRecap(events: GameEvent[], snakes: SnakeState[], theme: Theme) {
    const survivors = snakes.filter(s => s.alive);
    const playerSurvivors = survivors.filter(s => s.team === 'player');
    const enemySurvivors = survivors.filter(s => s.team === 'enemy');
    const isSciFi = theme === 'SCIFI';

    let tone = "";
    if (survivors.length === 0) {
        tone = isSciFi
            ? "TOTAL SYSTEM COLLAPSE. All units de-rezzed. The grid is silent."
            : "MUTUAL EXTINCTION. The soil drank too much; no champion remains to claim the throne.";
    } else if (playerSurvivors.length > 0 && enemySurvivors.length === 0) {
        tone = isSciFi
            ? "TOTAL DOMINATION. Enemy sub-routines purged. Blue team synchronization optimal."
            : "ABSOLUTE TRIUMPH. The enemy brood lies broken. Honor is satisfied.";
    } else if (survivors.length === 1 && survivors[0].hp < 25) {
        tone = isSciFi
            ? "FRAGILE SURVIVAL. A lone unit remains, hardware smoking, data corrupted."
            : "SOLEMN VICTORY. A single survivor crawls from the wreckage, scarred and staggering.";
    } else {
        tone = isSciFi ? "Expedition baseline recorded. Grid stabilized." : "The chronicles for this era have concluded.";
    }

    return tone;
}

function compileCausalArcs(snakeEvents: GameEvent[], snake: SnakeState, allEvents: GameEvent[], theme: Theme) {
    if (snakeEvents.length === 0) return { fullStory: "A ghost in the shadows...", visuals: [] };

    const arcs: { text: string, visualPrompt: string }[] = [];
    const isSciFi = theme === 'SCIFI';

    // Grouping into Cascades
    const cascadeStarts = snakeEvents.filter(e => e.type === 'CASCADE_START');

    // 1. Initial Identity Anchor
    const firstHazard = snakeEvents.find(e => e.type === 'HAZARD_HIT');
    if (firstHazard) {
        arcs.push({
            text: isSciFi
                ? `${snake.name} initiated hardware stress tests in the ${firstHazard.terrain}.`
                : `Beneath the ${firstHazard.terrain} sky, ${snake.name} first tasted the bite of the land.`,
            visualPrompt: `A snake being surprised by a trap in a ${firstHazard.terrain}`
        });
    }

    // 2. Adversity & Cascades
    if (cascadeStarts.length > 0) {
        arcs.push({
            text: isSciFi
                ? `System experienced a cascade of failures. Damage types tracked: ${Array.from(new Set(snakeEvents.map(e => e.cause).filter(c => c !== 'NONE'))).join(', ')}.`
                : `A storm of tragedy broke upon it. Driven by the elements and broken by steel, it entered a desperate struggle.`,
            visualPrompt: "A snake surrounded by fire, storm, and fangs"
        });
    }

    // 3. Behavioral Shifts (v7.0)
    const shifts = snakeEvents.filter(e => e.type === 'BEHAVIOR_SHIFT');
    shifts.forEach(s => {
        arcs.push({
            text: isSciFi
                ? `Safety protocols bypassed: ${s.tags[0]} state active. ${s.tags[1]}.`
                : `The serpent has been forged anew: ${s.tags[0]}! ${s.tags[1]}.`,
            visualPrompt: `A snake showing a visible change or aura of ${s.tags[0]}`
        });
    });

    // 4. Encounters
    const choices = snakeEvents.filter(e => e.type === 'ENCOUNTER_CHOICE');
    choices.forEach(c => {
        const result = snakeEvents.find(e => e.type === 'ENCOUNTER_RESULT' && e.tick === c.tick);
        if (result) {
            arcs.push({
                text: isSciFi
                    ? `Encounter logic: Automated ${c.tags[0]} resolve. Outcome: ${result.tags[0]}.`
                    : `In the moment of choice, the serpent's blood dictated ${c.tags[0]}. Result: ${result.tags[0]}.`,
                visualPrompt: `A snake choosing to ${c.tags[0]} at a crossroad`
            });
        }
    });

    // 5. Final Fate
    const ko = snakeEvents.find(e => e.type === 'KO');
    if (ko) {
        const causePhrase = getCausePhrase(ko.cause || 'NONE', isSciFi);
        arcs.push({
            text: isSciFi ? `UNIT DE-REZZED. Cause: ${causePhrase}.` : `THE END. ${causePhrase}.`,
            visualPrompt: "The final resting place of a fallen serpent"
        });
    }

    return {
        fullStory: arcs.map(a => a.text).join(' '),
        visuals: arcs
    };
}

function getCausePhrase(cause: CauseType, isSciFi: boolean): string {
    switch (cause) {
        case 'STORM': return isSciFi ? "Eradicated by containment field collapse" : "Swallowed by the narrowing eye of the storm";
        case 'TERRAIN': return isSciFi ? "Chassis failure due to environment mismatch" : "Foundered in terrain it was never meant to cross";
        case 'HAZARD': return isSciFi ? "Catastrophic impact with external obstacle" : "Broken by the jagged teeth of the land";
        case 'COMBAT': return isSciFi ? "Purged by rival sub-routine" : "Slain in honorable, if bloody, combat";
        default: return isSciFi ? "Unknown fatal error" : "Claimed by the silence of the waste";
    }
}
