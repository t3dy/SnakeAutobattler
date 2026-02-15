import React from 'react';
import { DESIGNERS, Designer } from '../engine/designers';

export default function HallOfDesigners({ onClose }: { onClose: () => void }) {
    return (
        <div className="hall-of-designers">
            <header className="hall-header">
                <h2>THE RADIANT COLLECTIVE: HALL OF DESIGNERS</h2>
                <button onClick={onClose} className="close-btn">RETURN TO ARCHIVE</button>
            </header>
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
            <footer className="hall-footer">
                <p>The collective is watching. Every lacuna is an opportunity for a new strike.</p>
            </footer>
        </div>
    );
}
