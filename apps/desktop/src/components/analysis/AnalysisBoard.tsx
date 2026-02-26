import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol } from 'chess.js';
import Chessboard from '../chess/Chessboard';
import { useEngine } from '../../hooks/useEngine';
import { formatScore, scoreClass } from '../../stores/engineStore';
import { STARTING_FEN, uciToSan } from '@chessdex/shared';

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
    const [engineEnabled, setEngineEnabled] = useState(true);

    const {
        isReady, isRunning, error, lines, currentDepth, multiPV,
        setPosition, stop, updateMultiPV,
    } = useEngine();

    // Analyze whenever fen changes and engine is enabled
    useEffect(() => {
        if (isReady && engineEnabled) {
            setPosition(fen);
        } else if (!engineEnabled) {
            stop();
        }
    }, [fen, isReady, engineEnabled]);

    const handleMove = useCallback(
        (from: Square, to: Square, newFen: string, san: string, promotion?: PieceSymbol) => {
            const entry: MoveEntry = { fen: newFen, san, from, to, promotion };

            // Use functional updater to avoid stale closure over currentIndex
            setCurrentIndex(prevIdx => {
                setMoves(prevMoves => [...prevMoves.slice(0, prevIdx + 1), entry]);
                return prevIdx + 1;
            });
            setFen(newFen);
        },
        []
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

    const currentMoveEntry = currentIndex >= 0 && currentIndex < moves.length ? moves[currentIndex] : undefined;
    const lastMove: [string, string] | undefined =
        currentMoveEntry ? [currentMoveEntry.from, currentMoveEntry.to] : undefined;

    // Determine perspective for score display
    const isBlackTurn = fen.split(' ')[1] === 'b';

    // Get best line score for eval bar
    const bestLine = lines.find(l => l.multipv === 1);
    const displayScore = bestLine
        ? formatScore(bestLine.score, bestLine.scoreType)
        : '0.00';
    const displayScoreClass = bestLine
        ? scoreClass(bestLine.score, bestLine.scoreType)
        : 'neutral';
    const bestLineSan = bestLine ? uciToSan(fen, bestLine.pv) : [];
    const bestLineText = bestLineSan.length > 0 ? bestLineSan.join(' ') : bestLine?.pvUci;

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't capture if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
            else if (e.key === 'Home') { e.preventDefault(); goFirst(); }
            else if (e.key === 'End') { e.preventDefault(); goLast(); }
            else if (e.key === 'f' || e.key === 'F') { flipBoard(); }
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
                <div className="chessboard-wrapper" style={{ flex: 1, width: '100%', aspectRatio: '1', maxHeight: 'calc(100vh - var(--header-height) - 80px)' }}>
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
                {/* Engine Eval Bar */}
                <div className="eval-bar">
                    <button
                        className={`engine-toggle ${engineEnabled ? 'active' : ''}`}
                        onClick={() => setEngineEnabled(e => !e)}
                        title={engineEnabled ? 'Disable engine' : 'Enable engine'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            {engineEnabled ? (
                                <>
                                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                                </>
                            ) : (
                                <>
                                    <line x1="10" y1="8" x2="10" y2="16" strokeWidth="3" />
                                    <line x1="14" y1="8" x2="14" y2="16" strokeWidth="3" />
                                </>
                            )}
                        </svg>
                    </button>
                    <span className={`eval-score ${displayScoreClass}`}>
                        {displayScore}
                    </span>
                    <span className="eval-depth">
                        d/{currentDepth}
                    </span>
                    {error ? (
                        <span className="eval-line" style={{ color: 'var(--accent-danger)' }}>
                            Error: {error}
                        </span>
                    ) : !isReady ? (
                        <span className="eval-line">Loading engine…</span>
                    ) : !engineEnabled ? (
                        <span className="eval-line">Engine paused</span>
                    ) : (
                        <span className="eval-line">
                            {bestLineText || (isRunning ? 'Thinking…' : 'Ready')}
                        </span>
                    )}
                </div>

                {/* Engine Lines */}
                {engineEnabled && lines.length > 0 && (
                    <div className="panel-section engine-lines-section">
                        <div className="panel-header">
                            <span>Engine Lines</span>
                            <select
                                className="multipv-select"
                                value={multiPV}
                                onChange={(e) => updateMultiPV(parseInt(e.target.value, 10))}
                                title="Number of lines"
                            >
                                <option value={1}>1 line</option>
                                <option value={2}>2 lines</option>
                                <option value={3}>3 lines</option>
                                <option value={5}>5 lines</option>
                            </select>
                        </div>
                        <div className="panel-content engine-lines">
                            {lines.map((line) => (
                                <div key={line.multipv} className="engine-line-row">
                                    <span className={`engine-line-score ${scoreClass(line.score, line.scoreType)}`}>
                                        {formatScore(line.score, line.scoreType)}
                                    </span>
                                    <span className="engine-line-pv">
                                        {(uciToSan(fen, line.pv).join(' ')) || line.pvUci}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

                {/* Position Info */}
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
