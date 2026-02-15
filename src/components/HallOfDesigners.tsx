import React, { useState } from 'react';
import { DESIGNERS, Designer } from '../engine/designers';
import { TRAIT_TEXT_REGISTRY, TraitTrigger } from '../engine/narrate';
import { BODIES, INSTINCTS, AFFINITIES } from '../engine/traits';

export default function HallOfDesigners({ onClose }: { onClose: () => void }) {
    const [view, setView] = useState<'profiles' | 'coverage'>('profiles');

    return (
        <div className="hall-of-designers">
            <header className="hall-header">
                <h2>THE RADIANT COLLECTIVE: HALL OF DESIGNERS</h2>
                <div className="hall-tabs">
                    <button
                        className={`tab-btn ${view === 'profiles' ? 'active' : ''}`}
                        onClick={() => setView('profiles')}
                    >
                        ARCHITECTS
                    </button>
                    <button
                        className={`tab-btn ${view === 'coverage' ? 'active' : ''}`}
                        onClick={() => setView('coverage')}
                    >
                        NARRATIVE WEAVE
                    </button>
                </div>
                <button onClick={onClose} className="close-btn">RETURN TO ARCHIVE</button>
            </header>

            {view === 'profiles' && (
                <>
                    <p className="hall-intro">
                        Each of these guardians manages a specialized layer of the Snake Autobattler engine.
                        They are the voices that define reality, from the raw math of traits to the cinematic flourish of the final kill.
                    </p>
                    <div className="designer-grid">
                        {DESIGNERS.map((designer: Designer) => (
                            <div key={designer.id} className="designer-card">
                                <div className="designer-top">
                                    <span className="designer-emoji">{designer.emoji}</span>
                                    <div className="designer-names">
                                        <h3 className="designer-name">{designer.name}</h3>
                                        <span className="designer-role">{designer.role}</span>
                                    </div>
                                </div>
                                <div className="designer-purview">
                                    <strong>PURVIEW:</strong> {designer.purview}
                                </div>
                                <p className="designer-desc">{designer.description}</p>
                                <div className="designer-tech">
                                    <strong>TECH:</strong> {designer.technology}
                                </div>
                                <div className="designer-quote">
                                    <i>"{designer.quote}"</i>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'coverage' && <CoverageView />}

            <footer className="hall-footer">
                <p>The collective is watching. Every lacuna is an opportunity for a new strike.</p>
            </footer>
        </div>
    );
}

function CoverageView() {
    // Helper to check coverage
    const checkCoverage = (trait: string, action: string) => {
        return TRAIT_TEXT_REGISTRY.some(t =>
            t.requires.includes(trait) &&
            (t.requires.includes(action) || t.requires.includes('ANY'))
        );
    };

    const categories = [
        { title: 'BODIES', items: Object.keys(BODIES) },
        { title: 'INSTINCTS', items: Object.keys(INSTINCTS) },
        { title: 'AFFINITIES', items: Object.keys(AFFINITIES) },
    ];

    return (
        <div className="coverage-view">
            <div className="coverage-intro">
                <h3>ORPHAN FINDER (v13.2)</h3>
                <p>Visualizing narrative density. Red cells indicate traits relying on generic fallback text.</p>
            </div>

            <div className="coverage-grids">
                {categories.map(cat => (
                    <div key={cat.title} className="coverage-category">
                        <h4>{cat.title}</h4>
                        <table className="coverage-table">
                            <thead>
                                <tr>
                                    <th>Trait</th>
                                    <th>RUN</th>
                                    <th>FIGHT</th>
                                    <th>HIDE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cat.items.map(item => (
                                    <tr key={item}>
                                        <td className="trait-name">{item}</td>
                                        {['RUN', 'FIGHT', 'STAY_HIDDEN'].map(action => {
                                            const hasText = checkCoverage(item, action) || checkCoverage(item, 'ANY');
                                            return (
                                                <td key={action} className={hasText ? 'cell-covered' : 'cell-orphan'}>
                                                    {hasText ? '✓' : 'Orphan'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
