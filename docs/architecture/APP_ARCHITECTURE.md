# App Architecture

## Overview
- Desktop UI is a Tauri shell running a Vite + React frontend.
- Core chess logic and data types are centralized in the shared package.

## Desktop App Flow
- Entry point: [main.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/main.tsx#L1-L18)
- Routes and layout: [App.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/App.tsx#L1-L22) and [Layout.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/layout/Layout.tsx#L1-L22)
- Feature areas:
  - Analysis board: [AnalysisBoard.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/analysis/AnalysisBoard.tsx#L17-L291)
  - Games library: [GamesPage.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/games/GamesPage.tsx#L1-L132)

## State Management
- Engine state is handled via Zustand: [engineStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/engineStore.ts#L1-L135)
- Games import state lives in [gamesStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/gamesStore.ts#L35-L119)

## Shared Package
- Public exports: [index.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/index.ts#L1-L66)
- Chess types: [types.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/packages/shared/src/chess/types.ts#L1-L132)
