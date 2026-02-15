import { useState } from 'react'
import './App.css'
import { runBattle } from './engine/engine'
import { BODIES, INSTINCTS, AFFINITIES, QUIRKS } from './engine/traits'
import { SnakeDraft, BodyType, InstinctType, AffinityType, QuirkType } from './engine/types'

function App() {
    const [gameState, setGameState] = useState<'draft' | 'battle' | 'recap'>('draft')
    const [draftingSnakeIdx, setDraftingSnakeIdx] = useState(0)
    const [currentDraft, setCurrentDraft] = useState<Partial<SnakeDraft>>({})
    const [playerTeam, setPlayerTeam] = useState<SnakeDraft[]>([])
    const [battleResult, setBattleResult] = useState<any>(null)

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
    }

    return (
        <div className="app-container">
            <header>
                <h1>SNAKE AUTOBATTLER</h1>
            </header>

            <main>
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
                        <h2>THE DUST SETTLES</h2>
                        <div className="battle-recap-text">{battleResult.narrative.recap}</div>
                        <div className="snake-stories">
                            {battleResult.narrative.snakeStories.map((s: any, i: number) => (
                                <div key={i} className="snake-story-box">
                                    <h3>{s.name}</h3>
                                    <p className="snake-bio"><em>{s.bio}</em></p>
                                    <p>{s.story}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setPlayerTeam([]); setDraftingSnakeIdx(0); setGameState('draft'); }}>NEW EXPEDITION</button>
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
