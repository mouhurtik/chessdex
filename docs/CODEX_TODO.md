# ChessDex — Codex Development Guide & TODO

> **Context**: This guide was written by Opus 4.6 for Codex 5.2 to follow.
> After completing tasks, submit for Opus review.

---

## Current Project State

```
chessdex/
├── apps/desktop/          # Tauri v2 + Vite + React (WORKING ✅)
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/  # AnalysisBoard.tsx — interactive board + engine
│   │   │   ├── chess/     # Chessboard.tsx — chessground wrapper
│   │   │   ├── games/     # GamesPage.tsx, GameList.tsx — PGN management
│   │   │   └── layout/    # Layout.tsx, Sidebar.tsx — app shell
│   │   ├── hooks/         # useEngine.ts — Stockfish worker communication
│   │   ├── stores/        # engineStore.ts, gamesStore.ts (Zustand)
│   │   └── styles/        # index.css — full design system
│   └── public/stockfish/  # stockfish-18-lite-single.js + .wasm
├── apps/mobile/           # ← DOES NOT EXIST YET — CREATE THIS
├── packages/shared/       # @chessdex/shared (BUILDS ✅)
│   └── src/
│       ├── chess/         # types.ts, pgn-parser.ts
│       ├── database/      # schema.ts, queries.ts
│       └── utils/         # fen.ts
└── pnpm-workspace.yaml    # workspaces: ['apps/*', 'packages/*']
```

### Key Tech Decisions Already Made
- **State management**: Zustand (lightweight, no boilerplate)
- **Chess logic**: `chess.js` for move validation, FEN handling
- **Board rendering**: `chessground` on desktop (web-based)
- **Engine**: Stockfish 18 WASM (lite, single-threaded)
- **Monorepo**: pnpm workspaces
- **Shared package**: Platform-agnostic types, PGN parser, FEN utils, SQL query builders

---

## PRIORITY 1: Desktop Fixes (Do These First)

### 1.1 — UCI-to-SAN Notation Converter

**Problem**: Engine lines display raw UCI notation (`e2e4 d7d5 b1c3`) instead of standard algebraic notation (`e4 d5 Nc3`). This looks ugly and is hard to read.

**Where to fix**: `apps/desktop/src/stores/engineStore.ts` and `apps/desktop/src/components/analysis/AnalysisBoard.tsx`

**Implementation**:

1. Add a `uciToSan()` utility function in `packages/shared/src/chess/` (so mobile can reuse it):

```typescript
// packages/shared/src/chess/notation.ts
import { Chess, type Square } from 'chess.js';

/**
 * Convert a UCI PV string to SAN notation given a starting FEN.
 * Example: uciToSan("rnbqkbnr/...", ["e2e4", "e7e5", "g1f3"]) → ["e4", "e5", "Nf3"]
 */
export function uciToSan(fen: string, uciMoves: string[]): string[] {
    const chess = new Chess(fen);
    const sans: string[] = [];
    
    for (const uci of uciMoves) {
        const from = uci.slice(0, 2) as Square;
        const to = uci.slice(2, 4) as Square;
        const promotion = uci.length > 4 ? uci[4] : undefined;
        
        try {
            const move = chess.move({ from, to, promotion });
            if (move) {
                sans.push(move.san);
            } else {
                break;
            }
        } catch {
            break;
        }
    }
    
    return sans;
}
```

2. Export from `packages/shared/src/index.ts`:
```typescript
export { uciToSan } from './chess/notation.js';
```

3. Use in `AnalysisBoard.tsx` — when displaying engine lines, call `uciToSan(currentFen, line.pv)` and display the SAN array instead of `line.pvUci`.

4. Also display in the eval bar's bestLine text.

**Important**: `chess.js` must be added as a dependency to `@chessdex/shared` if it's not already.

---

### 1.2 — Add Error Boundary

**Problem**: When a crash occurs (e.g., from the now-fixed move bug), the entire page goes blank with no recovery.

**What to add**: Wrap the `<AnalysisBoard>` in a React Error Boundary component that shows a friendly error message and a "Reset" button.

**File**: Create `apps/desktop/src/components/common/ErrorBoundary.tsx`

---

## PRIORITY 2: Mobile App Scaffold

### 2.1 — Initialize Expo Project

```bash
cd apps
npx -y create-expo-app@latest mobile --template blank-typescript
cd mobile
```

Then update `apps/mobile/package.json`:
- Set `"name": "@chessdex/mobile"`
- Add `"@chessdex/shared": "workspace:*"` to dependencies

Run from root: `pnpm install`

### 2.2 — Mobile Tech Stack

| Concern | Library | Notes |
|---------|---------|-------|
| Navigation | `expo-router` | File-based routing |
| Chess board | `react-native-chessboard` OR custom WebView with chessground | Explore both |
| Stockfish | `react-native-stockfish-cxx` | Native C++ bindings, much faster than WASM |
| Storage | `expo-sqlite` | Use shared `schema.ts` + `queries.ts` |
| State | `zustand` | Same pattern as desktop |
| File picker | `expo-document-picker` | For PGN import |
| UI framework | `react-native-paper` or custom | Match desktop dark theme |

### 2.3 — Mobile App Structure

```
apps/mobile/
├── app/                    # expo-router pages
│   ├── _layout.tsx         # Root layout with tab navigation
│   ├── index.tsx           # Home / Dashboard
│   ├── analysis.tsx        # Analysis board screen
│   └── games.tsx           # PGN file manager
├── components/
│   ├── chess/
│   │   └── MobileBoard.tsx # Chessboard component (touch-friendly)
│   ├── analysis/
│   │   └── AnalysisView.tsx # Engine + board combined
│   └── common/
│       └── TabBar.tsx      # Bottom tab navigation
├── hooks/
│   └── useEngine.ts        # Stockfish hook (adapted for native)
├── stores/
│   └── engineStore.ts      # Can reuse desktop's store verbatim
├── styles/
│   └── theme.ts            # Dark theme tokens matching desktop
└── package.json
```

### 2.4 — Feature Parity Checklist

The mobile app should eventually have these features (build in order):

- [ ] **Tab navigation** — Analysis, Games, Settings tabs
- [ ] **Chessboard** — Touch-friendly board with drag-and-drop pieces
- [ ] **Move input** — Tap source square, tap destination square
- [ ] **Move notation** — SAN notation display with move navigation
- [ ] **Stockfish engine** — Live analysis with eval score and engine lines
- [ ] **PGN import** — Pick .pgn file from device, parse with shared parser
- [ ] **Game browser** — List games from imported PGN files
- [ ] **Board controls** — First/prev/next/last/flip buttons
- [ ] **Dark theme** — Match desktop color palette

### 2.5 — Design Requirements

- Use the **same color palette** as desktop (see `apps/desktop/src/styles/index.css` `:root` variables)
- The board should be **full-width** on mobile, with the analysis panel **below** the board (vertical layout)
- Use a **bottom tab bar** for navigation (Analysis / Games / Settings)
- Engine lines should show below the board in a scrollable list
- Move notation should show below engine lines

---

## PRIORITY 3: Desktop Feature Additions

### 3.1 — Evaluation Graph

Add a visual evaluation graph below the board controls that plots the eval score at each move. This gives a visual sense of how the game progressed.

**Libraries**: Use a lightweight chart library like `recharts` or draw on `<canvas>`.

### 3.2 — Opening Book / Opening Name Display

Show the name of the current opening based on the move sequence. Use a JSON opening book (ECO classification).

### 3.3 — Board Themes

Allow users to select different board color schemes (e.g., green, brown, blue, default steel blue).

### 3.4 — Move Sound Effects

Add sounds for move, capture, check, and castle.

### 3.5 — Export Analysis as PGN

Allow exporting the current analysis (with engine evaluations as comments) as a PGN file.

---

## PRIORITY 4: Shared Package Enhancements

### 4.1 — Move Tree Support

Currently moves are a flat array. For proper analysis, support a **move tree** with variations/branches. This is critical for review mode.

### 4.2 — Opening Database

Add an ECO opening classification module to `packages/shared/src/chess/openings.ts` that maps FEN positions to opening names.

---

## Important Patterns to Follow

### When Adding to Shared Package
1. Create the file in the appropriate subdirectory under `packages/shared/src/`
2. Export from `packages/shared/src/index.ts`
3. Rebuild: `pnpm --filter @chessdex/shared build`
4. Then the desktop/mobile apps can import from `@chessdex/shared`

### When Adding Desktop Components
1. Follow the existing pattern: component in `src/components/[feature]/`
2. Zustand stores in `src/stores/`
3. Hooks in `src/hooks/`
4. CSS in `src/styles/index.css` (one file, organized by section comments)

### Engine Communication (Desktop)
- The stockfish JS file IS the Web Worker (`new Worker('/stockfish/stockfish-18-lite-single.js')`)
- **CRITICAL**: Always send `stop` + `isready` and wait for `readyok` before sending new `position` + `go` commands. Sending commands while the engine is still searching will crash the WASM.
- See `apps/desktop/src/hooks/useEngine.ts` for the complete handshake pattern.

---

## How to Verify Changes

```bash
# Type check shared package
pnpm --filter @chessdex/shared build

# Type check desktop
pnpm --filter @chessdex/desktop exec tsc --noEmit

# Run desktop dev server
pnpm --filter @chessdex/desktop dev
# → Opens at http://localhost:1420/

# Run mobile (after setting up)
cd apps/mobile
npx expo start
```

---

## Git Workflow

The project has a git repo initialized but no remote. Before pushing:
1. Verify all changes build: `pnpm --filter @chessdex/shared build && pnpm --filter @chessdex/desktop exec tsc --noEmit`
2. Stage and commit with descriptive messages
3. Set up remote when ready: `git remote add origin <url>`
