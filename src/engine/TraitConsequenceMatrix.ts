import { BodyType, InstinctType, AffinityType, QuirkType } from './types';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './traits';

/**
 * THE TRAIT CONSEQUENCE MATRIX (v13.0)
 * -----------------------------------
 * A living audit of how every trait impacts the 3 pillars of the engine.
 * 
 * PILLARS:
 * 1. SIMULATION (Sim): Physics, stats, AI logic, event emission.
 * 2. NARRATIVE (Nar): Prose generation, genre bleed, personality tags.
 * 3. VISUAL (Vis): Cinematic cues, CSS classes, emergent VFX.
 * 
 * AUDIT STATUS:
 * - COMPLETE: All 3 pillars defined and implemented.
 * - PARTIAL: Missing one or more pillar definitions.
 * - ORPHAN: Defined in types but missing implementation.
 */

type PillarStatus = 'COMPLETE' | 'PARTIAL' | 'ORPHAN';

interface TraitAudit {
    sim: string[]; // List of mechanics affected (e.g. "Speed +2", "Wall Climb")
    nar: string[]; // List of narrative tags (e.g. "Stoic", "Aggressive")
    vis: string[]; // List of visual cues (e.g. "Spikes", "Glow")
    radianceCoupling: number; // 0.0 - 1.0 influence on Radiance
    status: PillarStatus;
}

export const TRAIT_CONSEQUENCE_MATRIX: Record<string, TraitAudit> = {
    // BODIES
    'Python': {
        sim: ['Constriction Bonus', 'Size +2'],
        nar: ['Heavy coil descriptions', 'Slow movement verbs'],
        vis: ['Thick path stroke'],
        radianceCoupling: 0.1,
        status: 'COMPLETE'
    },
    'Boa': {
        sim: ['Ambush bonus', 'Camouflage +2'],
        nar: ['Silent approach', 'Hidden in leaves'],
        vis: ['Patterned texture'],
        radianceCoupling: 0.2,
        status: 'COMPLETE'
    },
    'Viper': {
        sim: ['High Venom', 'Speed Burst'],
        nar: ['Sudden strikes', 'Toxic metaphors'],
        vis: ['Sharp head shape', 'Green tint'],
        radianceCoupling: 0.3,
        status: 'COMPLETE'
    },
    'Cobra': {
        sim: ['Intimidation Aura', 'Ranged Split'],
        nar: ['Regal descriptions', 'Hood flare'],
        vis: ['Hooded sprite'],
        radianceCoupling: 0.4,
        status: 'COMPLETE'
    },
    'Mamba': {
        sim: ['Max Speed', 'Multi-Strike'],
        nar: ['Blur of motion', 'Shadowy figure'],
        vis: ['Black scales', 'Motion blur'],
        radianceCoupling: 0.5,
        status: 'COMPLETE'
    },
    // NEW v13 TRAITS (Examples)
    'Boulderback': {
        sim: ['Hazard Resistance'],
        nar: ['Unstoppable force'],
        vis: ['Stone texture overlay'],
        radianceCoupling: 0.2,
        status: 'PARTIAL' // Missing strict vis implementation
    }
};

export const ORPHAN_AUDIT = () => {
    const orphans = Object.entries(TRAIT_CONSEQUENCE_MATRIX)
        .filter(([_, audit]) => audit.status === 'ORPHAN' || audit.status === 'PARTIAL')
        .map(([trait, _]) => trait);

    if (orphans.length > 0) {
        console.warn(`[RADIANT AUDIT] Detected ${orphans.length} Orphan/Partial Traits:`, orphans);
    } else {
        console.log('[RADIANT AUDIT] All Traits Fully Integrated.');
    }
};
