import React, { useState, useEffect } from 'react';
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from '../engine/traits';
import { DESIGNERS } from '../engine/designers';
import { Genre, SnakeDraft } from '../engine/types';
import { generateSimulation } from '../engine/sim';
import { generateNarrative } from '../engine/narrate';

const GENRES: Genre[] = ['NOIR', 'SLAPSTICK', 'ZOMBIE', 'SPY', 'ALIEN'];

export default function RadiantToy({ onExit }: { onExit: () => void }) {
    const [selectedTrait, setSelectedTrait] = useState<string>('Boulderback Constrictor');
    const [selectedGenre, setSelectedGenre] = useState<Genre>('NOIR');
    const [draft, setDraft] = useState<SnakeDraft>({
        body: 'Boulderback Constrictor',
        instinct: 'Hunter',
        affinity: 'Stone-Scaled',
        quirk: 'Reckless'
    });
    const [auditStatus, setAuditStatus] = useState<string>('Checking...');
    const [result, setResult] = useState<{ event: string, prose: string } | null>(null);
    const [suggestion, setSuggestion] = useState('');

    useEffect(() => {
        // Mock audit check (ideally this pulls from a pre-generated manifest)
        const isOrphan = selectedTrait.includes('Dune') || selectedTrait.includes('River') || selectedTrait.includes('Clockwork');
        setAuditStatus(isOrphan ? '⚠️ ORPHAN' : '✅ SYNCED');
        runSim();
    }, [selectedTrait, selectedGenre]);

    const runSim = () => {
        const env = {
            climate: 'Standard' as any, fauna: 'Standard' as any, flora: 'Standard' as any,
            mode: 'SOLO' as any, theme: 'MEDIEVAL' as any, genre: selectedGenre, phase: 1
        };
        const sim = generateSimulation([draft], [], env);
        // Force an event for the trait
        sim.tick = 5;
        const e = sim.emit({ id: 'toy', name: 'Test' } as any, 'FEAT_ACCOMPLISHED', { x: 5, y: 5 }, 'forest', ['ALPHA_STRIKE'], 0);
        const narrative = generateNarrative([e], sim.snakes, env);

        setResult({
            event: `Simulated: ALPHA_STRIKE in ${selectedGenre}`,
            prose: narrative.snakeStories[0].story.fullStory
        });
    };

    const submitSuggestion = () => {
        console.log(`Suggestion for ${selectedTrait} in ${selectedGenre}: ${suggestion}`);
        setSuggestion('');
        alert("Suggestion captured in the Radiant Ledger!");
    };

    return (
        <div className="radiant-toy">
            <header className="toy-header">
                <h2>RADIANT LACUNA EXPLORER</h2>
                <button onClick={onExit}>EXIT TO ENGINE</button>
            </header>

            <div className="toy-layout">
                <aside className="trait-list">
                    <h3>ORPHAN TRAITS</h3>
                    {Object.keys(BODIES).map(t => (
                        <button
                            key={t}
                            className={`trait-btn ${selectedTrait === t ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedTrait(t);
                                setDraft(prev => ({ ...prev, body: t }));
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </aside>

                <main className="toy-lab">
                    <div className="lab-controls">
                        <div className="audit-badge">{auditStatus}</div>
                        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value as Genre)}>
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="lab-output">
                        <div className="output-box">
                            <h4>Simulation Marker</h4>
                            <pre>{result?.event}</pre>
                        </div>
                        <div className="output-box">
                            <h4>Narrative Bridge</h4>
                            <p>{result?.prose || "Waiting for output..."}</p>
                        </div>
                    </div>

                    <div className="lab-designer-insight">
                        <h3>DESIGNER INSIGHTS</h3>
                        <div className="insight-grid">
                            {DESIGNERS.sort(() => Math.random() - 0.5).slice(0, 3).map(d => (
                                <div key={d.id} className="insight-card">
                                    <span className="insight-emoji">{d.emoji}</span>
                                    <div className="insight-content">
                                        <strong>{d.name} ({d.role}):</strong>
                                        <p>"{d.quote}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lab-patch">
                        <h4>PATCH THIS LACUNA</h4>
                        <textarea
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            placeholder="How should this trait manifest in this genre?"
                        />
                        <button onClick={submitSuggestion} disabled={!suggestion}>COMMIT TO LEDGER</button>
                    </div>
                </main>
            </div>
        </div>
    );
}
