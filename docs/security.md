# Security

## Current Posture
- Tauri CSP is disabled (`csp: null`), which weakens content protection. See [tauri.conf.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/tauri.conf.json#L19-L33).
- File system access is scoped to explicit user actions via the dialog and fs plugins. See [fs.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/lib/fs.ts#L36-L116).
## Data Handling
- PGN data is read from disk and stored in memory; it is not sanitized or validated beyond parsing. See [gamesStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/gamesStore.ts#L35-L79).
- Shared SQL queries exist but are not executed in the desktop app yet. See [queries.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/database/queries.ts#L1-L197).

## Risks
- No CSP increases exposure to injected scripts if any HTML injection occurs.
- The desktop app loads WebAssembly and worker scripts from the public directory; integrity is not enforced.
## Tauri Surface
- Default permissions are enabled. See [default.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/capabilities/default.json#L1-L11).
- Logging is enabled in debug builds; ensure sensitive data is not logged. See [lib.rs](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src-tauri/src/lib.rs#L1-L16).

## Recommendations
- Enable a restrictive CSP and add allowances only for required assets.
- Keep Tauri permissions minimal and explicit as additional plugins are added.
- Validate and sanitize PGN input before rendering or storing if PGN content is displayed as HTML.
