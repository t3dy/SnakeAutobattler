import React, { useEffect, useState } from 'react';
import { ResolveOutcome, Theme, SnakeDraft } from '../engine/types';

interface CinematicVideoProps {
    choice: ResolveOutcome;
    snake: SnakeDraft;
    theme: Theme;
    onComplete: () => void;
}

const CinematicVideo: React.FC<CinematicVideoProps> = ({ choice, snake, theme, onComplete }) => {
    const [step, setStep] = useState(0);
    const isSciFi = theme === 'SCIFI';

    const getSFX = () => {
        if (choice === 'FIGHT') return isSciFi ? ['BZZZT', 'KRA-KOOM', 'CRITICAL_HIT'] : ['CLANG', 'ROAR', 'SLASH'];
        if (choice === 'RUN') return isSciFi ? ['ENGAGE_THRUSTERS', 'ZOOM', 'WARP'] : ['RUSTLE', 'PANT', 'ESCAPE'];
        return isSciFi ? ['CLOAK_ACTIVE', 'SILENCE', 'MISS'] : ['SHHH', 'SHADOWS', 'STILL'];
    };

    const sfx = getSFX();

    useEffect(() => {
        const handleKeyPress = () => {
            if (step < 2) setStep(step + 1);
            else onComplete();
        };

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('click', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('click', handleKeyPress);
        };
    }, [step, onComplete]);

    return (
        <div className={`cinematic-stage ${theme.toLowerCase()}`} style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="video-viewport">
                <div className={`animation-container ${choice.toLowerCase()}`}>
                    {/* Procedural SVG Snake Based on Choice */}
                    <div className="actor-container">
                        <svg className="cinematic-snake" viewBox="0 0 200 100">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path
                                d={choice === 'HIDE' ? "M50,50 Q100,20 150,50 T100,80 T50,50" : "M20,50 Q60,30 100,50 T180,50"}
                                fill="none"
                                stroke={isSciFi ? "#00ff7f" : "#d4af37"}
                                strokeWidth="4"
                                strokeLinecap="round"
                                filter="url(#glow)"
                            />
                            {choice === 'RUN' && <circle cx="180" cy="50" r="5" fill="#00d2ff" className="engine-flare" />}
                        </svg>

                        <div className="cinematic-hud">
                            <div className="hud-line">Subject: {snake.body}</div>
                            <div className="hud-line">Action: {choice}</div>
                            <div className="hud-line">Theme: {theme}</div>
                            <div className="hud-line probability">Success Probability: {(Math.random() * 40 + 50).toFixed(1)}%</div>
                        </div>

                        {choice === 'FIGHT' && (
                            <div className="enemy-silhouette animate-glitch">
                                {isSciFi ? '👾' : '🐉'}
                            </div>
                        )}
                    </div>

                    {/* Visual SFX */}
                    <div className={`visual-sfx step-${step}`}>
                        {sfx[step]}
                    </div>
                </div>

                <div className="video-controls">
                    <p>{step < 2 ? "[ CLICK OR PRESS KEY TO ADVANCE ]" : "[ PROCEED TO REALITY ]"}</p>
                </div>
            </div>
        </div>
    );
};

export default CinematicVideo;
