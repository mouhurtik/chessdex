# Engine Integration

## Stockfish Runtime
- Stockfish is loaded as a web worker from the public directory and controlled via UCI messages. See [useEngine.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/hooks/useEngine.ts#L33-L108).
- Engine state, lines, and depth are stored in Zustand. See [engineStore.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/stores/engineStore.ts#L1-L135).

## Analysis Flow
- The analysis board updates FEN on each move and triggers engine analysis when enabled. See [AnalysisBoard.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/analysis/AnalysisBoard.tsx#L30-L88).
- MultiPV is configurable through the UI and sent to the engine. See [AnalysisBoard.tsx](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/components/analysis/AnalysisBoard.tsx#L207-L236) and [useEngine.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/hooks/useEngine.ts#L160-L180).

## Worker Options
- A custom worker implementation exists but is not wired to the app. See [engine.worker.ts](file:///c:/Users/User/Desktop/OpenChess/chessdex/apps/desktop/src/workers/engine.worker.ts#L1-L85).
- Decide whether to remove it or route the engine hook through it for WASM prefetch control.
