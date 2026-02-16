import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol } from 'chess.js';
import type { Key } from 'chessground/types';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.cburnett.css';

export interface ChessboardProps {
    fen?: string;
    orientation?: 'white' | 'black';
    onMove?: (from: Square, to: Square, fen: string, san: string, promotion?: PieceSymbol) => void;
    chessInstance?: Chess;
    onChessInstanceReady?: (chess: Chess) => void;
    lastMove?: [string, string];
    nonInteractive?: boolean;
    shapes?: { orig: string; dest?: string; brush?: string }[];
    onShapesChange?: (shapes: { orig: string; dest?: string; brush?: string }[]) => void;
}

const Chessboard: React.FC<ChessboardProps> = ({
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    orientation = 'white',
    onMove,
    chessInstance: externalChess,
    onChessInstanceReady,
    lastMove,
    nonInteractive = false,
    shapes,
    onShapesChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const chessRef = useRef<Chess | null>(null);
    const groundRef = useRef<ReturnType<typeof Chessground> | null>(null);
    const [boardSize, setBoardSize] = useState(400);

    // Get legal move destinations
    const getDests = useCallback((chess: Chess) => {
        const dests = new Map<Square, Square[]>();
        chess.moves({ verbose: true }).forEach(move => {
            if (!dests.has(move.from)) dests.set(move.from, []);
            dests.get(move.from)!.push(move.to);
        });
        return dests;
    }, []);

    // Get or create chess instance
    const getChess = useCallback((): Chess => {
        if (externalChess) {
            chessRef.current = externalChess;
            return externalChess;
        }
        if (!chessRef.current) {
            chessRef.current = new Chess();
        }
        return chessRef.current;
    }, [externalChess]);

    // Initialize chessground
    useEffect(() => {
        if (!boardRef.current) return;

        if (groundRef.current) {
            groundRef.current.destroy();
            groundRef.current = null;
        }

        const chess = getChess();
        if (onChessInstanceReady) onChessInstanceReady(chess);

        const turnColor: 'white' | 'black' = chess.turn() === 'w' ? 'white' : 'black';

        groundRef.current = Chessground(boardRef.current, {
            fen: chess.fen(),
            orientation,
            turnColor,
            movable: nonInteractive
                ? { dests: new Map(), free: false }
                : { free: false, dests: getDests(chess), showDests: true },
            draggable: { enabled: !nonInteractive, showGhost: true },
            selectable: { enabled: !nonInteractive },
            highlight: { lastMove: true, check: true },
            drawable: {
                enabled: true,
                visible: true,
                eraseOnClick: true,
                defaultSnapToValidMove: true,
                onChange: onShapesChange
                    ? (newShapes: any[]) => {
                        onShapesChange(
                            newShapes.map(s => ({
                                orig: s.orig,
                                dest: s.dest,
                                brush: s.brush || 'green',
                            }))
                        );
                    }
                    : undefined,
            },
            coordinates: true,
            events: nonInteractive
                ? {}
                : {
                    move: (orig: Key, dest: Key) => {
                        try {
                            const move = chess.move({ from: orig as Square, to: dest as Square });
                            if (move && onMove) {
                                onMove(orig as Square, dest as Square, chess.fen(), move.san, move.promotion || undefined);
                            }
                            const newTurn: 'white' | 'black' = chess.turn() === 'w' ? 'white' : 'black';
                            groundRef.current?.set({
                                fen: chess.fen(),
                                turnColor: newTurn,
                                movable: { dests: getDests(chess) },
                                lastMove: [orig, dest],
                                check: chess.inCheck(),
                            });
                        } catch (error) {
                            console.error('Invalid move:', error);
                        }
                    },
                },
        });

        // Redraw to ensure proper sizing
        requestAnimationFrame(() => groundRef.current?.redrawAll());
        const t = setTimeout(() => groundRef.current?.redrawAll(), 100);

        return () => {
            clearTimeout(t);
            groundRef.current?.destroy();
            groundRef.current = null;
        };
    }, [externalChess]);

    // Sync FEN, orientation, and lastMove
    useEffect(() => {
        if (!groundRef.current) return;

        const chess = getChess();
        if (fen && chess.fen() !== fen) {
            try {
                chess.load(fen);
            } catch {
                return;
            }
        }

        groundRef.current.set({
            fen: chess.fen(),
            orientation,
            turnColor: chess.turn() === 'w' ? 'white' : 'black',
            movable: nonInteractive
                ? { dests: new Map() }
                : { dests: getDests(chess) },
            lastMove: lastMove as [Key, Key] | undefined,
            check: chess.inCheck(),
        });

        // Sync external shapes
        if (shapes && groundRef.current.state) {
            groundRef.current.state.drawable.shapes = shapes.map(s => ({
                orig: s.orig as Key,
                dest: s.dest as Key | undefined,
                brush: s.brush || 'green',
            }));
            groundRef.current.redrawAll();
        }
    }, [fen, orientation, lastMove, nonInteractive, shapes]);

    // Responsive sizing
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const compute = () => {
            const cw = el.clientWidth;
            const ch = el.clientHeight;
            if (cw && ch) {
                setBoardSize(Math.min(cw, ch));
            }
        };

        compute();

        const ro = new ResizeObserver(compute);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Redraw on resize
    useEffect(() => {
        if (groundRef.current && boardSize > 0) {
            groundRef.current.redrawAll();
        }
    }, [boardSize]);

    return (
        <div
            className="chessboard-container"
            ref={containerRef}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <div
                ref={boardRef}
                style={{
                    width: `${boardSize}px`,
                    height: `${boardSize}px`,
                    boxSizing: 'content-box',
                }}
                onContextMenu={e => e.preventDefault()}
            />
        </div>
    );
};

export default Chessboard;
