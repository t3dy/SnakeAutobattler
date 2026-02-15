import React from 'react';
import { RadianceEngine } from '../engine/radiance';

interface RadianceDisplayProps {
    radiance: RadianceEngine;
}

const RadianceDisplay: React.FC<RadianceDisplayProps> = ({ radiance }) => {
    const value = radiance.value;
    const state = radiance.getInterpretiveState();
    const pct = Math.max(0, Math.min(100, (value / 200) * 100));

    return (
        <div className="radiance-hud">
            <div className="radiance-header">
                <span className="radiance-title">RADIANCE//</span>
                <span className={`radiance-state state-${state.toLowerCase()}`}>{state}</span>
            </div>
            <div className="radiance-track">
                <div
                    className={`radiance-fill state-${state.toLowerCase()}`}
                    style={{ width: `${pct}%` }}
                />
                <div className="radiance-marker base-marker" style={{ left: '50%' }} title="Baseline" />
            </div>
            <div className="radiance-footer">
                <span className="radiance-value">{Math.round(value)}</span>
                <span className="radiance-max">/ 200</span>
            </div>
        </div>
    );
};

export default RadianceDisplay;
