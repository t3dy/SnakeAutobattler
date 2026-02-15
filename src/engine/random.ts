/**
 * THE DETERMINISTIC CORE (v15.0)
 * -----------------------------
 * Replacement for Math.random() to ensure simulation reproducibility.
 * Uses mulberry32 algorithm.
 */
export class DeterministicRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    /**
     * Returns a float between 0 and 1.
     */
    next(): number {
        let t = (this.seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Returns an integer between min and max (inclusive).
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /**
     * Picks a random item from an array.
     */
    pick<T>(items: T[]): T {
        return items[Math.floor(this.next() * items.length)];
    }

    /**
     * Returns a random string ID.
     */
    nextId(length: number = 9): string {
        return Math.floor(this.next() * Date.now()).toString(36).substr(0, length);
    }
}
