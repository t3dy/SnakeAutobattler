import React, { useEffect, useState } from 'react';
import { EnvironmentParams } from '../engine/types';

interface FeedbackItem {
    id: number;
    title: string;
    body: string;
    user: { login: string; avatar_url: string };
    created_at: string;
}

interface FeedbackLedgerProps {
    theme: 'MEDIEVAL' | 'SCIFI';
    onClose: () => void;
}

const FeedbackLedger: React.FC<FeedbackLedgerProps> = ({ theme, onClose }) => {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('https://api.github.com/repos/t3dy/SnakeAutobattler/issues?labels=feedback&state=all')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFeedback(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const isSciFi = theme === 'SCIFI';

    return (
        <div className={`ledger-overlay ${isSciFi ? 'theme-scifi' : 'theme-medieval'}`}>
            <div className="ledger-container">
                <button className="close-ledger" onClick={onClose}>[ RETURN TO CORES ]</button>
                <h2 className="ledger-title">{isSciFi ? '> FEEDBACK_LEDGER.EXE' : '📜 The Scroll of Consensus'}</h2>

                {loading ? (
                    <div className="ledger-loading">{isSciFi ? 'ACCESSING_ENCRYPTED_DATA...' : 'Unrolling the parchment...'}</div>
                ) : (
                    <div className="ledger-list">
                        {feedback.length === 0 ? (
                            <p className="no-feedback">{isSciFi ? 'ERROR: NO_DATA_FOUND' : 'The ink has not yet been spilled.'}</p>
                        ) : (
                            feedback.map(item => (
                                <div key={item.id} className="ledger-item">
                                    <div className="item-header">
                                        <img src={item.user.avatar_url} alt={item.user.login} className="user-avatar" />
                                        <span className="user-name">{item.user.login}</span>
                                        <span className="item-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="item-title">{item.title}</h3>
                                    <p className="item-body">{item.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackLedger;
