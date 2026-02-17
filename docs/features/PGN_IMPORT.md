# PGN Import

## Flow
- Import dialog and file read are handled in [fs.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/lib/fs.ts#L36-L127).
- Games are parsed with the shared PGN parser. See [gamesStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/gamesStore.ts#L60-L79) and [pgn-parser.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/chess/pgn-parser.ts#L1-L200).

## Current State
- Imported games live in memory only and are not stored in SQLite.
- File content is kept in sessionStorage for browser fallback mode.

## Next Steps
- Add persistent storage using shared SQL schema and queries.
- Add deduplication based on PGN headers or hash.
