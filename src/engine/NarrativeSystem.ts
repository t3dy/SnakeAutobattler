import { SnakeState, Genre, EncounterType } from './types';
import bioTemplates from './data/narrative/bio.json';
import idTemplates from './data/narrative/id.json';
import actTemplates from './data/narrative/act.json';
import genreTemplates from './data/narrative/genre.json';
import metaTemplates from './data/narrative/meta.json';
import { DeterministicRandom } from './random';

export type NarrativeLayer = "BIO" | "ID" | "ACT" | "GENRE" | "META";

export type NarrativeCategory =
    | "BIO_INTRO" | "ENVIRONMENT"   // BIO
    | "IDENTITY" | "SLITHER"       // ID
    | "ACT_REACTION" | "CHOREOGRAPHY"  // ACT
    | "GENRE_WRAPPER" // GENRE
    | "META_COMMENTARY" | "META_TONE";    // META

export type TriggerRule = {
    // Logic Ops
    any?: TriggerRule[];
    all?: TriggerRule[];
    not?: TriggerRule;

    // Context Matchers
    trait?: string;
    terrain?: string;
    phase?: "KNOWN" | "UNKNOWN";
    action?: string; // "RUN" | "HIDE" | "FIGHT" ...
    encounterType?: EncounterType;
    genre?: Genre;
    radianceBand?: "LOW" | "MID" | "HIGH";

    // Pacing Matchers
    actLabel?: "OPENING" | "RISING" | "CRISIS" | "CLIMAX" | "AFTERMATH";
    minTick?: number;
    maxTick?: number;
};

export interface NarrativeTemplate {
    id: string;
    layer: NarrativeLayer;
    category: NarrativeCategory;
    trigger: TriggerRule;

    priority: number;
    weight: number;

    cooldown?: number;
    oncePer?: "BEAT" | "ACT" | "PHASE" | "EXPEDITION";

    template: string;
}

export interface BeatContext {
    seed: number;
    tick: number;
    phase: "KNOWN" | "UNKNOWN";
    actLabel?: "OPENING" | "RISING" | "CRISIS" | "CLIMAX" | "AFTERMATH";

    snake: SnakeState;
    environment: {
        terrain: string;
        fields?: any
    };

    encounter: {
        type: EncounterType;
        intensity: number;
        tags?: string[];
    };
    action: string; // The choice made (RUN, FIGHT, etc)

    radiance: {
        value: number;
        band: "LOW" | "MID" | "HIGH"
    };

    genre: Genre; // v14.1 Genre Isolation

    history: {
        usedTemplateIds: string[];
        perTemplateCooldowns: Record<string, number>;
    };
}

export class NarrativeComposer {
    private registry: NarrativeTemplate[] = [];

    constructor() {
        // v14.1 Data-Driven Registry Loading
        this.loadTemplates(bioTemplates as any);
        this.loadTemplates(idTemplates as any);
        this.loadTemplates(actTemplates as any);
        this.loadTemplates(genreTemplates as any);
        this.loadTemplates(metaTemplates as any);

        console.log(`[NarrativeSystem] Initialized with ${this.registry.length} data-driven templates.`);
    }

    private loadTemplates(data: any[]) {
        data.forEach(t => {
            const template: NarrativeTemplate = {
                id: t.id,
                layer: t.layer as NarrativeLayer,
                category: t.category as NarrativeCategory,
                trigger: t.trigger as TriggerRule,
                template: t.template,
                priority: t.priority ?? 1,
                weight: t.weight ?? 1,
                cooldown: t.cooldown,
                oncePer: t.oncePer
            };
            this.registry.push(template);
        });
    }

    public register(templates: NarrativeTemplate[]) {
        this.registry.push(...templates);
    }

    public getTemplates(): NarrativeTemplate[] {
        return this.registry;
    }

    public composeBeat(context: BeatContext): string {
        const isSlither = context.action === 'MOVE';
        const rng = new DeterministicRandom(context.seed);

        // v15.0 Narrative Curation: Probability check for atmospheric layers (25% chance)
        const roll = (chance: number) => rng.next() < chance;
        const atmosphericChance = 0.25;

        // 1. BIO (Environment) - Probabilistic
        const bio = roll(atmosphericChance) ? this.selectTemplate(context, "BIO", "ENVIRONMENT", rng) : null;

        // 2. ID (Identity) - Mandatory
        const idCategory = isSlither ? "SLITHER" : "IDENTITY";
        let id = this.selectTemplate(context, "ID", idCategory as any, rng);
        if (!id) id = isSlither ? "{snakeName} slithered." : "The snake reacted.";

        // 3. ACT (Choreography) - Mandatory if not slithering
        let act = isSlither ? null : this.selectTemplate(context, "ACT", "CHOREOGRAPHY", rng);
        if (!act && !isSlither) act = "Action occurred.";

        // 4. GENRE (Wrapper) - Probabilistic
        const genre = roll(atmosphericChance) ? this.selectTemplate(context, "GENRE", "GENRE_WRAPPER", rng) : null;

        // 5. META (Radiance/Tone) - Probabilistic
        const meta = roll(atmosphericChance) ? this.selectTemplate(context, "META", "META_TONE", rng) : null;

        // Assembly
        let beat = bio ? bio + " " : "";

        // Contextual Grammar: combine ID + ACT (if ACT exists)
        let core = id;
        if (act) core = `${id} ${act}`;

        if (genre) {
            core = genre.replace("{core}", core);
        }

        beat += core;
        if (meta) beat += " " + meta;

        // Interpolation
        return this.interpolate(beat, context);
    }

    public selectTemplate(context: BeatContext, layer: NarrativeLayer, category: NarrativeCategory, rng: DeterministicRandom): string | null {
        // 1. Filter by Layer/Category and Trigger Rules
        let candidates = this.registry.filter(t =>
            t.layer === layer &&
            t.category === category &&
            this.matchTrigger(t.trigger, context)
        );

        // 2. Filter by Cooldowns and Variety
        candidates = candidates.filter(t => {
            if (!t.cooldown) {
                // Variety check: don't pick the same template twice in a row if there are others
                const lastUsed = context.history.usedTemplateIds[context.history.usedTemplateIds.length - 1];
                if (lastUsed === t.id && candidates.length > 1) return false;
                return true;
            }
            const cooldownRem = context.history.perTemplateCooldowns[t.id] || 0;
            return cooldownRem <= 0;
        });

        // 3. Sort by Priority
        candidates.sort((a, b) => b.priority - a.priority);
        if (candidates.length === 0) return null;

        // 5. Pick High Priority Bucket
        const maxPriority = candidates[0].priority;
        const topBucket = candidates.filter(t => t.priority === maxPriority);

        // 4. Weighted Random Selection
        const selected = this.weightedRandom(candidates, rng);

        // 7. Update History (Side Effect - effectively marking used)
        if (selected) {
            this.markUsed(selected, context);
        }

        return selected ? selected.template : null;
    }

    private matchTrigger(rule: TriggerRule, ctx: BeatContext): boolean {
        // Logic Ops
        if (rule.any) {
            if (!rule.any.some(r => this.matchTrigger(r, ctx))) return false;
        }
        if (rule.all) {
            if (!rule.all.every(r => this.matchTrigger(r, ctx))) return false;
        }
        if (rule.not) {
            if (this.matchTrigger(rule.not, ctx)) return false;
        }

        // Context Matchers
        if (rule.trait && !this.snakeHasTrait(ctx.snake, rule.trait)) return false;
        if (rule.terrain && rule.terrain !== 'ANY' && rule.terrain !== ctx.environment.terrain) return false;
        if (rule.action && rule.action !== 'ANY' && rule.action !== ctx.action) return false;
        if (rule.encounterType && rule.encounterType !== ctx.encounter.type) return false;
        if (rule.radianceBand && rule.radianceBand !== ctx.radiance.band) return false;
        if (rule.phase && rule.phase !== ctx.phase) return false;
        if (rule.genre && rule.genre !== ctx.genre) return false; // Strict Genre Match

        return true;
    }

    private snakeHasTrait(snake: SnakeState, trait: string): boolean {
        const { body, instinct, affinity } = snake.draft;
        return body === trait || instinct === trait || affinity === trait;
    }

    private weightedRandom(items: NarrativeTemplate[], rng: DeterministicRandom): NarrativeTemplate | null {
        if (items.length === 0) return null;
        const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
        let random = rng.next() * totalWeight;
        for (const item of items) {
            random -= (item.weight || 1);
            if (random <= 0) return item;
        }
        return items[items.length - 1];
    }

    private markUsed(t: NarrativeTemplate, ctx: BeatContext) {
        ctx.history.usedTemplateIds.push(t.id);
        if (t.cooldown) {
            ctx.history.perTemplateCooldowns[t.id] = t.cooldown;
        }
    }

    private interpolate(text: string, ctx: BeatContext): string {
        return text
            .replace(/{snakeName}/g, ctx.snake.name)
            .replace(/{terrain}/g, ctx.environment.terrain);
    }
}

