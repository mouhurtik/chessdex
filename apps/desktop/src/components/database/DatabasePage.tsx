import React from 'react';

const DatabasePage: React.FC = () => {
    return (
        <div className="placeholder-page">
            <div className="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            </div>
            <h2>Game Database</h2>
            <p>Search and organize your chess games with full-text search, position filtering, and tags.</p>
            <div className="placeholder-features">
                <span className="feature-chip">SQLite Storage</span>
                <span className="feature-chip">Position Search</span>
                <span className="feature-chip">Game Tags</span>
            </div>
            <span className="placeholder-status">Coming Soon</span>
        </div>
    );
};

export default DatabasePage;
