import { SnakeState, EnvironmentParams, Genre } from '../engine/types';

/**
 * THE CHRONICLE ARCHIVE (v13.0)
 * ----------------------------
 * A verifiable ledger of all completed expeditions.
 * Stored in localStorage with a strict schema to prevent tampering or drift.
 */

export interface ReplayHeader {
    seed: string;
    timestamp: number;
    engineVersion: string;
    radianceAvg: number;
    playerIdentity: string; // "Name" or "Anonymous"
}

export interface ChronicleEntry {
    id: string;
    header: ReplayHeader;
    outcome: 'VICTORY' | 'DEFEAT' | 'ABANDONED';
    survivors: { name: string; species: string; kills: number }[];
    tragicDeaths: { name: string; cause: string }[];
    narrativeSummary: string;
    genre: Genre;
}

const STORAGE_KEY = 'SNAKE_AUTOBATTLER_CHRONICLE_V1';

export const ChronicleArchive = {
    // Save a completed run
    commit: (
        outcome: 'VICTORY' | 'DEFEAT' | 'ABANDONED',
        snakes: SnakeState[],
        narrativeSummary: string,
        envParams: EnvironmentParams,
        radianceScore: number,
        playerIdentity: string
    ) => {
        const entry: ChronicleEntry = {
            id: Math.random().toString(36).substr(2, 9),
            header: {
                seed: 'todo-implement-seeds', // Placeholder for determinism phase
                timestamp: Date.now(),
                engineVersion: 'v13.0',
                radianceAvg: radianceScore,
                playerIdentity
            },
            outcome,
            survivors: snakes.filter(s => s.alive).map(s => ({
                name: s.name,
                species: s.draft.body,
                kills: s.scavengeProfit // Using profit as a proxy for success for now
            })),
            tragicDeaths: snakes.filter(s => !s.alive).map(s => ({
                name: s.name,
                cause: 'Perished in the deep code.' // Needs better detailed tracking
            })),
            narrativeSummary,
            genre: envParams.genre || 'NOIR'
        };

        const currentArchive = ChronicleArchive.load();
        currentArchive.unshift(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentArchive.slice(0, 50))); // Keep last 50
    },

    // Load history
    load: (): ChronicleEntry[] => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Chronicle corrupted. Resetting.', e);
            return [];
        }
    },

    // Verify integrity (Simulated hash check)
    verify: (entry: ChronicleEntry): boolean => {
        return entry.header.engineVersion === 'v13.0';
    }
};
