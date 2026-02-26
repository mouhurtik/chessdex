import React from 'react';
import {
    usePreferencesStore,
    BOARD_THEMES,
    PIECE_SETS,
    ENGINE_DEPTH_OPTIONS,
    BoardTheme,
} from '../../stores/preferencesStore';

/* ─── Small sub-components ────────────────────────────────── */

const ThemePreview: React.FC<{
    theme: BoardTheme;
    selected: boolean;
    onClick: () => void;
}> = ({ theme, selected, onClick }) => (
    <button
        className={`theme-preview ${selected ? 'selected' : ''}`}
        onClick={onClick}
        title={theme.name}
    >
        <div className="theme-grid">
            <div style={{ background: theme.lightSquare }} />
            <div style={{ background: theme.darkSquare }} />
            <div style={{ background: theme.darkSquare }} />
            <div style={{ background: theme.lightSquare }} />
        </div>
        <span className="theme-label">{theme.name}</span>
        {!theme.free && <span className="pro-badge">PRO</span>}
    </button>
);

const Toggle: React.FC<{
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
}> = ({ checked, onChange, label, description }) => (
    <div className="setting-row">
        <div className="setting-info">
            <span className="setting-label">{label}</span>
            {description && <span className="setting-desc">{description}</span>}
        </div>
        <button
            className={`toggle ${checked ? 'on' : ''}`}
            onClick={() => onChange(!checked)}
            role="switch"
            aria-checked={checked}
        >
            <div className="toggle-thumb" />
        </button>
    </div>
);

/* ─── Main Settings Page ──────────────────────────────────── */

const SettingsPage: React.FC = () => {
    const boardThemeId = usePreferencesStore(s => s.boardThemeId);
    const pieceSetId = usePreferencesStore(s => s.pieceSetId);
    const engineDepth = usePreferencesStore(s => s.engineDepth);
    const multiPV = usePreferencesStore(s => s.multiPV);
    const showCoordinates = usePreferencesStore(s => s.showCoordinates);
    const showLegalMoves = usePreferencesStore(s => s.showLegalMoves);

    const setBoardTheme = usePreferencesStore(s => s.setBoardTheme);
    const setPieceSet = usePreferencesStore(s => s.setPieceSet);
    const setEngineDepth = usePreferencesStore(s => s.setEngineDepth);
    const setMultiPV = usePreferencesStore(s => s.setMultiPV);
    const setShowCoordinates = usePreferencesStore(s => s.setShowCoordinates);
    const setShowLegalMoves = usePreferencesStore(s => s.setShowLegalMoves);

    return (
        <div className="settings-page">
            {/* ── Board Theme ─────────────────────────── */}
            <section className="settings-section">
                <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2" />
                        <rect x="6" y="6" width="4" height="4" />
                        <rect x="14" y="6" width="4" height="4" />
                        <rect x="6" y="14" width="4" height="4" />
                        <rect x="14" y="14" width="4" height="4" />
                    </svg>
                    Board Theme
                </h3>
                <div className="theme-grid-picker">
                    {BOARD_THEMES.map(t => (
                        <ThemePreview
                            key={t.id}
                            theme={t}
                            selected={boardThemeId === t.id}
                            onClick={() => setBoardTheme(t.id)}
                        />
                    ))}
                </div>
            </section>

            {/* ── Piece Set ───────────────────────────── */}
            <section className="settings-section">
                <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L9 9h6L12 2z" />
                        <path d="M7 9c-2 2-3 5-3 7 0 3 3 6 8 6s8-3 8-6c0-2-1-5-3-7H7z" />
                    </svg>
                    Piece Set
                </h3>
                <div className="piece-set-picker">
                    {PIECE_SETS.map(p => (
                        <button
                            key={p.id}
                            className={`piece-option ${pieceSetId === p.id ? 'selected' : ''}`}
                            onClick={() => setPieceSet(p.id)}
                        >
                            <span>{p.name}</span>
                            {!p.free && <span className="pro-badge">PRO</span>}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Board Options ────────────────────────── */}
            <section className="settings-section">
                <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Board Options
                </h3>
                <Toggle
                    label="Show Coordinates"
                    description="Display rank and file labels on the board"
                    checked={showCoordinates}
                    onChange={setShowCoordinates}
                />
                <Toggle
                    label="Show Legal Moves"
                    description="Highlight valid moves when selecting a piece"
                    checked={showLegalMoves}
                    onChange={setShowLegalMoves}
                />
            </section>

            {/* ── Engine Configuration ─────────────────── */}
            <section className="settings-section">
                <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
                    </svg>
                    Engine Configuration
                </h3>
                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Analysis Depth</span>
                        <span className="setting-desc">Higher depth = stronger analysis, slower speed</span>
                    </div>
                    <div className="depth-picker">
                        {ENGINE_DEPTH_OPTIONS.map(d => (
                            <button
                                key={d}
                                className={`depth-option ${engineDepth === d ? 'selected' : ''}`}
                                onClick={() => setEngineDepth(d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Engine Lines (MultiPV)</span>
                        <span className="setting-desc">Number of alternative lines to analyse</span>
                    </div>
                    <div className="depth-picker">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                className={`depth-option ${multiPV === n ? 'selected' : ''}`}
                                onClick={() => setMultiPV(n)}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Account (placeholder) ────────────────── */}
            <section className="settings-section">
                <h3 className="section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Account
                </h3>
                <div className="account-placeholder">
                    <p>Sign in to sync your games and preferences across devices.</p>
                    <button className="sign-in-btn" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Sign In — Coming Soon
                    </button>
                </div>
            </section>

            {/* ── About ────────────────────────────────── */}
            <section className="settings-section about-section">
                <div className="about-row">
                    <span className="about-label">Version</span>
                    <span className="about-value">0.1.0</span>
                </div>
                <div className="about-row">
                    <span className="about-label">Engine</span>
                    <span className="about-value">Stockfish 16 WASM Lite</span>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
