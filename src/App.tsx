import { useState, useEffect, useRef } from 'react'
import './App.css'
import { runBattle } from './engine/engine'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType } from './engine/types'
import Arena from './components/Arena'

type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0';

function App() {
    const [gameState, setGameState] = useState<'landing' | 'draft' | 'battle' | 'recap'>('landing')
    const [engineVersion, setEngineVersion] = useState<EngineVersion>('v3.0')
    const [draftingSnakeIdx, setDraftingSnakeIdx] = useState(0)
    const [currentDraft, setCurrentDraft] = useState<Partial<SnakeDraft>>({})
    const [playerTeam, setPlayerTeam] = useState<SnakeDraft[]>([])
    const [battleResult, setBattleResult] = useState<any>(null)

    // Replay State
    const [currentTick, setCurrentTick] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const playIntervalRef = useRef<number | null>(null)

    const selectVersion = (v: EngineVersion) => {
        setEngineVersion(v)
        setGameState('draft')
    }

    const handlePick = (category: keyof SnakeDraft, value: any) => {
        const newDraft = { ...currentDraft, [category]: value }
        if (category === 'quirk') {
            const finalized = newDraft as SnakeDraft
            const newTeam = [...playerTeam, finalized]
            setPlayerTeam(newTeam)
            setCurrentDraft({})
            if (newTeam.length === 3) {
                setGameState('battle')
            } else {
                setDraftingSnakeIdx(newTeam.length)
            }
        } else {
            setCurrentDraft(newDraft)
        }
    }

    const startFight = () => {
        const enemyTeam: SnakeDraft[] = playerTeam.map(() => ({
            body: Object.keys(BODIES)[Math.floor(Math.random() * 4)] as BodyType,
            instinct: Object.keys(INSTINCTS)[Math.floor(Math.random() * 4)] as InstinctType,
            affinity: Object.keys(AFFINITIES)[Math.floor(Math.random() * 4)] as AffinityType,
            quirk: Object.keys(QUIRKS)[Math.floor(Math.random() * 4)] as QuirkType
        }))
        const result = runBattle(playerTeam, enemyTeam)
        setBattleResult(result)
        setGameState('recap')
        setCurrentTick(0)

        // Auto-play replay only in v3.0
        if (engineVersion === 'v3.0') {
            setIsPlaying(true)
        }
    }

    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = window.setInterval(() => {
                setCurrentTick(prev => {
                    if (prev >= 60) {
                        setIsPlaying(false)
                        return 60
                    }
                    return prev + 1
                })
            }, 300)
        } else {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current)
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
                        <h2>SELECT EXPEDITION MODULE</h2>
                        <div className="version-grid">
                            <button className="version-btn" onClick={() => selectVersion('v1.0')}>
                                <strong>v1.0 CORE</strong>
                                <span>Legacy Log Simulation</span>
                            </button>
                            <button className="version-btn" onClick={() => selectVersion('v2.0')}>
                                <strong>v2.0 PERSONALITY</strong>
                                <span>Enhanced Bios & Flavor</span>
                            </button>
                            <button className="version-btn" onClick={() => selectVersion('v3.0')}>
                                <strong>v3.0 VISUAL</strong>
                                <span>Animated Arena Replay</span>
                            </button>
                        </div>
                        <p className="landing-hint">All versions share the same core 16-trait drafting system.</p>
                    </div>
                )}

                {gameState === 'draft' && (
                    <div className="draft-screen">
                        <h2>DRAFTING SNAKE {draftingSnakeIdx + 1}/3</h2>
                        <div className="draft-categories">
                            {!currentDraft.body && <CategoryBox title="BODY" options={BODIES} onSelect={(v: any) => handlePick('body', v)} />}
                            {currentDraft.body && !currentDraft.instinct && <CategoryBox title="INSTINCT" options={INSTINCTS} onSelect={(v: any) => handlePick('instinct', v)} />}
                            {currentDraft.instinct && !currentDraft.affinity && <CategoryBox title="AFFINITY" options={AFFINITIES} onSelect={(v: any) => handlePick('affinity', v)} />}
                            {currentDraft.affinity && !currentDraft.quirk && <CategoryBox title="QUIRK" options={QUIRKS} onSelect={(v: any) => handlePick('quirk', v)} />}
                        </div>
                        <div className="current-snake-preview">
                            {Object.entries(currentDraft).map(([k, v]) => <div key={k}>{k.toUpperCase()}: {v}</div>)}
                        </div>
                    </div>
                )}

                {gameState === 'battle' && (
                    <div className="battle-screen">
                        <h2>THE ARENA IS READY</h2>
                        <p>Your team of 3 snakes is coiled and ready.</p>
                        <button onClick={startFight}>UNLEASH THE SNAKES</button>
                    </div>
                )}

                {gameState === 'recap' && battleResult && (
                    <div className="recap-screen">

                        {engineVersion === 'v3.0' && (
                            <div className="visual-replay-container">
                                <h2>ARENA REPLAY: TICK {currentTick}</h2>
                                <Arena
                                    world={battleResult.world}
                                    events={battleResult.events}
                                    currentTick={currentTick}
                                    snakes={battleResult.snakes}
                                />
                                <div className="replay-controls">
                                    <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
                                    <input type="range" min="0" max="60" value={currentTick} onChange={(e) => { setCurrentTick(parseInt(e.target.value)); setIsPlaying(false); }} />
                                </div>
                            </div>
                        )}

                        <div className="narrative-results">
                            <h2>THE DUST SETTLES</h2>
                            <div className="battle-recap-text">{battleResult.narrative.recap}</div>
                            <div className="snake-stories">
                                {battleResult.narrative.snakeStories.map((s: any, i: number) => (
                                    <div key={i} className="snake-story-box">
                                        <h3>{s.name}</h3>
                                        {(engineVersion === 'v2.0' || engineVersion === 'v3.0') && (
                                            <p className="snake-bio"><em>{s.bio}</em></p>
                                        )}
                                        <p>{s.story}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bottom-actions">
                            <button onClick={() => { setPlayerTeam([]); setDraftingSnakeIdx(0); setGameState('landing'); }}>RETURN TO HUB</button>
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
            <h3>SELECT {title}</h3>
            <div className="option-grid">
                {Object.keys(options).map(opt => (
                    <button key={opt} onClick={() => onSelect(opt)}>{opt}</button>
                ))}
            </div>
        </div>
    )
}

export default App
