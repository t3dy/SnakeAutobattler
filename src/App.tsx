import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { runBattle } from './engine/engine'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType, EnvironmentParams } from './engine/types'
import Arena from './components/Arena'
import FeedbackLedger from './components/FeedbackLedger'
import { generateWorld } from './engine/world'
import { generateSimulation } from './engine/sim'
import { generateNarrative } from './engine/narrate'

type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0' | 'v6.0' | 'v7.0' | 'v8.0';

function App() {
    const [gameState, setGameState] = useState<any>('landing')
    const [engineVersion, setEngineVersion] = useState<EngineVersion>('v8.0')
    const [envParams, setEnvParams] = useState<EnvironmentParams>({
        climate: 'Standard',
        fauna: 'Standard',
        flora: 'Standard',
        mode: 'SOLO',
        theme: 'MEDIEVAL'
    })
    const [draftingSnakeIdx, setDraftingSnakeIdx] = useState(0)
    const [currentDraft, setCurrentDraft] = useState<Partial<SnakeDraft>>({})
    const [playerTeam, setPlayerTeam] = useState<SnakeDraft[]>([])
    const [p2Team, setP2Team] = useState<SnakeDraft[]>([])
    const [enemyTeam, setEnemyTeam] = useState<SnakeDraft[]>([])
    const [draftTurn, setDraftTurn] = useState<'P1' | 'P2' | 'ENEMY'>('P1')

    // Battle/Sim State
    const [battleResult, setBattleResult] = useState<any>(null)
    const [activeSim, setActiveSim] = useState<any>(null)
    const [currentEncounter, setCurrentEncounter] = useState<any>(null)
    const [currentTick, setCurrentTick] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const playIntervalRef = useRef<number | null>(null)

    const selectVersion = (v: EngineVersion) => {
        setEngineVersion(v)
        if (v === 'v5.0' || v === 'v6.0' || v === 'v7.0' || v === 'v8.0') {
            setGameState('mode_select')
        } else if (v === 'v4.0') {
            setGameState('env_draft')
        } else {
            setGameState('draft')
        }
    }

    const handleEnvPick = (category: keyof EnvironmentParams, value: any) => {
        setEnvParams(prev => ({ ...prev, [category]: value }))
    }

    const handlePick = (category: keyof SnakeDraft, value: any) => {
        const newDraft = { ...currentDraft, [category]: value }
        if (category === 'quirk') {
            handleDraftComplete(newDraft as SnakeDraft)
        } else {
            setCurrentDraft(newDraft)
        }
    }

    const handleDraftComplete = (draft: SnakeDraft) => {
        const isBattle = envParams.mode === 'HOTSEAT_BATTLE';
        const isCoop = envParams.mode === 'HOTSEAT_COOP';

        if (draftTurn === 'P1') {
            setPlayerTeam(prev => [...prev, draft]);
            if (isBattle || isCoop) {
                setDraftTurn('P2');
            } else {
                setDraftTurn('ENEMY');
            }
        } else if (draftTurn === 'P2') {
            setP2Team(prev => [...prev, draft]);
            setDraftTurn('ENEMY');
        } else {
            setEnemyTeam(prev => [...prev, draft]);
            setDraftTurn('P1');
            setDraftingSnakeIdx(prev => prev + 1);
        }
    }

    useEffect(() => {
        const targetCount = 2;
        if (draftingSnakeIdx >= targetCount) {
            setGameState('battle')
        }
    }, [draftingSnakeIdx])

    const startFight = () => {
        const enemyDrafts: SnakeDraft[] = enemyTeam.length > 0 ? enemyTeam : [1, 2, 3].map(() => ({
            body: Object.keys(BODIES)[Math.floor(Math.random() * 4)] as BodyType,
            instinct: Object.keys(INSTINCTS)[Math.floor(Math.random() * 4)] as InstinctType,
            affinity: Object.keys(AFFINITIES)[Math.floor(Math.random() * 4)] as AffinityType,
            quirk: Object.keys(QUIRKS)[Math.floor(Math.random() * 4)] as QuirkType
        }))

        const sim = generateSimulation(playerTeam, enemyDrafts, envParams, p2Team)
        setActiveSim(sim)
        setCurrentTick(0)
    }

    const makeChoice = (choice: 'RUN' | 'HIDE' | 'FIGHT') => {
        if (!activeSim || !currentEncounter) return
        activeSim.resolveEncounter(currentEncounter.snakeId, choice)
        setCurrentEncounter(null)
        setIsPlaying(true)
    }

    useEffect(() => {
        if (activeSim) {
            const encounter = activeSim.events.find((e: any) => e.tick === currentTick && e.type === 'ENCOUNTER_CHOICE')
            if (encounter && engineVersion === 'v6.0') {
                setCurrentEncounter(encounter)
                setIsPlaying(false)
            }
        }

        if (currentTick >= 60 && activeSim) {
            setBattleResult({
                events: activeSim.events,
                narrative: generateNarrative(activeSim.events, activeSim.snakes, envParams),
                snakes: activeSim.snakes
            })
            setGameState('recap')
            setActiveSim(null)
        }
    }, [currentTick, activeSim, engineVersion, envParams])

    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = window.setInterval(() => {
                setCurrentTick(prev => prev >= 60 ? (setIsPlaying(false), 60) : prev + 1)
            }, 300)
        } else if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current)
        }
        return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
    }, [isPlaying])

    const versions = [
        { id: 'v1.0', title: 'PRIMAL LOGS', desc: 'The core simulation loop. Pure functional movement and simple terminal-style event tracing.' },
        { id: 'v2.0', title: 'IDENTITY SPARK', desc: 'Introduction of the Drafting System. Snakes gain Traits, Quirks, and uniquely generated Origin Bios.' },
        { id: 'v3.0', title: 'GIFT OF SIGHT', desc: 'Transition to React/Vite. The Emoji Arena introduces real-time visual replays of the carnage.' },
        { id: 'v4.0', title: 'SAGA ENGINE', desc: 'The Story Compiler is born. Events are grouped into dramatic arcs (Exploration, Conflict, Survival).' },
        { id: 'v5.0', title: 'HONOR & STEEL', desc: 'Multilayered themes (Sci-Fi/Medieval) and Hot-Seat Multiplayer. Introduces the Storm mechanic.' },
        { id: 'v6.0', title: 'THE MERCHANT', desc: 'Interrupted simulation loop. Manual tactics: Run, Hide, or Fight. Persistent event stacking.' },
        { id: 'v7.0', title: 'THE GHOST', desc: 'Surgical causality. Autonomous Resolve based on personality, Typed Adversity, and Causal Cascades.' },
        { id: 'v8.0', title: 'CHRONICLE', desc: 'The Living Chronicle. Cinematic camera, SVG morphing, atmospheric layering, and procedural weather.' }
    ];

    const VersionCard = ({ id, title, desc }: { id: string, title: string, desc: string }) => (
        <div
            className={`megaman-card ${engineVersion === id ? 'active' : ''} ${id === 'v8.0' ? 'v8-glitch' : ''}`}
            onClick={() => selectVersion(id as any)}
        >
            <div className="card-id">{id}</div>
            <div className="card-title">{title}</div>
        </div>
    );

    const openFeedback = () => {
        const title = `[FEEDBACK] [${engineVersion}] [${envParams.theme}]`;
        const body = `--- SYSTEM BREADCRUMB ---\nVersion: ${engineVersion}\nTheme: ${envParams.theme}\nClimate: ${envParams.climate}\n-----------------------\n\nPLEASE DESCRIBE YOUR EXPERIENCE:`;
        window.open(`https://github.com/t3dy/SnakeAutobattler/issues/new?labels=feedback&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`);
    }

    return (
        <div className="app-container">
            {gameState === 'ledger' && <FeedbackLedger theme={envParams.theme || 'MEDIEVAL'} onClose={() => setGameState('landing')} />}
            <header>
                <h1>SNAKE AUTOBATTLER {gameState !== 'landing' && <span className="version-tag">{engineVersion}</span>}</h1>
            </header>

            <main>
                {gameState === 'landing' && (
                    <div className="landing-page">
                        <header className="landing-header">
                            <h1>SNAKE AUTOBATTLER: <span className="highlight-text">EVOLUTION</span></h1>
                            <p className="subtitle">From Primal Logs to Autonomous Narratives</p>
                        </header>

                        <div className="intro-section">
                            <p>Part strategy, part procedural story engine. This project explores <strong>Math-to-Myth</strong> translation, where every simulation event informs a thematic chronicle. Each version represents a leap in how simulation weights turn into world-building.</p>
                        </div>

                        <div className="megaman-grid">
                            <VersionCard id="v1.0" title="PRIMAL" desc="Core Loop" />
                            <VersionCard id="v2.0" title="SPARK" desc="Identity" />
                            <VersionCard id="v3.0" title="SIGHT" desc="Visuals" />

                            <VersionCard id="v4.0" title="SAGA" desc="Narrative" />
                            <div className="central-logo">
                                <h2>SNAKE<br />AUTO<br />BATTLER</h2>
                                <div className="evolution-subtitle">EVOLUTION</div>
                            </div>
                            <VersionCard id="v5.0" title="STEEL" desc="Themes" />

                            <VersionCard id="v6.0" title="MERCHANT" desc="Agency" />
                            <VersionCard id="v7.0" title="GHOST" desc="Resolve" />
                            <VersionCard id="v8.0" title="CHRONICLE" desc="Cinematic" />

                            <div className="megaman-card secret-boss" onClick={openFeedback}>
                                <div className="card-id">99.9</div>
                                <div className="card-title">✍️ FEEDBACK</div>
                            </div>
                            <div className="megaman-card secret-boss" onClick={() => setGameState('ledger')}>
                                <div className="card-id">LEDGER</div>
                                <div className="card-title">📜 ARCHIVE</div>
                            </div>
                            <div className="megaman-card" style={{ opacity: 0.2, cursor: 'default' }}>
                                <div className="card-id">???</div>
                                <div className="card-title">LOCKED</div>
                            </div>
                        </div>

                        <div className="version-detail-pane">
                            {engineVersion ? (
                                <div className="detail-content animate-slide-up">
                                    <span className="detail-tag">{engineVersion}</span>
                                    <h4>{versions.find(v => v.id === engineVersion)?.title}</h4>
                                    <p>{versions.find(v => v.id === engineVersion)?.desc}</p>
                                    <button className="unleash-btn-large" onClick={() => setGameState('mode_select')}>INITIALIZE MODULE</button>
                                </div>
                            ) : (
                                <p className="select-hint">SELECT AN ENGINE ARCHIVE TO PROCEED</p>
                            )}
                        </div>

                        <div className="tech-footer">
                            <span>Engine Status: <span className="status-online">Operational</span></span>
                            <span>Latest Update: v8.0 (The Living Chronicle)</span>
                        </div>
                    </div>
                )}

                {gameState === 'mode_select' && (
                    <div className="mode-select-screen">
                        <h2>SELECT ENGAGEMENT PROTOCOL</h2>
                        <div className="option-grid">
                            <button onClick={() => { handleEnvPick('mode', 'SOLO'); setGameState('env_draft'); }}>SOLO EXPEDITION</button>
                            <button onClick={() => { handleEnvPick('mode', 'HOTSEAT_BATTLE'); setGameState('env_draft'); }}>HOTSEAT CLASH</button>
                            <button onClick={() => { handleEnvPick('mode', 'HOTSEAT_COOP'); setGameState('env_draft'); }}>HOTSEAT CO-OP</button>
                        </div>
                    </div>
                )}

                {gameState === 'env_draft' && (
                    <div className="env-draft-screen">
                        <h2>ARENA PARAMETERS</h2>
                        <CategoryBox title="THEME" options={{ MEDIEVAL: '⚔️', SCIFI: '🚀' }} onSelect={(val: any) => handleEnvPick('theme', val)} />
                        <CategoryBox title="CLIMATE" options={{ Standard: '☁️', Arid: '🏜️', Lush: '🌴', Binary: '💾' }} onSelect={(val: any) => handleEnvPick('climate', val)} />
                        <CategoryBox title="FAUNA" options={{ Standard: '🐄', Hostile: '👹', Sparse: '🌵', Swarm: '🐝' }} onSelect={(val: any) => handleEnvPick('fauna', val)} />
                        <CategoryBox title="FLORA" options={{ Standard: '🌿', Dense: '🌳', None: '🏜️', Obsidian: '💎' }} onSelect={(val: any) => handleEnvPick('flora', val)} />
                        <button onClick={() => setGameState('draft')}>LOCK & DRAFT</button>
                    </div>
                )}

                {gameState === 'draft' && (
                    <div className="draft-screen">
                        <h2>BROOD SELECTION ({draftTurn})</h2>
                        <div className="draft-ui">
                            {!currentDraft.body && <CategoryBox title="BODY" options={BODIES} onSelect={(val: any) => handlePick('body', val)} />}
                            {currentDraft.body && !currentDraft.instinct && <CategoryBox title="INSTINCT" options={INSTINCTS} onSelect={(val: any) => handlePick('instinct', val)} />}
                            {currentDraft.body && currentDraft.instinct && !currentDraft.affinity && <CategoryBox title="AFFINITY" options={AFFINITIES} onSelect={(val: any) => handlePick('affinity', val)} />}
                            {currentDraft.body && currentDraft.instinct && currentDraft.affinity && !currentDraft.quirk && <CategoryBox title="QUIRK" options={QUIRKS} onSelect={(val: any) => handlePick('quirk', val)} />}
                        </div>
                    </div>
                )}

                {gameState === 'battle' && (
                    <div className="battle-screen">
                        {activeSim ? (
                            <div className="scene-container">
                                {((engineVersion as string) === 'v8.0') && <div className="parallax-backdrop" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/shapes/svg?seed=${envParams.climate}')` }} />}
                                <h2>THE SAGA UNFOLDS</h2>
                                <Arena
                                    world={activeSim.world}
                                    events={activeSim.events}
                                    currentTick={currentTick}
                                    snakes={activeSim.snakes}
                                    params={{ ...envParams, version: engineVersion }}
                                />
                                {currentEncounter && (
                                    <div className="choice-modal">
                                        <div className="scene-description">
                                            <p>A critical junction in the {currentEncounter.terrain}!</p>
                                        </div>
                                        <div className="choice-options">
                                            <button onClick={() => makeChoice('RUN')}>RUN</button>
                                            <button onClick={() => makeChoice('HIDE')}>HIDE</button>
                                            <button onClick={() => makeChoice('FIGHT')}>FIGHT</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pre-battle">
                                <h2>READY FOR EXPEDITION</h2>
                                <button className="unleash-btn" onClick={startFight}>UNLEASH THE SAGA</button>
                            </div>
                        )}
                    </div>
                )}

                {gameState === 'recap' && battleResult && (
                    <div className="recap-screen">
                        <h2>THE CHRONICLE OF {envParams.climate}</h2>
                        <div className="recap-narrative">
                            {battleResult.narrative.map((s: any, i: number) => (
                                <div key={i} className={`story-arc ${s.isCascade ? 'cascade' : ''}`}>
                                    <h4>{s.title}</h4>
                                    {Array.isArray(s.story) ? (
                                        <div className="surgical-log">
                                            {s.story.map((line: string, li: number) => <p key={li}>{line}</p>)}
                                        </div>
                                    ) : (
                                        <p>{typeof s.story === 'string' ? s.story : s.story.fullStory}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="recap-actions">
                            <button onClick={() => window.location.reload()}>NEW EXPEDITION</button>
                            <button className="recap-feedback-btn" onClick={openFeedback}>✍️ LEAVE FEEDBACK</button>
                            <button className="recap-ledger-btn" onClick={() => setGameState('ledger')}>📜 VIEW PUBLIC LEDGER</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

function CategoryBox({ title, options, onSelect }: any) {
    return (
        <div className="category-box">
            <h3>{title}</h3>
            <div className="option-grid">
                {Object.keys(options).map(opt => (
                    <button key={opt} onClick={() => onSelect(opt)}>{opt}</button>
                ))}
            </div>
        </div>
    )
}

export default App
