# Data Model

## Domain Types
- Core chess types and PGN structure live in [types.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/chess/types.ts#L1-L132).
- PGN parsing is implemented in [pgn-parser.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/chess/pgn-parser.ts#L1-L200).

## Database Schema
- SQLite tables and indexes are defined in [schema.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/database/schema.ts#L1-L90).
- Query builders are defined in [queries.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/database/queries.ts#L1-L197).

## Current Usage
- Desktop app reads PGN files into memory and does not persist to SQLite. See [gamesStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/gamesStore.ts#L35-L79).
