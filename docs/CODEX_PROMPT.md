# Codex 5.2 Prompt — Copy & Paste This

Below is a ready-to-use prompt for Codex 5.2. Copy everything between the `---` markers.

---

## Prompt for Codex 5.2

Read the development guide at `docs/CODEX_TODO.md` in this project. It contains the full architecture, current state, and prioritized TODO list written by the lead developer (Opus 4.6).

**Your task — work through these priorities in order:**

### Phase A: Desktop Fix — UCI to SAN Notation
1. Create `packages/shared/src/chess/notation.ts` with a `uciToSan(fen, uciMoves)` function that converts UCI PV strings to standard algebraic notation (SAN) using chess.js
2. Export it from `packages/shared/src/index.ts`
3. Make sure `chess.js` is a dependency of `@chessdex/shared` (`pnpm --filter @chessdex/shared add chess.js`)
4. Update `apps/desktop/src/components/analysis/AnalysisBoard.tsx` to convert engine line PVs from UCI to SAN before displaying them
5. Update the eval bar's best line text to also show SAN instead of UCI
6. Rebuild shared: `pnpm --filter @chessdex/shared build`
7. Verify desktop compiles: `pnpm --filter @chessdex/desktop exec tsc --noEmit`

### Phase B: Error Boundary
1. Create `apps/desktop/src/components/common/ErrorBoundary.tsx` — a React Error Boundary that catches crashes and shows a "Something went wrong" message with a "Reset" button
2. Wrap `<AnalysisBoard>` in the error boundary in `App.tsx` or the route definition

### Phase C: Mobile App Scaffold
1. Create the Expo project: `cd apps && npx -y create-expo-app@latest mobile --template blank-typescript`
2. Update `apps/mobile/package.json` — set name to `@chessdex/mobile`, add `@chessdex/shared` as `workspace:*` dependency
3. Run `pnpm install` from root
4. Set up expo-router file-based navigation with tabs: Analysis, Games, Settings
5. Create the dark theme matching the desktop colors (copy from `apps/desktop/src/styles/index.css` `:root` variables)
6. Create a basic chessboard component (can use WebView + chessground initially, or `react-native-chessboard`)
7. Create the analysis screen with board + engine lines section below
8. Port the Zustand `engineStore.ts` — it's platform-agnostic and can be copied as-is
9. Add `expo-document-picker` for PGN import
10. Verify the app runs: `cd apps/mobile && npx expo start`

### Important Rules:
- **Follow the existing patterns** — check existing desktop code for conventions
- **Do NOT touch `useEngine.ts`** — the engine handshake logic is finalized and carefully tuned
- **Rebuild shared after any changes**: `pnpm --filter @chessdex/shared build`
- **Type check before committing**: `pnpm --filter @chessdex/desktop exec tsc --noEmit`
- **Engine safety**: When sending commands to Stockfish, ALWAYS send `stop` + `isready` and wait for `readyok` before sending new `position` + `go` commands

---
