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

// Database
export {
    CREATE_TABLES_SQL,
    SCHEMA_VERSION,
    getCreateTableStatements,
} from './database/schema.js';

export type { SqlQuery } from './database/queries.js';
export {
    insertGameQuery,
    getGameQuery,
    getAllGamesQuery,
    getGamesByFolderQuery,
    searchGamesQuery,
    updateGameNotesQuery,
    toggleFavoriteQuery,
    moveGameToFolderQuery,
    deleteGameQuery,
    createFolderQuery,
    getAllFoldersQuery,
    renameFolderQuery,
    deleteFolderQuery,
    createTagQuery,
    getAllTagsQuery,
    addTagToGameQuery,
    removeTagFromGameQuery,
    getTagsForGameQuery,
    deleteTagQuery,
    getGameCountQuery,
    getFavoriteGamesQuery,
} from './database/queries.js';
