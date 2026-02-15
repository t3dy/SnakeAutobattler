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
            setCurrentEncounter(pending)
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
                    <div className="landing-screen">
                        <h2>ARCHIVE HUB</h2>
                        <div className="version-grid">
                            {['v1.0', 'v2.0', 'v3.0', 'v4.0', 'v5.0', 'v6.0', 'v7.0'].map(v => (
                                <button key={v} className={`version-btn ${v === 'v6.0' ? 'v5-highlight' : ''} ${v === 'v7.0' ? 'v7-locked' : ''}`} onClick={() => v !== 'v7.0' && selectVersion(v as any)}>
                                    <strong>{v}</strong>
                                    <span>{v === 'v6.0' ? 'MERCHANT' : v === 'v7.0' ? 'GHOST (PLANNED)' : 'LEGACY'}</span>
                                </button>
                            ))}
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
                                <h2>THE SAGA UNFOLDS</h2>
                                {currentEncounter && (
                                    <div className="choice-modal">
                                        <div className="scene-description">
                                            <p>A critical junction in the {currentEncounter.terrain}!</p>
                                            <div className="scene-visual">📷 [DEPICTION REQUIRED]</div>
                                        </div>
                                        <div className="choice-options">
                                            <button onClick={() => makeChoice('RUN')}>RUN</button>
                                            <button onClick={() => makeChoice('HIDE')}>HIDE</button>
                                            <button onClick={() => makeChoice('FIGHT')}>FIGHT</button>
                                        </div>
                                    </div>
                                )}
                                {!currentEncounter && <p className="loading-text">Advancing time...</p>}
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
