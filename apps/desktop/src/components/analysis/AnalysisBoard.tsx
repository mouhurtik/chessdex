import React, { useCallback, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol } from 'chess.js';
import Chessboard from '../chess/Chessboard';
import { STARTING_FEN } from '@chessdex/shared';

interface MoveEntry {
    fen: string;
    san: string;
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
}

const AnalysisBoard: React.FC = () => {
    const chessRef = useRef(new Chess());
    const [moves, setMoves] = useState<MoveEntry[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [fen, setFen] = useState(STARTING_FEN);
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');

    const handleMove = useCallback(
        (from: Square, to: Square, newFen: string, san: string, promotion?: PieceSymbol) => {
            const entry: MoveEntry = { fen: newFen, san, from, to, promotion };

            setMoves(prev => {
                // If we're not at the end, truncate future moves (creating a new line)
                const next = [...prev.slice(0, currentIndex + 1), entry];
                return next;
            });
            setCurrentIndex(prev => prev + 1);
            setFen(newFen);
        },
        [currentIndex]
    );

    const goToMove = useCallback(
        (index: number) => {
            if (index < -1 || index >= moves.length) return;
            const targetFen = index === -1 ? STARTING_FEN : moves[index].fen;
            setCurrentIndex(index);
            setFen(targetFen);
            chessRef.current.load(targetFen);
        },
        [moves]
    );

    const goFirst = () => goToMove(-1);
    const goPrev = () => goToMove(currentIndex - 1);
    const goNext = () => goToMove(currentIndex + 1);
    const goLast = () => goToMove(moves.length - 1);
    const flipBoard = () => setOrientation(o => (o === 'white' ? 'black' : 'white'));

    // Get last move for highlighting
    const lastMove: [string, string] | undefined =
        currentIndex >= 0 ? [moves[currentIndex].from, moves[currentIndex].to] : undefined;

    // Keyboard shortcuts
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goFirst();
            } else if (e.key === 'End') {
                e.preventDefault();
                goLast();
            } else if (e.key === 'f' || e.key === 'F') {
                flipBoard();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    // Format moves into pairs for notation display
    const movePairs: { num: number; white: MoveEntry; black?: MoveEntry }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            num: Math.floor(i / 2) + 1,
            white: moves[i],
            black: moves[i + 1],
        });
    }

    return (
        <div className="analysis-container">
            {/* Board */}
            <div className="analysis-board-section">
                <div className="chessboard-wrapper" style={{ width: '100%', maxWidth: '600px', aspectRatio: '1' }}>
                    <Chessboard
                        fen={fen}
                        orientation={orientation}
                        onMove={handleMove}
                        chessInstance={chessRef.current}
                        lastMove={lastMove}
                    />
                </div>

                {/* Board Controls */}
                <div className="board-controls">
                    <button onClick={goFirst} title="First move (Home)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="11 17 6 12 11 7" />
                            <line x1="7" y1="12" x2="18" y2="12" />
                            <line x1="6" y1="5" x2="6" y2="19" />
                        </svg>
                    </button>
                    <button onClick={goPrev} title="Previous move (←)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button onClick={goNext} title="Next move (→)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                    <button onClick={goLast} title="Last move (End)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="13 17 18 12 13 7" />
                            <line x1="17" y1="12" x2="6" y2="12" />
                            <line x1="18" y1="5" x2="18" y2="19" />
                        </svg>
                    </button>
                    <button onClick={flipBoard} title="Flip board (F)" style={{ marginLeft: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="17 1 21 5 17 9" />
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                            <polyline points="7 23 3 19 7 15" />
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Right Panel */}
            <div className="analysis-panel">
                {/* Engine Eval (placeholder) */}
                <div className="eval-bar">
                    <span className="eval-score neutral">0.0</span>
                    <span className="eval-depth">d/0</span>
                    <span className="eval-line">Engine not connected</span>
                </div>

                {/* Move Notation */}
                <div className="panel-section" style={{ flex: 1 }}>
                    <div className="panel-header">
                        <span>Moves</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {moves.length} move{moves.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="notation-container">
                        {moves.length === 0 ? (
                            <div className="empty-state">
                                <p>Make a move to begin analysis</p>
                            </div>
                        ) : (
                            <div className="notation-moves">
                                {movePairs.map((pair) => (
                                    <React.Fragment key={pair.num}>
                                        <span className="move-number">{pair.num}.</span>
                                        <span
                                            className={`move-san ${currentIndex === (pair.num - 1) * 2 ? 'active' : ''}`}
                                            onClick={() => goToMove((pair.num - 1) * 2)}
                                        >
                                            {pair.white.san}
                                        </span>
                                        {pair.black && (
                                            <span
                                                className={`move-san ${currentIndex === (pair.num - 1) * 2 + 1 ? 'active' : ''}`}
                                                onClick={() => goToMove((pair.num - 1) * 2 + 1)}
                                            >
                                                {pair.black.san}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info panel */}
                <div className="panel-section">
                    <div className="panel-header">
                        <span>Position</span>
                    </div>
                    <div className="panel-content" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, wordBreak: 'break-all' }}>
                        {fen}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisBoard;
