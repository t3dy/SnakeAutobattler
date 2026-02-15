import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType, EnvironmentParams, EngineVersion, SnakeState, GameEvent } from './engine/types'
import Arena from './components/Arena'
import FeedbackLedger from './components/FeedbackLedger'
import CinematicVideo from './components/CinematicVideo'
import RadiantToy from './components/RadiantToy';
import SnakeSkinLayout from './components/SnakeSkinLayout';
import HallOfDesigners from './components/HallOfDesigners';
import { ChronicleArchive } from './utils/ChronicleArchive';
import ResonanceTuner from './components/ResonanceTuner';
import GenreFlux from './components/GenreFlux';
import AncestorsCoil from './components/AncestorsCoil';
import ChronicleView from './components/ChronicleView';
import RadianceDisplay from './components/RadianceDisplay'; // v13.1 Recovery
import { DESIGNERS } from './engine/designers';
import { generateSimulation } from './engine/sim'
import { generateNarrative } from './engine/narrate'
import { DeterministicRandom } from './engine/random'

enum GameStage {
    Draft = 'DRAFT',
    Simulation = 'SIMULATION',
    CinematicEncounter = 'CINEMATIC_ENCOUNTER',
    Recap = 'RECAP',
    Landing = 'LANDING',
    Options = 'OPTIONS',
    ModeSelect = 'MODE_SELECT',
    GenreSelect = 'GENRE_SELECT',
    DraftOrderSelect = 'DRAFT_ORDER_SELECT',
    EnvDraft = 'ENV_DRAFT',
    PrePhase = 'PRE_PHASE',
    HallOfDesigners = 'HALL_OF_DESIGNERS',
    RadiantToy = 'RADIANT_TOY',
    ResonanceTuner = 'RESONANCE_TUNER',
    GenreFlux = 'GENRE_FLUX',
    AncestorsCoil = 'ANCESTORS_COIL',
}

type GameState = 'landing' | 'mode_select' | 'genre_select' | 'draft_order_select' | 'env_draft' | 'draft' | 'battle' | 'recap' | 'pre_phase' | 'hall_of_designers' | 'radiant_toy' | 'resonance_tuner' | 'genre_flux' | 'ancestors_coil' | 'cinematic_video' | 'ledger' | 'chronicle_view' | 'version_archive';

function App() {
    const [gameState, setGameState] = useState<GameState>('landing')
    const [gameStage, setGameStage] = useState<GameStage>(GameStage.Draft); // v13.0 Meta-Stage
    const [engineVersion, setEngineVersion] = useState<EngineVersion>('v15.0');
    const [playerName, setPlayerName] = useState<string>('Anonymous'); // v13.0 Identity
    const [envParams, setEnvParams] = useState<EnvironmentParams>({
        climate: 'Standard',
        fauna: 'Standard',
        flora: 'Standard',
        mode: 'SOLO',
        theme: 'MEDIEVAL',
        genre: 'NOIR',
        phase: 1
    })

    // Drafting State
    const [draftOrder, setDraftOrder] = useState<'SNAKE_FIRST' | 'ENV_FIRST'>('SNAKE_FIRST')
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
    const [cinematicView, setCinematicView] = useState<{ choice: any, snake: any } | null>(null)
    const [currentTick, setCurrentTick] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [sessionSeed, setSessionSeed] = useState<number>(Date.now())
    const [encounterAccount, setEncounterAccount] = useState<string | null>(null)
    const [narrativeLog, setNarrativeLog] = useState<{ id: string, text: string }[]>([])
    const playIntervalRef = useRef<number | null>(null)

    const selectVersion = (v: EngineVersion) => {
        setEngineVersion(v)
        // v15.0 Brass Tacks: Direct to Draft with SOLO defaults
        if (v === 'v15.0') {
            setEnvParams(prev => ({ ...prev, mode: 'SOLO', genre: 'NOIR' }))
            setGameState('draft')
        } else if (v === 'v14.1' || v === 'v14.0' || v === 'v13.0' || v === 'v12.0' || v === 'v10.0' || v === 'v11.0') {
            setGameState('mode_select')
        } else if (v === 'v5.0' || v === 'v6.0' || v === 'v7.0' || v === 'v8.0') {
            setGameState('mode_select')
        } else if (v === 'v13.1' || v === 'v13.2') {
            setGameState('mode_select')
        } else if (v === 'v4.0') {
            setGameState('env_draft')
        } else {
            setGameState('draft')
        }
    }

    const handleModePick = (mode: any) => {
        handleEnvPick('mode', mode);
        // v13.1: Lucid Loop Recovery - Restore Genre Agency
        if (engineVersion === 'v13.0' || engineVersion === 'v12.0') {
            setGameState('genre_select');
        } else if (engineVersion === 'v10.0' || engineVersion === 'v11.0') {
            setGameState('draft_order_select');
        } else {
            setGameState('env_draft');
        }
    }

    const handleDraftOrderPick = (order: 'SNAKE_FIRST' | 'ENV_FIRST') => {
        setDraftOrder(order);
        if (order === 'SNAKE_FIRST') {
            setGameState('draft');
        } else {
            setGameState('env_draft');
        }
    }

    const handleEnvPick = (category: keyof EnvironmentParams, value: any) => {
        setEnvParams(prev => ({ ...prev, [category]: value }))
    }

    const handleGenrePick = (genre: any) => {
        handleEnvPick('genre', genre);
        setGameState('draft_order_select');
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
        // v15.0 Brass Tacks: Single Player Only
        const isBattle = envParams.mode === 'HOTSEAT_BATTLE' && engineVersion !== 'v15.0';
        const isCoop = envParams.mode === 'HOTSEAT_COOP' && engineVersion !== 'v15.0';

        if (draftTurn === 'P1') {
            setPlayerTeam(prev => [...prev, draft]);
            if (isBattle || isCoop) setDraftTurn('P2');
            else setDraftTurn('ENEMY');
        } else if (draftTurn === 'P2') {
            setP2Team(prev => [...prev, draft]);
            setDraftTurn('ENEMY');
        } else {
            setEnemyTeam(prev => [...prev, draft]);
            setDraftTurn('P1');
            setDraftingSnakeIdx(prev => prev + 1);
        }
    }

    const hardReset = () => {
        if (window.confirm("WARNING: This will clear all session data and return to the primordial state. Proceed?")) {
            localStorage.clear();
            window.location.reload();
        }
    }

    useEffect(() => {
        const targetCount = 2;
        if (draftingSnakeIdx >= targetCount) {
            if (engineVersion === 'v10.0' && draftOrder === 'SNAKE_FIRST') {
                setGameState('env_draft');
            } else {
                setGameState('battle');
            }
        }
    }, [draftingSnakeIdx, engineVersion, draftOrder])

    const startFight = () => {
        const seed = Date.now();
        setSessionSeed(seed);
        const rng = new DeterministicRandom(seed);

        const enemyDrafts: SnakeDraft[] = enemyTeam.length > 0 ? enemyTeam : [1, 2, 3].map(() => ({
            body: Object.keys(BODIES)[Math.floor(rng.next() * 5)] as BodyType,
            instinct: Object.keys(INSTINCTS)[Math.floor(rng.next() * 5)] as InstinctType,
            affinity: Object.keys(AFFINITIES)[Math.floor(rng.next() * 5)] as AffinityType,
            quirk: Object.keys(QUIRKS)[Math.floor(rng.next() * 5)] as QuirkType
        }))

        const sim = generateSimulation(playerTeam, enemyDrafts, envParams, p2Team, seed)
        setActiveSim(sim)
        setCurrentTick(0)
        setIsPlaying(true)
    }

    const makeChoice = (choice: 'RUN' | 'HIDE' | 'FIGHT') => {
        if (!activeSim || !currentEncounter) return
        const snake = activeSim.snakes.find((s: any) => s.id === currentEncounter.snakeId);

        if (engineVersion === 'v15.0') {
            // v15.0 Brass Tacks: Generate Text Account
            const resolution = activeSim.handleChoice(currentEncounter.snakeId, choice);
            const narrative = generateNarrative([resolution], activeSim.snakes, envParams);

            setEncounterAccount(narrative.snakeStories[0]?.story.fullStory || "The encounter resolved in silence.");
            setCurrentEncounter(null);
            setIsPlaying(false); // Pause so player can read the account
        } else {
            // v13.0 ALWAYS transitions to CinematicVideo before resolution
            setCinematicView({ choice, snake });
            setGameState('cinematic_video');
            setGameStage(GameStage.CinematicEncounter);
        }
    }

    const onCinematicComplete = () => {
        if (!activeSim || !currentEncounter || !cinematicView) return;

        // Resolve logic based on cinematic choice
        activeSim.handleChoice(currentEncounter.snakeId, cinematicView.choice);

        setCinematicView(null);
        setCurrentEncounter(null);
        setGameState('battle');
        setGameStage(GameStage.Simulation);
        setIsPlaying(true);
    }

    const startPhase2 = () => {
        const rng = new DeterministicRandom(sessionSeed + 1); // Iterative seed for next phase
        const nextParams: EnvironmentParams = {
            ...envParams,
            climate: ['Standard', 'Arid', 'Lush', 'Binary'][Math.floor(rng.next() * 4)] as any,
            fauna: ['Standard', 'Hostile', 'Sparse', 'Swarm'][Math.floor(rng.next() * 4)] as any,
            flora: ['Standard', 'Dense', 'None', 'Obsidian'][Math.floor(rng.next() * 4)] as any,
            phase: 2
        };
        setEnvParams(nextParams);
        const sim = generateSimulation(activeSim.snakes.map((s: SnakeState) => s.draft), [], nextParams, [], sessionSeed + 1);
        // Persist skills/stats
        sim.snakes.forEach((s: any, i: number) => {
            s.skills = activeSim.snakes[i].skills;
            s.hp = activeSim.snakes[i].hp;
        });
        setActiveSim(sim);
        setCurrentTick(0);
        setGameState('battle');
        setIsPlaying(true);
    }

    useEffect(() => {
        if (activeSim) {
            const encounter = activeSim.events.find((e: any) => e.tick === currentTick && e.type === 'PENDING_CHOICE')
            if (encounter) {
                setCurrentEncounter(encounter)
                setIsPlaying(false)
            }
        }

        if (currentTick >= 60 && activeSim) {
            if (envParams.phase === 1 && engineVersion === 'v10.0') {
                setGameState('pre_phase');
                setIsPlaying(false);
            } else {
                setBattleResult({
                    events: activeSim.events,
                    narrative: generateNarrative(activeSim.events, activeSim.snakes, envParams),
                    snakes: activeSim.snakes
                })

                // v13.0: Commit to Chronicle Archive
                const survivors = activeSim.snakes.filter((s: SnakeState) => s.alive);
                const outcome = survivors.length > 0 ? 'VICTORY' : 'DEFEAT';
                const narrativeSummary = generateNarrative(activeSim.events, activeSim.snakes, envParams).recap;

                ChronicleArchive.commit(
                    outcome,
                    activeSim.snakes,
                    narrativeSummary,
                    envParams,
                    activeSim.radianceScore,
                    playerName
                );

                setGameState('recap')
                setActiveSim(null)
            }
        }
    }, [currentTick, activeSim, engineVersion, envParams.phase])

    useEffect(() => {
        if (isPlaying && activeSim) {
            playIntervalRef.current = window.setInterval(() => {
                const prevEventsCount = activeSim.events.length;
                activeSim.step(); // v15.0 Stabilization: Step the engine
                setCurrentTick(activeSim.tick);

                // v15.0 Total De-Graphication: Stream Narrative Log
                if (engineVersion === 'v15.0') {
                    const newEvents = activeSim.events.slice(prevEventsCount);
                    newEvents.forEach((e: GameEvent) => {
                        // We only log events that have narrative significance (MOVE, HAZARD, CASCADE, etc)
                        if (['MOVE', 'HAZARD_HIT', 'KO', 'VICTORY', 'DEFEAT', 'DAMAGE', 'FEAT_ACCOMPLISHED', 'PHASE_SHIFT'].includes(e.type)) {
                            const snake = activeSim.snakes.find((s: SnakeState) => s.id === e.snakeId);
                            if (snake || e.snakeId === 'SYSTEM') {
                                // For simplicity, we create a basic context or use composer directly
                                // Here we can use the generateNarrative helper but it's built for lists
                                // Let's use a simplified version of compileGenreArcs logic or just map it
                                const mockNarrative = generateNarrative([e], activeSim.snakes, envParams);
                                const text = mockNarrative.snakeStories.find(s => s.name === snake?.name)?.story.fullStory
                                    || (e.snakeId === 'SYSTEM' ? (e.tags[0] || "System event detected.") : null);

                                if (text) {
                                    setNarrativeLog(prev => [...prev, { id: e.id, text }]);
                                }
                            }
                        }
                    });
                }

                if (activeSim.tick >= 60) {
                    setIsPlaying(false);
                }
            }, 300)
        } else if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current)
        }
        return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
    }, [isPlaying, activeSim])

    const versions = [
        { id: 'v1.0', title: 'The Primordial Coil', desc: 'Basic movement and apple consumption.' },
        { id: 'v4.0', title: 'The Elemental Shedding', desc: 'Introduction of hazard biomes.' },
        { id: 'v7.0', title: 'The Genetic Split', desc: 'Unit classes and synergistic evolutions.' },
        { id: 'v8.0', title: 'The Cinematic Eye', desc: 'Visual overhaul and automated camera direction.' },
        { id: 'v10.0', title: 'The Resonance', desc: 'Deep simulation and metadata tracking.' },
        { id: 'v11.0', title: 'The Scalar Field', desc: 'Terrain interactions and procedural generation.' },
        { id: 'v12.0', title: 'The Genre Shift', desc: 'Narrative genres and creative direction.' },
        { id: 'v13.0', title: 'The Radiant Architect', desc: 'Encounter-driven drama and tool-assisted design.' },
        { id: 'v13.1', title: 'The Lucid Loop', desc: 'Refined navigation and visual feedback.' },
        { id: 'v13.2', title: 'The Narrative Weave', desc: 'Context-aware storytelling and orphanage detection.' },
        { id: 'v14.0', title: 'The Narrative Skald', desc: 'Strict data-driven schema and layered composition.' },
        { id: 'v14.1', title: 'The Narrative Skald (Governance)', desc: 'JSON-driven registry and dynamic pacing scaling.' },
        { id: 'v15.0', title: 'The Stall Guard', desc: 'Seeded determinism and Branch Manager recovery logic.' }
    ];

    const VersionCard = ({ id, title }: { id: string, title: string }) => (
        <div
            className={`megaman-card ${engineVersion === id ? 'active' : ''} ${id === 'v10.0' ? 'v10-expedition' : ''}`}
            onClick={() => selectVersion(id as any)}
        >
            <div className="card-id">{id}</div>
            <div className="card-title">{title}</div>
        </div>
    );

    return (
        <div className="app-container">
            {gameState === 'hall_of_designers' && <HallOfDesigners onClose={() => setGameState('landing')} />}
            {gameState === 'radiant_toy' && <RadiantToy onExit={() => setGameState('landing')} />}
            {gameState === 'resonance_tuner' && <ResonanceTuner onExit={() => setGameState('landing')} />}
            {gameState === 'genre_flux' && <GenreFlux onExit={() => setGameState('landing')} />}
            {gameState === 'ancestors_coil' as any && <AncestorsCoil onExit={() => setGameState('landing')} />}
            {gameState === 'ledger' && <FeedbackLedger theme={envParams.theme || 'MEDIEVAL'} onClose={() => setGameState('landing')} />}
            {gameState === 'chronicle_view' && <ChronicleView onExit={() => setGameState('landing')} />}
            {gameState === 'cinematic_video' && cinematicView && (
                <CinematicVideo
                    choice={cinematicView.choice}
                    snake={cinematicView.snake.draft}
                    theme={envParams.theme}
                    onComplete={onCinematicComplete}
                />
            )}

            <header>
                <h1>SNAKE AUTOBATTLER {gameState !== 'landing' && <span className="version-tag">{engineVersion}</span>}</h1>
            </header>

            <main>
                {gameState === 'landing' && (
                    <div className="hero-landing">
                        <div className="hub-header">
                            <h2>CENTRAL COMMAND</h2>
                            <p>SELECT SECTOR FOR DEPLOYMENT</p>
                        </div>

                        <div className="hub-actions">
                            <button className="hub-btn hub-btn-newest" onClick={() => selectVersion('v15.0')}>
                                <span className="hub-label">TRY NEWEST VERSION</span>
                                <span className="hub-footer">v15.0 "Stall Guard" (2026)</span>
                            </button>

                            <button className="hub-btn hub-btn-classic" onClick={() => selectVersion('v1.0')}>
                                <span className="hub-label">TRY ORIGINAL VERSION</span>
                                <span className="hub-footer">v1.0 "Primordial Coil"</span>
                            </button>

                            <button className="hub-btn hub-btn-options" onClick={() => setGameState('options' as any)}>
                                <span className="hub-label">OTHER OPTIONS</span>
                                <span className="hub-footer">Legacy, Tools & Diagnostics</span>
                            </button>
                        </div>

                        <div className="safe-mode-zone">
                            <button className="reset-btn-link" onClick={hardReset}>SYSTEM HARD RESET</button>
                        </div>
                    </div>
                )}

                {gameState === 'options' as any && (
                    <div className="options-master-screen">
                        <div className="options-header">
                            <button className="back-btn" onClick={() => setGameState('landing')}>← BACK</button>
                            <h2>SYSTEM ARCHIVE & TOOLS</h2>
                        </div>

                        <div className="options-grid">
                            <div className="options-section">
                                <h3>LEGACY EXPEDITIONS</h3>
                                <div className="legacy-list">
                                    {versions.filter(v => v.id !== 'v1.0' && v.id !== 'v15.0').map(v => (
                                        <button key={v.id} className="legacy-btn" onClick={() => selectVersion(v.id as any)}>
                                            <strong>{v.id}</strong> {v.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="options-section">
                                <h3>INTERNAL SCHEMATICS</h3>
                                <div className="tools-list">
                                    <button onClick={() => setGameState('hall_of_designers')}>HALL OF DESIGNERS</button>
                                    <button onClick={() => setGameState('radiant_toy')}>RADIANT TOY</button>
                                    <button onClick={() => setGameState('resonance_tuner')}>RESONANCE TUNER</button>
                                    <button onClick={() => setGameState('genre_flux')}>GENRE FLUX</button>
                                    <button onClick={() => setGameState('ancestors_coil' as any)}>ANCESTORS COIL</button>
                                    <button onClick={() => setGameState('ledger')}>FEEDBACK LEDGER</button>
                                    <button onClick={() => setGameState('chronicle_view')}>CHRONICLE ARCHIVE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'version_archive' && (
                    <div className="archive-screen">
                        <div className="archive-header">
                            <button className="back-btn" onClick={() => setGameState('landing')}>← BACK</button>
                            <h2>THE SCHEMATIC ARCHIVE</h2>
                        </div>

                        <div className="tool-grid">
                            <button className="tool-btn" onClick={() => setGameState('hall_of_designers')}>DESIGN TEAM</button>
                            <button className="tool-btn" onClick={() => setGameState('radiant_toy')}>RADIANT TOY</button>
                            <button className="tool-btn" onClick={() => setGameState('resonance_tuner')}>RESONANCE TUNER</button>
                            <button className="tool-btn" onClick={() => setGameState('genre_flux')}>GENRE FLUX</button>
                            <button className="tool-btn" onClick={() => setGameState('ancestors_coil' as any)}>ANCESTORS COIL</button>
                            <button className="tool-btn" onClick={() => setGameState('ledger')}>FEEDBACK LEDGER</button>
                            <button className="tool-btn" onClick={() => setGameState('chronicle_view')}>CHRONICLE ARCHIVE</button>
                        </div>

                        <div className="archive-version-section">
                            <h3>LEGACY VERSIONS</h3>
                            <SnakeSkinLayout
                                versions={versions}
                                onSelectVersion={(id) => selectVersion(id as EngineVersion)}
                                onSelectToy={(toyId) => setGameState(toyId as any)}
                                currentVersion={engineVersion}
                            />
                        </div>
                    </div>
                )}

                {gameState === 'mode_select' && (
                    <div className="mode-select-screen">
                        <h2>CHOOSE YOUR CHALLENGE</h2>
                        <div className="option-grid">
                            <button onClick={() => handleModePick('SOLO')}>SOLO EXPEDITION</button>
                            <button onClick={() => handleModePick('HOTSEAT_BATTLE')}>HOTSEAT CLASH</button>
                            <button onClick={() => handleModePick('HOTSEAT_COOP')}>HOTSEAT CO-OP</button>
                            <button onClick={() => handleModePick('TREASURE_EXPEDITION')}>TREASURE HUNT</button>
                        </div>
                    </div>
                )}

                {gameState === 'genre_select' && (
                    <div className="mode-select-screen">
                        <h2>SELECT NARRATIVE GENRE</h2>
                        <div className="option-grid">
                            <button onClick={() => handleGenrePick('SLAPSTICK')}>🤡 SLAPSTICK</button>
                            <button onClick={() => handleGenrePick('ZOMBIE')}>🧟 ZOMBIE</button>
                            <button onClick={() => handleGenrePick('NOIR')}>🕵️ NOIR</button>
                            <button onClick={() => handleGenrePick('SPY')}>🕶️ SPY</button>
                            <button onClick={() => handleGenrePick('ALIEN')}>👽 ALIEN</button>
                        </div>
                    </div>
                )}

                {gameState === 'draft_order_select' && (
                    <div className="mode-select-screen">
                        <h2>EXPEDITION DOCTRINE</h2>
                        <div className="option-grid">
                            <button onClick={() => handleDraftOrderPick('SNAKE_FIRST')}>
                                🐍 SNAKE FIRST
                                <span className="btn-subtext">Draft your brood, then choose where they hunt.</span>
                            </button>
                            <button onClick={() => handleDraftOrderPick('ENV_FIRST')}>
                                🌍 ENVIRONMENT FIRST
                                <span className="btn-subtext">Understand the land, then draft survivors.</span>
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'env_draft' && (
                    <div className="env-draft-screen">
                        <h2>PHASE 1: CHOSEN LAND</h2>
                        <div className="draft-hint-box">
                            💡 {envParams.theme === 'MEDIEVAL' ? "Ancient maps suggest high hazards." : "Satellite data indicates swarm activity."}
                        </div>
                        <CategoryBox title="THEME" options={{ MEDIEVAL: '⚔️', SCIFI: '🚀' }} onSelect={(val: any) => handleEnvPick('theme', val)} />
                        <CategoryBox title="CLIMATE" options={{ Standard: '☁️', Arid: '🏜️', Lush: '🌴', Binary: '💾' }} onSelect={(val: any) => handleEnvPick('climate', val)} />
                        <button className="unleash-btn" onClick={() => setGameState(draftOrder === 'ENV_FIRST' ? 'draft' : 'battle')}>
                            {draftOrder === 'ENV_FIRST' ? 'RECRUIT BROOD' : 'BEGIN EXPEDITION'}
                        </button>
                    </div>
                )}

                {gameState === 'draft' && (
                    <div className="draft-screen">
                        <h2>BROOD SELECTION ({draftTurn})</h2>
                        <div className="snake-naming">
                            <input
                                type="text"
                                placeholder={`Name your ${currentDraft.body || 'Snake'}...`}
                                value={currentDraft.name || ''}
                                onChange={(e) => setCurrentDraft({ ...currentDraft, name: e.target.value })}
                                className="cyber-input snake-name-input"
                            />
                        </div>
                        <div className="draft-ui">
                            {!currentDraft.body && <CategoryBox title="BODY" options={BODIES} onSelect={(val: any) => handlePick('body', val)} />}
                            {currentDraft.body && !currentDraft.instinct && <CategoryBox title="INSTINCT" options={INSTINCTS} onSelect={(val: any) => handlePick('instinct', val)} />}
                            {currentDraft.body && currentDraft.instinct && !currentDraft.affinity && <CategoryBox title="AFFINITY" options={AFFINITIES} onSelect={(val: any) => handlePick('affinity', val)} />}
                            {currentDraft.body && currentDraft.instinct && currentDraft.affinity && !currentDraft.quirk && <CategoryBox title="QUIRK" options={QUIRKS} onSelect={(val: any) => handlePick('quirk', val)} />}
                        </div>
                    </div>
                )}

                {/* v13.1 Lucid Loop: Radiance HUD */}
                {activeSim && engineVersion !== 'v15.0' && (gameState === 'battle' || gameState === 'cinematic_video') && (
                    <RadianceDisplay radiance={activeSim.radiance} />
                )}

                {gameState === 'battle' && (
                    <div className="battle-screen">
                        {activeSim ? (
                            <div className="scene-container">
                                {engineVersion !== 'v15.0' && <h2>PHASE {envParams.phase}: {envParams.phase === 1 ? 'PREPARATION' : 'THE UNKNOWN'}</h2>}

                                {engineVersion === 'v15.0' ? (
                                    <div className="narrative-log-terminal">
                                        <div className="log-entries">
                                            {narrativeLog.map((entry) => (
                                                <div key={entry.id} className="log-entry">
                                                    <span className="cursor-indicator">{'>'}</span> {entry.text}
                                                </div>
                                            ))}
                                            <div id="log-anchor" />
                                        </div>
                                    </div>
                                ) : (
                                    <Arena world={activeSim.world} events={activeSim.events} currentTick={currentTick} snakes={activeSim.snakes} params={{ ...envParams, version: engineVersion }} />
                                )}
                                {currentEncounter && (
                                    <div className="choice-modal">
                                        <h3>ENCOUNTER: {currentEncounter.terrain.toUpperCase()}</h3>
                                        <div className="choice-options">
                                            <button onClick={() => makeChoice('RUN')}>🏃 RUN</button>
                                            <button onClick={() => makeChoice('HIDE')}>🕵️ HIDE</button>
                                            <button onClick={() => makeChoice('FIGHT')}>⚔️ FIGHT</button>
                                        </div>
                                    </div>
                                )}
                                {encounterAccount && (
                                    <div className="choice-modal account-modal">
                                        <h3>ENCOUNTER ACCOUNT</h3>
                                        <div className="account-text">
                                            {encounterAccount}
                                        </div>
                                        <button className="unleash-btn" onClick={() => {
                                            setEncounterAccount(null);
                                            setIsPlaying(true);
                                        }}>CONTINUE EXPEDITION</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pre-battle">
                                <button className="unleash-btn" onClick={startFight}>ENTER THE ARCHIVE</button>
                            </div>
                        )}
                    </div>
                )}

                {gameState === 'pre_phase' && (
                    <div className="mode-select-screen">
                        <h2>PHASE 1 COMPLETE</h2>
                        <p>Your brood has survived the known. Now they descend into the unknown depths.</p>
                        <div className="snake-stats-list">
                            {activeSim?.snakes.map((s: any) => (
                                <div key={s.id} className="snake-stat-row">
                                    {s.name}: {s.hp} HP | Skills: {s.skills.join(', ') || 'None'}
                                </div>
                            ))}
                        </div>
                        <button className="unleash-btn-large" onClick={startPhase2}>DESCEND TO PHASE 2</button>
                    </div>
                )}

                {gameState === 'recap' && battleResult && (
                    <div className="recap-screen">
                        <h2>EXPEDITION LOG: {envParams.genre}</h2>
                        <div className="recap-tone">
                            <p>{battleResult.narrative.recap}</p>
                        </div>
                        <div className="recap-narrative">
                            {battleResult.narrative.snakeStories.map((s: any, i: number) => (
                                <div key={i} className="story-arc">
                                    <h4>{s.name}</h4>
                                    <p className="bio"><i>{s.bio}</i></p>
                                    <p>{s.story.fullStory}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => window.location.reload()}>FORGE NEW SAGA</button>
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
                {Object.entries(options).map(([opt, data]: any) => (
                    <button key={opt} onClick={() => onSelect(opt)} className="option-btn">
                        <div className="opt-name">{opt}</div>
                        {data.hints && (
                            <div className="opt-hints">
                                <span className="pro">+{data.hints.pro}</span>
                                <span className="con">-{data.hints.con}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default App
