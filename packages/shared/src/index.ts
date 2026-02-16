// @chessdex/shared — Core chess logic, types, and utilities

// Chess types
export type {
    Position,
    Arrow,
    Highlight,
    MoveNode,
    GameHeaders,
    Game,
    Folder,
    PgnFile,
    GameFilter,
    DatabaseStats,
    EngineLine,
    EngineState,
} from './chess/types.js';

// Re-export chess.js types
export type { Chess, Square, PieceSymbol, Color } from './chess/types.js';

// PGN parser
export { parsePgn, gameToPgn, resetIdCounter } from './chess/pgn-parser.js';

// FEN utilities
export {
    isValidFen,
    STARTING_FEN,
    fenToPlacement,
    isCheckmate,
    isStalemate,
    sideToMove,
    fullMoveNumber,
} from './utils/fen.js';
