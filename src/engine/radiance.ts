import { GameEvent, SnakeState, EnvironmentParams } from './types';

/**
 * THE RADIANCE CONTRACT (v13.0)
 * --------------------------------
 * 1. DEFINITION: Radiance is a derived quantity representing the "Narrative Harmony" of the simulation.
 *    Formula: Base (100) + Heroic Actions - Corruption Events.
 * 
 * 2. COUPLING LIMITS:
 *    - MECHANICAL (Hard Cap: +/- 20%): Can only affect TripChance and CriticalHit rates.
 *    - INTERPRETIVE (Unbounded): Can shift Genre and Narrative Tone freely.
 *    - COSMETIC (Unbounded): Can drive VFX brightness, glitch shaders, and UI glows.
 * 
 * 3. VERIFIABILITY:
 *    - Every Radiance shift must emit a RADIANCE_LOG event.
 *    - Final Replay Header must include the average Radiance Score.
 */

export interface RadianceSnapshot {
    value: number; // 0 - 200
    entanglement: number; // How many systems are currently modified by Radiance
    couplings: {
        mechanical: boolean;
        interpretive: boolean;
        cosmetic: boolean;
    };
}

export const RADIANCE_BOUNDS = {
    MIN: 0,
    MAX: 200,
    BASE: 100,
    CORRUPTION_THRESHOLD: 60,
    ASCENSION_THRESHOLD: 160
};

export class RadianceEngine {
    private currentValue: number = RADIANCE_BOUNDS.BASE;
    private log: { tick: number; delta: number; reason: string; coupling: 'MECH' | 'INT' | 'COS' }[] = [];

    constructor(initialValue: number = RADIANCE_BOUNDS.BASE) {
        this.currentValue = initialValue;
    }

    // THE FORMULA
    // Radiance is not random. It is a sum of Brave Deeds vs. Entropic Failures.
    update(events: GameEvent[], snakes: SnakeState[]): number {
        let delta = 0;

        events.forEach(e => {
            if (e.type === 'FEAT_ACCOMPLISHED') {
                delta += 5;
                this.logChange(e.tick, 5, 'HEROIC_FEAT', 'INT');
            }
            if (e.type === 'KO') {
                delta -= 10;
                this.logChange(e.tick, -10, 'DEATH_ENTROPY', 'INT');
            }
            if (e.type === 'SYSTEM_RESONANCE') { // Tuner Intervention
                const intensity = parseInt(e.tags[1] || '0');
                delta += intensity;
                this.logChange(e.tick, intensity, 'MANUAL_TUNING', 'MECH');
            }
        });

        // Decay toward baseline if no events
        if (delta === 0 && this.currentValue !== RADIANCE_BOUNDS.BASE) {
            const decay = this.currentValue > RADIANCE_BOUNDS.BASE ? -0.1 : 0.1;
            this.currentValue += decay;
        }

        this.currentValue = Math.max(RADIANCE_BOUNDS.MIN, Math.min(RADIANCE_BOUNDS.MAX, this.currentValue + delta));
        return this.currentValue;
    }

    // COUPLING GATES
    // Returns a multiplier for mechanics, strictly clamped.
    getMechanicalMultiplier(): number {
        // Contract: Mechanical influence cannot exceed +/- 20%
        const deviation = this.currentValue - RADIANCE_BOUNDS.BASE;
        const rawMod = deviation * 0.002; // max deviation 100 * 0.002 = 0.2
        return 1.0 + Math.max(-0.2, Math.min(0.2, rawMod));
    }

    // Returns a mood string for narrative/UI
    getInterpretiveState(): 'CORRUPTED' | 'DIM' | 'RADIANT' | 'ASCENDED' {
        if (this.currentValue < RADIANCE_BOUNDS.CORRUPTION_THRESHOLD) return 'CORRUPTED';
        if (this.currentValue < 90) return 'DIM';
        if (this.currentValue > RADIANCE_BOUNDS.ASCENSION_THRESHOLD) return 'ASCENDED';
        return 'RADIANT';
    }

    private logChange(tick: number, delta: number, reason: string, coupling: 'MECH' | 'INT' | 'COS') {
        this.log.push({ tick, delta, reason, coupling });
    }

    getAuditLog() {
        return this.log;
    }
}
