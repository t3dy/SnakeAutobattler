import React, { useState } from 'react';
import { Genre, GameEvent } from '../engine/types';
import { generateNarrative } from '../engine/narrate';

const MOCK_EVENTS: GameEvent[] = [
    { id: '1', type: 'MOVE', tick: 1, snakeId: '1', terrain: 'river', pos: { x: 2, y: 3 }, tags: [], snapshot: { hp: 100, effectiveStats: {} as any, aiState: 'searching', flags: [] } },
    { id: '2', type: 'FEAT_ACCOMPLISHED', tick: 10, snakeId: '1', terrain: 'river', pos: { x: 5, y: 5 }, tags: ['ALPHA_STRIKE'], snapshot: { hp: 90, effectiveStats: {} as any, aiState: 'attacking', flags: [] } },
    { id: '3', type: 'KO', tick: 60, snakeId: '1', terrain: 'river', pos: { x: 8, y: 8 }, tags: [], snapshot: { hp: 0, effectiveStats: {} as any, aiState: 'dead', flags: [] } }
];

export default function GenreFlux({ onExit }: { onExit: () => void }) {
    const [genre, setGenre] = useState<Genre>('NOIR');
    const narrative = generateNarrative(MOCK_EVENTS, [{ id: '1', name: 'Infiltrator', draft: {} as any }] as any, { genre } as any);

    return (
        <div className="radiant-toy genre-flux">
            <header className="toy-header">
                <h2>GENRE FLUX: REALITY WARPER</h2>
                <button onClick={onExit}>EXIT</button>
            </header>

            <div className="flux-controls">
                {['NOIR', 'SLAPSTICK', 'ZOMBIE', 'SPY', 'ALIEN'].map((g: any) => (
                    <button
                        key={g}
                        className={genre === g ? 'active' : ''}
                        onClick={() => setGenre(g)}
                    >
                        {g}
                    </button>
                ))}
            </div>

            <main className="flux-theatre">
                <div className="theatre-screen">
                    {narrative.snakeStories[0].story.arcs.map((arc: any, i: number) => (
                        <div key={i} className="prose-arc animate-fade-in">
                            <h3>{arc.title}</h3>
                            <p>{arc.story}</p>
                        </div>
                    ))}
                </div>

                <aside className="flux-metadata">
                    <h4>GENRE DNA</h4>
                    <div className="dna-stat">Lexical Weight: {genre === 'NOIR' ? 'Heavy' : genre === 'SLAPSTICK' ? 'Looney' : 'Standard'}</div>
                    <div className="dna-stat">Tone: {genre === 'ZOMBIE' ? 'Gritty' : genre === 'SPY' ? 'Cold' : 'Void'}</div>
                </aside>
            </main>
        </div>
    );
}
