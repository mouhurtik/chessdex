# ChessDex

A cross-platform chess game manager — your personal chess database, analysis board, and repertoire tool.

**Desktop** (Tauri v2 + React) • **Mobile** (React Native / Expo)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces |
| Desktop | Tauri v2, Vite, React, TypeScript |
| Mobile | React Native (Expo), TypeScript |
| Chessboard | chessground (desktop), custom (mobile) |
| Chess Logic | chess.js |
| State | Zustand |
| Database | SQLite (tauri-plugin-sql / expo-sqlite) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Desktop development
pnpm dev:desktop

# Mobile development  
pnpm dev:mobile

# Build shared package
pnpm build:shared
```

## Project Structure

```
chessdex/
├── packages/shared/    # @chessdex/shared — chess logic, types, PGN parser
├── apps/desktop/       # @chessdex/desktop — Tauri + React desktop app
└── apps/mobile/        # @chessdex/mobile — React Native mobile app
```
