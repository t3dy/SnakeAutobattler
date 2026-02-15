import React, { useEffect, useState } from 'react';
import { ChronicleArchive, ChronicleEntry } from '../utils/ChronicleArchive';

interface ChronicleViewProps {
    onExit: () => void;
}

const ChronicleView: React.FC<ChronicleViewProps> = ({ onExit }) => {
    const [entries, setEntries] = useState<ChronicleEntry[]>([]);

    useEffect(() => {
        setEntries(ChronicleArchive.load());
    }, []);

    return (
        <div className="ledger-overlay theme-medieval">
            <div className="ledger-container">
                <button className="close-ledger" onClick={onExit}>[ RETURN TO CORES ]</button>
                <h2 className="ledger-title">📜 The Chronicle Archive</h2>

                <div className="ledger-list chronicle-list">
                    {entries.length === 0 ? (
                        <p className="no-feedback">The pages are blank. No sagas have been woven yet.</p>
                    ) : (
                        entries.map(entry => (
                            <div key={entry.id} className={`ledger-item outcome-${entry.outcome.toLowerCase()}`}>
                                <div className="item-header">
                                    <span className="user-name">{entry.header.playerIdentity}</span>
                                    <span className="item-date">{new Date(entry.header.timestamp).toLocaleDateString()}</span>
                                    <span className={`outcome-tag ${entry.outcome.toLowerCase()}`}>{entry.outcome}</span>
                                </div>
                                <div className="chronicle-meta">
                                    <span>Radiance: {entry.header.radianceAvg.toFixed(0)}</span>
                                    <span>Seed: {entry.header.seed}</span>
                                    <span>v: {entry.header.engineVersion}</span>
                                </div>
                                <h3 className="item-title">Survivors: {entry.survivors.map(s => s.name).join(', ') || 'None'}</h3>
                                <p className="item-body">{entry.narrativeSummary}</p>
                                {entry.tragicDeaths.length > 0 && (
                                    <div className="casualties">
                                        <h4>Fallen:</h4>
                                        <ul>
                                            {entry.tragicDeaths.map((d, i) => (
                                                <li key={i}>{d.name} - {d.cause}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChronicleView;
