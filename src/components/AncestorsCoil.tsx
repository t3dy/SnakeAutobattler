import React from 'react';

const ANCESTORS = [
    { v: 'v1.0', name: 'The Primal Log', dna: '01001', feat: 'Functional Foundation' },
    { v: 'v4.0', name: 'The Saga Engine', dna: '11001', feat: 'Narrative Arcs' },
    { v: 'v7.0', name: 'The Ghost', dna: '11101', feat: 'Autonomous Resolve' },
    { v: 'v10.0', name: 'Expedition', dna: '11111', feat: 'Global Persistence' },
    { v: 'v13.0', name: 'The Architect', dna: '∞', feat: 'Meta-Agentic Synergy' }
];

export default function AncestorsCoil({ onExit }: { onExit: () => void }) {
    return (
        <div className="radiant-toy ancestors-coil">
            <header className="toy-header">
                <h2>ANCESTOR'S COIL: ARCHITECTURAL GENEALOGY</h2>
                <button onClick={onExit}>EXIT</button>
            </header>

            <div className="genealogy-tree">
                {ANCESTORS.map((a, i) => (
                    <div key={a.v} className="ancestor-node animate-slide-right" style={{ animationDelay: `${i * 0.2}s` }}>
                        <div className="node-version">{a.v}</div>
                        <div className="node-content">
                            <h3>{a.name}</h3>
                            <div className="node-dna">DNA: <code>{a.dna}</code></div>
                            <p>Major Feat: {a.feat}</p>
                        </div>
                        {i < ANCESTORS.length - 1 && <div className="node-link">↓</div>}
                    </div>
                ))}
            </div>

            <footer className="coil-footer">
                <p>The coil remembers every refactor. Architecture is destiny.</p>
            </footer>
        </div>
    );
}
