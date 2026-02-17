/**
 * Database Schema Definitions
 * 
 * SQLite table schemas for games, folders, tags, and game_tags.
 * Compatible with both tauri-plugin-sql (desktop) and expo-sqlite (mobile).
 */

export const SCHEMA_VERSION = 1;

/**
 * SQL statements to create all tables.
 * Uses IF NOT EXISTS for safe re-runs.
 */
export const CREATE_TABLES_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Folders for organizing games
CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Tags for categorizing games
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#4263eb',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- PGN headers
  white TEXT,
  black TEXT,
  result TEXT,
  date TEXT,
  event TEXT,
  site TEXT,
  round TEXT,
  eco TEXT,
  white_elo INTEGER,
  black_elo INTEGER,
  
  -- Full PGN text
  pgn TEXT NOT NULL,
  
  -- Metadata
  folder_id INTEGER,
  source_file TEXT,
  notes TEXT,
  is_favorite INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Game-Tag junction table (many-to-many)
CREATE TABLE IF NOT EXISTS game_tags (
  game_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (game_id, tag_id),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_games_white ON games(white);
CREATE INDEX IF NOT EXISTS idx_games_black ON games(black);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_eco ON games(eco);
CREATE INDEX IF NOT EXISTS idx_games_folder ON games(folder_id);
CREATE INDEX IF NOT EXISTS idx_games_favorite ON games(is_favorite);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
`;

/**
 * Split the schema SQL into individual statements for drivers
 * that don't support multiple statements in one call.
 */
export function getCreateTableStatements(): string[] {
    return CREATE_TABLES_SQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s + ';');
}
