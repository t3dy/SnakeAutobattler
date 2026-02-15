import React, { useState, useEffect } from 'react';
import './SnakeSkin.css';

interface SnakeSkinProps {
    versions: { id: string, title: string, desc: string }[];
    onSelectVersion: (id: string) => void;
    onSelectToy: (toyId: string) => void;
    currentVersion: string | null;
}

export default function SnakeSkinLayout({ versions, onSelectVersion, onSelectToy, currentVersion }: SnakeSkinProps) {

    // Sinuous Path Coordinates (normalized 0-100 for SVG)
    const pathPoints = [
        { x: 10, y: 90 }, { x: 20, y: 70 }, { x: 40, y: 80 },
        { x: 50, y: 60 }, { x: 30, y: 40 }, { x: 50, y: 20 },
        { x: 70, y: 30 }, { x: 80, y: 50 }, { x: 90, y: 10 }
    ];

    // Generate Smooth Bezier Path
    const svgPath = `M ${pathPoints[0].x} ${pathPoints[0].y} ` +
        pathPoints.slice(1).map((p, i) => {
            const prev = pathPoints[i];
            const cp1x = prev.x + (p.x - prev.x) * 0.5;
            const cp1y = prev.y;
            const cp2x = prev.x + (p.x - prev.x) * 0.5;
            const cp2y = p.y;
            return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
        }).join(" ");

    // Map Versions to Path Logic (approximate positions along the curve)
    const getPos = (idx: number, total: number) => {
        const t = idx / (total - 1);
        // Interpolating visually along the S-curve
        // Hardcoded tweak for "S" shape aesthetics
        const x = 15 + (idx * 6); // simple linear drift for now, refined later
        const y = 50 + Math.sin(idx * 0.8) * 35;
        return { left: `${x}%`, top: `${y}%` };
    };

    return (
        <div className="snake-skin-container">
            <div className="scaly-background"></div>

            {/* SVG Path Layer */}
            <svg className="sinuous-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path className="path-spine" d={svgPath} />
                <path className="path-pulse" d={svgPath} />
            </svg>

            {/* Interactive Content Layer */}
            <div className="snake-content-layer">

                {/* --- LEGACY NODE (v1.0) --- */}
                <div
                    className={`scale-node ${currentVersion === 'v1.0' ? 'active' : ''}`}
                    style={{ left: '15%', top: '75%' }}
                    onClick={() => onSelectVersion('v1.0')}
                >
                    <span className="scale-id">v1.0</span>
                    <span className="scale-title">THE PRIMORDIAL COIL</span>
                </div>

                {/* --- CURRENT NODE (v13.2) --- */}
                <div
                    className={`scale-node ${currentVersion === 'v13.2' ? 'active' : ''}`}
                    style={{ left: '80%', top: '15%', borderColor: '#00ff7f', boxShadow: '0 0 20px rgba(0,255,127,0.3)' }}
                    onClick={() => onSelectVersion('v13.2')}
                >
                    <span className="scale-id">v13.2</span>
                    <span className="scale-title">THE NARRATIVE WEAVE</span>
                </div>

                {/* --- ORGANS (TOYS) --- */}

                {/* 1. Design (Hall of Designers) */}
                <div className="organ-node organ-radiant" style={{ left: '30%', top: '30%' }} onClick={() => onSelectToy('hall_of_designers')}>
                    <span className="organ-icon">🐍</span>
                    <span className="organ-label">DESIGN</span>
                </div>

                {/* 2. Tune (Resonance Tuner) */}
                <div className="organ-node organ-tuner" style={{ left: '50%', top: '50%' }} onClick={() => onSelectToy('resonance_tuner')}>
                    <span className="organ-icon">🔊</span>
                    <span className="organ-label">TUNE</span>
                </div>

                {/* 3. Flux (Genre Flux) */}
                <div className="organ-node organ-flux" style={{ left: '70%', top: '70%' }} onClick={() => onSelectToy('genre_flux')}>
                    <span className="organ-icon">🌀</span>
                    <span className="organ-label">FLUX</span>
                </div>

                {/* 4. Coil (Ancestors) */}
                <div className="organ-node organ-coil" style={{ left: '60%', top: '25%' }} onClick={() => onSelectToy('ancestors_coil')}>
                    <span className="organ-icon">🧬</span>
                    <span className="organ-label">COIL</span>
                </div>

                {/* 5. Records (Chronicle) */}
                <div className="organ-node organ-chronicle" style={{ left: '20%', top: '55%' }} onClick={() => onSelectToy('chronicle_view')}>
                    <span className="organ-icon">📖</span>
                    <span className="organ-label">RECORDS</span>
                </div>

                {/* Detail Panel */}
                <div className={`snake-detail-panel ${currentVersion ? 'visible' : ''}`}>
                    {currentVersion && (() => {
                        const v = versions.find(ver => ver.id === currentVersion);
                        return (
                            <>
                                <h2>{v?.id}: {v?.title}</h2>
                                <p className="designer-desc">{v?.desc}</p>
                                <button className="start-expedition-btn" onClick={() => onSelectToy('mode_select')}>
                                    INITIALIZE EXPEDITION
                                </button>
                            </>
                        );
                    })()}
                </div>

            </div>
        </div>
    );
}
