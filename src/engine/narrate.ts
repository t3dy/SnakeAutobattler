import { GameEvent, SnakeState } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

export function generateNarrative(events: GameEvent[], snakes: SnakeState[]) {
    const recap = generateDramaticRecap(events, snakes);
    const snakeStories = snakes.map(snake => ({
        name: snake.name,
        bio: generateOriginBio(snake),
        story: compileStoryArcs(events.filter(e => e.snakeId === snake.id), snake, events)
    }));

    return { recap, snakeStories };
}

function generateOriginBio(snake: SnakeState) {
    const d = snake.draft;
    return `${BODIES[d.body].description} ${INSTINCTS[d.instinct].description} ${AFFINITIES[d.affinity].description} [Strategy: ${BODIES[d.body].strategy} ${INSTINCTS[d.instinct].strategy}]`;
}

function generateDramaticRecap(events: GameEvent[], snakes: SnakeState[]) {
    const kos = events.filter(e => e.type === 'KO');
    const stormTicks = events.filter(e => e.type === 'STORM_ADVANCE').length;
    const highestEvolution = [...snakes].sort((a, b) =>
        Object.values(b.evolution).reduce((s, v) => s + (v || 0), 0) -
        Object.values(a.evolution).reduce((s, v) => s + (v || 0), 0)
    )[0];

    const winners = snakes.filter(s => s.alive && s.team === 'player');
    const survivorCount = snakes.filter(s => s.alive).length;

    let story = `The arena became a crucible of survival. `;
    if (stormTicks > 0) story += `The narrowing boundaries of the storm claimed the weak, forcing the remaining ${survivorCount} snakes into a final, bloody convergence. `;

    if (kos.length > 3) {
        story += `It was a massacre, with fatalities occurring in almost every biome. `;
    } else {
        story += `Territorial posturing dominated most of the encounter, with few direct kills. `;
    }

    if (highestEvolution) {
        story += `${highestEvolution.name} showed the most significant growth, adapting rapidly to the environment. `;
    }

    story += winners.length > 0 ? "Against all odds, your brood held the territory." : "The wild reclaim the land; your team has fallen.";

    return story;
}

/**
 * Story Compiler v4.0
 * Group events into dramatic beats instead of 1-1 mapping.
 */
function compileStoryArcs(snakeEvents: GameEvent[], snake: SnakeState, allEvents: GameEvent[]) {
    if (snakeEvents.length === 0) return "A shadow in the undergrowth, it left no trace.";

    const arcs: string[] = [];
    const drafts = snake.draft;

    // 1. Exploration Arc (Biomes)
    const exploredBiomes = Array.from(new Set(snakeEvents.map(e => e.terrain))).slice(0, 3);
    if (exploredBiomes.length > 1) {
        arcs.push(`${snake.name} traversed from the ${exploredBiomes[0]} to the ${exploredBiomes[1]}, displaying its ${drafts.body.split(' ')[0]} endurance.`);
    }

    // 2. Conflict/Combat Arc (Summarize all fights)
    const fights = snakeEvents.filter(e => e.type === 'COMBAT_START');
    if (fights.length > 0) {
        const uniqueFoes = Array.from(new Set(fights.map(f => f.targetId)));
        let fightStory = `The scent of ${uniqueFoes.length} rivals kept it on high alert. `;

        const turningPoints = snakeEvents.filter(e => e.type === 'TURNING_POINT');
        if (turningPoints.length > 0) {
            fightStory += `In one desperate clash, the tide of battle shifted violently. `;
        }

        const kills = allEvents.filter(e => e.type === 'KO' && e.targetId === snake.id && e.tags.some(t => t.includes(`slain_by`)));
        if (kills.length > 0) {
            fightStory += `It asserted its dominance through raw force, claiming its place in the hierarchy. `;
        }

        arcs.push(fightStory);
    }

    // 3. Survival/Hazard Arc
    const hazards = snakeEvents.filter(e => e.type === 'HAZARD_HIT');
    if (hazards.length > 2) {
        arcs.push(`The environment itself seemed to reject its presence; it limped through a series of brutal accidents.`);
    } else if (hazards.length > 0) {
        arcs.push(`It narrowly survived the ${hazards[0].tags[0] || 'hazards'} of the ${hazards[0].terrain}.`);
    }

    // 4. Memory/Evolution Arc
    const foods = snakeEvents.filter(e => e.type === 'FOOD_EAT');
    if (foods.length > 1) {
        arcs.push(`${snake.name} utilized its ${drafts.instinct} instincts to locate vital caches, growing stronger with every meal.`);
    }

    // 5. Final Fate
    const ko = snakeEvents.find(e => e.type === 'KO');
    if (ko) {
        if (ko.tags.some(t => t.includes('hazard'))) {
            arcs.push(`Finally, the relentless pressures of the ${ko.terrain} proved too much; it succumbed to the world itself.`);
        } else {
            arcs.push(`Worn down by rival fangs, its journey ended beneath the ${ko.terrain} sky.`);
        }
    } else {
        arcs.push(`Against the thinning storm, it remained unyielding, a true survivor of the saga.`);
    }

    return arcs.join(' ');
}
