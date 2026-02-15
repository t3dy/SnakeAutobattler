import { useState, useEffect, useRef } from 'react'
import './App.css'
import { runBattle } from './engine/engine'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType, EnvironmentParams } from './engine/types'
import Arena from './components/Arena'

type EngineVersion = 'v1.0' | 'v2.0' | 'v3.0' | 'v4.0' | 'v5.0';

function App() {
    const [gameState, setGameState] = useState<'landing' | 'env_draft' | 'draft' | 'battle' | 'recap'>('landing')
    const [engineVersion, setEngineVersion] = useState<EngineVersion>('v5.0')
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
    const [battleResult, setBattleResult] = useState<any>(null)

    // Replay State
    const [currentTick, setCurrentTick] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const playIntervalRef = useRef<number | null>(null)

    const selectVersion = (v: EngineVersion) => {
        setEngineVersion(v)
        if (v === 'v5.0') {
            setGameState('mode_select')
        } else if (v === 'v4.0') {
            setGameState('env_draft')
        } else {
            setGameState('draft')
        }
    }

    const handleEnvPick = (category: keyof EnvironmentParams, value: any) => {
        const next = { ...envParams, [category]: value }
        setEnvParams(next)
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
        const result = runBattle(playerTeam, enemyTeam, envParams)
        setBattleResult(result)
        setGameState('recap')
        setCurrentTick(0)

        // Auto-play replay for v3 and v4
        if (engineVersion === 'v3.0' || engineVersion === 'v4.0') {
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
                                <span>Legacy Log</span>
                                <p className="version-desc">The primordial transcript. Linear moves and basic combat logs.</p>
                            </button>
                            <button className="version-btn" onClick={() => selectVersion('v2.0')}>
                                <strong>v2.0 PERSONALITY</strong>
                                <span>Trait Bios</span>
                                <p className="version-desc">Introduced Archetypes and Origin Bios for more flavorful storytelling.</p>
                            </button>
                            <button className="version-btn" onClick={() => selectVersion('v3.0')}>
                                <strong>v3.0 VISUAL</strong>
                                <span>Arena Replay</span>
                                <p className="version-desc">The gift of sight. A real-time 16x12 emoji replay of the simulation.</p>
                            </button>
                            <button className="version-btn" onClick={() => selectVersion('v4.0')}>
                                <strong>v4.0 SAGA</strong>
                                <span>Dramatic Arcs</span>
                                <p className="version-desc">Evolution through memory. Spatial awareness and non-linear Story Compiling.</p>
                            </button>
                            <button className="version-btn v5-highlight" onClick={() => selectVersion('v5.0')}>
                                <strong>v5.0 CHRONICLES</strong>
                                <span>Honor & Steel</span>
                                <p className="version-desc">The Ultimate Saga. Hot-Seat 2-Player modes, Medieval/Sci-Fi themes, and FTL-style dungeon depth.</p>
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'env_draft' && (
                    <div className="env-draft-screen">
                        <h2>DEFINE THE ARENA</h2>
                        <div className="env-options-grid">
                            <div className="env-card">
                                <h3>CLIMATE</h3>
                                <button className={envParams.climate === 'Standard' ? 'active' : ''} onClick={() => handleEnvPick('climate', 'Standard')}>STANDARD</button>
                                <button className={envParams.climate === 'Tropical' ? 'active' : ''} onClick={() => handleEnvPick('climate', 'Tropical')}>TROPICAL (RIVERS)</button>
                                <button className={envParams.climate === 'Arid' ? 'active' : ''} onClick={() => handleEnvPick('climate', 'Arid')}>ARID (DUNES)</button>
                                <button className={envParams.climate === 'Alpine' ? 'active' : ''} onClick={() => handleEnvPick('climate', 'Alpine')}>ALPINE (PEAKS)</button>
                            </div>
                            <div className="env-card">
                                <h3>FAUNA (FOOD)</h3>
                                <button className={envParams.fauna === 'Standard' ? 'active' : ''} onClick={() => handleEnvPick('fauna', 'Standard')}>STANDARD</button>
                                <button className={envParams.fauna === 'High' ? 'active' : ''} onClick={() => handleEnvPick('fauna', 'High')}>DENSE</button>
                                <button className={envParams.fauna === 'Sparse' ? 'active' : ''} onClick={() => handleEnvPick('fauna', 'Sparse')}>SPARSE</button>
                            </div>
                            <div className="env-card">
                                <h3>FLORA (FOREST)</h3>
                                <button className={envParams.flora === 'Standard' ? 'active' : ''} onClick={() => handleEnvPick('flora', 'Standard')}>STANDARD</button>
                                <button className={envParams.flora === 'Dense' ? 'active' : ''} onClick={() => handleEnvPick('flora', 'Dense')}>DENSE</button>
                                <button className={envParams.flora === 'Barren' ? 'active' : ''} onClick={() => handleEnvPick('flora', 'Barren')}>BARREN</button>
                            </div>
                        </div>
                        <button className="proceed-btn" onClick={() => setGameState('draft')}>LOCK PARAMETERS & DRAFT SQUAD</button>
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
                        <h2>ARENA PARAMETERS SET</h2>
                        <p>Climate: {envParams.climate} | Fauna: {envParams.fauna} | Flora: {envParams.flora}</p>
                        <button onClick={startFight}>UNLEASH THE SAGA</button>
                    </div>
                )}

                {gameState === 'recap' && battleResult && (
                    <div className="recap-screen">

                        {(engineVersion === 'v3.0' || engineVersion === 'v4.0') && (
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
                                        {(engineVersion !== 'v1.0') && (
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
                    <div key={opt} className="trait-card">
                        <button onClick={() => onSelect(opt)}>{opt}</button>
                        <p className="trait-desc">{options[opt].description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App
