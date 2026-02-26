import React from 'react';

const FilesPage: React.FC = () => {
    return (
        <div className="placeholder-page">
            <div className="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
            </div>
            <h2>File Explorer</h2>
            <p>Browse, organize, and manage your PGN files in a folder tree with drag-and-drop support.</p>
            <div className="placeholder-features">
                <span className="feature-chip">Folder Tree</span>
                <span className="feature-chip">PGN Import</span>
                <span className="feature-chip">Drag & Drop</span>
            </div>
            <span className="placeholder-status">Coming Soon</span>
        </div>
    );
};

export default FilesPage;
