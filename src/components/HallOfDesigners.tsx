import React, { useState } from 'react';
import { DESIGNERS, Designer } from '../engine/designers';
import { composer } from '../engine/narrate';
import { BODIES, INSTINCTS, AFFINITIES } from '../engine/traits';

export default function HallOfDesigners({ onClose }: { onClose: () => void }) {
    const [view, setView] = useState<'profiles' | 'coverage' | 'diagnostic'>('profiles');
    const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);

    const openDiagnostic = (designer: Designer) => {
        setSelectedDesigner(designer);
        setView('diagnostic');
    };

    return (
        <div className="hall-of-designers">
            <header className="hall-header">
                <h2>THE RADIANT COLLECTIVE: {view === 'diagnostic' ? `DIAGNOSTIC PORTAL [${selectedDesigner?.name.toUpperCase()}]` : 'HALL OF DESIGNERS'}</h2>
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
                <button onClick={onClose} className="close-btn">RETURN TO HUB</button>
            </header>

            {view === 'profiles' && (
                <>
                    <p className="hall-intro">
                        Each of these guardians manages a specialized layer of the Snake Autobattler engine.
                        Click an architect's profile to access their diagnostic oversight dashboard.
                    </p>
                    <div className="designer-grid">
                        {DESIGNERS.map((designer: Designer) => (
                            <div
                                key={designer.id}
                                className="designer-card clickable"
                                onClick={() => openDiagnostic(designer)}
                            >
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
                                <div className="designer-action-hint">VIEW DIAGNOSTIC OVERLOOK →</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'diagnostic' && selectedDesigner && (
                <DesignerDiagnostic
                    designer={selectedDesigner}
                    onBack={() => setView('profiles')}
                />
            )}

            {view === 'coverage' && <CoverageView />}

            <footer className="hall-footer">
                <p>The collective is watching. Every lacuna is an opportunity for a new strike.</p>
            </footer>
        </div>
    );
}

function DesignerDiagnostic({ designer, onBack }: { designer: Designer, onBack: () => void }) {
    const getReport = () => {
        switch (designer.id) {
            case 'ball-python': return {
                title: "TRAIT FRAGMENTATION REPORT",
                weakness: "12% of trait combinations in traits.ts lack active mechanical triggers in sim.ts.",
                suggestion: "Implement 'Whipcoil' recoil logic to reduce mechanical orphans."
            };
            case 'boomslang': return {
                title: "NARRATIVE VOID ANALYSIS",
                weakness: "Genre overlap detected in act.json. Slapstick tone bleeding into Alien encounters.",
                suggestion: "Refactor GENRE_WRAPPER layers to enforce strict tonal isolation."
            };
            case 'emerald-boa': return {
                title: "RADIANCE CONTRACT AUDIT",
                weakness: "Radiance accumulation rate is 15% higher than the v15.0 stabilization mandate.",
                suggestion: "Apply a scalar dampener to 'Brave Deed' honor rewards."
            };
            case 'black-mamba': return {
                title: "COMBAT STABILITY OVERLOOK",
                weakness: "Predictive branch manager is firing 3x more than expected in 'Forest' biomes.",
                suggestion: "Recalibrate hazard density to prevent simulation stalls."
            };
            default: return {
                title: "SYSTEM OBSERVATION LOG",
                weakness: "Sub-optimal data flow detected in " + designer.purview,
                suggestion: "Standardize bitmasking across " + designer.technology + " layer."
            };
        }
    };

    const report = getReport();

    return (
        <div className="designer-diagnostic">
            <div className="diagnostic-header">
                <button className="back-btn" onClick={onBack}>← BACK TO COLLECTIVE</button>
                <div className="diagnostic-title">
                    <span className="emoji">{designer.emoji}</span>
                    <h3>{report.title}</h3>
                </div>
            </div>

            <div className="diagnostic-content">
                <div className="diagnostic-section">
                    <h4>STUFF THAT NEEDS IMPROVEMENT (OBSERVATIONS)</h4>
                    <p className="weakness-text">{report.weakness}</p>
                </div>

                <div className="diagnostic-section">
                    <h4>PROPOSED REFACTOR</h4>
                    <p className="suggestion-text">{report.suggestion}</p>
                </div>

                <div className="diagnostic-stats">
                    <div className="stat-box">
                        <span className="stat-label">STABILITY</span>
                        <span className="stat-value">94.2%</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">ORPHANS</span>
                        <span className="stat-value">HIGH</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">RESONANCE</span>
                        <span className="stat-value">ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CoverageView() {
    const registry = composer.getTemplates ? composer.getTemplates() : [];

    const checkCoverage = (trait: string, action: string) => {
        return registry.some((t: any) => {
            const tr = t.trigger;
            const traitMatch = tr.trait === trait;
            const actionMatch = tr.action === action || tr.action === 'ANY' || !tr.action;
            return traitMatch && actionMatch;
        });
    };

    const categories = [
        { title: 'BODIES', items: Object.keys(BODIES) },
        { title: 'INSTINCTS', items: Object.keys(INSTINCTS) },
        { title: 'AFFINITIES', items: Object.keys(AFFINITIES) },
    ];

    return (
        <div className="coverage-view">
            <div className="coverage-intro">
                <h3>NARRATIVE WEAVE (v14.0)</h3>
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
                                            const hasText = checkCoverage(item, action);
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
