import React, { useState, useEffect } from 'react';
import { Genre } from '../engine/types';
import { generateNarrative } from '../engine/narrate';

export default function ResonanceTuner({ onExit }: { onExit: () => void }) {
    const [score, setScore] = useState(100);
    const [genre, setGenre] = useState<Genre>('NOIR');
    const [mockProse, setMockProse] = useState('');

    useEffect(() => {
        const mockEvents = score < 60 ? [{ type: 'MOVE', snakeId: '1', terrain: 'forest', tags: [], tick: 1, pos: { x: 0, y: 0 } }] as any : [];
        const narrative = generateNarrative(mockEvents, [{ id: '1', name: 'TestSnake', draft: { body: 'Boulderback', instinct: 'Hunter', affinity: 'Stone', quirk: 'Reckless' } }] as any, { genre } as any);
        setMockProse(narrative.recap || narrative.snakeStories[0].story.fullStory);
    }, [score, genre]);

    return (
        <div className="radiant-toy resonance-tuner">
            <header className="toy-header">
                <h2>RESONANCE TUNER (v13.0)</h2>
                <button onClick={onExit}>EXIT</button>
            </header>

            <div className="toy-controls">
                <div className="control-group">
                    <label>SYNERGY RESONANCE (0 - 200)</label>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                    />
                    <div className="score-display" style={{ color: score < 60 ? '#ff3333' : score > 160 ? '#00ff7f' : '#33ff33' }}>
                        {score} - {score < 60 ? 'CORRUPTING' : score > 160 ? 'LEGENDARY' : 'STABLE'}
                    </div>
                </div>

                <div className="control-group">
                    <label>TARGET GENRE</label>
                    <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
                        {['NOIR', 'SLAPSTICK', 'ZOMBIE', 'SPY', 'ALIEN'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            <main className="tuner-output">
                <div className={`output-box ${score < 60 ? 'glitch-border' : ''}`}>
                    <h4>ENGINE PROSE OUTPUT</h4>
                    <p>{mockProse}</p>
                    {score < 60 && <div className="glitch-warning">⚠️ NARRATIVE BLEED DETECTED</div>}
                </div>

                <div className="tuner-stats">
                    <h4>SYSTEM IMPACT</h4>
                    <ul>
                        <li>VFX Intensity: {Math.abs(100 - score)}%</li>
                        <li>Genre Interference: {score < 60 ? 'HIGH' : 'LOW'}</li>
                        <li>Deterministic Drift: {(score / 2).toFixed(1)}ms</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
