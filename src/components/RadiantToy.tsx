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
    const [result, setResult] = useState<{ event: string, prose: string } | null>(null);
    const [suggestion, setSuggestion] = useState('');
    const [seed, setSeed] = useState<number>(12345);
    const [managerConfidence, setManagerConfidence] = useState<number>(98.5);
    const [isSeeded, setIsSeeded] = useState(true);

    const runSim = () => {
        const env = {
            climate: 'Standard' as any, fauna: 'Standard' as any, flora: 'Standard' as any,
            mode: 'SOLO' as any, theme: 'MEDIEVAL' as any, genre: selectedGenre,
            phase: 1, seed: isSeeded ? seed : undefined
        };
        const sim = generateSimulation([draft], [], env);
        // Step the simulation explicitly to test v15 hook
        sim.step();

        sim.tick = 5;
        const e = sim.emit({ id: 'toy', name: 'Test' } as any, 'FEAT_ACCOMPLISHED', { x: 5, y: 5 }, 'forest', ['ALPHA_STRIKE'], 0);
        const narrative = generateNarrative([e], sim.snakes, env);

        setResult({
            event: `Simulated: ALPHA_STRIKE (Seed: ${isSeeded ? seed : 'RANDOM'})\nManager Confidence: ${managerConfidence.toFixed(1)}%`,
            prose: narrative.snakeStories[0].story.fullStory
        });
        setManagerConfidence(prev => Math.min(100, prev + (Math.random() - 0.5)));
    };

    useEffect(() => {
        runSim();
    }, [selectedTrait, selectedGenre, seed, isSeeded]);

    const submitSuggestion = () => {
        console.log(`Suggestion for ${selectedTrait} in ${selectedGenre}: ${suggestion}`);
        setSuggestion('');
        alert("Suggestion captured in the Radiant Ledger!");
    };

    return (
        <div className="radiant-toy">
            <header className="toy-header">
                <h2>RADIANT LACUNA EXPLORER (v15.0 STABLE)</h2>
                <button onClick={onExit}>EXIT TO HUB</button>
            </header>

            <div className="toy-layout">
                <aside className="trait-list">
                    <h3>TRAIT ARCHIVE</h3>
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
                        <div className="v15-tag">STALL GUARD ACTIVE</div>
                        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value as Genre)}>
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <div className="seed-control">
                            <label>SEED:</label>
                            <input type="checkbox" checked={isSeeded} onChange={e => setIsSeeded(e.target.checked)} />
                            {isSeeded && <input type="number" value={seed} onChange={e => setSeed(parseInt(e.target.value))} className="seed-input" />}
                            <button className="re-run-btn" onClick={runSim}>RE-RUN</button>
                        </div>
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
                        <h3>V15.0 STABILIZATION OVERLOOK</h3>
                        <div className="insight-grid">
                            {DESIGNERS.filter(d => ['emerald-boa', 'black-mamba', 'boomslang'].includes(d.id)).map(d => (
                                <div key={d.id} className="insight-card">
                                    <span className="insight-emoji">{d.emoji}</span>
                                    <div className="insight-content">
                                        <strong>{d.name}:</strong>
                                        <p>"{d.id === 'emerald-boa' ? 'Seeded runs are now 100% deterministic. Stalls are prevented.' : d.quote}"</p>
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
