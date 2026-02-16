import type { Chess, Move as ChessJsMove, Square, PieceSymbol, Color } from 'chess.js';

// ─── Core Chess Types ───────────────────────────────────────────────

export interface Position {
    fen: string;
    comment?: string;
    annotations?: string[];     // NAG symbols like '!', '?', '!!'
    arrows?: Arrow[];
    highlights?: Highlight[];
}

export interface Arrow {
    from: string;
    to: string;
    brush?: string;  // 'green', 'red', 'blue', 'yellow'
}

export interface Highlight {
    square: string;
    brush?: string;
}

export interface MoveNode {
    id: string;
    move: string;             // SAN notation (e.g., 'Nf3')
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
    position: Position;       // Position AFTER this move
    moveNumber: number;
    color: 'w' | 'b';
    parent?: string;          // parent MoveNode id
    children: string[];       // child MoveNode ids (variations)
    comment?: string;
    nag?: string[];           // Numeric Annotation Glyphs
}

// ─── Game Types ─────────────────────────────────────────────────────

export interface GameHeaders {
    event?: string;
    site?: string;
    date?: string;
    round?: string;
    white?: string;
    black?: string;
    result?: string;          // '1-0', '0-1', '1/2-1/2', '*'
    whiteElo?: string;
    blackElo?: string;
    eco?: string;             // ECO opening code
    opening?: string;
    timeControl?: string;
    [key: string]: string | undefined;
}

export interface Game {
    id: string;
    headers: GameHeaders;
    startingPosition: Position;
    moves: Map<string, MoveNode>;  // id -> MoveNode
    rootMoveIds: string[];         // top-level move ids
    pgn: string;                   // original PGN text
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    folderId?: string;
}

// ─── File/Folder Types ──────────────────────────────────────────────

export interface Folder {
    id: string;
    name: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PgnFile {
    id: string;
    name: string;
    folderId?: string;
    path?: string;          // filesystem path (desktop only)
    gameCount: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Database Types ─────────────────────────────────────────────────

export interface GameFilter {
    player?: string;
    white?: string;
    black?: string;
    opening?: string;
    eco?: string;
    result?: string;
    dateFrom?: string;
    dateTo?: string;
    minElo?: number;
    maxElo?: number;
    tags?: string[];
    folderId?: string;
}

export interface DatabaseStats {
    totalGames: number;
    totalFolders: number;
    totalFiles: number;
}

// ─── Engine Types ───────────────────────────────────────────────────

export interface EngineLine {
    pv: string[];           // Principal variation (moves)
    score: number;          // Centipawn score
    mate?: number;          // Mate in N (positive = white mates)
    depth: number;
    nodes?: number;
    nps?: number;           // Nodes per second
}

export interface EngineState {
    isRunning: boolean;
    lines: EngineLine[];
    depth: number;
    bestMove?: string;
}

// Re-export chess.js types for convenience
export type { Chess, ChessJsMove, Square, PieceSymbol, Color };
