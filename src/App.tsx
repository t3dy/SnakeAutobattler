import { useState, useEffect, useRef } from 'react'
import './App.css'
import { runBattle } from './engine/engine'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType, EnvironmentParams } from './engine/types'
import Arena from './components/Arena'
import { generateNarrative } from './engine/narrate'

type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0' | 'v6.0' | 'v7.0';

function App() {
    const [gameState, setGameState] = useState<any>('landing')
    const [engineVersion, setEngineVersion] = useState<EngineVersion>('v6.0')
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
        if (v === 'v5.0' || v === 'v6.0') {
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
        // Check if draft is done
        const targetCount = 2; // Assuming 2 snakes per team for this prototype
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

        const result = runBattle(playerTeam, enemyDrafts, envParams)

        if (engineVersion === 'v6.0' && result.sim.isWaitingForChoice) {
            setActiveSim(result.sim)
            processSimEvents(result.sim)
        } else if (engineVersion === 'v7.0') {
            // In v7.0, the sim handles choices autonomously without setting isWaitingForChoice
            setBattleResult(result)
            setGameState('recap')
        } else {
            setBattleResult(result)
            setGameState('recap')
            if (engineVersion === 'v3.0' || engineVersion === 'v4.0') setIsPlaying(true)
        }
    }

    const processSimEvents = (sim: any) => {
        const pending = sim.events.find((e: any) => e.type === 'PENDING_CHOICE' && !e.processed)
        if (pending) {
            pending.processed = true
            if (engineVersion === 'v7.0') {
                // Auto-resolve in v7.0
                sim.handleChoice(pending.snakeId, 'RUN'); // Placeholder, triggerEncounter already handles it in sim.ts v7
                // Wait, in v7.0 triggerEncounter already calls resolveEncounterChoice!
                // So we don't need to do anything here for v7.0, just let it run.
            } else {
                setCurrentEncounter(pending)
            }
        }
    }

    const makeChoice = (choice: 'RUN' | 'HIDE' | 'FIGHT') => {
        if (!activeSim || !currentEncounter) return
        activeSim.handleChoice(currentEncounter.snakeId, choice)
        setCurrentEncounter(null)

        activeSim.run()

        if (activeSim.isWaitingForChoice) {
            processSimEvents(activeSim)
        } else {
            setBattleResult({
                world: activeSim.world,
                events: activeSim.events,
                narrative: generateNarrative(activeSim.events, activeSim.snakes, envParams),
                snakes: activeSim.snakes
            })
            setGameState('recap')
            setActiveSim(null)
        }
    }

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

    return (
        <div className="app-container">
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

                        <div className="version-showcase">
                            {[
                                { id: 'v1.0', title: 'PRIMAL LOGS', desc: 'Core simulation loop. Pure functional movement and simple event tracing.' },
                                { id: 'v2.0', title: 'IDENTITY SPARK', desc: 'Snake Traits and uniquely generated Origin Bios.' },
                                { id: 'v3.0', title: 'GIFT OF SIGHT', desc: 'Emoji Arena introduces real-time visual replays.' },
                                { id: 'v4.0', title: 'SAGA ENGINE', desc: 'Story Compiler groups events into dramatic arcs.' },
                                { id: 'v5.0', title: 'HONOR & STEEL', desc: 'Themes (Sci-Fi/Medieval) and Hot-Seat Multiplayer.' },
                                { id: 'v6.0', title: 'THE MERCHANT', desc: 'Interrupted simulation with Manual Tactics: Run, Hide, Fight.' },
                                { id: 'v7.0', title: 'THE GHOST', desc: 'Autonomous Resolve, Typed Adversity, and Causal Cascades.' },
                                { id: 'v8.0', title: 'CHRONICLE', desc: 'The Living Chronicle. Cinematic camera, SVG morphing, and atmospheric layering.' }
                            ].map(v => (
                                <div key={v.id} className={`version-card ${engineVersion === v.id ? 'active' : ''} ${v.id === 'v8.0' ? 'v8-glitch' : ''}`} onClick={() => selectVersion(v.id as any)}>
                                    <div className="version-tag">{v.id}</div>
                                    <h3>{v.title}</h3>
                                    <p>{v.desc}</p>
                                    <button className="select-btn">SELECT ENGINE</button>
                                </div>
                            ))}
                        </div>

                        <div className="tech-footer">
                            <span>Engine Status: <span className="status-online">Operational</span></span>
                            <span>Latest Update: v8.0 (The Living Chronicle)</span>
                        </div>
                    </div>
                )}

                {gameState === 'mode_select' && (
                    <div className="mode-select-screen">
                        <h2>CHRONICLE SETTINGS</h2>
                        <div className="v5-selection-container">
                            <div className="v5-panel">
                                <h3>THEME</h3>
                                <button className={envParams.theme === 'MEDIEVAL' ? 'active' : ''} onClick={() => handleEnvPick('theme', 'MEDIEVAL')}>⚔️ MEDIEVAL</button>
                                <button className={envParams.theme === 'SCIFI' ? 'active' : ''} onClick={() => handleEnvPick('theme', 'SCIFI')}>🔫 SCI-FI</button>
                            </div>
                            <div className="v5-panel">
                                <h3>MODE</h3>
                                <button className={envParams.mode === 'SOLO' ? 'active' : ''} onClick={() => handleEnvPick('mode', 'SOLO')}>👤 SOLO</button>
                                <button className={envParams.mode === 'HOTSEAT_BATTLE' ? 'active' : ''} onClick={() => handleEnvPick('mode', 'HOTSEAT_BATTLE')}>🤜 BATTLE</button>
                            </div>
                        </div>
                        <button className="confirm-btn" onClick={() => setGameState('env_draft')}>PROCEED</button>
                    </div>
                )}

                {gameState === 'env_draft' && (
                    <div className="env-draft-screen">
                        <h2>ARENA PARAMETERS</h2>
                        <button onClick={() => setGameState('draft')}>LOCK & DRAFT</button>
                    </div>
                )}

                {gameState === 'draft' && (
                    <div className="draft-screen">
                        <h2>DRAFTING {draftTurn} ({draftingSnakeIdx + 1}/2)</h2>
                        <div className="draft-categories">
                            {!currentDraft.body && <CategoryBox title="BODY" options={BODIES} onSelect={(v: any) => handlePick('body', v)} />}
                            {currentDraft.body && !currentDraft.instinct && <CategoryBox title="INSTINCT" options={INSTINCTS} onSelect={(v: any) => handlePick('instinct', v)} />}
                            {currentDraft.instinct && !currentDraft.affinity && <CategoryBox title="AFFINITY" options={AFFINITIES} onSelect={(v: any) => handlePick('affinity', v)} />}
                            {currentDraft.affinity && !currentDraft.quirk && <CategoryBox title="QUIRK" options={QUIRKS} onSelect={(v: any) => handlePick('quirk', v)} />}
                        </div>
                    </div>
                )}

                {gameState === 'battle' && (
                    <div className="battle-screen">
                        {activeSim ? (
                            <div className="scene-container">
                                {engineVersion === 'v8.0' && <div className="parallax-backdrop" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/shapes/svg?seed=${envParams.climate}')` }} />}
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
                        <h2>THE CHRONICLE OF SURVIVAL</h2>
                        <div className="battle-recap-text">{battleResult.narrative.recap}</div>
                        <div className="snake-stories">
                            {battleResult.narrative.snakeStories.map((s: any, i: number) => (
                                <div key={i} className="snake-story-box">
                                    <h3>{s.name}</h3>
                                    <p className="snake-bio"><em>{s.bio}</em></p>
                                    {engineVersion === 'v6.0' ? (
                                        <div className="persistent-history">
                                            {battleResult.snakes[i].storyHistory.map((line: string, j: number) => (
                                                <p key={j} className="history-line">📜 {line}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>{typeof s.story === 'string' ? s.story : s.story.fullStory}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => window.location.reload()}>NEW EXPEDITION</button>
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
