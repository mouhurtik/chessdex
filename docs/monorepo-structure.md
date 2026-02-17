# Monorepo Structure

## Workspace Layout
- `apps/desktop` — Tauri + React desktop app.
- `packages/shared` — chess logic, PGN parsing, FEN helpers, and SQLite schema/query builders.

## Workspace Configuration
- Workspace globs include `apps/*` and `packages/*`. See [pnpm-workspace.yaml](file:///c:/Users/User/Desktop/OpenChess/chessdex/pnpm-workspace.yaml#L1-L3).
- Root scripts orchestrate builds and dev commands. See [package.json](file:///c:/Users/User/Desktop/OpenChess/chessdex/package.json#L6-L14).

## Dependency Flow
- The desktop app consumes `@chessdex/shared` for chess types, FEN utilities, and PGN parsing.
- Shared package is built with TypeScript and exported as ESM.

## Notable Entry Points
- Desktop UI root: [App.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/App.tsx#L1-L22)
- Desktop layout shell: [Layout.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/layout/Layout.tsx#L1-L22)
- Stockfish integration: [useEngine.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/hooks/useEngine.ts#L1-L198)
- Shared exports: [index.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/index.ts#L1-L66)

## Gaps
- The workspace configuration includes `apps/*`, but there is no `apps/mobile` directory.
