import React from 'react';
import { useGamesStore } from '../../stores/gamesStore';
import GameList from './GameList';

const GamesPage: React.FC = () => {
    const {
        files, activeFileIndex, activeGameIndex,
        importFile, selectFile, selectGame, removeFile,
        isLoading, error, currentGame,
    } = useGamesStore();

    return (
        <div className="games-page">
            {/* Files sidebar */}
            <div className="games-files-panel">
                <div className="panel-header">
                    <span>PGN Files</span>
                    <button className="import-btn" onClick={importFile} disabled={isLoading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Import
                    </button>
                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="files-list">
                    {files.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 16px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>No PGN files loaded</p>
                            <p style={{ fontSize: 11 }}>Click "Import" to open a PGN file</p>
                        </div>
                    ) : (
                        files.map((file, index) => (
                            <div
                                key={index}
                                className={`file-item ${activeFileIndex === index ? 'active' : ''}`}
                                onClick={() => selectFile(index)}
                            >
                                <div className="file-item-info">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6" />
                                    </svg>
                                    <span className="file-item-name">{file.name}</span>
                                    <span className="file-item-count">{file.gameCount}</span>
                                </div>
                                <button
                                    className="file-item-remove"
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    title="Remove file"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Games list */}
            <div className="games-list-panel">
                {activeFileIndex !== null && files[activeFileIndex] ? (
                    <GameList
                        games={files[activeFileIndex].games}
                        activeIndex={activeGameIndex}
                        onSelectGame={(gameIndex) => selectGame(activeFileIndex, gameIndex)}
                        fileName={files[activeFileIndex].name}
                    />
                ) : (
                    <div className="empty-state">
                        <p>Select a file to view games</p>
                    </div>
                )}
            </div>

            {/* Game preview */}
            <div className="games-preview-panel">
                {currentGame ? (
                    <div className="game-preview">
                        <div className="panel-header">
                            <span>
                                {currentGame.headers?.White || '?'} vs {currentGame.headers?.Black || '?'}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                {currentGame.headers?.Result || '*'}
                            </span>
                        </div>
                        <div className="panel-content">
                            {Object.entries(currentGame.headers || {}).map(([key, value]) => (
                                <div key={key} className="game-header-row">
                                    <span className="game-header-key">{key}</span>
                                    <span className="game-header-value">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="game-preview-actions">
                            <button className="action-btn primary" onClick={() => {
                                // Navigate to analysis with this game
                                // For now, just notify — will wire to router later
                                window.location.hash = '/analysis';
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                                Analyze
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Select a game to preview</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesPage;
