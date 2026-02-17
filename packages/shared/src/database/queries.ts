/**
 * Database Query Builders
 * 
 * Platform-agnostic SQL query strings and parameter arrays.
 * Each function returns { sql: string, params: any[] } objects
 * that can be executed by any SQLite driver.
 */

import type { Game } from '../chess/types';

// ─── Query result type ──────────────────────────────────────────

export interface SqlQuery {
    sql: string;
    params: any[];
}

// ─── Games CRUD ─────────────────────────────────────────────────

export function insertGameQuery(game: Game, sourceFile?: string): SqlQuery {
    const h = game.headers || {};
    return {
        sql: `INSERT INTO games (white, black, result, date, event, site, round, eco, white_elo, black_elo, pgn, source_file, folder_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
            h.White || null,
            h.Black || null,
            h.Result || null,
            h.Date || null,
            h.Event || null,
            h.Site || null,
            h.Round || null,
            h.ECO || null,
            h.WhiteElo ? parseInt(h.WhiteElo, 10) : null,
            h.BlackElo ? parseInt(h.BlackElo, 10) : null,
            game.pgn || '',
            sourceFile || null,
            null, // folder_id
        ],
    };
}

export function getGameQuery(id: number): SqlQuery {
    return {
        sql: `SELECT * FROM games WHERE id = ?`,
        params: [id],
    };
}

export function getAllGamesQuery(limit = 100, offset = 0): SqlQuery {
    return {
        sql: `SELECT id, white, black, result, date, event, eco, white_elo, black_elo, is_favorite, created_at
          FROM games ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        params: [limit, offset],
    };
}

export function getGamesByFolderQuery(folderId: number, limit = 100, offset = 0): SqlQuery {
    return {
        sql: `SELECT id, white, black, result, date, event, eco, white_elo, black_elo, is_favorite, created_at
          FROM games WHERE folder_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        params: [folderId, limit, offset],
    };
}

export function searchGamesQuery(searchTerm: string, limit = 50): SqlQuery {
    const like = `%${searchTerm}%`;
    return {
        sql: `SELECT id, white, black, result, date, event, eco, white_elo, black_elo, is_favorite, created_at
          FROM games
          WHERE white LIKE ? OR black LIKE ? OR event LIKE ? OR eco LIKE ?
          ORDER BY created_at DESC LIMIT ?`,
        params: [like, like, like, like, limit],
    };
}

export function updateGameNotesQuery(id: number, notes: string): SqlQuery {
    return {
        sql: `UPDATE games SET notes = ?, updated_at = datetime('now') WHERE id = ?`,
        params: [notes, id],
    };
}

export function toggleFavoriteQuery(id: number, isFavorite: boolean): SqlQuery {
    return {
        sql: `UPDATE games SET is_favorite = ?, updated_at = datetime('now') WHERE id = ?`,
        params: [isFavorite ? 1 : 0, id],
    };
}

export function moveGameToFolderQuery(gameId: number, folderId: number | null): SqlQuery {
    return {
        sql: `UPDATE games SET folder_id = ?, updated_at = datetime('now') WHERE id = ?`,
        params: [folderId, gameId],
    };
}

export function deleteGameQuery(id: number): SqlQuery {
    return {
        sql: `DELETE FROM games WHERE id = ?`,
        params: [id],
    };
}

// ─── Folders CRUD ───────────────────────────────────────────────

export function createFolderQuery(name: string, parentId?: number | null): SqlQuery {
    return {
        sql: `INSERT INTO folders (name, parent_id) VALUES (?, ?)`,
        params: [name, parentId || null],
    };
}

export function getAllFoldersQuery(): SqlQuery {
    return {
        sql: `SELECT * FROM folders ORDER BY sort_order, name`,
        params: [],
    };
}

export function renameFolderQuery(id: number, name: string): SqlQuery {
    return {
        sql: `UPDATE folders SET name = ?, updated_at = datetime('now') WHERE id = ?`,
        params: [name, id],
    };
}

export function deleteFolderQuery(id: number): SqlQuery {
    return {
        sql: `DELETE FROM folders WHERE id = ?`,
        params: [id],
    };
}

// ─── Tags CRUD ──────────────────────────────────────────────────

export function createTagQuery(name: string, color?: string): SqlQuery {
    return {
        sql: `INSERT INTO tags (name, color) VALUES (?, ?)`,
        params: [name, color || '#4263eb'],
    };
}

export function getAllTagsQuery(): SqlQuery {
    return {
        sql: `SELECT * FROM tags ORDER BY name`,
        params: [],
    };
}

export function addTagToGameQuery(gameId: number, tagId: number): SqlQuery {
    return {
        sql: `INSERT OR IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)`,
        params: [gameId, tagId],
    };
}

export function removeTagFromGameQuery(gameId: number, tagId: number): SqlQuery {
    return {
        sql: `DELETE FROM game_tags WHERE game_id = ? AND tag_id = ?`,
        params: [gameId, tagId],
    };
}

export function getTagsForGameQuery(gameId: number): SqlQuery {
    return {
        sql: `SELECT t.* FROM tags t
          INNER JOIN game_tags gt ON t.id = gt.tag_id
          WHERE gt.game_id = ?
          ORDER BY t.name`,
        params: [gameId],
    };
}

export function deleteTagQuery(id: number): SqlQuery {
    return {
        sql: `DELETE FROM tags WHERE id = ?`,
        params: [id],
    };
}

// ─── Stats ──────────────────────────────────────────────────────

export function getGameCountQuery(): SqlQuery {
    return {
        sql: `SELECT COUNT(*) as count FROM games`,
        params: [],
    };
}

export function getFavoriteGamesQuery(limit = 50): SqlQuery {
    return {
        sql: `SELECT id, white, black, result, date, event, eco, is_favorite, created_at
          FROM games WHERE is_favorite = 1 ORDER BY updated_at DESC LIMIT ?`,
        params: [limit],
    };
}
